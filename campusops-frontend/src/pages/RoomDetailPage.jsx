import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { roomApi } from '../api/roomApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

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

  return (
    <div className="workspace-page detail-article">
      <article className="workspace-card detail-card">
        <div className="detail-head">
          <div>
            <span className="workspace-label">ROOM DETAIL</span>
            <h1>{room.roomName}</h1>
            <p>{room.location || '위치 미정'} · {room.capacity || 0}명 수용</p>
          </div>
          <div className="workspace-actions">
            <span className={`status-pill ${statusClass(room.status)}`}>{room.status}</span>
            <Link className="secondary-button" to="/rooms">목록</Link>
          </div>
        </div>

        <div className="detail-layout">
          <section className="detail-body">
            <h2>예약 현황</h2>
            <div className="workspace-list">
              {reservations.map((reservation) => (
                <div className="workspace-row" key={reservation.reservationNo}>
                  <div className="workspace-row__main">
                    <strong>{reservation.reservationDate}</strong>
                    <span>{reservation.startTime} - {reservation.endTime} · 사용자 #{reservation.userNo}</span>
                  </div>
                  <span className={`status-pill ${statusClass(reservation.status)}`}>{reservation.status}</span>
                </div>
              ))}
              {!reservations.length ? <div className="workspace-empty">해당 공간의 예약 내역이 없습니다.</div> : null}
            </div>
          </section>
          <aside className="detail-side">
            <div><span>공간 번호</span><strong>#{room.roomNo}</strong></div>
            <div><span>위치</span><strong>{room.location || '위치 미정'}</strong></div>
            <div><span>수용 인원</span><strong>{room.capacity || 0}명</strong></div>
            <div><span>예약 안내</span><p>공간 예약은 날짜와 시작/종료 시간을 지정해 신청합니다.</p></div>
          </aside>
        </div>
      </article>
    </div>
  );
}
