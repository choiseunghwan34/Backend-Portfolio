package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.ReportReplyDTO;
import com.campusops.dto.ReportStatusDTO;
import com.campusops.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {
    private final ReportService reportService;

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.success("전체 신고 목록 조회 성공", reportService.getAllReports());
    }

    @PatchMapping("/{reportNo}/status")
    public ApiResponse<?> status(@PathVariable Long reportNo, @Valid @RequestBody ReportStatusDTO request) {
        reportService.updateStatus(reportNo, request);
        return ApiResponse.success("신고 상태 변경 성공", null);
    }

    @PatchMapping("/{reportNo}/reply")
    public ApiResponse<?> reply(@PathVariable Long reportNo, @Valid @RequestBody ReportReplyDTO request) {
        reportService.updateReply(reportNo, request);
        return ApiResponse.success("신고 답변 등록 성공", null);
    }
}
