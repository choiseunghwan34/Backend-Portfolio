package com.campusops.service.impl;

import com.campusops.dao.NotificationDao;
import com.campusops.service.NotificationService;
import com.campusops.util.RedisKeys;
import com.campusops.util.SecurityUtil;
import com.campusops.vo.NotificationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationDao notificationDao;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public List<NotificationVO> getNotifications() {
        return notificationDao.selectByUser(SecurityUtil.currentPrincipal().getUserNo());
    }

    @Override
    public void markRead(Long notificationNo) {
        Long userNo = SecurityUtil.currentPrincipal().getUserNo();
        notificationDao.markRead(notificationNo, userNo);
        redisTemplate.delete(RedisKeys.unreadCount(userNo));
    }

    @Override
    public int unreadCount() {
        Long userNo = SecurityUtil.currentPrincipal().getUserNo();
        String key = RedisKeys.unreadCount(userNo);
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached instanceof Integer count) {
            return count;
        }
        int count = notificationDao.countUnread(userNo);
        redisTemplate.opsForValue().set(key, count, Duration.ofMinutes(5));
        return count;
    }

    @Override
    public void createNotification(Long userNo, String title, String content) {
        NotificationVO notificationVO = new NotificationVO();
        notificationVO.setUserNo(userNo);
        notificationVO.setTitle(title);
        notificationVO.setContent(content);
        notificationVO.setReadYn(false);
        notificationDao.insertNotification(notificationVO);
        redisTemplate.delete(RedisKeys.unreadCount(userNo));
    }
}
