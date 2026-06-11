package com.campusops.service;

import com.campusops.dto.NoticeRequestDTO;
import com.campusops.vo.NoticeVO;

import java.util.List;
import java.util.Map;

public interface NoticeService {
    Map<String, Object> getNotices(String keyword, int page, int size);
    NoticeVO getNotice(Long noticeNo);
    NoticeVO createNotice(NoticeRequestDTO request);
    NoticeVO updateNotice(Long noticeNo, NoticeRequestDTO request);
    void deleteNotice(Long noticeNo);
    List<NoticeVO> getRecentNotices();
}
