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

  useEffect(() => { load(1); }, []);

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">NOTICE CENTER</span>
          <h1>공지사항</h1>
          <p>중요 공지와 운영 안내를 검색하고 상세 내용을 확인하세요.</p>
        </div>
        <div className="workspace-hero__aside"><span>등록된 공지</span><strong>{pageData.total || pageData.items.length}건</strong></div>
      </section>

      <section className="workspace-card">
        <div className="workspace-card__head">
          <div><h2>공지 목록</h2><p>키워드로 제목과 내용을 검색할 수 있습니다.</p></div>
          <div className="toolbar">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(1)} placeholder="검색어 입력" />
            <button className="secondary-button" onClick={() => load(1)}>검색</button>
          </div>
        </div>
        <div className="workspace-list">
          {pageData.items.map((notice) => (
            <Link className="workspace-row" key={notice.noticeNo} to={`/notices/${notice.noticeNo}`}>
              <div className="workspace-row__main">
                <strong className="notice-title">{notice.importantYn ? <i className="important-dot" /> : null}{notice.title}</strong>
                <span>{notice.category || '기타'} · 조회수 {notice.viewCount}</span>
              </div>
              <span className="workspace-row__meta">{String(notice.createdAt || '').slice(0, 10)}</span>
            </Link>
          ))}
          {!pageData.items.length ? <div className="workspace-empty">검색 결과가 없습니다.</div> : null}
        </div>
        <div className="toolbar pagination-bar">
          <button className="secondary-button" disabled={page <= 1} onClick={() => load(page - 1)}>이전</button>
          <span>페이지 {page}</span>
          <button className="secondary-button" disabled={pageData.items.length < pageData.size} onClick={() => load(page + 1)}>다음</button>
        </div>
      </section>
    </div>
  );
}
