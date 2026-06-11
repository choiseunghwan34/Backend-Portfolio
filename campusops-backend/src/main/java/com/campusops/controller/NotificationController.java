package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.success("알림 목록 조회 성공", notificationService.getNotifications());
    }

    @PatchMapping("/{notificationNo}/read")
    public ApiResponse<?> markRead(@PathVariable Long notificationNo) {
        notificationService.markRead(notificationNo);
        return ApiResponse.success("읽음 처리 성공", null);
    }

    @GetMapping("/unread-count")
    public ApiResponse<?> unreadCount() {
        return ApiResponse.success("읽지 않은 알림 개수 조회 성공", notificationService.unreadCount());
    }
}
