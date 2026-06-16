import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';

export default function NoticeDetailPage() {
  const { noticeNo } = useParams();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await noticeApi.detail(noticeNo);
      setNotice(data.data);
    })();
  }, [noticeNo]);

  if (!notice) return <div className="workspace-card detail-article">불러오는 중...</div>;

  const createdDate = String(notice.createdAt || '').slice(0, 10) || '-';
  const updatedDate = String(notice.updatedAt || notice.createdAt || '').slice(0, 10) || '-';

  return (
    <div className="workspace-page detail-article">
      <article className="workspace-card detail-card">
        <div className="detail-head">
          <div>
            <span className="workspace-label">NOTICE DETAIL</span>
            <h1>{notice.title}</h1>
            <div className="detail-meta">
              {notice.importantYn ? <span className="detail-badge important">중요</span> : null}
              <span className="detail-badge">{notice.category || '공지'}</span>
              <span>{createdDate}</span>
              <span>조회 {notice.viewCount?.toLocaleString?.() || notice.viewCount || 0}</span>
            </div>
          </div>
          <Link className="secondary-button" to="/notices">목록</Link>
        </div>
        <div className="detail-layout">
          <section className="detail-body">
            <h2>공지 내용</h2>
            <p className="body-text">{notice.content}</p>
          </section>
          <aside className="detail-side">
            <div className="detail-side__summary">
              <span>게시 정보</span>
              <strong>{notice.importantYn ? '상단 고정 공지' : '일반 공지'}</strong>
              <p>{notice.category || '공지'} 카테고리에 등록된 안내입니다.</p>
            </div>
            <div><span>등록일</span><strong>{createdDate}</strong></div>
            <div><span>수정일</span><strong>{updatedDate}</strong></div>
            <div><span>조회</span><strong>{notice.viewCount?.toLocaleString?.() || notice.viewCount || 0}회</strong></div>
          </aside>
        </div>
      </article>
    </div>
  );
}
