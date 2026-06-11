package com.campusops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReservationRequestDTO {
    @NotBlank
    private String reservationDate;
    @NotBlank
    private String startTime;
    @NotBlank
    private String endTime;
}
