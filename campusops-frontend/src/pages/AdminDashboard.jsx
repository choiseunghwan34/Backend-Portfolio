import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const reportStatusText = {
  RECEIVED: '접수',
  CHECKING: '확인중',
  COMPLETED: '완료',
  REJECTED: '반려'
};

const shortcuts = [
  { label: '공지 관리', description: '운영 공지 등록과 수정', to: '/admin/notices' },
  { label: '신고 처리', description: '접수 신고 상태와 답변 관리', to: '/admin/reports' },
  { label: '기자재 승인', description: '대여 승인, 반려, 반납 처리', to: '/admin/assets' },
  { label: '공간 예약', description: '공간 등록과 예약 현황 관리', to: '/admin/rooms' }
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      try {
        const { data } = await dashboardApi.adminStats();
        setStats(data.data || {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="workspace-page admin-page admin-console">
      <section className="workspace-hero admin-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">ADMIN CONSOLE</span>
          <h1>운영 관리자 대시보드</h1>
          <p>공지 등록, 시설 신고 처리, 기자재 승인, 공간 예약 현황을 한 화면에서 관리합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>오늘 예약</span><strong>{stats.todayReservations || 0}건</strong></div>
      </section>

      <section className="admin-command-strip">
        {shortcuts.map((item) => (
          <Link to={item.to} key={item.to}>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </Link>
        ))}
      </section>

      <section className="workspace-stats admin-stats">
        <div className="workspace-stat"><span>전체 회원</span><strong>{stats.totalUsers || 0}</strong><small>등록 사용자</small></div>
        <div className="workspace-stat"><span>처리 대기 신고</span><strong>{stats.pendingReports || 0}</strong><small>관리자 확인 필요</small></div>
        <div className="workspace-stat"><span>대여 신청</span><strong>{stats.requestedRentals || 0}</strong><small>승인 대기</small></div>
        <div className="workspace-stat"><span>오늘 예약</span><strong>{stats.todayReservations || 0}</strong><small>공간 이용 일정</small></div>
      </section>

      {loading ? (
        <div className="workspace-grid two">
          <SkeletonCard rows={5} />
          <SkeletonCard rows={5} />
        </div>
      ) : (
        <div className="workspace-grid two">
          <section className="workspace-card admin-card">
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
              {!(stats.recentNotices || []).length ? <EmptyState eyebrow="NOTICE" title="등록된 공지가 없습니다." description="관리자 공지 화면에서 첫 공지를 등록해 보세요." /> : null}
            </div>
          </section>

          <section className="workspace-card admin-card">
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
              {!(stats.recentReports || []).length ? <EmptyState eyebrow="REPORT" title="접수된 신고가 없습니다." description="신규 신고가 들어오면 이곳에 표시됩니다." /> : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
