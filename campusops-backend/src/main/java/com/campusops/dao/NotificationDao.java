package com.campusops.dao;

import com.campusops.vo.NotificationVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationDao {
    int insertNotification(NotificationVO notificationVO);
    List<NotificationVO> selectByUser(@Param("userNo") Long userNo);
    int markRead(@Param("notificationNo") Long notificationNo, @Param("userNo") Long userNo);
    int countUnread(@Param("userNo") Long userNo);
}
