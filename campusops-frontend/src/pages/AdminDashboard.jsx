import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const reportStatusText = {
  RECEIVED: '접수',
  CHECKING: '확인중',
  COMPLETED: '완료',
  REJECTED: '반려'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingReports: 0,
    requestedRentals: 0,
    todayReservations: 0,
    recentNotices: [],
    recentReports: []
  });

  useEffect(() => {
    (async () => {
      const { data } = await dashboardApi.adminStats();
      setStats(data.data || {});
    })();
  }, []);

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">ADMIN OPERATIONS</span>
          <h1>관리자 대시보드</h1>
          <p>공지 등록, 시설 신고 처리, 기자재 승인, 공간 예약 현황을 한 화면에서 관리합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>오늘 예약</span><strong>{stats.todayReservations || 0}건</strong></div>
      </section>

      <section className="workspace-stats">
        <div className="workspace-stat"><span>전체 회원</span><strong>{stats.totalUsers || 0}</strong><small>등록 사용자</small></div>
        <div className="workspace-stat"><span>처리 대기 신고</span><strong>{stats.pendingReports || 0}</strong><small>관리자 확인 필요</small></div>
        <div className="workspace-stat"><span>대여 신청</span><strong>{stats.requestedRentals || 0}</strong><small>승인 대기</small></div>
        <div className="workspace-stat"><span>오늘 예약</span><strong>{stats.todayReservations || 0}</strong><small>공간 이용 일정</small></div>
      </section>

      <div className="workspace-grid two">
        <section className="workspace-card">
          <div className="workspace-card__head">
            <div><h2>최근 공지</h2><p>최근 등록된 운영 공지입니다.</p></div>
            <Link className="secondary-button" to="/admin/notices">공지 관리</Link>
          </div>
          <div className="workspace-list">
            {(stats.recentNotices || []).map((item) => (
              <div className="workspace-row" key={item.noticeNo}>
                <div className="workspace-row__main"><strong>{item.title}</strong><span>{item.category || '일반'} · 조회 {item.viewCount || 0}</span></div>
                <span className={`status-pill ${item.importantYn ? 'rejected' : 'approved'}`}>{item.importantYn ? '중요' : '일반'}</span>
              </div>
            ))}
            {!(stats.recentNotices || []).length ? <div className="workspace-empty">등록된 공지가 없습니다.</div> : null}
          </div>
        </section>

        <section className="workspace-card">
          <div className="workspace-card__head">
            <div><h2>최근 신고</h2><p>빠르게 처리해야 할 시설 신고입니다.</p></div>
            <Link className="secondary-button" to="/admin/reports">신고 관리</Link>
          </div>
          <div className="workspace-list">
            {(stats.recentReports || []).map((item) => (
              <div className="workspace-row" key={item.reportNo}>
                <div className="workspace-row__main"><strong>{item.title}</strong><span>{item.place} · {item.category || '기타'}</span></div>
                <span className={`status-pill ${statusClass(item.status)}`}>{reportStatusText[item.status] || item.status}</span>
              </div>
            ))}
            {!(stats.recentReports || []).length ? <div className="workspace-empty">접수된 신고가 없습니다.</div> : null}
          </div>
        </section>
      </div>

      <section className="workspace-card dark">
        <div className="workspace-card__head">
          <div><h2>관리 메뉴</h2><p>자주 사용하는 관리자 기능으로 바로 이동합니다.</p></div>
        </div>
        <div className="workspace-actions">
          <Link className="secondary-button" to="/admin/notices">공지 관리</Link>
          <Link className="secondary-button" to="/admin/reports">신고 관리</Link>
          <Link className="secondary-button" to="/admin/assets">기자재 관리</Link>
          <Link className="secondary-button" to="/admin/rooms">공간 관리</Link>
        </div>
      </section>
    </div>
  );
}
