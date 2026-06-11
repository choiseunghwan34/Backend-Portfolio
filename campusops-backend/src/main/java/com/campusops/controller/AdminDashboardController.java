package com.campusops.controller;

import com.campusops.dao.AssetDao;
import com.campusops.dao.NoticeDao;
import com.campusops.dao.ReportDao;
import com.campusops.dao.RoomDao;
import com.campusops.dao.UserDao;
import com.campusops.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final UserDao userDao;
    private final ReportDao reportDao;
    private final AssetDao assetDao;
    private final RoomDao roomDao;
    private final NoticeDao noticeDao;

    @GetMapping("/stats")
    public ApiResponse<?> stats() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", userDao.countUsers());
        data.put("pendingReports", reportDao.countByStatus("RECEIVED") + reportDao.countByStatus("CHECKING"));
        data.put("requestedRentals", assetDao.countRequestedRentals());
        data.put("todayReservations", roomDao.countTodayReservations());
        data.put("recentNotices", noticeDao.selectRecentNotices(5));
        data.put("recentReports", reportDao.selectRecentReports(5));
        return ApiResponse.success("대시보드 조회 성공", data);
    }
}
