package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {
    private final NoticeService noticeService;

    @GetMapping
    public ApiResponse<?> list(@RequestParam(defaultValue = "") String keyword,
                               @RequestParam(defaultValue = "1") int page,
                               @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("공지사항 조회 성공", noticeService.getNotices(keyword, page, size));
    }

    @GetMapping("/recent")
    public ApiResponse<?> recent() {
        return ApiResponse.success("최근 공지 조회 성공", noticeService.getRecentNotices());
    }

    @GetMapping("/{noticeNo}")
    public ApiResponse<?> detail(@PathVariable Long noticeNo) {
        return ApiResponse.success("공지사항 상세 조회 성공", noticeService.getNoticeDetail(noticeNo));
    }
}
