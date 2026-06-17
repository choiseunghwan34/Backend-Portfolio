package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.AuthRequestDTO;
import com.campusops.dto.AuthResponseDTO;
import com.campusops.dto.EmailVerificationDTO;
import com.campusops.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/email/send")
    public ApiResponse<Map<String, Object>> sendEmailVerification(@Valid @RequestBody EmailVerificationDTO request) {
        return ApiResponse.success("이메일 인증 링크가 발송되었습니다.", authService.sendEmailVerification(request));
    }

    @PostMapping("/email/verify")
    public ApiResponse<Void> verifyEmail(@Valid @RequestBody EmailVerificationDTO request) {
        authService.verifyEmail(request);
        return ApiResponse.success("이메일 인증이 완료되었습니다.", null);
    }

    @PostMapping("/signup")
    public ApiResponse<AuthResponseDTO> signup(@Valid @RequestBody AuthRequestDTO request) {
        return ApiResponse.success("회원가입이 완료되었습니다.", authService.signup(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO request) {
        return ApiResponse.success("로그인이 완료되었습니다.", authService.login(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        String token = authorization != null && authorization.startsWith("Bearer ")
                ? authorization.substring(7)
                : null;
        authService.logout(token);
        return ApiResponse.success("로그아웃이 완료되었습니다.", null);
    }
}
