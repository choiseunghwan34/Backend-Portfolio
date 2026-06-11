package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.service.AuthService;
import com.campusops.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final AuthService authService;

    @GetMapping("/me")
    public ApiResponse<UserVO> me() {
        return ApiResponse.success("내 정보 조회 성공", authService.getCurrentUser());
    }
}
