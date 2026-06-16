import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setSession } from '../utils/auth';

export default function LoginPage() {
  const [form, setForm] = useState({ userId: '', userPw: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await authApi.login(form);
      setSession({
        token: data.data.token,
        user: { userNo: data.data.userNo, userId: data.data.userId, userName: data.data.userName, role: data.data.role }
      });
      navigate(data.data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
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
            <input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} />
          </label>
          <label>
            비밀번호
            <input type="password" value={form.userPw} onChange={(e) => setForm({ ...form, userPw: e.target.value })} />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="primary-button" type="submit">로그인</button>
        </form>
        <div className="auth-footer">
          계정이 없나요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
