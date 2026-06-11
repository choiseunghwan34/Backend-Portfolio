package com.campusops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssetRequestDTO {
    @NotBlank
    private String assetName;
    private String category;
    private String description;
}
