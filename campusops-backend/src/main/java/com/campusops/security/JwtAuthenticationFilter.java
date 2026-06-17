package com.campusops.security;

import com.campusops.dto.TokenPrincipalDTO;
import com.campusops.util.AuthContextHolder;
import com.campusops.util.RedisKeys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                String tokenHash = jwtUtil.tokenHash(token);
                Object blacklistReason = redisTemplate.opsForValue().get(RedisKeys.tokenBlacklist(tokenHash));
                if (blacklistReason != null) {
                    String reason = String.valueOf(blacklistReason);
                    if (RedisKeys.BLACKLIST_DUPLICATE_LOGIN.equals(reason)) {
                        writeUnauthorized(response, "DUPLICATE_LOGIN", "다른 곳에서 로그인되어 현재 세션이 종료되었습니다.");
                        return;
                    }
                    writeUnauthorized(response, "LOGOUT", "로그아웃된 세션입니다.");
                    return;
                }
                TokenPrincipalDTO principal = jwtUtil.parseToken(token);
                if (!Boolean.TRUE.equals(redisTemplate.hasKey(RedisKeys.activeToken(principal.getUserNo(), tokenHash)))) {
                    writeUnauthorized(response, "SESSION_INACTIVE", "세션이 종료되었습니다. 다시 로그인해 주세요.");
                    return;
                }
                AuthContextHolder.set(principal);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + principal.getRole()))
                        );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
                AuthContextHolder.clear();
                writeUnauthorized(response, "SESSION_EXPIRED", "세션이 만료되었습니다. 다시 로그인해 주세요.");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void writeUnauthorized(HttpServletResponse response, String reason, String message) throws IOException {
        SecurityContextHolder.clearContext();
        AuthContextHolder.clear();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("X-Auth-Error", reason);
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\",\"data\":null}");
    }
}
