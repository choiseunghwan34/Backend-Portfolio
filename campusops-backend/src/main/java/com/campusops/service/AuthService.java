package com.campusops.service;

import com.campusops.dto.AuthRequestDTO;
import com.campusops.dto.AuthResponseDTO;
import com.campusops.vo.UserVO;

public interface AuthService {
    AuthResponseDTO signup(AuthRequestDTO request);
    AuthResponseDTO login(AuthRequestDTO request);
    void logout(String token);
    UserVO getCurrentUser();
}
