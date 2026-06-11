package com.campusops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoomRequestDTO {
    @NotBlank
    private String roomName;
    private String location;
    private Integer capacity;
}
