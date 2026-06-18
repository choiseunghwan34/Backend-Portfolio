import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';

export default function NoticeListPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState({ items: [], total: 0, page: 1, size: 10 });

  const load = async (targetPage = 1) => {
    setLoading(true);
    try {
      const { data } = await noticeApi.list({ keyword, page: targetPage, size: 10 });
      setPageData(data.data || { items: [], total: 0, page: targetPage, size: 10 });
      setPage(targetPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const total = Number(pageData.total || pageData.items.length || 0);
  const size = Number(pageData.size || 10);
  const totalPages = Math.max(1, Math.ceil(total / size));
  const hasNext = page < totalPages;

  return (
    <div className="notice-board-page">
      <section className="notice-board-hero">
        <span className="workspace-label">NOTICE CENTER</span>
        <h1>공지사항</h1>
        <p>CampusOps 운영 공지와 주요 안내를 검색하고 상세 내용을 확인하세요.</p>
      </section>

      <section className="notice-board-info">
        <div className="notice-board-info__icon">i</div>
        <p>
          시설 신고, 기자재 대여, 공간 예약 등 CampusOps 이용에 필요한 공지사항을 안내합니다.
          중요한 운영 변경 사항은 상단 고정 공지로 표시됩니다.
        </p>
      </section>

      <section className="notice-board-panel">
        <div className="notice-board-toolbar">
          <div className="notice-board-title">
            <strong>공지 목록</strong>
            <span>총 {total.toLocaleString()}건</span>
          </div>
          <div className="notice-search">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && load(1)}
              placeholder="검색어 입력"
            />
            <button className="secondary-button" type="button" onClick={() => load(1)}>
              검색
            </button>
          </div>
        </div>

        {loading ? (
          <SkeletonList rows={5} />
        ) : (
          <div className="notice-board-list">
            {pageData.items.map((notice) => (
              <Link className="notice-board-row" key={notice.noticeNo} to={`/notices/${notice.noticeNo}`}>
                <span className={`notice-board-badge ${notice.importantYn ? 'important' : ''}`}>
                  {notice.importantYn ? '중요' : notice.category || '공지'}
                </span>
                <div>
                  <strong>{notice.title}</strong>
                  <span>{notice.category || '공지'} · 조회 {notice.viewCount?.toLocaleString?.() || notice.viewCount || 0}</span>
                </div>
                <time>{String(notice.createdAt || '').slice(0, 10)}</time>
              </Link>
            ))}
            {!pageData.items.length ? (
              <EmptyState
                eyebrow="NOTICE"
                title="검색 결과가 없습니다."
                description="다른 검색어를 입력하거나 전체 공지 목록을 확인해 보세요."
              />
            ) : null}
          </div>
        )}

        <div className="toolbar pagination-bar">
          <button className="secondary-button" type="button" disabled={page <= 1 || loading} onClick={() => load(page - 1)}>
            이전
          </button>
          <span className="pagination-current">페이지 {page} / {totalPages}</span>
          <button className="secondary-button" type="button" disabled={!hasNext || loading} onClick={() => load(page + 1)}>
            다음
          </button>
        </div>
      </section>
    </div>
  );
}
