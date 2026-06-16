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
      <article className="workspace-card">
        <div className="workspace-card__head">
          <div>
            <span className="workspace-label">NOTICE DETAIL</span>
            <h1>{notice.title}</h1>
            <p>{notice.category || '기타'} · 조회수 {notice.viewCount} · {String(notice.createdAt || '').slice(0, 10)}</p>
          </div>
          <Link className="secondary-button" to="/notices">목록</Link>
        </div>
        <p className="body-text">{notice.content}</p>
      </article>
    </div>
  );
}
