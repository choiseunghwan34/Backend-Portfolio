package com.campusops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportReplyDTO {
    @NotBlank
    private String adminReply;
}
