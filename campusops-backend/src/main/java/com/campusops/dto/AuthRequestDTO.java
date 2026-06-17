package com.campusops.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequestDTO {
    @NotBlank
    private String userId;
    @NotBlank
    private String userPw;
    private String userName;
    @Email
    private String email;
    private Boolean autoLogin;
}
