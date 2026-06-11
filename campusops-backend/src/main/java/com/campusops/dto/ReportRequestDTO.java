package com.campusops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportRequestDTO {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    @NotBlank
    private String place;
    private String category;
}
