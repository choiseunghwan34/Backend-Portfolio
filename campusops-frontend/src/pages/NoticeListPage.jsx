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
    <div className="notice-board-page">
      <section className="notice-board-hero">
        <span className="workspace-label">NOTICE CENTER</span>
        <h1>공지사항</h1>
        <p>CampusOps 운영 공지와 이용 안내를 확인하세요.</p>
      </section>

      <section className="notice-board-info">
        <div className="notice-board-info__icon">!</div>
        <p>
          CampusOps 공지사항을 안내해 드립니다. 시설 신고, 기자재 대여, 공간 예약 등 운영 서비스 이용 전
          주요 안내를 확인해 주세요.
        </p>
      </section>

      <section className="notice-board-panel">
        <div className="notice-board-toolbar">
          <div>
            <strong>전체 공지</strong>
            <span>총 {pageData.total || pageData.items.length}건</span>
          </div>
          <div className="notice-search">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(1)} placeholder="검색어 입력" />
            <button className="secondary-button" onClick={() => load(1)}>검색</button>
          </div>
        </div>

        <div className="notice-board-list">
          {pageData.items.map((notice) => (
            <Link className="notice-board-row" key={notice.noticeNo} to={`/notices/${notice.noticeNo}`}>
              <span className={`notice-board-badge ${notice.importantYn ? 'important' : ''}`}>{notice.importantYn ? '중요' : notice.category || '공지'}</span>
              <div>
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
