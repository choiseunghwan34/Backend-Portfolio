import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function RoomPage() {
  const [rooms, setRooms] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [form, setForm] = useState({ roomNo: '', reservationDate: '', startTime: '', endTime: '' });

  const load = async () => {
    const [roomRes, reservationRes] = await Promise.all([roomApi.list(), roomApi.myReservations()]);
    setRooms(roomRes.data.data || []);
    setMyReservations(reservationRes.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const reserve = async (e) => {
    e.preventDefault();
    await roomApi.reserve(form.roomNo, {
      reservationDate: form.reservationDate,
      startTime: form.startTime,
      endTime: form.endTime
    });
    setForm({ roomNo: '', reservationDate: '', startTime: '', endTime: '' });
    load();
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
          <div><dt>예약 가능</dt><dd>{rooms.filter((r) => r.status !== 'DISABLED').length}곳</dd></div>
          <div><dt>내 예약</dt><dd>{myReservations.length}건</dd></div>
        </dl>
      </section>

      <section className="service-guide">
        <strong>예약 이용 안내</strong>
        <p>날짜와 시작/종료 시간을 선택하면 중복 예약 여부를 확인합니다. 예약 시간은 임시 선점되어 중복 신청을 줄입니다.</p>
      </section>

      <div className="service-layout">
        <section className="service-panel">
          <header><span>AVAILABLE ROOMS</span><h2>공간 목록</h2></header>
          <div className="service-list room-directory">
            {rooms.map((room) => (
              <Link className="service-row" key={room.roomNo} to={`/rooms/${room.roomNo}`}>
                <div><strong>{room.roomName}</strong><span>{room.location || '위치 미정'} · {room.capacity || 0}명</span></div>
                <span className={`status-pill ${statusClass(room.status)}`}>{roomStatusText[room.status] || room.status}</span>
              </Link>
            ))}
            {!rooms.length ? <div className="workspace-empty">등록된 공간이 없습니다.</div> : null}
          </div>
        </section>

        <section className="service-panel service-panel--form">
          <header><span>RESERVATION FORM</span><h2>예약 신청</h2></header>
          <form className="service-form" onSubmit={reserve}>
            <label>공간 선택
              <select required value={form.roomNo} onChange={(e) => setForm({ ...form, roomNo: e.target.value })}>
                <option value="">선택</option>
                {rooms.map((room) => <option key={room.roomNo} value={room.roomNo}>{room.roomName} · {room.location || '위치 미정'} · {room.capacity || 0}명</option>)}
              </select>
            </label>
            <label>예약 날짜<input required type="date" value={form.reservationDate} onChange={(e) => setForm({ ...form, reservationDate: e.target.value })} /></label>
            <label>시작 시간<input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label>
            <label>종료 시간<input required type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label>
            <button className="primary-button" type="submit">예약 신청</button>
          </form>
        </section>
      </div>

      <section className="service-panel">
        <header><span>MY RESERVATIONS</span><h2>내 예약 내역</h2></header>
        <div className="service-list service-list--compact">
          {myReservations.map((reservation) => (
            <div className="service-row" key={reservation.reservationNo}>
              <div>
                <strong>{reservation.roomName || `공간 #${reservation.roomNo}`}</strong>
                <span>{reservation.reservationDate} · {reservation.startTime} - {reservation.endTime}</span>
              </div>
              <span className={`status-pill ${statusClass(reservation.status)}`}>{reservationStatusText[reservation.status] || reservation.status}</span>
            </div>
          ))}
          {!myReservations.length ? <div className="workspace-empty">예약 내역이 없습니다.</div> : null}
        </div>
      </section>
    </div>
  );
}
