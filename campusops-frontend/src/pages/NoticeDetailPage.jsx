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

  return (
    <div className="workspace-page detail-article">
      <article className="workspace-card detail-card">
        <div className="detail-head">
          <div>
            <span className="workspace-label">NOTICE DETAIL</span>
            <h1>{notice.title}</h1>
            <p>{notice.category || '기타'} · 조회수 {notice.viewCount} · {String(notice.createdAt || '').slice(0, 10)}</p>
          </div>
          <Link className="secondary-button" to="/notices">목록</Link>
        </div>
        <div className="detail-layout">
          <section className="detail-body">
            <h2>공지 내용</h2>
            <p className="body-text">{notice.content}</p>
          </section>
          <aside className="detail-side">
            <div><span>분류</span><strong>{notice.category || '기타'}</strong></div>
            <div><span>중요 공지</span><strong>{notice.importantYn ? '예' : '아니오'}</strong></div>
            <div><span>조회수</span><strong>{notice.viewCount}</strong></div>
            <div><span>최종 수정</span><p>{String(notice.updatedAt || notice.createdAt || '').slice(0, 10) || '-'}</p></div>
          </aside>
        </div>
      </article>
    </div>
  );
}
