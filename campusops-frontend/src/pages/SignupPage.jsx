import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setSession } from '../utils/auth';

export default function SignupPage() {
  const [form, setForm] = useState({ userId: '', userPw: '', userName: '', email: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await authApi.signup(form);
      setSession({
        token: data.data.token,
        user: { userNo: data.data.userNo, userId: data.data.userId, userName: data.data.userName, role: data.data.role }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <img src="/campusops-mark.svg" alt="" />
          <span>CampusOps</span>
        </div>
        <span className="workspace-label">CREATE ACCOUNT</span>
        <h1>회원가입</h1>
        <p>CampusOps에서 신고, 대여, 예약 업무를 시작하세요.</p>
        <form onSubmit={onSubmit} className="workspace-form">
          <label>아이디<input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} /></label>
          <label>비밀번호<input type="password" value={form.userPw} onChange={(e) => setForm({ ...form, userPw: e.target.value })} /></label>
          <label>이름<input value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} /></label>
          <label>이메일<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="primary-button" type="submit">가입하기</button>
        </form>
        <div className="auth-footer">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
}
