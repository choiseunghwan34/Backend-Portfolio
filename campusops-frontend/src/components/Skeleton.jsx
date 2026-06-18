import React from 'react';

export function SkeletonLine({ width = '100%' }) {
  return <span className="skeleton-line" style={{ width }} />;
}

export function SkeletonCard({ rows = 4 }) {
  return (
    <div className="skeleton-card" aria-label="데이터를 불러오는 중">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonLine key={index} width={index === 0 ? '46%' : `${92 - index * 12}%`} />
      ))}
    </div>
  );
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div className="skeleton-list" aria-label="목록을 불러오는 중">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skeleton-row" key={index}>
          <SkeletonLine width="4.2rem" />
          <div>
            <SkeletonLine width={`${58 + (index % 2) * 18}%`} />
            <SkeletonLine width="32%" />
          </div>
          <SkeletonLine width="5rem" />
        </div>
      ))}
    </div>
  );
}
