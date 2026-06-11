package com.campusops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportStatusDTO {
    @NotBlank
    private String status;
}
