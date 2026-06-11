package com.campusops.service;

import com.campusops.vo.NotificationVO;

import java.util.List;

public interface NotificationService {
    List<NotificationVO> getNotifications();
    void markRead(Long notificationNo);
    int unreadCount();
    void createNotification(Long userNo, String title, String content);
}
