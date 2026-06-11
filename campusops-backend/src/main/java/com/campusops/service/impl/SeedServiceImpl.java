package com.campusops.service.impl;

import com.campusops.dao.UserDao;
import com.campusops.service.SeedService;
import com.campusops.util.PasswordUtil;
import com.campusops.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SeedServiceImpl implements SeedService {
    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void seedDefaultUsers() {
        if (userDao.selectByUserId("admin") == null) {
            UserVO admin = new UserVO();
            admin.setUserId("admin");
            admin.setUserPw(passwordEncoder.encode(PasswordUtil.normalize("Admin123!")));
            admin.setUserName("관리자");
            admin.setEmail("admin@campusops.local");
            admin.setRole("ADMIN");
            userDao.insertUser(admin);
        }
        if (userDao.selectByUserId("user01") == null) {
            UserVO user = new UserVO();
            user.setUserId("user01");
            user.setUserPw(passwordEncoder.encode(PasswordUtil.normalize("User123!")));
            user.setUserName("일반사용자");
            user.setEmail("user01@campusops.local");
            user.setRole("USER");
            userDao.insertUser(user);
        }
    }
}
