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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";
    private static final int MAX_HISTORY = 8;
    private static final int MAX_MESSAGE_LENGTH = 600;

    private final RedisTemplate<String, Object> redisTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
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

        String url = UriComponentsBuilder
                .fromHttpUrl(GEMINI_URL)
                .queryParam("key", apiKey)
                .buildAndExpand(model)
                .toUriString();

        try {
            JsonNode response = restTemplate.postForObject(url, new HttpEntity<>(body, headers), JsonNode.class);
            String answer = response
                    .path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText("");
            if (!StringUtils.hasText(answer)) {
                throw new BusinessException("AI 답변을 생성하지 못했습니다.", 502);
            }
            return new ChatResponseDTO(answer.trim());
        } catch (RestClientException exception) {
            throw new BusinessException("AI 서버 호출에 실패했습니다. Gemini API 키와 모델명을 확인해 주세요.", 502);
        }
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
                // Fall back to IP when an optional token is unavailable.
            }
        }
        String forwardedFor = request.getHeader("X-Forwarded-For");
        String ip = StringUtils.hasText(forwardedFor) ? forwardedFor.split(",")[0].trim() : request.getRemoteAddr();
        return "ip:" + ip;
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
