import React from 'react';

export default function EmptyState({
  eyebrow = 'EMPTY',
  title = '표시할 데이터가 없습니다.',
  description = '조건을 바꾸거나 새 항목을 등록해 보세요.',
  action = null
}) {
  return (
    <div className="empty-state">
      <span>{eyebrow}</span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
