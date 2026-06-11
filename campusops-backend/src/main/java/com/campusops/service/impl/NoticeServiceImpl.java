package com.campusops.service.impl;

import com.campusops.dao.NoticeDao;
import com.campusops.dto.NoticeRequestDTO;
import com.campusops.exception.BusinessException;
import com.campusops.service.NoticeService;
import com.campusops.util.RedisKeys;
import com.campusops.vo.NoticeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {
    private final NoticeDao noticeDao;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public Map<String, Object> getNotices(String keyword, int page, int size) {
        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("limit", size);
        params.put("offset", (page - 1) * size);
        List<NoticeVO> list = noticeDao.selectNotices(params);
        long total = noticeDao.countNotices(params);
        Map<String, Object> result = new HashMap<>();
        result.put("items", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    @Override
    public NoticeVO getNotice(Long noticeNo) {
        noticeDao.incrementViewCount(noticeNo);
        NoticeVO notice = noticeDao.selectNotice(noticeNo);
        if (notice == null) {
            throw new BusinessException("공지사항을 찾을 수 없습니다.", 404);
        }
        return notice;
    }

    @Override
    public NoticeVO createNotice(NoticeRequestDTO request) {
        NoticeVO notice = new NoticeVO();
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setCategory(request.getCategory());
        notice.setImportantYn(Boolean.TRUE.equals(request.getImportantYn()));
        noticeDao.insertNotice(notice);
        redisTemplate.delete(RedisKeys.recentNotices());
        return notice;
    }

    @Override
    public NoticeVO updateNotice(Long noticeNo, NoticeRequestDTO request) {
        NoticeVO notice = noticeDao.selectNoticeForUpdate(noticeNo);
        if (notice == null) {
            throw new BusinessException("공지사항을 찾을 수 없습니다.", 404);
        }
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setCategory(request.getCategory());
        notice.setImportantYn(Boolean.TRUE.equals(request.getImportantYn()));
        noticeDao.updateNotice(notice);
        redisTemplate.delete(RedisKeys.recentNotices());
        return notice;
    }

    @Override
    public void deleteNotice(Long noticeNo) {
        int updated = noticeDao.deleteNotice(noticeNo);
        if (updated == 0) {
            throw new BusinessException("공지사항을 찾을 수 없습니다.", 404);
        }
        redisTemplate.delete(RedisKeys.recentNotices());
    }

    @Override
    public List<NoticeVO> getRecentNotices() {
        Object cached = redisTemplate.opsForValue().get(RedisKeys.recentNotices());
        if (cached instanceof List<?> cachedList) {
            @SuppressWarnings("unchecked")
            List<NoticeVO> notices = (List<NoticeVO>) cachedList;
            return notices;
        }
        List<NoticeVO> notices = noticeDao.selectRecentNotices(5);
        redisTemplate.opsForValue().set(RedisKeys.recentNotices(), notices, Duration.ofMinutes(10));
        return notices;
    }
}
