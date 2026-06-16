import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { roomApi } from '../api/roomApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const roomStatusText = {
  AVAILABLE: '예약 가능',
  DISABLED: '운영 중지'
};

const reservationStatusText = {
  RESERVED: '예약됨',
  CANCELLED: '취소됨',
  COMPLETED: '이용 완료'
};

export default function RoomDetailPage() {
  const { roomNo } = useParams();
  const [room, setRoom] = useState(null);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    (async () => {
      const [roomRes, reservationRes] = await Promise.all([
        roomApi.detail(roomNo),
        roomApi.reservations(roomNo)
      ]);
      setRoom(roomRes.data.data);
      setReservations(reservationRes.data.data || []);
    })();
  }, [roomNo]);

  if (!room) return <div className="workspace-card detail-article">불러오는 중...</div>;

  const statusText = roomStatusText[room.status] || room.status || '확인 필요';
  const nextReservation = reservations[0];

  return (
    <div className="workspace-page detail-article">
      <article className="workspace-card detail-card">
        <div className="detail-head">
          <div>
            <span className="workspace-label">SPACE RESERVATION</span>
            <h1>{room.roomName}</h1>
            <div className="detail-meta">
              <span className="detail-badge">{room.location || '위치 미정'}</span>
              <span>{room.capacity || 0}명 수용</span>
              <span>{reservations.length}건 예약</span>
            </div>
          </div>
          <div className="workspace-actions">
            <span className={`status-pill ${statusClass(room.status)}`}>{statusText}</span>
            <Link className="secondary-button" to="/rooms">목록</Link>
          </div>
        </div>

        <div className="detail-layout">
          <section className="detail-body">
            <h2>예약 현황</h2>
            {nextReservation ? (
              <div className="detail-action-panel">
                <div>
                  <span className="workspace-label">NEXT RESERVATION</span>
                  <h3>{nextReservation.reservationDate}</h3>
                  <p>{nextReservation.startTime} - {nextReservation.endTime} 일정이 가장 가까운 예약입니다.</p>
                </div>
                <Link className="secondary-button" to="/rooms">예약 신청</Link>
              </div>
            ) : (
              <div className="detail-action-panel">
                <div>
                  <span className="workspace-label">AVAILABLE SLOT</span>
                  <h3>등록된 예약이 없습니다</h3>
                  <p>현재 예약 현황이 비어 있어 원하는 시간대를 신청할 수 있습니다.</p>
                </div>
                <Link className="primary-button" to="/rooms">예약 신청</Link>
              </div>
            )}
            <div className="workspace-list">
              {reservations.map((reservation) => (
                <div className="workspace-row" key={reservation.reservationNo}>
                  <div className="workspace-row__main">
                    <strong>{reservation.reservationDate}</strong>
                    <span>{reservation.startTime} - {reservation.endTime} · 사용자 #{reservation.userNo}</span>
                  </div>
                  <span className={`status-pill ${statusClass(reservation.status)}`}>{reservationStatusText[reservation.status] || reservation.status}</span>
                </div>
              ))}
              {!reservations.length ? <div className="workspace-empty">해당 공간의 예약 내역이 없습니다.</div> : null}
            </div>
          </section>
          <aside className="detail-side">
            <div className="detail-side__summary">
              <span>공간 상태</span>
              <strong>{statusText}</strong>
              <p>{room.status === 'AVAILABLE' ? '운영 시간 내 예약 신청이 가능한 공간입니다.' : '현재 관리자가 예약을 제한한 공간입니다.'}</p>
            </div>
            <div><span>공간 번호</span><strong>#{room.roomNo}</strong></div>
            <div><span>위치</span><strong>{room.location || '위치 미정'}</strong></div>
            <div><span>예약 안내</span><p>날짜와 시작/종료 시간을 지정해 신청하면 중복 여부를 확인합니다.</p></div>
          </aside>
        </div>
      </article>
    </div>
  );
}
