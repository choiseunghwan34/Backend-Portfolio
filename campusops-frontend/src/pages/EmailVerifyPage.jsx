import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { notify } from '../utils/dialog.jsx';

export default function EmailVerifyPage() {
  const [searchParams] = useSearchParams();
  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('');

  const verify = async () => {
    setStatus('loading');
    setMessage('');
    try {
      await authApi.verifyEmail({ email, token });
      setStatus('success');
      setMessage('이메일 인증이 완료되었습니다. 회원가입 페이지로 돌아가 가입을 마무리해 주세요.');
      await notify({ title: '이메일 인증 완료', message: '이제 회원가입을 진행할 수 있습니다.', type: 'success' });
    } catch (error) {
      setStatus('error');
      setMessage(error?.response?.data?.message || '이메일 인증에 실패했습니다.');
    }
  };

  const isInvalidLink = !email || !token;

  return (
    <div className="auth-page email-verify-page">
      <div className={`auth-card email-verify-card ${status === 'loading' ? 'is-busy' : ''}`}>
        <div className="auth-card__brand">
          <img src="/campusops-mark.svg" alt="" />
          <span>CampusOps</span>
        </div>
        <span className="workspace-label">EMAIL VERIFICATION</span>
        <h1>이메일 인증</h1>
        <p>아래 버튼을 눌러 CampusOps 계정 이메일 인증을 완료하세요.</p>

        <div className="email-verify-box">
          <span>인증 대상 이메일</span>
          <strong>{email || '올바르지 않은 인증 링크입니다.'}</strong>
        </div>

        {message ? <div className={status === 'error' ? 'form-error' : 'detail-message'}>{message}</div> : null}

        <button className="primary-button" type="button" disabled={isInvalidLink || status === 'loading' || status === 'success'} onClick={verify}>
          {status === 'loading' ? <span className="button-spinner" /> : null}
          {status === 'success' ? '인증 완료' : status === 'loading' ? '인증 중...' : '인증하기'}
        </button>

        <div className="auth-footer">
          <Link to="/signup">회원가입 페이지로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}
