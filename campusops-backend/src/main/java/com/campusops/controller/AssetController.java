package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.RentalRequestDTO;
import com.campusops.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    private final AssetService assetService;

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.success("기자재 목록 조회 성공", assetService.getAssets());
    }

    @GetMapping("/{assetNo}")
    public ApiResponse<?> detail(@PathVariable Long assetNo) {
        return ApiResponse.success("기자재 상세 조회 성공", assetService.getAsset(assetNo));
    }

    @PostMapping("/{assetNo}/rentals")
    public ApiResponse<?> rent(@PathVariable Long assetNo, @Valid @RequestBody RentalRequestDTO request) {
        return ApiResponse.success("기자재 대여 신청 성공", assetService.rentAsset(assetNo, request));
    }
}
