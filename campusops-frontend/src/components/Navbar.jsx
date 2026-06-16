import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { getCurrentUser, clearSession } from '../utils/auth';

export default function Navbar() {
  const user = getCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

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
        <Link to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/home'}>
          <img className="navbar__brand-mark" src="/campusops-mark.svg" alt="" />
          <span className="navbar__brand-text">CampusOps</span>
        </Link>
      </div>

      <nav className="navbar__menu">
        {!user ? (
          <>
            <Link to="/notices" className={isActive('/notices') ? 'active' : ''}>공지사항</Link>
            <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>시설신고</Link>
            <Link to="/assets" className={isActive('/assets') ? 'active' : ''}>기자재대여</Link>
            <Link to="/rooms" className={isActive('/rooms') ? 'active' : ''}>공간예약</Link>
            <Link to="/notifications" className={isActive('/notifications') ? 'active' : ''}>알림</Link>
            <Link to="/login" className={`navbar__login ${isActive('/login') ? 'active' : ''}`}>로그인</Link>
            <Link to="/signup" className={`navbar__signup ${isActive('/signup') ? 'active' : ''}`}>회원가입</Link>
          </>
        ) : (
          <>
            <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className={isActive('/admin') || isActive('/dashboard') ? 'active' : ''}>대시보드</Link>
            {user.role === 'ADMIN' ? (
              <>
                <Link to="/admin/notices" className={isActive('/admin/notices') ? 'active' : ''}>공지 관리</Link>
                <Link to="/admin/reports" className={isActive('/admin/reports') ? 'active' : ''}>신고 관리</Link>
                <Link to="/admin/assets" className={isActive('/admin/assets') ? 'active' : ''}>기자재 관리</Link>
                <Link to="/admin/rooms" className={isActive('/admin/rooms') ? 'active' : ''}>공간 관리</Link>
              </>
            ) : (
              <>
                <Link to="/notices" className={isActive('/notices') ? 'active' : ''}>공지</Link>
                <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>신고</Link>
                <Link to="/assets" className={isActive('/assets') ? 'active' : ''}>기자재</Link>
                <Link to="/rooms" className={isActive('/rooms') ? 'active' : ''}>공간</Link>
                <Link to="/notifications" className={isActive('/notifications') ? 'active' : ''}>알림</Link>
              </>
            )}
            <button className="text-button" onClick={logout}>로그아웃</button>
          </>
        )}
      </nav>
    </header>
  );
}
