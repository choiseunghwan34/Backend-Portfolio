import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { notificationApi } from '../api/notificationApi';
import { clearSession, getCurrentUser, subscribeSession } from '../utils/auth';
import { notify } from '../utils/dialog.jsx';

export default function Navbar() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [unread, setUnread] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = user ? `${user.userName || user.userId}(${user.userId})` : '';

  useEffect(() => subscribeSession(() => setUser(getCurrentUser())), []);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setUnread(0);
      return () => { mounted = false; };
    }
    notificationApi.unreadCount()
      .then(({ data }) => {
        if (mounted) setUnread(Number(data?.data ?? 0));
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [user, location.pathname]);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } finally {
      clearSession();
      setLoggingOut(false);
      await notify({ title: '로그아웃되었습니다.', message: '다음에 다시 만나요.', type: 'success' });
      navigate('/home');
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className={`navbar ${user?.role === 'ADMIN' ? 'navbar--admin' : ''}`}>
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
        <Link to="/notifications" className={isActive('/notifications') ? 'active navbar__notice-link' : 'navbar__notice-link'}>
          알림
          {unread > 0 ? <b>{unread > 9 ? '9+' : unread}</b> : null}
        </Link>
        <Link to="/qna" className={isActive('/qna') ? 'active' : ''}>Q&A</Link>

        {user ? (
          <>
            <Link
              to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
              className={isActive('/admin') || isActive('/dashboard') ? 'active' : ''}
            >
              대시보드
            </Link>
            <Link
              to="/mypage"
              className={`navbar__user ${user.role === 'ADMIN' ? 'navbar__user--admin' : ''} ${isActive('/mypage') ? 'active' : ''}`}
              title="마이페이지로 이동"
            >
              {user.profileImageUrl ? (
                <img className="navbar__user-avatar" src={user.profileImageUrl} alt="" />
              ) : (
                <span className="navbar__user-dot" />
              )}
              {user.role === 'ADMIN' ? `관리자(${user.userId})` : displayName}
            </Link>
            <button className="text-button navbar__logout" type="button" disabled={loggingOut} onClick={logout}>
              {loggingOut ? <span className="button-spinner button-spinner--dark" /> : null}
              {loggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
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
