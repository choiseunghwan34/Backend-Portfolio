import React from 'react';

const labels = {
  RECEIVED: '접수',
  CHECKING: '확인중',
  COMPLETED: '완료',
  REJECTED: '반려',
  REQUESTED: '신청',
  APPROVED: '승인',
  RETURNED: '반납',
  RESERVED: '예약',
  CANCELLED: '취소'
};

export default function StatusTimeline({ steps = [], current }) {
  const currentIndex = Math.max(0, steps.indexOf(current));

  return (
    <ol className="status-timeline">
      {steps.map((step, index) => {
        const done = index <= currentIndex && current !== 'REJECTED' && current !== 'CANCELLED';
        const active = step === current;
        return (
          <li className={`${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`} key={step}>
            <i />
            <span>{labels[step] || step}</span>
          </li>
        );
      })}
    </ol>
  );
}
