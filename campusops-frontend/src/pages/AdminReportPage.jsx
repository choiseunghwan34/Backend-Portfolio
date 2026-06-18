import React, { useEffect, useState } from 'react';
import { reportApi } from '../api/reportApi';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import StatusTimeline from '../components/StatusTimeline';
import { notify, promptDialog } from '../utils/dialog.jsx';

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
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await reportApi.all();
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (reportNo, status) => {
    await reportApi.status(reportNo, { status });
    await notify({ title: '상태 변경 완료', message: `신고 상태가 ${statusText[status]} 상태로 변경되었습니다.`, type: 'success' });
    load();
  };

  const reply = async (reportNo) => {
    const text = await promptDialog({
      title: '관리자 답변 등록',
      message: '사용자에게 전달할 처리 안내를 입력해 주세요.',
      placeholder: '예: 현장 확인 후 조치 완료했습니다.',
      confirmText: '답변 저장'
    });
    if (!text || typeof text !== 'string') return;
    await reportApi.reply(reportNo, { adminReply: text });
    await notify({ title: '답변 등록 완료', message: '사용자 알림이 함께 생성되었습니다.', type: 'success' });
    load();
  };

  const filteredItems = filter === 'ALL' ? items : items.filter((item) => item.status === filter);

  return (
    <div className="workspace-page admin-page admin-console">
      <section className="workspace-hero admin-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">REPORT ADMIN</span>
          <h1>시설 신고 관리</h1>
          <p>접수된 시설 신고의 처리 상태를 변경하고 관리자 답변을 등록합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>전체 신고</span><strong>{items.length}건</strong></div>
      </section>

      <section className="workspace-card admin-card">
        <div className="workspace-card__head">
          <div><h2>신고 목록</h2><p>상태 변경 시 사용자 알림이 생성됩니다.</p></div>
          <div className="reference-tabs admin-tabs">
            {['ALL', 'RECEIVED', 'CHECKING', 'COMPLETED', 'REJECTED'].map((status) => (
              <button type="button" className={filter === status ? 'active' : ''} onClick={() => setFilter(status)} key={status}>
                {status === 'ALL' ? '전체' : statusText[status]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonList rows={5} />
        ) : (
          <div className="workspace-list">
            {filteredItems.map((report) => (
              <div className="workspace-row admin-report-row" key={report.reportNo}>
                <div className="workspace-row__main">
                  <strong>{report.title}</strong>
                  <span>{report.place} · {report.category || '기타'}{report.adminReply ? ` · 답변: ${report.adminReply}` : ''}</span>
                  <StatusTimeline steps={['RECEIVED', 'CHECKING', 'COMPLETED']} current={report.status} />
                </div>
                <div className="workspace-row__actions">
                  <span className={`status-pill ${statusClass(report.status)}`}>{statusText[report.status] || report.status}</span>
                  <button className="secondary-button" type="button" onClick={() => changeStatus(report.reportNo, 'CHECKING')}>확인중</button>
                  <button className="secondary-button" type="button" onClick={() => changeStatus(report.reportNo, 'COMPLETED')}>완료</button>
                  <button className="secondary-button danger-button" type="button" onClick={() => changeStatus(report.reportNo, 'REJECTED')}>반려</button>
                  <button className="secondary-button" type="button" onClick={() => reply(report.reportNo)}>답변</button>
                </div>
              </div>
            ))}
            {!filteredItems.length ? <EmptyState eyebrow="REPORT" title="조건에 맞는 신고가 없습니다." description="다른 상태 필터를 선택하거나 새 신고 접수를 기다려 주세요." /> : null}
          </div>
        )}
      </section>
    </div>
  );
}
