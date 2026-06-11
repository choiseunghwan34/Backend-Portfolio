package com.campusops.service.impl;

import com.campusops.dao.ReportDao;
import com.campusops.dto.ReportReplyDTO;
import com.campusops.dto.ReportRequestDTO;
import com.campusops.dto.ReportStatusDTO;
import com.campusops.exception.BusinessException;
import com.campusops.service.NotificationService;
import com.campusops.service.ReportService;
import com.campusops.util.RedisKeys;
import com.campusops.util.SecurityUtil;
import com.campusops.vo.FacilityReportVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final ReportDao reportDao;
    private final RedisTemplate<String, Object> redisTemplate;
    private final NotificationService notificationService;

    @Override
    public FacilityReportVO createReport(ReportRequestDTO request) {
        Long userNo = SecurityUtil.currentPrincipal().getUserNo();
        String key = RedisKeys.reportRate(userNo);
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            throw new BusinessException("신고 요청은 60초에 한 번만 가능합니다.", 429);
        }
        redisTemplate.opsForValue().set(key, "1", Duration.ofSeconds(60));
        FacilityReportVO report = new FacilityReportVO();
        report.setUserNo(userNo);
        report.setTitle(request.getTitle());
        report.setContent(request.getContent());
        report.setPlace(request.getPlace());
        report.setCategory(request.getCategory());
        report.setStatus("RECEIVED");
        reportDao.insertReport(report);
        return report;
    }

    @Override
    public List<FacilityReportVO> getMyReports() {
        return reportDao.selectMyReports(SecurityUtil.currentPrincipal().getUserNo());
    }

    @Override
    public FacilityReportVO getReport(Long reportNo) {
        FacilityReportVO report = reportDao.selectReport(reportNo);
        if (report == null) {
            throw new BusinessException("신고를 찾을 수 없습니다.", 404);
        }
        return report;
    }

    @Override
    public List<FacilityReportVO> getAllReports() {
        return reportDao.selectAllReports();
    }

    @Override
    public void updateStatus(Long reportNo, ReportStatusDTO request) {
        FacilityReportVO report = reportDao.selectReport(reportNo);
        if (report == null) {
            throw new BusinessException("신고를 찾을 수 없습니다.", 404);
        }
        reportDao.updateStatus(reportNo, request.getStatus());
        if ("COMPLETED".equals(request.getStatus()) || "REJECTED".equals(request.getStatus())) {
            notificationService.createNotification(report.getUserNo(), "신고 처리 결과", "신고 번호 " + reportNo + " 상태가 " + request.getStatus() + "로 변경되었습니다.");
        }
    }

    @Override
    public void updateReply(Long reportNo, ReportReplyDTO request) {
        FacilityReportVO report = reportDao.selectReport(reportNo);
        if (report == null) {
            throw new BusinessException("신고를 찾을 수 없습니다.", 404);
        }
        reportDao.updateReply(reportNo, request.getAdminReply());
        notificationService.createNotification(report.getUserNo(), "관리자 답변", request.getAdminReply());
    }
}
