import React, { useEffect, useState } from 'react';
import { roomApi } from '../api/roomApi';
import { confirmDialog, notify } from '../utils/dialog.jsx';

const empty = { roomName: '', location: '', capacity: '' };

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const roomStatusText = { AVAILABLE: '예약 가능', DISABLED: '운영 중지' };
const reservationStatusText = { RESERVED: '예약됨', CANCELLED: '취소됨', COMPLETED: '이용 완료' };

function formatTime(value) {
  if (!value) return '-';
  return String(value).slice(0, 5);
}

export default function AdminRoomPage() {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [reservations, setReservations] = useState([]);

  const load = async () => {
    const [roomRes, resvRes] = await Promise.all([roomApi.list(), roomApi.adminReservations()]);
    setItems(roomRes.data.data || []);
    setReservations(resvRes.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, capacity: Number(form.capacity || 0) };
    if (editingId) await roomApi.update(editingId, payload);
    else await roomApi.create(payload);
    await notify({ title: '저장 완료', message: '공간 정보가 저장되었습니다.', type: 'success' });
    setForm(empty);
    setEditingId(null);
    load();
  };

  const startEdit = (room) => {
    setEditingId(room.roomNo);
    setForm({ roomName: room.roomName, location: room.location || '', capacity: room.capacity || '' });
  };

  const disable = async (roomNo) => {
    const confirmed = await confirmDialog({
      title: '공간을 운영 중지할까요?',
      message: '운영 중지된 공간은 사용자가 예약할 수 없습니다.',
      type: 'warning',
      confirmText: '운영 중지',
      cancelText: '취소'
    });
    if (!confirmed) return;
    await roomApi.disable(roomNo);
    await notify({ title: '운영 중지 완료', message: '공간 상태가 변경되었습니다.', type: 'success' });
    load();
  };

  return (
    <div className="workspace-page admin-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">ROOM ADMIN</span>
          <h1>공간 관리</h1>
          <p>강의실, 회의실, 스터디룸을 등록·수정하고 전체 예약 현황을 관리합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>등록 공간</span><strong>{items.length}곳</strong></div>
      </section>

      <div className="workspace-grid two">
        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>{editingId ? '공간 수정' : '공간 등록'}</h2><p>예약 가능한 공간 정보를 관리합니다.</p></div></div>
          <form className="workspace-form" onSubmit={submit}>
            <label>이름<input required value={form.roomName} onChange={(event) => setForm({ ...form, roomName: event.target.value })} /></label>
            <label>위치<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
            <label>수용 인원<input type="number" min="0" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} /></label>
            <div className="workspace-actions">
              <button className="primary-button" type="submit">{editingId ? '수정 저장' : '등록'}</button>
              {editingId ? <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(empty); }}>취소</button> : null}
            </div>
          </form>

          <div className="workspace-list">
            {items.map((room) => (
              <div className="workspace-row" key={room.roomNo}>
                <div className="workspace-row__main"><strong>{room.roomName}</strong><span>{room.location || '-'} · {room.capacity || 0}명</span></div>
                <div className="workspace-row__actions">
                  <span className={`status-pill ${statusClass(room.status)}`}>{roomStatusText[room.status] || room.status}</span>
                  <button className="secondary-button" type="button" onClick={() => startEdit(room)}>수정</button>
                  <button className="secondary-button" type="button" disabled={room.status === 'DISABLED'} onClick={() => disable(room.roomNo)}>운영 중지</button>
                </div>
              </div>
            ))}
            {!items.length ? <div className="workspace-empty">등록된 공간이 없습니다.</div> : null}
          </div>
        </section>

        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>예약 관리</h2><p>전체 예약 신청과 이용 일정을 확인합니다.</p></div></div>
          <div className="workspace-list">
            {reservations.map((reservation) => (
              <div className="workspace-row" key={reservation.reservationNo}>
                <div className="workspace-row__main">
                  <strong>{reservation.roomName || `예약 #${reservation.reservationNo}`}</strong>
                  <span>{reservation.reservationDate} · {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</span>
                </div>
                <span className={`status-pill ${statusClass(reservation.status)}`}>{reservationStatusText[reservation.status] || reservation.status || '예약됨'}</span>
              </div>
            ))}
            {!reservations.length ? <div className="workspace-empty">예약 내역이 없습니다.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
