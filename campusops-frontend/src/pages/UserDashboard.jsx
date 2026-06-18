import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homeApi } from '../api/homeApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

export default function UserDashboard() {
  const [notices, setNotices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myReports, setMyReports] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [myReservations, setMyReservations] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await homeApi.summary();
      const payload = data?.data || {};
      setNotices(payload.notices || []);
      setUnreadCount(payload.unreadCount || 0);
      setMyReports(payload.reports || []);
      setMyRentals(payload.rentals || []);
      setMyReservations(payload.reservations || []);
    })();
  }, []);

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">MY CAMPUSOPS</span>
          <h1>내 운영 현황을 한눈에 확인하세요</h1>
          <p>공지사항, 시설 신고, 기자재 대여, 공간 예약과 알림을 한 화면에서 이어서 확인할 수 있습니다.</p>
        </div>
        <div className="workspace-hero__aside">
          <span>읽지 않은 알림</span>
          <strong>{unreadCount}건</strong>
        </div>
      </section>

      <section className="workspace-stats">
        <div className="workspace-stat"><span>내 신고</span><strong>{myReports.length}</strong><small>처리 상태 확인</small></div>
        <div className="workspace-stat"><span>내 대여</span><strong>{myRentals.length}</strong><small>승인 및 반납 일정</small></div>
        <div className="workspace-stat"><span>내 예약</span><strong>{myReservations.length}</strong><small>오늘 공간 이용 일정</small></div>
        <div className="workspace-stat"><span>최근 공지</span><strong>{notices.length}</strong><small>중요 운영 안내</small></div>
      </section>

      <section className="workspace-grid two">
        <article className="workspace-card">
          <div className="workspace-card__head">
            <div>
              <h2>최근 공지사항</h2>
              <p>학교 운영팀에서 등록한 최신 공지입니다.</p>
            </div>
            <Link className="secondary-button" to="/notices">전체보기</Link>
          </div>
          <div className="workspace-list">
            {notices.length ? notices.map((item) => (
              <Link className="workspace-row" key={item.noticeNo} to={`/notices/${item.noticeNo}`}>
                <div className="workspace-row__main">
                  <strong className="notice-title">{item.importantYn ? <i className="important-dot" /> : null}{item.title}</strong>
                  <span>{item.category || '일반'} · 조회수 {item.viewCount}</span>
                </div>
                <span className="workspace-row__meta">{String(item.createdAt || '').slice(0, 10)}</span>
              </Link>
            )) : <div className="workspace-empty">최근 공지가 없습니다.</div>}
          </div>
        </article>

        <article className="workspace-card">
          <div className="workspace-card__head">
            <div>
              <h2>진행 중인 요청</h2>
              <p>신고와 대여, 예약 내역을 빠르게 확인합니다.</p>
            </div>
          </div>
          <div className="workspace-list">
            {myReports.slice(0, 2).map((report) => (
              <div className="workspace-row" key={`report-${report.reportNo}`}>
                <div className="workspace-row__main"><strong>{report.title}</strong><span>{report.place} · 시설 신고</span></div>
                <span className={`status-pill ${statusClass(report.status)}`}>{report.status}</span>
              </div>
            ))}
            {myRentals.slice(0, 2).map((rental) => (
              <div className="workspace-row" key={`rental-${rental.rentalNo}`}>
                <div className="workspace-row__main"><strong>기자재 #{rental.assetNo}</strong><span>반납 예정 {String(rental.returnDueDate || '').slice(0, 10)}</span></div>
                <span className={`status-pill ${statusClass(rental.rentalStatus)}`}>{rental.rentalStatus}</span>
              </div>
            ))}
            {!myReports.length && !myRentals.length ? <div className="workspace-empty">진행 중인 요청이 없습니다.</div> : null}
          </div>
        </article>
      </section>
    </div>
  );
}
