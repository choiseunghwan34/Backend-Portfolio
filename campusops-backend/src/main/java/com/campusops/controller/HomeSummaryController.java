package com.campusops.controller;

import com.campusops.dao.AssetDao;
import com.campusops.dao.NotificationDao;
import com.campusops.dao.NoticeDao;
import com.campusops.dao.ReportDao;
import com.campusops.dao.RoomDao;
import com.campusops.dto.ApiResponse;
import com.campusops.dto.TokenPrincipalDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeSummaryController {
    private final NoticeDao noticeDao;
    private final AssetDao assetDao;
    private final RoomDao roomDao;
    private final ReportDao reportDao;
    private final NotificationDao notificationDao;

    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> summary() {
        roomDao.completeExpiredReservations();

        Map<String, Object> data = new HashMap<>();
        data.put("notices", noticeDao.selectRecentNotices(4));
        data.put("assets", assetDao.selectAssets());
        data.put("rooms", roomDao.selectRooms());
        data.put("reports", Collections.emptyList());
        data.put("rentals", Collections.emptyList());
        data.put("reservations", Collections.emptyList());
        data.put("unreadCount", 0);

        TokenPrincipalDTO principal = currentPrincipalOrNull();
        if (principal != null) {
            Long userNo = principal.getUserNo();
            data.put("reports", reportDao.selectMyReports(userNo));
            data.put("rentals", assetDao.selectMyRentals(userNo));
            data.put("reservations", roomDao.selectMyReservations(userNo));
            data.put("unreadCount", notificationDao.countUnread(userNo));
        }

        return ApiResponse.success("홈 요약 조회 성공", data);
    }

    private TokenPrincipalDTO currentPrincipalOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof TokenPrincipalDTO principal)) {
            return null;
        }
        return principal;
    }
}
