package com.campusops.service.impl;

import com.campusops.dto.ChatMessageDTO;
import com.campusops.dto.ChatRequestDTO;
import com.campusops.dto.ChatResponseDTO;
import com.campusops.dto.TokenPrincipalDTO;
import com.campusops.exception.BusinessException;
import com.campusops.service.ChatService;
import com.campusops.util.SecurityUtil;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
public class ChatServiceImpl implements ChatService {
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";
    private static final int MAX_HISTORY = 6;
    private static final int MAX_MESSAGE_LENGTH = 500;
    private static final List<String> FALLBACK_MODELS = List.of(
            "gemini-2.0-flash",
            "gemini-2.5-flash",
            "gemini-flash-latest"
    );

    private final RedisTemplate<String, Object> redisTemplate;
    private final RestTemplate restTemplate;

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String model;

    @Value("${gemini.requests-per-minute:8}")
    private int requestsPerMinute;

    public ChatServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(8));
        this.restTemplate = new RestTemplate(requestFactory);
    }

    @Override
    public ChatResponseDTO ask(ChatRequestDTO request, HttpServletRequest servletRequest) {
        String message = normalizeMessage(request.getMessage());
        String quickAnswer = findQuickAnswer(message);
        if (quickAnswer != null) {
            return new ChatResponseDTO(quickAnswer);
        }

        ensureConfigured();
        enforceRateLimit(resolveRequesterKey(servletRequest));

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt()))),
                "contents", buildContents(request.getHistory(), message),
                "generationConfig", Map.of(
                        "temperature", 0.28,
                        "maxOutputTokens", 360
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpStatusCodeException lastGeminiException = null;
        RestClientException lastClientException = null;
        for (String candidateModel : candidateModels()) {
            try {
                ChatResponseDTO response = requestGemini(candidateModel, body, headers);
                if (!candidateModel.equals(resolvePrimaryModel())) {
                    log.info("Gemini fallback succeeded. primaryModel={}, fallbackModel={}", resolvePrimaryModel(), candidateModel);
                }
                return response;
            } catch (HttpStatusCodeException exception) {
                lastGeminiException = exception;
                log.warn("Gemini API returned error. status={}, model={}, body={}",
                        exception.getStatusCode(), candidateModel, exception.getResponseBodyAsString());
                if (!isRetryableGeminiError(exception)) {
                    throw new BusinessException(toFriendlyGeminiMessage(exception), 502);
                }
            } catch (RestClientException exception) {
                lastClientException = exception;
                log.warn("Gemini API request failed. model={}", candidateModel, exception);
            }
        }

        if (lastGeminiException != null) {
            throw new BusinessException(toFriendlyGeminiMessage(lastGeminiException), 502);
        }
        if (lastClientException != null) {
            throw new BusinessException("AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.", 502);
        }
        throw new BusinessException("AI 답변을 생성하지 못했습니다.", 502);
    }

    private ChatResponseDTO requestGemini(String candidateModel, Map<String, Object> body, HttpHeaders headers) {
        String url = UriComponentsBuilder
                .fromHttpUrl(GEMINI_URL)
                .queryParam("key", apiKey.trim())
                .buildAndExpand(candidateModel)
                .toUriString();

        JsonNode response = restTemplate.postForObject(url, new HttpEntity<>(body, headers), JsonNode.class);
        String answer = response
                .path("candidates").path(0)
                .path("content").path("parts").path(0)
                .path("text").asText("");
        if (!StringUtils.hasText(answer)) {
            log.warn("Gemini returned empty answer. model={}, response={}", candidateModel, response);
            throw new BusinessException("AI 답변을 생성하지 못했습니다.", 502);
        }
        return new ChatResponseDTO(answer.trim());
    }

    private String findQuickAnswer(String message) {
        String normalized = message.toLowerCase(Locale.ROOT).replace(" ", "");
        if (containsAny(normalized, "강의실예약", "공간예약", "예약방법", "예약어떻게")) {
            return "공간 예약은 상단 메뉴의 공간예약에서 진행할 수 있습니다. 원하는 공간을 선택한 뒤 날짜와 시작/종료 시간을 고르고 예약 신청을 누르면 됩니다. 이미 예약된 시간이나 운영중지 공간은 신청할 수 없습니다.";
        }
        if (containsAny(normalized, "시설신고", "고장신고", "신고처리", "처리상태")) {
            return "시설 신고는 시설신고 메뉴에서 접수할 수 있습니다. 장소, 카테고리, 제목, 내용을 입력하면 내 신고 목록에서 상태를 확인할 수 있어요. 상태는 접수, 확인중, 완료, 반려 순서로 관리됩니다.";
        }
        if (containsAny(normalized, "기자재", "대여", "반납", "노트북", "태블릿", "카메라")) {
            return "기자재 대여는 기자재대여 메뉴에서 신청할 수 있습니다. 대여 가능한 기자재를 선택해 신청하면 관리자가 승인 또는 반려 처리합니다. 승인 후 반납 처리까지 내 대여 내역에서 확인할 수 있습니다.";
        }
        if (containsAny(normalized, "공지", "공지사항", "안내문")) {
            return "공지사항은 공지사항 메뉴에서 확인할 수 있습니다. 중요 공지는 목록 상단과 상세 화면에서 별도로 표시되고, 검색어로 제목과 내용을 검색할 수 있습니다.";
        }
        if (containsAny(normalized, "알림", "읽지않은", "알림센터")) {
            return "알림 메뉴에서 내 알림을 확인할 수 있습니다. 신고 처리, 대여 승인/반려, 예약 관련 결과가 있을 때 알림이 생성되고 읽음 처리도 가능합니다.";
        }
        if (containsAny(normalized, "관리자", "admin", "대시보드")) {
            return "관리자는 관리자 계정으로 로그인한 뒤 대시보드에서 공지 등록, 신고 처리, 대여 승인, 공간/예약 관리를 할 수 있습니다. 일반 사용자는 관리자 메뉴에 접근할 수 없습니다.";
        }
        return null;
    }

    private boolean containsAny(String value, String... keywords) {
        for (String keyword : keywords) {
            if (value.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private Set<String> candidateModels() {
        Set<String> models = new LinkedHashSet<>();
        models.add(resolvePrimaryModel());
        models.addAll(FALLBACK_MODELS);
        return models;
    }

    private String resolvePrimaryModel() {
        return StringUtils.hasText(model) ? model.trim() : "gemini-2.0-flash";
    }

    private boolean isRetryableGeminiError(HttpStatusCodeException exception) {
        int status = exception.getStatusCode().value();
        String body = exception.getResponseBodyAsString();
        return status == 429
                || status == 503
                || status == 504
                || (status == 404 && body != null && body.toLowerCase(Locale.ROOT).contains("not found"));
    }

    private List<Map<String, Object>> buildContents(List<ChatMessageDTO> history, String message) {
        List<Map<String, Object>> contents = new ArrayList<>();
        if (history != null) {
            history.stream()
                    .filter(item -> item != null && StringUtils.hasText(item.getContent()))
                    .skip(Math.max(0, history.size() - MAX_HISTORY))
                    .forEach(item -> contents.add(Map.of(
                            "role", "assistant".equalsIgnoreCase(item.getRole()) ? "model" : "user",
                            "parts", List.of(Map.of("text", normalizeMessage(item.getContent())))
                    )));
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", message))));
        return contents;
    }

    private String normalizeMessage(String message) {
        String normalized = String.valueOf(message).trim();
        if (normalized.length() > MAX_MESSAGE_LENGTH) {
            normalized = normalized.substring(0, MAX_MESSAGE_LENGTH);
        }
        return normalized;
    }

    private void ensureConfigured() {
        if (!StringUtils.hasText(apiKey)) {
            throw new BusinessException("Gemini API 키가 설정되지 않았습니다.", 500);
        }
    }

    private void enforceRateLimit(String requesterKey) {
        String key = "rate:chat:" + requesterKey;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }
        if (count != null && count > requestsPerMinute) {
            throw new BusinessException("AI 질문이 잠시 많습니다. 1분 뒤 다시 시도해 주세요.", 429);
        }
    }

    private String resolveRequesterKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            try {
                TokenPrincipalDTO principal = SecurityUtil.currentPrincipal();
                return "user:" + principal.getUserNo();
            } catch (Exception ignored) {
                // Optional token이 없으면 IP 기준 제한으로 처리합니다.
            }
        }
        String forwardedFor = request.getHeader("X-Forwarded-For");
        String ip = StringUtils.hasText(forwardedFor) ? forwardedFor.split(",")[0].trim() : request.getRemoteAddr();
        return "ip:" + ip;
    }

    private String toFriendlyGeminiMessage(HttpStatusCodeException exception) {
        int status = exception.getStatusCode().value();
        String body = exception.getResponseBodyAsString();
        if (status == 400 && body != null && body.toLowerCase(Locale.ROOT).contains("not found")) {
            return "Gemini 모델명을 찾을 수 없습니다. Render의 GEMINI_MODEL 값을 gemini-2.0-flash 또는 gemini-2.5-flash로 바꿔 주세요.";
        }
        if (status == 400) {
            return "Gemini 요청 형식이 올바르지 않습니다. Render 로그의 Gemini API 오류 내용을 확인해 주세요.";
        }
        if (status == 403) {
            return "Gemini API 키 권한이 없습니다. Google AI Studio에서 키를 다시 복사하고 Render 환경변수를 확인해 주세요.";
        }
        if (status == 429) {
            return "Gemini 무료 사용량 또는 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.";
        }
        if (status == 503 || status == 504) {
            return "Gemini 모델 사용량이 많아 잠시 응답하지 못했습니다. 잠시 후 다시 시도해 주세요.";
        }
        return "AI 서버 호출에 실패했습니다. Render 로그에서 Gemini API 오류 내용을 확인해 주세요.";
    }

    private String systemPrompt() {
        return """
                당신은 CampusOps 운영 관리 플랫폼의 안내 챗봇입니다.
                CampusOps는 학교, 학원, 동아리, 스터디 센터에서 공지사항, 시설 신고, 기자재 대여, 공간 예약, 알림을 관리하는 서비스입니다.
                답변은 한국어로, 실제 서비스 상담원처럼 짧고 명확하게 작성하세요.
                사용자가 기능 위치를 물으면 다음 기준으로 안내하세요.
                - 공지사항: /notices
                - 시설 신고: /reports
                - 기자재 대여: /assets
                - 공간 예약: /rooms
                - 알림: /notifications
                - Q&A: /qna
                관리자 기능은 관리자 계정에서 대시보드와 각 관리 메뉴로 접근한다고 설명하세요.
                비밀번호, API 키, 개인정보 같은 민감정보는 요청하지 말고, 그런 정보가 필요해 보이면 관리자에게 문의하라고 안내하세요.
                CampusOps와 무관한 질문은 간단히 답하되, 가능한 CampusOps 이용 안내로 되돌려 주세요.
                """;
    }
}
