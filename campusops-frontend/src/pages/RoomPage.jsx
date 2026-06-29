import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import StatusTimeline from '../components/StatusTimeline';
import { confirmDialog, notify } from '../utils/dialog.jsx';
import { labelOf, reservationStatusLabels, roomStatusLabels } from '../utils/labels';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const roomStatusText = {
  AVAILABLE: '예약 가능',
  DISABLED: '운영 중지'
};

const reservationStatusText = {
  RESERVED: '예약중',
  CANCELLED: '취소됨',
  COMPLETED: '이용 완료'
};

function formatTime(value) {
  if (!value) return '-';
  return String(value).slice(0, 5);
}

export default function RoomPage() {
  const [rooms, setRooms] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const availableRooms = useMemo(() => rooms.filter((room) => room.status === 'AVAILABLE'), [rooms]);
  const activeReservations = useMemo(() => myReservations.filter((item) => item.status === 'RESERVED'), [myReservations]);

  const load = async () => {
    setLoading(true);
    try {
      const [roomRes, reservationRes] = await Promise.all([roomApi.list(), roomApi.myReservations()]);
      setRooms(roomRes.data.data || []);
      setMyReservations(reservationRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancelReservation = async (reservationNo) => {
    const confirmed = await confirmDialog({
      title: '예약을 취소할까요?',
      message: '취소한 예약은 다시 복구할 수 없습니다.',
      type: 'warning',
      confirmText: '예약 취소',
      cancelText: '돌아가기'
    });
    if (!confirmed) return;
    try {
      await roomApi.cancel(reservationNo);
      await notify({ title: '예약 취소 완료', message: '예약이 취소되었습니다.', type: 'success' });
      await load();
    } catch (error) {
      await notify({ title: '취소 실패', message: error?.response?.data?.message || '예약 취소에 실패했습니다.', type: 'error' });
    }
  };

  return (
    <div className="service-page service-page--room">
      <section className="service-hero">
        <div>
          <span className="workspace-label">ROOM RESERVATION</span>
          <h1>공간 예약</h1>
          <p>강의실, 회의실, 스터디룸을 선택하고 영화관처럼 좌석을 고른 뒤 예약할 수 있습니다.</p>
        </div>
        <dl>
          <div><dt>예약 가능</dt><dd>{availableRooms.length}곳</dd></div>
          <div><dt>내 예약</dt><dd>{activeReservations.length}건</dd></div>
        </dl>
      </section>

      <section className="service-guide">
        <strong>좌석 예약 안내</strong>
        <p>공간을 선택하면 상세 화면에서 날짜와 시간을 고른 뒤 좌석 배치도에서 원하는 좌석을 예약할 수 있습니다. 이미 예약된 좌석과 운영 중지 좌석은 선택할 수 없습니다.</p>
      </section>

      <section className="service-panel">
        <header><span>ROOM DIRECTORY</span><h2>공간 목록</h2></header>
        {loading ? (
          <SkeletonList rows={4} />
        ) : (
          <div className="service-list room-directory">
            {rooms.map((room) => (
              <Link className={`service-row ${room.status === 'DISABLED' ? 'is-disabled' : ''}`} key={room.roomNo} to={`/rooms/${room.roomNo}`}>
                <div>
                  <strong>{room.roomName}</strong>
                  <span>{room.location || '위치 미정'} · {room.capacity || 0}명 수용</span>
                </div>
                <div className="service-row__actions">
                  <span className={`status-pill ${statusClass(room.status)}`}>{labelOf(roomStatusLabels, room.status)}</span>
                  <span className="secondary-button">좌석 선택</span>
                </div>
              </Link>
            ))}
            {!rooms.length ? <EmptyState eyebrow="ROOM" title="등록된 공간이 없습니다." description="관리자가 공간을 등록하면 이곳에 표시됩니다." /> : null}
          </div>
        )}
      </section>

      <section className="service-panel">
        <header><span>MY RESERVATIONS</span><h2>내 예약 내역</h2></header>
        {loading ? (
          <SkeletonList rows={4} />
        ) : (
          <div className="service-list service-list--compact">
            {myReservations.map((reservation) => (
              <div className="service-row" key={reservation.reservationNo}>
                <div>
                  <strong>
                    {reservation.roomName || `공간 #${reservation.roomNo}`}
                    {reservation.seatCode ? ` · ${reservation.seatCode} 좌석` : ''}
                  </strong>
                  <span>{reservation.reservationDate} · {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</span>
                  <StatusTimeline steps={['RESERVED', 'COMPLETED']} current={reservation.status} />
                </div>
                <div className="service-row__actions">
                  <span className={`status-pill ${statusClass(reservation.status)}`}>{labelOf(reservationStatusLabels, reservation.status)}</span>
                  {reservation.status === 'RESERVED'
                    ? <button className="secondary-button danger-button" type="button" onClick={() => cancelReservation(reservation.reservationNo)}>예약 취소</button>
                    : null}
                </div>
              </div>
            ))}
            {!myReservations.length ? <EmptyState eyebrow="RESERVATION" title="예약 내역이 없습니다." description="필요한 공간을 선택해 좌석 예약을 신청해 보세요." /> : null}
          </div>
        )}
      </section>
    </div>
  );
}
