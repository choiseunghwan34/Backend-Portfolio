import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { dashboardApi } from '../api/dashboardApi';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, pendingReports: 0, requestedRentals: 0, todayReservations: 0, recentNotices: [], recentReports: [] });

  useEffect(() => {
    (async () => {
      const { data } = await dashboardApi.adminStats();
      setStats(data.data);
    })();
  }, []);

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <h1>관리자 대시보드</h1>
        <p>공지, 신고, 대여, 예약 운영 현황을 카드형 통계로 확인합니다.</p>
      </section>
      <div className="card-row">
        <Card title="전체 회원 수" value={stats.totalUsers} />
        <Card title="처리 대기 신고" value={stats.pendingReports} />
        <Card title="대여 신청 수" value={stats.requestedRentals} />
        <Card title="오늘 예약 수" value={stats.todayReservations} />
      </div>
      <div className="content-grid two-col">
        <section className="content-card">
          <h2>최근 공지</h2>
          <div className="stack-list">
            {(stats.recentNotices || []).map((item) => <div className="list-item" key={item.noticeNo}><strong>{item.title}</strong><span>{item.category || '기타'}</span></div>)}
          </div>
        </section>
        <section className="content-card">
          <h2>최근 신고</h2>
          <div className="stack-list">
            {(stats.recentReports || []).map((item) => <div className="list-item" key={item.reportNo}><strong>{item.title}</strong><span>{item.place} · {item.status}</span></div>)}
          </div>
        </section>
      </div>
      <section className="content-card">
        <h2>관리 메뉴</h2>
        <div className="action-links">
          <Link to="/admin/notices">공지 관리</Link>
          <Link to="/admin/reports">신고 관리</Link>
          <Link to="/admin/assets">기자재 관리</Link>
          <Link to="/admin/rooms">공간 관리</Link>
        </div>
      </section>
    </div>
  );
}
