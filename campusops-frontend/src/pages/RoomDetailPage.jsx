import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import { notify } from '../utils/dialog.jsx';

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

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function RoomDetailPage() {
  const { roomNo } = useParams();
  const [room, setRoom] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedSeatNo, setSelectedSeatNo] = useState('');
  const [form, setForm] = useState({ reservationDate: today(), startTime: '10:00', endTime: '12:00' });
  const [loading, setLoading] = useState(true);
  const [seatLoading, setSeatLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadBase = async () => {
    setLoading(true);
    try {
      const [roomRes, reservationRes, seatRes] = await Promise.all([
        roomApi.detail(roomNo),
        roomApi.reservations(roomNo),
        roomApi.seats(roomNo)
      ]);
      setRoom(roomRes.data.data);
      setReservations(reservationRes.data.data || []);
      setSeats(seatRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadSeatStatus = async () => {
    if (!form.reservationDate || !form.startTime || !form.endTime || form.startTime >= form.endTime) return;
    setSeatLoading(true);
    try {
      const { data } = await roomApi.seatStatus(roomNo, form);
      setSeats(data.data || []);
      setSelectedSeatNo('');
    } finally {
      setSeatLoading(false);
    }
  };

  useEffect(() => { loadBase(); }, [roomNo]);
  useEffect(() => { loadSeatStatus(); }, [roomNo, form.reservationDate, form.startTime, form.endTime]);

  const groupedSeats = useMemo(() => {
    return seats.reduce((acc, seat) => {
      const row = seat.rowLabel || String(seat.seatCode || '').replace(/\d+/g, '') || '좌석';
      acc[row] = [...(acc[row] || []), seat];
      return acc;
    }, {});
  }, [seats]);

  const selectedSeat = seats.find((seat) => String(seat.seatNo) === String(selectedSeatNo));
  const statusText = roomStatusText[room?.status] || room?.status || '확인 필요';

  const reserve = async (event) => {
    event.preventDefault();
    if (!room || room.status !== 'AVAILABLE') {
      await notify({ title: '예약할 수 없는 공간입니다.', message: '운영 중지된 공간은 예약할 수 없습니다.', type: 'warning' });
      return;
    }
    if (form.startTime >= form.endTime) {
      await notify({ title: '시간을 확인해 주세요.', message: '종료 시간은 시작 시간보다 늦어야 합니다.', type: 'warning' });
      return;
    }
    if (seats.length > 0 && !selectedSeatNo) {
      await notify({ title: '좌석을 선택해 주세요.', message: '예약할 좌석을 먼저 선택해야 합니다.', type: 'info' });
      return;
    }

    setSubmitting(true);
    try {
      await roomApi.reserve(roomNo, {
        ...form,
        seatNo: selectedSeatNo ? Number(selectedSeatNo) : null
      });
      await notify({
        title: '예약이 완료되었습니다.',
        message: `${room.roomName}${selectedSeat ? ` ${selectedSeat.seatCode} 좌석` : ''} 예약이 확정되었습니다.`,
        type: 'success'
      });
      await Promise.all([loadBase(), loadSeatStatus()]);
    } catch (error) {
      await notify({
        title: '예약에 실패했습니다.',
        message: error?.response?.data?.message || '예약 정보를 확인해 주세요.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !room) {
    return <div className="workspace-card detail-article">공간 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="workspace-page detail-article">
      <article className="workspace-card detail-card room-seat-page">
        <div className="detail-head">
          <div>
            <span className="workspace-label">SEAT RESERVATION</span>
            <h1>{room.roomName}</h1>
            <div className="detail-meta">
              <span className="detail-badge">{room.location || '위치 미정'}</span>
              <span>{room.capacity || 0}명 수용</span>
              <span>{seats.length || 0}개 좌석</span>
              <span>{reservations.length}건 예약</span>
            </div>
          </div>
          <div className="workspace-actions">
            <span className={`status-pill ${statusClass(room.status)}`}>{statusText}</span>
            <Link className="secondary-button" to="/rooms">목록</Link>
          </div>
        </div>

        <div className="seat-reservation-layout">
          <section className="seat-booking-card">
            <header>
              <span className="workspace-label">SELECT SCHEDULE</span>
              <h2>예약 시간 선택</h2>
            </header>
            <form className="seat-booking-form" onSubmit={reserve}>
              <label>
                날짜
                <input type="date" value={form.reservationDate} onChange={(event) => setForm({ ...form, reservationDate: event.target.value })} />
              </label>
              <label>
                시작
                <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
              </label>
              <label>
                종료
                <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} />
              </label>
              <button className="primary-button" type="submit" disabled={submitting || room.status !== 'AVAILABLE'}>
                {submitting ? '예약 중...' : selectedSeat ? `${selectedSeat.seatCode} 예약하기` : '예약하기'}
              </button>
            </form>

            <div className="seat-legend">
              <span><i className="is-available" />선택 가능</span>
              <span><i className="is-selected" />선택됨</span>
              <span><i className="is-reserved" />예약됨</span>
              <span><i className="is-disabled" />사용 불가</span>
            </div>
          </section>

          <section className="seat-map-card">
            <div className="seat-map-head">
              <div>
                <span className="workspace-label">SEAT MAP</span>
                <h2>좌석 선택</h2>
              </div>
              {seatLoading ? <span className="seat-map-loading">좌석 현황 갱신 중...</span> : null}
            </div>

            {seats.length ? (
              <div className="seat-map">
                <div className="seat-stage">FRONT / BOARD</div>
                {Object.entries(groupedSeats).map(([row, rowSeats]) => (
                  <div className="seat-row" key={row}>
                    <span className="seat-row-label">{row}</span>
                    <div className="seat-row-grid">
                      {rowSeats.map((seat) => {
                        const reserved = Boolean(seat.reserved);
                        const disabled = seat.status !== 'AVAILABLE';
                        const selected = String(selectedSeatNo) === String(seat.seatNo);
                        return (
                          <button
                            type="button"
                            key={seat.seatNo}
                            className={`seat-button ${selected ? 'is-selected' : ''} ${reserved ? 'is-reserved' : ''} ${disabled ? 'is-disabled' : ''}`}
                            disabled={reserved || disabled || room.status !== 'AVAILABLE'}
                            onClick={() => setSelectedSeatNo(String(seat.seatNo))}
                          >
                            {seat.seatCode}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="workspace-empty">등록된 좌석이 없습니다. 이 공간은 시간 단위 전체 예약으로 이용됩니다.</div>
            )}
          </section>
        </div>

        <section className="seat-reservation-history">
          <header>
            <span className="workspace-label">RESERVATION STATUS</span>
            <h2>예약 현황</h2>
          </header>
          <div className="workspace-list">
            {reservations.map((reservation) => (
              <div className="workspace-row" key={reservation.reservationNo}>
                <div className="workspace-row__main">
                  <strong>{reservation.reservationDate}</strong>
                  <span>
                    {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                    {reservation.seatCode ? ` · ${reservation.seatCode} 좌석` : ''}
                    {` · 사용자 #${reservation.userNo}`}
                  </span>
                </div>
                <span className={`status-pill ${statusClass(reservation.status)}`}>{reservationStatusText[reservation.status] || reservation.status}</span>
              </div>
            ))}
            {!reservations.length ? <div className="workspace-empty">해당 공간의 예약 내역이 없습니다.</div> : null}
          </div>
        </section>
      </article>
    </div>
  );
}
