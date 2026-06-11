package com.campusops.service;

import com.campusops.dto.ReportReplyDTO;
import com.campusops.dto.ReportRequestDTO;
import com.campusops.dto.ReportStatusDTO;
import com.campusops.vo.FacilityReportVO;

import java.util.List;

public interface ReportService {
    FacilityReportVO createReport(ReportRequestDTO request);
    List<FacilityReportVO> getMyReports();
    FacilityReportVO getReport(Long reportNo);
    List<FacilityReportVO> getAllReports();
    void updateStatus(Long reportNo, ReportStatusDTO request);
    void updateReply(Long reportNo, ReportReplyDTO request);
}
