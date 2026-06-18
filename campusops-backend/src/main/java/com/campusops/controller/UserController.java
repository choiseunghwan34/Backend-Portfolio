package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.UserUpdateRequestDTO;
import com.campusops.service.AuthService;
import com.campusops.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final AuthService authService;

    @GetMapping("/me")
    public ApiResponse<UserVO> me() {
        return ApiResponse.success("내 정보 조회 성공", authService.getCurrentUser());
    }

    @PutMapping("/me")
    public ApiResponse<UserVO> updateMe(@Valid @RequestBody UserUpdateRequestDTO request) {
        return ApiResponse.success("내 정보가 수정되었습니다.", authService.updateCurrentUser(request));
    }

    @PostMapping("/me/profile-image")
    public ApiResponse<UserVO> updateProfileImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success("프로필 사진이 변경되었습니다.", authService.updateProfileImage(file));
    }
}
