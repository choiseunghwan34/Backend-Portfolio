package com.campusops.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FacilityReportVO {
    private Long reportNo;
    private Long userNo;
    private String title;
    private String content;
    private String place;
    private String category;
    private String status;
    private String adminReply;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
