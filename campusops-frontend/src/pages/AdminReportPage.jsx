import React, { useEffect, useState } from 'react';
import { reportApi } from '../api/reportApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const statusText = {
  RECEIVED: '접수',
  CHECKING: '확인중',
  COMPLETED: '완료',
  REJECTED: '반려'
};

export default function AdminReportPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await reportApi.all();
    setItems(data.data || []);
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (reportNo, status) => {
    await reportApi.status(reportNo, { status });
    load();
  };

  const reply = async (reportNo) => {
    const text = window.prompt('사용자에게 전달할 관리자 답변을 입력하세요.');
    if (!text) return;
    await reportApi.reply(reportNo, { adminReply: text });
    load();
  };

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">REPORT ADMIN</span>
          <h1>신고 관리</h1>
          <p>접수된 시설 신고의 처리 상태를 변경하고 관리자 답변을 등록합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>전체 신고</span><strong>{items.length}건</strong></div>
      </section>

      <section className="workspace-card">
        <div className="workspace-card__head">
          <div><h2>신고 목록</h2><p>상태 변경 시 사용자 알림이 생성됩니다.</p></div>
        </div>
        <div className="workspace-list">
          {items.map((report) => (
            <div className="workspace-row" key={report.reportNo}>
              <div className="workspace-row__main">
                <strong>{report.title}</strong>
                <span>{report.place} · {report.category || '기타'}{report.adminReply ? ` · 답변: ${report.adminReply}` : ''}</span>
              </div>
              <div className="workspace-row__actions">
                <span className={`status-pill ${statusClass(report.status)}`}>{statusText[report.status] || report.status}</span>
                <button className="secondary-button" type="button" onClick={() => changeStatus(report.reportNo, 'CHECKING')}>확인중</button>
                <button className="secondary-button" type="button" onClick={() => changeStatus(report.reportNo, 'COMPLETED')}>완료</button>
                <button className="secondary-button" type="button" onClick={() => changeStatus(report.reportNo, 'REJECTED')}>반려</button>
                <button className="secondary-button" type="button" onClick={() => reply(report.reportNo)}>답변</button>
              </div>
            </div>
          ))}
          {!items.length ? <div className="workspace-empty">접수된 신고가 없습니다.</div> : null}
        </div>
      </section>
    </div>
  );
}
