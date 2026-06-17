package com.campusops.service.impl;

import com.campusops.dao.UserDao;
import com.campusops.dto.AuthRequestDTO;
import com.campusops.dto.AuthResponseDTO;
import com.campusops.dto.TokenPrincipalDTO;
import com.campusops.exception.BusinessException;
import com.campusops.security.JwtUtil;
import com.campusops.service.AuthService;
import com.campusops.util.PasswordUtil;
import com.campusops.util.RedisKeys;
import com.campusops.util.SecurityUtil;
import com.campusops.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${jwt.expiration:7200000}")
    private long defaultExpirationMillis;

    @Value("${jwt.auto-login-expiration:2592000000}")
    private long autoLoginExpirationMillis;

    @Override
    public AuthResponseDTO signup(AuthRequestDTO request) {
        if (request.getUserName() == null || request.getUserName().isBlank()) {
            throw new BusinessException("이름을 입력해주세요.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BusinessException("이메일을 입력해주세요.");
        }
        if (userDao.selectByUserId(request.getUserId()) != null) {
            throw new BusinessException("이미 존재하는 아이디입니다.");
        }
        if (userDao.selectByEmail(request.getEmail()) != null) {
            throw new BusinessException("이미 존재하는 이메일입니다.");
        }
        UserVO user = new UserVO();
        user.setUserId(request.getUserId());
        user.setUserPw(passwordEncoder.encode(PasswordUtil.normalize(request.getUserPw())));
        user.setUserName(request.getUserName());
        user.setEmail(request.getEmail());
        user.setRole("USER");
        userDao.insertUser(user);
        UserVO saved = userDao.selectByUserId(request.getUserId());
        String token = jwtUtil.generateToken(new TokenPrincipalDTO(saved.getUserNo(), saved.getUserId(), saved.getRole()), defaultExpirationMillis);
        cacheActiveToken(saved, token);
        return new AuthResponseDTO(token, saved.getUserNo(), saved.getUserId(), saved.getUserName(), saved.getRole(), false);
    }

    @Override
    public AuthResponseDTO login(AuthRequestDTO request) {
        UserVO user = userDao.selectByUserId(request.getUserId());
        if (user == null || !passwordEncoder.matches(PasswordUtil.normalize(request.getUserPw()), user.getUserPw())) {
            throw new BusinessException("아이디 또는 비밀번호가 올바르지 않습니다.", 401);
        }
        boolean duplicateLogin = invalidateActiveTokens(user.getUserNo());
        long expirationMillis = Boolean.TRUE.equals(request.getAutoLogin()) ? autoLoginExpirationMillis : defaultExpirationMillis;
        String token = jwtUtil.generateToken(new TokenPrincipalDTO(user.getUserNo(), user.getUserId(), user.getRole()), expirationMillis);
        cacheActiveToken(user, token);
        return new AuthResponseDTO(token, user.getUserNo(), user.getUserId(), user.getUserName(), user.getRole(), duplicateLogin);
    }

    @Override
    public void logout(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        long remainingMillis = jwtUtil.remainingMillis(token);
        if (remainingMillis <= 0) {
            return;
        }
        TokenPrincipalDTO principal = jwtUtil.parseToken(token);
        String tokenHash = jwtUtil.tokenHash(token);
        redisTemplate.opsForValue().set(
                RedisKeys.tokenBlacklist(tokenHash),
                RedisKeys.BLACKLIST_LOGOUT,
                Duration.ofMillis(remainingMillis)
        );
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
        return user;
    }

    private void cacheActiveToken(UserVO user, String token) {
        long remainingMillis = jwtUtil.remainingMillis(token);
        if (remainingMillis <= 0) {
            return;
        }
        String tokenHash = jwtUtil.tokenHash(token);
        long expiresAt = System.currentTimeMillis() + remainingMillis;
        redisTemplate.opsForValue().set(
                RedisKeys.activeToken(user.getUserNo(), tokenHash),
                String.valueOf(expiresAt),
                Duration.ofMillis(remainingMillis)
        );
        redisTemplate.opsForSet().add(RedisKeys.activeTokens(user.getUserNo()), tokenHash);
        redisTemplate.expire(RedisKeys.activeTokens(user.getUserNo()), Duration.ofMillis(remainingMillis));
    }

    private boolean invalidateActiveTokens(Long userNo) {
        String activeTokensKey = RedisKeys.activeTokens(userNo);
        Set<Object> tokenHashes = redisTemplate.opsForSet().members(activeTokensKey);
        if (tokenHashes == null || tokenHashes.isEmpty()) {
            return false;
        }
        boolean invalidated = false;
        long now = System.currentTimeMillis();
        for (Object tokenHashObject : tokenHashes) {
            String tokenHash = String.valueOf(tokenHashObject);
            String activeTokenKey = RedisKeys.activeToken(userNo, tokenHash);
            Object expiresAtValue = redisTemplate.opsForValue().get(activeTokenKey);
            long remainingMillis = readRemainingMillis(expiresAtValue, now);
            if (remainingMillis > 0) {
                redisTemplate.opsForValue().set(RedisKeys.tokenBlacklist(tokenHash), RedisKeys.BLACKLIST_DUPLICATE_LOGIN, Duration.ofMillis(remainingMillis));
                invalidated = true;
            }
            redisTemplate.delete(activeTokenKey);
        }
        redisTemplate.delete(activeTokensKey);
        return invalidated;
    }

    private long readRemainingMillis(Object expiresAtValue, long now) {
        if (expiresAtValue == null) {
            return 0;
        }
        try {
            return Math.max(Long.parseLong(String.valueOf(expiresAtValue)) - now, 0);
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }
}
