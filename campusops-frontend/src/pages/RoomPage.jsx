import React, { useEffect, useState } from 'react';
import { roomApi } from '../api/roomApi';

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
    <div className="content-grid two-col">
      <section className="content-card">
        <h1>공간 예약</h1>
        <form className="form-grid" onSubmit={reserve}>
          <label>공간 선택
            <select value={form.roomNo} onChange={(e) => setForm({ ...form, roomNo: e.target.value })}>
              <option value="">선택</option>
              {rooms.map((room) => <option key={room.roomNo} value={room.roomNo}>{room.roomName}</option>)}
            </select>
          </label>
          <label>예약 날짜<input type="date" value={form.reservationDate} onChange={(e) => setForm({ ...form, reservationDate: e.target.value })} /></label>
          <label>시작 시간<input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label>
          <label>종료 시간<input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label>
          <button className="primary-button" type="submit">예약 신청</button>
        </form>
      </section>
      <section className="content-card">
        <h2>내 예약 내역</h2>
        <div className="stack-list">
          {myReservations.map((reservation) => (
            <div className="list-item" key={reservation.reservationNo}>
              <strong>공간 #{reservation.roomNo}</strong>
              <span>{reservation.reservationDate} {reservation.startTime} - {reservation.endTime} · {reservation.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
