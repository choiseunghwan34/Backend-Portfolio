package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.AssetRequestDTO;
import com.campusops.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/assets")
@RequiredArgsConstructor
public class AdminAssetController {
    private final AssetService assetService;

    @PostMapping
    public ApiResponse<?> create(@Valid @RequestBody AssetRequestDTO request) {
        return ApiResponse.success("기자재 등록 성공", assetService.createAsset(request));
    }

    @PutMapping("/{assetNo}")
    public ApiResponse<?> update(@PathVariable Long assetNo, @Valid @RequestBody AssetRequestDTO request) {
        return ApiResponse.success("기자재 수정 성공", assetService.updateAsset(assetNo, request));
    }

    @PatchMapping("/{assetNo}/disable")
    public ApiResponse<?> disable(@PathVariable Long assetNo) {
        assetService.disableAsset(assetNo);
        return ApiResponse.success("기자재 비활성화 성공", null);
    }

    @GetMapping("/rentals")
    public ApiResponse<?> rentals() {
        return ApiResponse.success("대여 목록 조회 성공", assetService.getAllRentals());
    }

    @PatchMapping("/rentals/{rentalNo}/approve")
    public ApiResponse<?> approve(@PathVariable Long rentalNo) {
        assetService.approveRental(rentalNo);
        return ApiResponse.success("대여 승인 성공", null);
    }

    @PatchMapping("/rentals/{rentalNo}/reject")
    public ApiResponse<?> reject(@PathVariable Long rentalNo) {
        assetService.rejectRental(rentalNo);
        return ApiResponse.success("대여 반려 성공", null);
    }

    @PatchMapping("/rentals/{rentalNo}/return")
    public ApiResponse<?> returnRental(@PathVariable Long rentalNo) {
        assetService.returnRental(rentalNo);
        return ApiResponse.success("반납 처리 성공", null);
    }
}
