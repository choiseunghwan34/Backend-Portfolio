package com.campusops.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenPrincipalDTO {
    private Long userNo;
    private String userId;
    private String role;
}
