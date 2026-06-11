package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.NoticeRequestDTO;
import com.campusops.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class AdminNoticeController {
    private final NoticeService noticeService;

    @PostMapping
    public ApiResponse<?> create(@Valid @RequestBody NoticeRequestDTO request) {
        return ApiResponse.success("공지 등록 성공", noticeService.createNotice(request));
    }

    @PutMapping("/{noticeNo}")
    public ApiResponse<?> update(@PathVariable Long noticeNo, @Valid @RequestBody NoticeRequestDTO request) {
        return ApiResponse.success("공지 수정 성공", noticeService.updateNotice(noticeNo, request));
    }

    @DeleteMapping("/{noticeNo}")
    public ApiResponse<?> delete(@PathVariable Long noticeNo) {
        noticeService.deleteNotice(noticeNo);
        return ApiResponse.success("공지 삭제 성공", null);
    }
}
