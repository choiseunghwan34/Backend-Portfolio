package com.campusops.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssetRentalVO {
    private Long rentalNo;
    private Long assetNo;
    private Long userNo;
    private String rentalStatus;
    private LocalDateTime rentalDate;
    private LocalDateTime returnDueDate;
    private LocalDateTime returnedAt;
    private LocalDateTime createdAt;
}
