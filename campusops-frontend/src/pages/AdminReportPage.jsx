import React, { useEffect, useState } from 'react';
import { reportApi } from '../api/reportApi';

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
    const text = window.prompt('관리자 답변을 입력하세요');
    if (!text) return;
    await reportApi.reply(reportNo, { adminReply: text });
    load();
  };

  return (
    <div className="content-card">
      <h1>신고 관리</h1>
      <div className="stack-list">
        {items.map((report) => (
            <div className="list-item" key={report.reportNo}>
              <strong>{report.title}</strong>
              <span>{report.place} · {report.status}</span>
              <div className="inline-actions">
                <button className="secondary-button" onClick={() => changeStatus(report.reportNo, 'CHECKING')}>검토</button>
                <button className="secondary-button" onClick={() => changeStatus(report.reportNo, 'COMPLETED')}>완료</button>
                <button className="secondary-button" onClick={() => changeStatus(report.reportNo, 'REJECTED')}>반려</button>
                <button className="secondary-button" onClick={() => reply(report.reportNo)}>답변</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
