package com.campusops.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserVO {
    private Long userNo;
    private String userId;
    private String userPw;
    private String userName;
    private String email;
    private String role;
    private LocalDateTime createdAt;
}
