import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import { SkeletonCard } from '../components/Skeleton';

export default function NoticeDetailPage() {
  const { noticeNo } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await noticeApi.detail(noticeNo);
        if (mounted) setNotice(data.data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [noticeNo]);

  if (loading) {
    return (
      <div className="notice-board-page">
        <section className="notice-board-hero compact">
          <span className="workspace-label">NOTICE DETAIL</span>
          <h1>공지사항</h1>
        </section>
        <SkeletonCard rows={6} />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="notice-board-page">
        <section className="notice-document">
          <h2>공지사항을 찾을 수 없습니다.</h2>
          <Link to="/notices" className="primary-button">목록으로</Link>
        </section>
      </div>
    );
  }

  const createdDate = String(notice.createdAt || '').slice(0, 10) || '-';
  const updatedDate = String(notice.updatedAt || notice.createdAt || '').slice(0, 10) || '-';
  const viewCount = notice.viewCount?.toLocaleString?.() || notice.viewCount || 0;

  return (
    <div className="notice-board-page">
      <section className="notice-board-hero compact">
        <span className="workspace-label">NOTICE DETAIL</span>
        <h1>공지사항</h1>
        <p>운영 안내와 주요 공지의 상세 내용을 확인하세요.</p>
      </section>

      <article className="notice-document">
        <header className="notice-document__head">
          <div className="notice-document__eyebrow">CampusOps Notice</div>
          <h2>{notice.title}</h2>
          <div className="notice-document__meta">
            <span>{notice.category || '공지'}</span>
            <span>{createdDate}</span>
            <span>조회 {viewCount}</span>
            {notice.importantYn ? <strong>중요 공지</strong> : null}
          </div>
        </header>

        <section className="notice-document__body">
          <h3>공지 내용</h3>
          <p>{notice.content}</p>
        </section>

        <dl className="notice-document__file">
          <dt>첨부파일</dt>
          <dd>첨부파일이 없습니다.</dd>
          <dt>수정일</dt>
          <dd>{updatedDate}</dd>
        </dl>

        <nav className="notice-document__nav" aria-label="공지 이동">
          <button type="button" className="notice-circle" disabled>이전</button>
          <Link to="/notices" className="notice-document__list">목록</Link>
          <button type="button" className="notice-circle" disabled>다음</button>
        </nav>
      </article>
    </div>
  );
}
