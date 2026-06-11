package com.campusops.dao;

import com.campusops.vo.FacilityReportVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReportDao {
    int insertReport(FacilityReportVO reportVO);
    List<FacilityReportVO> selectMyReports(@Param("userNo") Long userNo);
    FacilityReportVO selectReport(@Param("reportNo") Long reportNo);
    List<FacilityReportVO> selectAllReports();
    int updateStatus(@Param("reportNo") Long reportNo, @Param("status") String status);
    int updateReply(@Param("reportNo") Long reportNo, @Param("reply") String reply);
    int countByStatus(@Param("status") String status);
    List<FacilityReportVO> selectRecentReports(@Param("limit") int limit);
}
