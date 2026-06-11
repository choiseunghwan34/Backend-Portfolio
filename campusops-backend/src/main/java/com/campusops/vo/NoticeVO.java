package com.campusops.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoticeVO {
    private Long noticeNo;
    private String title;
    private String content;
    private String category;
    private Boolean importantYn;
    private Long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
