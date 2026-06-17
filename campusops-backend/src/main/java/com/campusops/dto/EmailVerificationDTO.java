package com.campusops.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmailVerificationDTO {
    @Email
    @NotBlank
    private String email;
    private String token;
}
