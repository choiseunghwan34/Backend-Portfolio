import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportApi } from '../api/reportApi';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import StatusTimeline from '../components/StatusTimeline';
import { notify } from '../utils/dialog.jsx';
import { labelOf, reportStatusLabels } from '../utils/labels';

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await reportApi.my();
      setMyReports(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await reportApi.create(form);
      setForm({ place: '', category: '', title: '', content: '' });
      await notify({ title: '신고가 접수되었습니다', message: '관리자가 확인 후 처리 상태를 안내합니다.', type: 'success' });
      await load();
    } catch (error) {
      await notify({ title: '신고 접수 실패', message: error?.response?.data?.message || '잠시 후 다시 시도해 주세요.', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
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
            <label>장소<input required value={form.place} onChange={(event) => setForm({ ...form, place: event.target.value })} placeholder="예: 본관 3층 복도" /></label>
            <label>카테고리<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="조명, 냉난방, 출입문 등" /></label>
            <label>제목<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="신고 제목" /></label>
            <label>내용<textarea required rows="6" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="증상과 요청 내용을 입력하세요." /></label>
            <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '접수 중...' : '신고 등록'}</button>
          </form>
        </section>

        <section className="service-panel">
          <header><span>MY REPORTS</span><h2>내 신고 목록</h2></header>
          {loading ? (
            <SkeletonList rows={4} />
          ) : (
            <div className="service-list">
              {myReports.map((report) => (
                <Link className="service-row" key={report.reportNo} to={`/reports/${report.reportNo}`}>
                  <div>
                    <strong>{report.title}</strong>
                    <span>{report.place} · {report.category || '기타'}{report.adminReply ? ` · 답변: ${report.adminReply}` : ''}</span>
                    <StatusTimeline steps={['RECEIVED', 'CHECKING', 'COMPLETED']} current={report.status} />
                  </div>
                  <span className={`status-pill ${statusClass(report.status)}`}>{labelOf(reportStatusLabels, report.status)}</span>
                </Link>
              ))}
              {!myReports.length ? <EmptyState eyebrow="REPORT" title="아직 등록한 신고가 없습니다." description="시설 고장이나 불편 사항이 있으면 왼쪽 양식으로 신고해 주세요." /> : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
