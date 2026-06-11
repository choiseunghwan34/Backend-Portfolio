package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {
    private final AssetService assetService;

    @GetMapping("/my")
    public ApiResponse<?> myRentals() {
        return ApiResponse.success("내 대여 내역 조회 성공", assetService.getMyRentals());
    }
}
