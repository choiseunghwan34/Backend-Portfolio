package com.campusops.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RentalRequestDTO {
    @NotNull
    private Integer rentalDays;
}
