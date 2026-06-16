import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { reportApi } from '../api/reportApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const reportStatusText = {
  RECEIVED: '접수',
  CHECKING: '확인중',
  COMPLETED: '처리 완료',
  REJECTED: '반려'
};

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

  const createdDate = String(report.createdAt || '').slice(0, 10) || '-';
  const updatedDate = String(report.updatedAt || report.createdAt || '').slice(0, 10) || '-';
  const statusText = reportStatusText[report.status] || report.status || '접수';

  return (
    <div className="workspace-page detail-article">
      <article className="workspace-card detail-card">
        <div className="detail-head">
          <div>
            <span className="workspace-label">FACILITY REPORT</span>
            <h1>{report.title}</h1>
            <div className="detail-meta">
              <span className="detail-badge">{report.category || '시설'}</span>
              <span>{report.place}</span>
              <span>{createdDate}</span>
            </div>
          </div>
          <div className="workspace-actions">
            <span className={`status-pill ${statusClass(report.status)}`}>{statusText}</span>
            <Link className="secondary-button" to="/reports">목록</Link>
          </div>
        </div>

        <div className="detail-layout">
          <section className="detail-body">
            <h2>신고 내용</h2>
            <p className="body-text">{report.content}</p>
            <div className="detail-response">
              <div>
                <span className="workspace-label">ADMIN RESPONSE</span>
                <h3>관리자 처리 메모</h3>
              </div>
              <p>{report.adminReply || '담당자가 내용을 확인한 뒤 처리 결과를 이곳에 남깁니다.'}</p>
            </div>
          </section>
          <aside className="detail-side">
            <div className="detail-side__summary">
              <span>처리 흐름</span>
              <strong>{statusText}</strong>
              <p>{statusText === '처리 완료' ? '요청 사항이 처리 완료되었습니다.' : '담당자가 신고 내용을 확인하고 있습니다.'}</p>
            </div>
            <div><span>신고 위치</span><strong>{report.place}</strong></div>
            <div><span>분류</span><strong>{report.category || '시설'}</strong></div>
            <div><span>최종 업데이트</span><strong>{updatedDate}</strong></div>
          </aside>
        </div>
      </article>
    </div>
  );
}
