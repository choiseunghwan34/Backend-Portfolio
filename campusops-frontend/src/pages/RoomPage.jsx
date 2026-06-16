import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { roomApi } from '../api/roomApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

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
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">ROOM RESERVATION</span>
          <h1>공간 예약</h1>
          <p>강의실, 회의실, 스터디룸 예약을 신청하고 내 예약 상태를 확인합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>예약 가능 공간</span><strong>{rooms.filter((r) => r.status !== 'DISABLED').length}개</strong></div>
      </section>

      <div className="workspace-grid two">
        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>예약 신청</h2><p>예약 시간은 중복 신청 방지를 위해 임시 선점됩니다.</p></div></div>
          <div className="workspace-list room-directory">
            {rooms.map((room) => (
              <Link className="workspace-row" key={room.roomNo} to={`/rooms/${room.roomNo}`}>
                <div className="workspace-row__main"><strong>{room.roomName}</strong><span>{room.location || '위치 미정'} · {room.capacity || 0}명</span></div>
                <span className={`status-pill ${statusClass(room.status)}`}>{room.status}</span>
              </Link>
            ))}
          </div>
          <form className="workspace-form" onSubmit={reserve}>
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

        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>내 예약 내역</h2><p>공간 이용 시간과 예약 상태를 확인합니다.</p></div></div>
          <div className="workspace-list">
            {myReservations.map((reservation) => (
              <div className="workspace-row" key={reservation.reservationNo}>
                <div className="workspace-row__main">
                  <strong>공간 #{reservation.roomNo}</strong>
                  <span>{reservation.reservationDate} · {reservation.startTime} - {reservation.endTime}</span>
                </div>
                <span className={`status-pill ${statusClass(reservation.status)}`}>{reservation.status}</span>
              </div>
            ))}
            {!myReservations.length ? <div className="workspace-empty">예약 내역이 없습니다.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
