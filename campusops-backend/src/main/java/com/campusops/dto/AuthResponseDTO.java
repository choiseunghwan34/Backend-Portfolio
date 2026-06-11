package com.campusops.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private Long userNo;
    private String userId;
    private String userName;
    private String role;
}
