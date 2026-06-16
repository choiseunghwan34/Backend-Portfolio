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
    <div className="workspace-page notice-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">NOTICE CENTER</span>
          <h1>공지사항</h1>
          <p>중요 공지와 운영 안내를 검색하고 상세 내용을 확인하세요.</p>
        </div>
        <div className="workspace-hero__aside"><span>등록된 공지</span><strong>{pageData.total || pageData.items.length}건</strong></div>
      </section>

      <section className="workspace-card notice-card">
        <div className="workspace-card__head">
          <div><h2>공지 목록</h2><p>키워드로 제목과 내용을 검색할 수 있습니다.</p></div>
          <div className="toolbar notice-search">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(1)} placeholder="검색어 입력" />
            <button className="secondary-button" onClick={() => load(1)}>검색</button>
          </div>
        </div>
        <div className="notice-list">
          {pageData.items.map((notice) => (
            <Link className="notice-row" key={notice.noticeNo} to={`/notices/${notice.noticeNo}`}>
              <span className={`notice-badge ${notice.importantYn ? 'important' : ''}`}>{notice.importantYn ? '중요' : notice.category || '공지'}</span>
              <div className="notice-row__content">
                <strong>{notice.title}</strong>
                <span>{notice.category || '공지'} · 조회 {notice.viewCount?.toLocaleString?.() || notice.viewCount || 0}</span>
              </div>
              <time>{String(notice.createdAt || '').slice(0, 10)}</time>
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
