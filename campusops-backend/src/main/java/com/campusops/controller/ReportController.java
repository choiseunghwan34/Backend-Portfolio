package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.ReportRequestDTO;
import com.campusops.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping
    public ApiResponse<?> create(@Valid @RequestBody ReportRequestDTO request) {
        return ApiResponse.success("시설 신고 등록 성공", reportService.createReport(request));
    }

    @GetMapping("/my")
    public ApiResponse<?> my() {
        return ApiResponse.success("내 신고 목록 조회 성공", reportService.getMyReports());
    }

    @GetMapping("/{reportNo}")
    public ApiResponse<?> detail(@PathVariable Long reportNo) {
        return ApiResponse.success("신고 상세 조회 성공", reportService.getReport(reportNo));
    }
}
