package com.campusops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NoticeRequestDTO {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private String category;
    private Boolean importantYn;
}
