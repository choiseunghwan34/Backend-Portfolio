import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';

export default function NoticeListPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({ items: [], total: 0, page: 1, size: 10 });

  const load = async (targetPage = 1) => {
    const { data } = await noticeApi.list({ keyword, page: targetPage, size: 10 });
    setPageData(data.data);
    setPage(targetPage);
  };

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div className="content-card">
      <h1>공지사항</h1>
      <div className="toolbar">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="검색어 입력" />
        <button className="secondary-button" onClick={() => load(1)}>검색</button>
      </div>
      <div className="stack-list">
        {pageData.items.map((notice) => (
          <Link className="list-item link-item" key={notice.noticeNo} to={`/notices/${notice.noticeNo}`}>
            <strong>{notice.importantYn ? '중요 · ' : ''}{notice.title}</strong>
            <span>{notice.category || '기타'} · 조회수 {notice.viewCount}</span>
          </Link>
        ))}
      </div>
      <div className="toolbar pagination-bar">
        <button className="secondary-button" disabled={page <= 1} onClick={() => load(page - 1)}>이전</button>
        <span>페이지 {page}</span>
        <button className="secondary-button" disabled={pageData.items.length < pageData.size} onClick={() => load(page + 1)}>다음</button>
      </div>
    </div>
  );
}
