package com.campusops.service.impl;

import com.campusops.dao.UserDao;
import com.campusops.dto.AuthRequestDTO;
import com.campusops.dto.AuthResponseDTO;
import com.campusops.dto.EmailVerificationDTO;
import com.campusops.dto.TokenPrincipalDTO;
import com.campusops.dto.UserUpdateRequestDTO;
import com.campusops.exception.BusinessException;
import com.campusops.security.JwtUtil;
import com.campusops.service.AuthService;
import com.campusops.service.FileStorageService;
import com.campusops.util.PasswordUtil;
import com.campusops.util.RedisKeys;
import com.campusops.util.SecurityUtil;
import com.campusops.vo.FileAttachmentVO;
import com.campusops.vo.UserVO;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private static final Duration EMAIL_TOKEN_TTL = Duration.ofMinutes(10);
    private static final String EMAIL_VERIFIED_VALUE = "VERIFIED";
    private static final String EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final JavaMailSender mailSender;
    private final FileStorageService fileStorageService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${jwt.expiration:7200000}")
    private long defaultExpirationMillis;

    @Value("${jwt.auto-login-expiration:2592000000}")
    private long autoLoginExpirationMillis;

    @Value("${mail.from:}")
    private String mailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${mail.from-name:CampusOps}")
    private String mailFromName;

    @Value("${mail.debug-code-enabled:false}")
    private boolean debugCodeEnabled;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${emailjs.enabled:true}")
    private boolean emailJsEnabled;

    @Value("${emailjs.service-id:}")
    private String emailJsServiceId;

    @Value("${emailjs.template-id:}")
    private String emailJsTemplateId;

    @Value("${emailjs.public-key:}")
    private String emailJsPublicKey;

    @Value("${emailjs.access-token:}")
    private String emailJsAccessToken;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public AuthResponseDTO signup(AuthRequestDTO request) {
        validateSignupRequest(request);
        assertEmailVerified(request.getEmail());

        UserVO user = new UserVO();
        user.setUserId(request.getUserId());
        user.setUserPw(passwordEncoder.encode(PasswordUtil.normalize(request.getUserPw())));
        user.setUserName(request.getUserName());
        user.setEmail(normalizeEmail(request.getEmail()));
        user.setRole("USER");
        userDao.insertUser(user);
        redisTemplate.delete(RedisKeys.emailVerification(user.getEmail()));

        UserVO saved = userDao.selectByUserId(request.getUserId());
        String token = jwtUtil.generateToken(
                new TokenPrincipalDTO(saved.getUserNo(), saved.getUserId(), saved.getRole()),
                defaultExpirationMillis
        );
        cacheActiveToken(saved, token, defaultExpirationMillis);
        return new AuthResponseDTO(token, saved.getUserNo(), saved.getUserId(), saved.getUserName(), saved.getProfileImageUrl(), saved.getRole(), false);
    }

    @Override
    public AuthResponseDTO login(AuthRequestDTO request) {
        UserVO user = userDao.selectByUserId(request.getUserId());
        if (user == null || !passwordEncoder.matches(PasswordUtil.normalize(request.getUserPw()), user.getUserPw())) {
            throw new BusinessException("아이디 또는 비밀번호가 올바르지 않습니다.", 401);
        }

        boolean duplicateLogin = invalidateActiveTokens(user.getUserNo());
        long expirationMillis = Boolean.TRUE.equals(request.getAutoLogin()) ? autoLoginExpirationMillis : defaultExpirationMillis;
        String token = jwtUtil.generateToken(
                new TokenPrincipalDTO(user.getUserNo(), user.getUserId(), user.getRole()),
                expirationMillis
        );
        cacheActiveToken(user, token, expirationMillis);
        return new AuthResponseDTO(token, user.getUserNo(), user.getUserId(), user.getUserName(), user.getProfileImageUrl(), user.getRole(), duplicateLogin);
    }

    @Override
    public Map<String, Object> sendEmailVerification(EmailVerificationDTO request) {
        String email = normalizeEmail(request.getEmail());
        if (userDao.selectByEmail(email) != null) {
            throw new BusinessException("이미 가입된 이메일입니다.");
        }

        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        redisTemplate.opsForValue().set(RedisKeys.emailVerification(email), token, EMAIL_TOKEN_TTL);
        String verificationUrl = buildVerificationUrl(email, token);
        sendVerificationMail(email, verificationUrl);

        Map<String, Object> data = new HashMap<>();
        data.put("expiresInSeconds", EMAIL_TOKEN_TTL.toSeconds());
        if (debugCodeEnabled) {
            data.put("debugVerificationUrl", verificationUrl);
        }
        return data;
    }

    @Override
    public void verifyEmail(EmailVerificationDTO request) {
        String email = normalizeEmail(request.getEmail());
        String key = RedisKeys.emailVerification(email);
        Object savedToken = redisTemplate.opsForValue().get(key);
        if (savedToken == null) {
            throw new BusinessException("이메일 인증 링크가 만료되었습니다. 다시 발송해 주세요.");
        }
        if (request.getToken() == null || !String.valueOf(savedToken).equals(request.getToken())) {
            throw new BusinessException("이메일 인증 링크가 올바르지 않습니다.");
        }
        redisTemplate.opsForValue().set(key, EMAIL_VERIFIED_VALUE, Duration.ofMinutes(30));
    }

    @Override
    public void logout(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        TokenPrincipalDTO principal = jwtUtil.parseToken(token);
        String tokenHash = jwtUtil.tokenHash(token);
        redisTemplate.delete(RedisKeys.activeToken(principal.getUserNo(), tokenHash));
        redisTemplate.opsForSet().remove(RedisKeys.activeTokens(principal.getUserNo()), tokenHash);
    }

    @Override
    public UserVO getCurrentUser() {
        TokenPrincipalDTO principal = SecurityUtil.currentPrincipal();
        UserVO user = userDao.selectByUserNo(principal.getUserNo());
        if (user == null) {
            throw new BusinessException("사용자 정보를 찾을 수 없습니다.", 404);
        }
        user.setUserPw(null);
        return user;
    }

    @Override
    public UserVO updateCurrentUser(UserUpdateRequestDTO request) {
        TokenPrincipalDTO principal = SecurityUtil.currentPrincipal();
        String email = normalizeEmail(request.getEmail());
        UserVO exists = userDao.selectByEmail(email);
        if (exists != null && !exists.getUserNo().equals(principal.getUserNo())) {
            throw new BusinessException("이미 사용 중인 이메일입니다.");
        }

        int updated = userDao.updateProfile(principal.getUserNo(), request.getUserName().trim(), email);
        if (updated == 0) {
            throw new BusinessException("사용자 정보를 찾을 수 없습니다.", 404);
        }
        UserVO user = userDao.selectByUserNo(principal.getUserNo());
        user.setUserPw(null);
        return user;
    }

    @Override
    public UserVO updateProfileImage(MultipartFile file) {
        TokenPrincipalDTO principal = SecurityUtil.currentPrincipal();
        FileAttachmentVO attachment = fileStorageService.upload("USER", principal.getUserNo(), file);
        int updated = userDao.updateProfileImage(principal.getUserNo(), attachment.getFileUrl());
        if (updated == 0) {
            throw new BusinessException("사용자 정보를 찾을 수 없습니다.", 404);
        }
        UserVO user = userDao.selectByUserNo(principal.getUserNo());
        user.setUserPw(null);
        return user;
    }

    private void validateSignupRequest(AuthRequestDTO request) {
        if (request.getUserName() == null || request.getUserName().isBlank()) {
            throw new BusinessException("이름을 입력해 주세요.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BusinessException("이메일을 입력해 주세요.");
        }
        if (userDao.selectByUserId(request.getUserId()) != null) {
            throw new BusinessException("이미 사용 중인 아이디입니다.");
        }
        if (userDao.selectByEmail(normalizeEmail(request.getEmail())) != null) {
            throw new BusinessException("이미 가입된 이메일입니다.");
        }
    }

    private void assertEmailVerified(String email) {
        Object verified = redisTemplate.opsForValue().get(RedisKeys.emailVerification(normalizeEmail(email)));
        if (!EMAIL_VERIFIED_VALUE.equals(String.valueOf(verified))) {
            throw new BusinessException("이메일 인증을 완료해 주세요.");
        }
    }

    private String buildVerificationUrl(String email, String token) {
        return UriComponentsBuilder
                .fromHttpUrl(frontendUrl)
                .path("/email-verify")
                .queryParam("email", email)
                .queryParam("token", token)
                .build()
                .toUriString();
    }

    private void sendVerificationMail(String email, String verificationUrl) {
        if (debugCodeEnabled) {
            return;
        }
        if (emailJsEnabled) {
            sendWithEmailJs(email, verificationUrl);
            return;
        }
        sendWithSmtp(email, verificationUrl);
    }

    private void sendWithEmailJs(String email, String verificationUrl) {
        if (isBlank(emailJsServiceId) || isBlank(emailJsTemplateId) || isBlank(emailJsPublicKey)) {
            throw new BusinessException("EmailJS 설정이 필요합니다. service id, template id, public key를 확인해 주세요.", 500);
        }

        Map<String, Object> templateParams = new HashMap<>();
        templateParams.put("to_email", email);
        templateParams.put("to_name", email);
        templateParams.put("from_name", mailFromName);
        templateParams.put("app_name", "CampusOps");
        templateParams.put("verification_url", verificationUrl);
        templateParams.put("logo_url", buildAssetUrl("/campusops-mark.svg"));
        templateParams.put("expire_minutes", EMAIL_TOKEN_TTL.toMinutes());
        templateParams.put("support_email", resolveSenderSafely());
        templateParams.put("subject", "[CampusOps] 이메일 인증 요청");

        Map<String, Object> body = new HashMap<>();
        body.put("service_id", emailJsServiceId);
        body.put("template_id", emailJsTemplateId);
        body.put("user_id", emailJsPublicKey);
        body.put("template_params", templateParams);
        if (!isBlank(emailJsAccessToken)) {
            body.put("accessToken", emailJsAccessToken);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            restTemplate.postForEntity(EMAILJS_SEND_URL, new HttpEntity<>(body, headers), String.class);
        } catch (RestClientException exception) {
            log.warn("Failed to send CampusOps verification mail through EmailJS. to={}, serviceId={}, templateId={}",
                    email, emailJsServiceId, emailJsTemplateId, exception);
            throw new BusinessException("인증 메일 발송에 실패했습니다. EmailJS 설정을 확인해 주세요.", 500);
        }
    }

    private void sendWithSmtp(String email, String verificationUrl) {
        if (mailHost == null || mailHost.isBlank()) {
            throw new BusinessException("메일 서버 설정이 필요합니다.", 500);
        }

        try {
            String sender = resolveSender();
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(sender, mailFromName);
            helper.setTo(email);
            helper.setSubject("[CampusOps] 이메일 인증 요청");
            helper.setText(buildVerificationMailText(verificationUrl), false);
            mailSender.send(message);
        } catch (Exception exception) {
            log.warn("Failed to send CampusOps verification mail through SMTP. to={}, from={}, host={}",
                    email, resolveSenderSafely(), mailHost, exception);
            throw new BusinessException("인증 메일 발송에 실패했습니다. SMTP 설정을 확인해 주세요.", 500);
        }
    }

    private String resolveSenderSafely() {
        try {
            return resolveSender();
        } catch (Exception exception) {
            return "";
        }
    }

    private String resolveSender() {
        if (mailFrom != null && !mailFrom.isBlank()) {
            return mailFrom;
        }
        if (mailUsername != null && !mailUsername.isBlank()) {
            return mailUsername;
        }
        return "no-reply@campusops.local";
    }

    private String buildVerificationMailText(String verificationUrl) {
        return "CampusOps 이메일 인증을 완료하려면 아래 링크를 열고 인증하기 버튼을 눌러 주세요.\n\n"
                + verificationUrl
                + "\n\n이 링크는 10분 동안 유효합니다.";
    }

    private String buildAssetUrl(String path) {
        return UriComponentsBuilder
                .fromHttpUrl(frontendUrl)
                .path(path)
                .build()
                .toUriString();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void cacheActiveToken(UserVO user, String token, long expirationMillis) {
        if (expirationMillis <= 0) {
            return;
        }
        String tokenHash = jwtUtil.tokenHash(token);
        long expiresAt = System.currentTimeMillis() + expirationMillis;
        redisTemplate.opsForValue().set(
                RedisKeys.activeToken(user.getUserNo(), tokenHash),
                String.valueOf(expiresAt),
                Duration.ofMillis(expirationMillis)
        );
        redisTemplate.opsForSet().add(RedisKeys.activeTokens(user.getUserNo()), tokenHash);
        redisTemplate.expire(RedisKeys.activeTokens(user.getUserNo()), Duration.ofMillis(expirationMillis));
    }

    private boolean invalidateActiveTokens(Long userNo) {
        String activeTokensKey = RedisKeys.activeTokens(userNo);
        Set<Object> tokenHashes = redisTemplate.opsForSet().members(activeTokensKey);
        if (tokenHashes == null || tokenHashes.isEmpty()) {
            return false;
        }

        for (Object tokenHashObject : tokenHashes) {
            String tokenHash = String.valueOf(tokenHashObject);
            redisTemplate.opsForValue().set(
                    RedisKeys.tokenBlacklist(tokenHash),
                    RedisKeys.BLACKLIST_DUPLICATE_LOGIN,
                    Duration.ofMillis(autoLoginExpirationMillis)
            );
            redisTemplate.delete(RedisKeys.activeToken(userNo, tokenHash));
        }
        redisTemplate.delete(activeTokensKey);
        return true;
    }
}
