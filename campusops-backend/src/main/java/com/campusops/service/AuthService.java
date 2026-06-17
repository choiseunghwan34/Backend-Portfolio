package com.campusops.service;

import com.campusops.dto.AuthRequestDTO;
import com.campusops.dto.AuthResponseDTO;
import com.campusops.dto.EmailVerificationDTO;
import com.campusops.vo.UserVO;

import java.util.Map;

public interface AuthService {
    AuthResponseDTO signup(AuthRequestDTO request);
    AuthResponseDTO login(AuthRequestDTO request);
    Map<String, Object> sendEmailVerification(EmailVerificationDTO request);
    void verifyEmail(EmailVerificationDTO request);
    void logout(String token);
    UserVO getCurrentUser();
}
