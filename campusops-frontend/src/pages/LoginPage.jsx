import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { clearSavedUserId, consumeAuthNotice, getSavedUserId, setSavedUserId, setSession } from '../utils/auth';
import { notify } from '../utils/dialog.jsx';

const demoAccounts = {
  user: { userId: 'user01', userPw: 'User123!' },
  admin: { userId: 'admin', userPw: 'Admin123!' }
};

export default function LoginPage() {
  const savedUserId = getSavedUserId();
  const [form, setForm] = useState({ userId: savedUserId, userPw: '' });
  const [options, setOptions] = useState({ rememberId: Boolean(savedUserId), autoLogin: true });
  const [error, setError] = useState(() => consumeAuthNotice());
  const [loadingType, setLoadingType] = useState('');
  const navigate = useNavigate();

  const loginWith = async (payload, type = 'form') => {
    setError('');
    setLoadingType(type);
    try {
      const loginPayload = { ...payload, autoLogin: options.autoLogin };
      const { data } = await authApi.login(loginPayload);
      const result = data.data;

      setSession({
        token: result.token,
        user: {
          userNo: result.userNo,
          userId: result.userId,
          userName: result.userName,
          profileImageUrl: result.profileImageUrl,
          role: result.role
        },
        autoLogin: options.autoLogin
      });

      if (options.rememberId) {
        setSavedUserId(loginPayload.userId);
      } else {
        clearSavedUserId();
      }

      if (result.duplicateLogin) {
        await notify({
          title: '기존 세션이 정리되었습니다',
          message: '다른 곳에서 로그인되어 있던 세션을 종료하고 새로 로그인했습니다.',
          type: 'warning'
        });
      }

      navigate(result.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoadingType('');
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await loginWith(form, 'form');
  };

  return (
    <div className="auth-page">
      <div className={`auth-card ${loadingType ? 'is-busy' : ''}`}>
        <div className="auth-card__brand">
          <img src="/campusops-mark.svg" alt="" />
          <span>CampusOps</span>
        </div>
        <span className="workspace-label">WELCOME BACK</span>
        <h1>운영 포털 로그인</h1>
        <p>학교·학원 운영 업무를 한 곳에서 이어서 관리하세요.</p>

        <form onSubmit={onSubmit} className="workspace-form">
          <label>
            아이디
            <input value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} />
          </label>
          <label>
            비밀번호
            <input type="password" value={form.userPw} onChange={(event) => setForm({ ...form, userPw: event.target.value })} />
          </label>

          <div className="auth-options">
            <label>
              <input type="checkbox" checked={options.rememberId} onChange={(event) => setOptions({ ...options, rememberId: event.target.checked })} />
              <span>아이디 저장</span>
            </label>
            <label>
              <input type="checkbox" checked={options.autoLogin} onChange={(event) => setOptions({ ...options, autoLogin: event.target.checked })} />
              <span>자동 로그인</span>
            </label>
          </div>

          {error ? <div className="form-error">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={Boolean(loadingType)}>
            {loadingType === 'form' ? <span className="button-spinner" /> : null}
            {loadingType === 'form' ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="demo-login">
          <div className="demo-login__head">
            <strong>체험 계정으로 바로 시작</strong>
            <span>별도 가입 없이 사용자/관리자 기능을 확인할 수 있습니다.</span>
          </div>
          <div className="demo-login__grid">
            <button type="button" className="secondary-button" disabled={Boolean(loadingType)} onClick={() => loginWith(demoAccounts.user, 'user')}>
              {loadingType === 'user' ? <span className="button-spinner" /> : null}
              {loadingType === 'user' ? '로그인 중...' : '일반회원 로그인'}
            </button>
            <button type="button" className="secondary-button" disabled={Boolean(loadingType)} onClick={() => loginWith(demoAccounts.admin, 'admin')}>
              {loadingType === 'admin' ? <span className="button-spinner" /> : null}
              {loadingType === 'admin' ? '로그인 중...' : '관리자계정 로그인'}
            </button>
          </div>
        </div>

        <div className="auth-footer">
          계정이 없나요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
