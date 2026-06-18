import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="error-page">
      <section>
        <span className="workspace-label">404 PAGE</span>
        <h1>요청한 페이지를 찾을 수 없습니다.</h1>
        <p>주소가 변경되었거나 접근할 수 없는 CampusOps 페이지입니다.</p>
        <Link className="primary-button" to="/home">홈으로 이동</Link>
      </section>
    </div>
  );
}
