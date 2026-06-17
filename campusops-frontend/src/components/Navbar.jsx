import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { clearSession, getCurrentUser, subscribeSession } from '../utils/auth';

export default function Navbar() {
  const [user, setUser] = useState(() => getCurrentUser());
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = user ? `${user.userName || user.userId}(${user.userId})` : '';

  useEffect(() => subscribeSession(() => setUser(getCurrentUser())), []);

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      navigate('/home');
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to="/home" aria-label="CampusOps 홈으로 이동">
          <img className="navbar__brand-mark" src="/campusops-mark.svg" alt="" />
          <span className="navbar__brand-text">CampusOps</span>
        </Link>
      </div>

      <nav className="navbar__menu" aria-label="주요 메뉴">
        <Link to="/home" className={isActive('/home') || location.pathname === '/' ? 'active' : ''}>홈</Link>
        <Link to="/notices" className={isActive('/notices') ? 'active' : ''}>공지사항</Link>
        <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>시설신고</Link>
        <Link to="/assets" className={isActive('/assets') ? 'active' : ''}>기자재대여</Link>
        <Link to="/rooms" className={isActive('/rooms') ? 'active' : ''}>공간예약</Link>
        <Link to="/notifications" className={isActive('/notifications') ? 'active' : ''}>알림</Link>

        {user ? (
          <>
            <Link
              to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
              className={isActive('/admin') || isActive('/dashboard') ? 'active' : ''}
            >
              대시보드
            </Link>
            <span className="navbar__user" title={displayName}>
              <span className="navbar__user-dot" />
              {displayName}
            </span>
            <button className="text-button" type="button" onClick={logout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login" className={`navbar__login ${isActive('/login') ? 'active' : ''}`}>로그인</Link>
            <Link to="/signup" className={`navbar__signup ${isActive('/signup') ? 'active' : ''}`}>회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
