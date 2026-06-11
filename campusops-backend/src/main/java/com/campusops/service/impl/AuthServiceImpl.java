package com.campusops.service.impl;

import com.campusops.dao.UserDao;
import com.campusops.dto.AuthRequestDTO;
import com.campusops.dto.AuthResponseDTO;
import com.campusops.dto.TokenPrincipalDTO;
import com.campusops.exception.BusinessException;
import com.campusops.security.JwtUtil;
import com.campusops.service.AuthService;
import com.campusops.util.PasswordUtil;
import com.campusops.util.SecurityUtil;
import com.campusops.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

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
        String token = jwtUtil.generateToken(new TokenPrincipalDTO(saved.getUserNo(), saved.getUserId(), saved.getRole()));
        return new AuthResponseDTO(token, saved.getUserNo(), saved.getUserId(), saved.getUserName(), saved.getRole());
    }

    @Override
    public AuthResponseDTO login(AuthRequestDTO request) {
        UserVO user = userDao.selectByUserId(request.getUserId());
        if (user == null || !passwordEncoder.matches(PasswordUtil.normalize(request.getUserPw()), user.getUserPw())) {
            throw new BusinessException("아이디 또는 비밀번호가 올바르지 않습니다.", 401);
        }
        String token = jwtUtil.generateToken(new TokenPrincipalDTO(user.getUserNo(), user.getUserId(), user.getRole()));
        return new AuthResponseDTO(token, user.getUserNo(), user.getUserId(), user.getUserName(), user.getRole());
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
}
