package com.campusops.vo;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class RoomReservationVO {
    private Long reservationNo;
    private Long roomNo;
    private String roomName;
    private String location;
    private Long userNo;
    private LocalDate reservationDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private LocalDateTime createdAt;
}
