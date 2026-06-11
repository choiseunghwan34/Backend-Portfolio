import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, clearSession } from '../utils/auth';

export default function Navbar() {
  const user = getCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate('/home');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/home'}>
          <span className="navbar__brand-mark">CO</span>
          <span className="navbar__brand-text">CampusOps</span>
        </Link>
      </div>

      <nav className="navbar__menu">
        {!user ? (
          <>
            <a href="#notices" className={location.hash === '#notices' || isActive('/home') ? 'active' : ''}>공지사항</a>
            <a href="#guide" className={location.hash === '#guide' ? 'active' : ''}>이용안내</a>
            <Link to="/login" className={isActive('/login') ? 'active' : ''}>로그인</Link>
            <Link to="/signup" className={isActive('/signup') ? 'active' : ''}>회원가입</Link>
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
