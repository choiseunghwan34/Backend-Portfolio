package com.campusops.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoomSeatVO {
    private Long seatNo;
    private Long roomNo;
    private String seatCode;
    private String rowLabel;
    private Integer colNo;
    private String status;
    private Boolean reserved;
    private LocalDateTime createdAt;
}
