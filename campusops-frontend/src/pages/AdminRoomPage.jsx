import React, { useEffect, useState } from 'react';
import { roomApi } from '../api/roomApi';

const empty = { roomName: '', location: '', capacity: '' };

export default function AdminRoomPage() {
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState([]);
  const [reservations, setReservations] = useState([]);

  const load = async () => {
    const [roomRes, resvRes] = await Promise.all([roomApi.list(), roomApi.adminReservations()]);
    setItems(roomRes.data.data || []);
    setReservations(resvRes.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await roomApi.create({ ...form, capacity: Number(form.capacity || 0) });
    setForm(empty);
    load();
  };

  return (
    <div className="content-grid two-col">
      <section className="content-card">
        <h1>공간 등록</h1>
        <form className="form-grid" onSubmit={submit}>
          <label>이름<input value={form.roomName} onChange={(e) => setForm({ ...form, roomName: e.target.value })} /></label>
          <label>위치<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
          <label>수용 인원<input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
          <button className="primary-button" type="submit">등록</button>
        </form>
        <div className="stack-list">
          {items.map((room) => (
            <div className="list-item" key={room.roomNo}>
              <strong>{room.roomName}</strong>
              <span>{room.location || '-'} · {room.status}</span>
              <button className="secondary-button" onClick={() => roomApi.disable(room.roomNo).then(load)}>비활성화</button>
            </div>
          ))}
        </div>
      </section>
      <section className="content-card">
        <h2>예약 관리</h2>
        <div className="stack-list">
          {reservations.map((reservation) => (
            <div className="list-item" key={reservation.reservationNo}>
              <strong>#{reservation.reservationNo}</strong>
              <span>{reservation.reservationDate} {reservation.startTime}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
