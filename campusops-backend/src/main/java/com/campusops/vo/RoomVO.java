package com.campusops.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoomVO {
    private Long roomNo;
    private String roomName;
    private String location;
    private Integer capacity;
    private String status;
    private LocalDateTime createdAt;
}
