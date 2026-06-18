import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import { SkeletonCard } from '../components/Skeleton';

export default function NoticeDetailPage() {
  const { noticeNo } = useParams();
  const [notice, setNotice] = useState(null);
  const [previousNotice, setPreviousNotice] = useState(null);
  const [nextNotice, setNextNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await noticeApi.detail(noticeNo);
        if (mounted) {
          const payload = data.data;
          setNotice(payload?.notice || payload);
          setPreviousNotice(payload?.previousNotice || null);
          setNextNotice(payload?.nextNotice || null);
        }
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
        <section className="notice-document notice-document--empty">
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
          {previousNotice ? (
            <Link to={`/notices/${previousNotice.noticeNo}`} className="notice-nav-link notice-nav-link--prev">
              <span>이전글</span>
              <strong>{previousNotice.title}</strong>
            </Link>
          ) : (
            <span className="notice-nav-link notice-nav-link--disabled">이전글 없음</span>
          )}
          <Link to="/notices" className="notice-document__list">목록</Link>
          {nextNotice ? (
            <Link to={`/notices/${nextNotice.noticeNo}`} className="notice-nav-link notice-nav-link--next">
              <span>다음글</span>
              <strong>{nextNotice.title}</strong>
            </Link>
          ) : (
            <span className="notice-nav-link notice-nav-link--disabled notice-nav-link--next">다음글 없음</span>
          )}
        </nav>
      </article>
    </div>
  );
}
