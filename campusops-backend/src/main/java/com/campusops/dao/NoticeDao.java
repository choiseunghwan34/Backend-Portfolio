package com.campusops.dao;

import com.campusops.vo.NoticeVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface NoticeDao {
    List<NoticeVO> selectNotices(Map<String, Object> params);
    long countNotices(Map<String, Object> params);
    NoticeVO selectNotice(@Param("noticeNo") Long noticeNo);
    NoticeVO selectNoticeForUpdate(@Param("noticeNo") Long noticeNo);
    int insertNotice(NoticeVO noticeVO);
    int updateNotice(NoticeVO noticeVO);
    int deleteNotice(@Param("noticeNo") Long noticeNo);
    int incrementViewCount(@Param("noticeNo") Long noticeNo);
    List<NoticeVO> selectRecentNotices(@Param("limit") int limit);
}
