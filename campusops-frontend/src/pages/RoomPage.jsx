import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import StatusTimeline from '../components/StatusTimeline';
import { confirmDialog, notify } from '../utils/dialog.jsx';

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

function isPastSlot(date, startTime) {
  if (!date || !startTime) return false;
  const start = new Date(`${date}T${startTime}`);
  return Number.isFinite(start.getTime()) && start <= new Date();
}

export default function RoomPage() {
  const [rooms, setRooms] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [form, setForm] = useState({ roomNo: '', reservationDate: '', startTime: '', endTime: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const reserve = async (event) => {
    event.preventDefault();
    setMessage('');

    const selectedRoom = rooms.find((room) => String(room.roomNo) === String(form.roomNo));
    if (!selectedRoom) {
      await notify({ title: '공간 선택 필요', message: '예약할 공간을 선택해 주세요.', type: 'info' });
      return;
    }
    if (selectedRoom.status !== 'AVAILABLE') {
      await notify({ title: '예약할 수 없는 공간입니다', message: '운영 중지된 공간은 예약할 수 없습니다.', type: 'warning' });
      return;
    }
    if (!form.reservationDate || !form.startTime || !form.endTime) {
      await notify({ title: '예약 정보 확인', message: '예약 날짜와 시간을 모두 입력해 주세요.', type: 'info' });
      return;
    }
    if (form.startTime >= form.endTime) {
      await notify({ title: '시간 확인 필요', message: '종료 시간은 시작 시간보다 늦어야 합니다.', type: 'warning' });
      return;
    }
    if (isPastSlot(form.reservationDate, form.startTime)) {
      await notify({ title: '지난 시간입니다', message: '현재 이후 시간만 예약할 수 있습니다.', type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      await roomApi.reserve(form.roomNo, {
        reservationDate: form.reservationDate,
        startTime: form.startTime,
        endTime: form.endTime
      });
      setForm({ roomNo: '', reservationDate: '', startTime: '', endTime: '' });
      setMessage('예약이 완료되었습니다.');
      await notify({ title: '예약 완료', message: `${selectedRoom.roomName} 예약이 접수되었습니다.`, type: 'success' });
      await load();
    } catch (error) {
      await notify({ title: '예약 실패', message: error?.response?.data?.message || '예약 신청에 실패했습니다.', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

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
      await notify({ title: '취소 실패', message: error?.response?.data?.message || '예약 취소에 실패했습니다.', type: 'danger' });
    }
  };

  return (
    <div className="service-page service-page--room">
      <section className="service-hero">
        <div>
          <span className="workspace-label">ROOM RESERVATION</span>
          <h1>공간 예약</h1>
          <p>강의실, 회의실, 스터디룸의 이용 가능 여부를 확인하고 예약을 신청하세요.</p>
        </div>
        <dl>
          <div><dt>예약 가능</dt><dd>{availableRooms.length}곳</dd></div>
          <div><dt>내 예약</dt><dd>{activeReservations.length}건</dd></div>
        </dl>
      </section>

      <section className="service-guide">
        <strong>예약 이용 안내</strong>
        <p>예약 시간이 지나면 자동으로 이용 완료 상태로 전환됩니다. 운영 중지된 공간과 이미 예약된 시간은 신청할 수 없습니다.</p>
      </section>

      {message ? <div className="detail-message">{message}</div> : null}

      <div className="service-layout">
        <section className="service-panel">
          <header><span>ROOM DIRECTORY</span><h2>공간 목록</h2></header>
          {loading ? (
            <SkeletonList rows={4} />
          ) : (
            <div className="service-list room-directory">
              {rooms.map((room) => (
                <Link className={`service-row ${room.status === 'DISABLED' ? 'is-disabled' : ''}`} key={room.roomNo} to={`/rooms/${room.roomNo}`}>
                  <div><strong>{room.roomName}</strong><span>{room.location || '위치 미정'} · {room.capacity || 0}명</span></div>
                  <span className={`status-pill ${statusClass(room.status)}`}>{roomStatusText[room.status] || room.status}</span>
                </Link>
              ))}
              {!rooms.length ? <EmptyState eyebrow="ROOM" title="등록된 공간이 없습니다." description="관리자가 공간을 등록하면 이곳에 표시됩니다." /> : null}
            </div>
          )}
        </section>

        <section className="service-panel service-panel--form">
          <header><span>RESERVATION FORM</span><h2>예약 신청</h2></header>
          <form className="service-form" onSubmit={reserve}>
            <label>공간 선택
              <select required value={form.roomNo} onChange={(event) => setForm({ ...form, roomNo: event.target.value })}>
                <option value="">선택</option>
                {rooms.map((room) => (
                  <option key={room.roomNo} value={room.roomNo} disabled={room.status !== 'AVAILABLE'}>
                    {room.roomName} · {room.location || '위치 미정'} · {room.capacity || 0}명{room.status !== 'AVAILABLE' ? ' · 운영 중지' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>예약 날짜<input required type="date" value={form.reservationDate} onChange={(event) => setForm({ ...form, reservationDate: event.target.value })} /></label>
            <label>시작 시간<input required type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} /></label>
            <label>종료 시간<input required type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} /></label>
            <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '예약 중...' : '예약 신청'}</button>
          </form>
        </section>
      </div>

      <section className="service-panel">
        <header><span>MY RESERVATIONS</span><h2>내 예약 내역</h2></header>
        {loading ? (
          <SkeletonList rows={4} />
        ) : (
          <div className="service-list service-list--compact">
            {myReservations.map((reservation) => (
              <div className="service-row" key={reservation.reservationNo}>
                <div>
                  <strong>{reservation.roomName || `공간 #${reservation.roomNo}`}</strong>
                  <span>{reservation.reservationDate} · {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</span>
                  <StatusTimeline steps={['RESERVED', 'COMPLETED']} current={reservation.status} />
                </div>
                <div className="service-row__actions">
                  <span className={`status-pill ${statusClass(reservation.status)}`}>{reservationStatusText[reservation.status] || reservation.status}</span>
                  {reservation.status === 'RESERVED'
                    ? <button className="secondary-button danger-button" type="button" onClick={() => cancelReservation(reservation.reservationNo)}>예약 취소</button>
                    : null}
                </div>
              </div>
            ))}
            {!myReservations.length ? <EmptyState eyebrow="RESERVATION" title="예약 내역이 없습니다." description="필요한 공간을 선택해 예약을 신청해 보세요." /> : null}
          </div>
        )}
      </section>
    </div>
  );
}
