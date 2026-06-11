package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.AuthRequestDTO;
import com.campusops.dto.AuthResponseDTO;
import com.campusops.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ApiResponse<AuthResponseDTO> signup(@Valid @RequestBody AuthRequestDTO request) {
        return ApiResponse.success("회원가입이 완료되었습니다.", authService.signup(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO request) {
        return ApiResponse.success("로그인이 완료되었습니다.", authService.login(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.success("로그아웃이 완료되었습니다.", null);
    }
}
