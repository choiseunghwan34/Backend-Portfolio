import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function ReportPage() {
  const [form, setForm] = useState({ place: '', category: '', title: '', content: '' });
  const [myReports, setMyReports] = useState([]);

  const load = async () => {
    const { data } = await reportApi.my();
    setMyReports(data.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await reportApi.create(form);
    setForm({ place: '', category: '', title: '', content: '' });
    load();
  };

  return (
    <div className="service-page service-page--report">
      <section className="service-hero">
        <div>
          <span className="workspace-label">FACILITY REPORT</span>
          <h1>시설 신고</h1>
          <p>고장 위치와 증상을 접수하면 담당자가 확인 후 처리 상태를 안내합니다.</p>
        </div>
        <dl>
          <div><dt>내 신고</dt><dd>{myReports.length}건</dd></div>
          <div><dt>처리중</dt><dd>{myReports.filter((item) => item.status === 'CHECKING').length}건</dd></div>
        </dl>
      </section>

      <section className="service-guide">
        <strong>신고 전 확인해 주세요</strong>
        <p>정확한 장소와 증상을 함께 입력하면 담당자가 더 빠르게 확인할 수 있습니다. 같은 내용의 반복 신고는 60초 간격으로 제한됩니다.</p>
      </section>

      <div className="service-layout">
        <section className="service-panel service-panel--form">
          <header><span>REPORT FORM</span><h2>신고 등록</h2></header>
          <form className="service-form" onSubmit={submit}>
            <label>장소<input required value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="예: 본관 3층 복도" /></label>
            <label>카테고리<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="조명, 냉난방, 출입문 등" /></label>
            <label>제목<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="신고 제목" /></label>
            <label>내용<textarea required rows="6" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="증상과 요청 내용을 입력하세요." /></label>
            <button className="primary-button" type="submit">신고 등록</button>
          </form>
        </section>

        <section className="service-panel">
          <header><span>MY REPORTS</span><h2>내 신고 목록</h2></header>
          <div className="service-list">
            {myReports.map((report) => (
              <Link className="service-row" key={report.reportNo} to={`/reports/${report.reportNo}`}>
                <div>
                  <strong>{report.title}</strong>
                  <span>{report.place} · {report.category || '기타'}{report.adminReply ? ` · 답변: ${report.adminReply}` : ''}</span>
                </div>
                <span className={`status-pill ${statusClass(report.status)}`}>{statusText[report.status] || report.status}</span>
              </Link>
            ))}
            {!myReports.length ? <div className="workspace-empty">아직 등록한 신고가 없습니다.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
