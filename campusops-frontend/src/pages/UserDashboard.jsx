import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { dashboardApi } from '../api/dashboardApi';
import { reportApi } from '../api/reportApi';
import { assetApi } from '../api/assetApi';
import { roomApi } from '../api/roomApi';

export default function UserDashboard() {
  const [notices, setNotices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myReports, setMyReports] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [myReservations, setMyReservations] = useState([]);

  useEffect(() => {
    (async () => {
      const [recentRes, unreadRes, reportRes, rentalRes, reservationRes] = await Promise.all([
        dashboardApi.userRecentNotices(),
        dashboardApi.unreadCount(),
        reportApi.my(),
        assetApi.myRentals(),
        roomApi.myReservations()
      ]);
      setNotices(recentRes.data.data || []);
      setUnreadCount(unreadRes.data.data || 0);
      setMyReports(reportRes.data.data || []);
      setMyRentals(rentalRes.data.data || []);
      setMyReservations(reservationRes.data.data || []);
    })();
  }, []);

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <h1>사용자 대시보드</h1>
        <p>최근 공지, 신고, 대여, 예약, 알림 상태를 한눈에 확인합니다.</p>
      </section>
      <div className="card-row">
        <Card title="읽지 않은 알림" value={unreadCount} hint="notification:unread 캐시 사용" />
        <Card title="내 신고" value={myReports.length} />
        <Card title="내 대여" value={myRentals.length} />
        <Card title="내 예약" value={myReservations.length} />
      </div>
      <section className="content-card">
        <h2>최근 공지사항</h2>
        <div className="stack-list">
          {notices.map((item) => (
            <div className="list-item" key={item.noticeNo}>
              <strong>{item.importantYn ? '[중요] ' : ''}{item.title}</strong>
              <span>{item.category || '일반'} · 조회수 {item.viewCount}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
