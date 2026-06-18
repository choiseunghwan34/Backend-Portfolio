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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
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
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";
    private static final int MAX_HISTORY = 8;
    private static final int MAX_MESSAGE_LENGTH = 600;
    private static final List<String> FALLBACK_MODELS = List.of(
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-flash-latest"
    );

    private final RedisTemplate<String, Object> redisTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${gemini.requests-per-minute:12}")
    private int requestsPerMinute;

    @Override
    public ChatResponseDTO ask(ChatRequestDTO request, HttpServletRequest servletRequest) {
        ensureConfigured();
        String message = normalizeMessage(request.getMessage());
        enforceRateLimit(resolveRequesterKey(servletRequest));

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt()))),
                "contents", buildContents(request.getHistory(), message),
                "generationConfig", Map.of(
                        "temperature", 0.35,
                        "maxOutputTokens", 520
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

    private Set<String> candidateModels() {
        Set<String> models = new LinkedHashSet<>();
        models.add(resolvePrimaryModel());
        models.addAll(FALLBACK_MODELS);
        return models;
    }

    private String resolvePrimaryModel() {
        return StringUtils.hasText(model) ? model.trim() : "gemini-2.5-flash";
    }

    private boolean isRetryableGeminiError(HttpStatusCodeException exception) {
        int status = exception.getStatusCode().value();
        String body = exception.getResponseBodyAsString();
        return status == 429
                || status == 503
                || status == 504
                || (status == 404 && body != null && body.toLowerCase().contains("not found"));
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
        if (status == 400 && body != null && body.toLowerCase().contains("not found")) {
            return "Gemini 모델명을 찾을 수 없습니다. Render의 GEMINI_MODEL 값을 gemini-2.5-flash 또는 gemini-2.0-flash로 바꿔 주세요.";
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
