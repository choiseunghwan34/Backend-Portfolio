package com.campusops.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationVO {
    private Long notificationNo;
    private Long userNo;
    private String title;
    private String content;
    private Boolean readYn;
    private LocalDateTime createdAt;
}
