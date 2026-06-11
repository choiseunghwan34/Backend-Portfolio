import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  if (!notice) return <div className="content-card">불러오는 중...</div>;

  return (
    <article className="content-card">
      <h1>{notice.title}</h1>
      <div className="meta-row">
        <span>{notice.category || '기타'}</span>
        <span>조회수 {notice.viewCount}</span>
      </div>
      <p className="body-text">{notice.content}</p>
    </article>
  );
}
