package com.campusops.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssetVO {
    private Long assetNo;
    private String assetName;
    private String category;
    private String status;
    private String description;
    private LocalDateTime createdAt;
}
