import React, { useEffect, useState } from 'react';
import { reportApi } from '../api/reportApi';

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
    <div className="content-grid two-col">
      <section className="content-card">
        <h1>시설 신고</h1>
        <form className="form-grid" onSubmit={submit}>
          <label>장소<input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} /></label>
          <label>카테고리<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label>제목<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>내용<textarea rows="5" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
          <button className="primary-button" type="submit">신고 등록</button>
        </form>
      </section>
      <section className="content-card">
        <h2>내 신고 목록</h2>
        <div className="stack-list">
          {myReports.map((report) => (
            <div className="list-item" key={report.reportNo}>
              <strong>{report.title}</strong>
              <span>{report.place} · {report.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
