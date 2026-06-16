import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { reportApi } from '../api/reportApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

export default function ReportDetailPage() {
  const { reportNo } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await reportApi.detail(reportNo);
      setReport(data.data);
    })();
  }, [reportNo]);

  if (!report) return <div className="workspace-card detail-article">불러오는 중...</div>;

  return (
    <div className="workspace-page detail-article">
      <article className="workspace-card detail-card">
        <div className="detail-head">
          <div>
            <span className="workspace-label">REPORT DETAIL</span>
            <h1>{report.title}</h1>
            <p>{report.place} · {report.category || '기타'} · {String(report.createdAt || '').slice(0, 10)}</p>
          </div>
          <div className="workspace-actions">
            <span className={`status-pill ${statusClass(report.status)}`}>{report.status}</span>
            <Link className="secondary-button" to="/reports">목록</Link>
          </div>
        </div>

        <div className="detail-layout">
          <section className="detail-body">
            <h2>신고 내용</h2>
            <p className="body-text">{report.content}</p>
          </section>
          <aside className="detail-side">
            <div><span>장소</span><strong>{report.place}</strong></div>
            <div><span>분류</span><strong>{report.category || '기타'}</strong></div>
            <div><span>처리 상태</span><strong>{report.status}</strong></div>
            <div><span>관리자 답변</span><p>{report.adminReply || '아직 등록된 답변이 없습니다.'}</p></div>
          </aside>
        </div>
      </article>
    </div>
  );
}
