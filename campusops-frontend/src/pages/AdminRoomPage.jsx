import React, { useEffect, useState } from 'react';
import { roomApi } from '../api/roomApi';

const empty = { roomName: '', location: '', capacity: '' };

function statusClass(value = '') {
  return String(value).toLowerCase();
}

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
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy"><span className="workspace-label">ROOM ADMIN</span><h1>공간 관리</h1><p>강의실, 회의실, 스터디룸을 등록하고 예약 현황을 관리합니다.</p></div>
        <div className="workspace-hero__aside"><span>등록 공간</span><strong>{items.length}개</strong></div>
      </section>
      <div className="workspace-grid two">
        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>공간 등록</h2><p>예약 가능한 공간 정보를 등록합니다.</p></div></div>
          <form className="workspace-form" onSubmit={submit}>
            <label>이름<input required value={form.roomName} onChange={(e) => setForm({ ...form, roomName: e.target.value })} /></label>
            <label>위치<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
            <label>수용 인원<input type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
            <button className="primary-button" type="submit">등록</button>
          </form>
          <div className="workspace-list">
            {items.map((room) => (
              <div className="workspace-row" key={room.roomNo}>
                <div className="workspace-row__main"><strong>{room.roomName}</strong><span>{room.location || '-'} · {room.capacity || 0}명</span></div>
                <div className="workspace-row__actions"><span className={`status-pill ${statusClass(room.status)}`}>{room.status}</span><button className="secondary-button" onClick={() => roomApi.disable(room.roomNo).then(load)}>비활성화</button></div>
              </div>
            ))}
          </div>
        </section>
        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>예약 관리</h2><p>전체 예약 신청과 이용 일정을 확인합니다.</p></div></div>
          <div className="workspace-list">
            {reservations.map((reservation) => (
              <div className="workspace-row" key={reservation.reservationNo}>
                <div className="workspace-row__main"><strong>예약 #{reservation.reservationNo}</strong><span>공간 #{reservation.roomNo} · {reservation.reservationDate} {reservation.startTime} - {reservation.endTime}</span></div>
                <span className={`status-pill ${statusClass(reservation.status)}`}>{reservation.status || 'RESERVED'}</span>
              </div>
            ))}
            {!reservations.length ? <div className="workspace-empty">예약 내역이 없습니다.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
