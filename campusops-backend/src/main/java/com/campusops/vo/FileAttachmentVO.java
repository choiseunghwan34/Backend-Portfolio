package com.campusops.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FileAttachmentVO {
    private Long attachmentNo;
    private String targetType;
    private Long targetNo;
    private String originalName;
    private String filePath;
    private String fileUrl;
    private String contentType;
    private Long fileSize;
    private LocalDateTime createdAt;
}
