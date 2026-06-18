import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setSession } from '../utils/auth';
import { notify } from '../utils/dialog.jsx';

const verifiedKey = (email) => `campusops:email-verified:${String(email || '').trim().toLowerCase()}`;

export default function SignupPage() {
  const [form, setForm] = useState({ userId: '', userPw: '', userName: '', email: '' });
  const [mailSent, setMailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [debugLink, setDebugLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const navigate = useNavigate();

  const syncVerifiedState = () => {
    setEmailVerified(Boolean(form.email && localStorage.getItem(verifiedKey(form.email))));
  };

  useEffect(() => {
    syncVerifiedState();
  }, [form.email]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === verifiedKey(form.email)) {
        setEmailVerified(true);
      }
    };
    const handleFocus = () => syncVerifiedState();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [form.email]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'email') {
      setMailSent(false);
      setEmailVerified(Boolean(value && localStorage.getItem(verifiedKey(value))));
      setDebugLink('');
    }
  };

  const sendVerificationMail = async () => {
    setError('');
    if (!form.email) {
      setError('이메일을 입력해 주세요.');
      return;
    }

    setLoading('send');
    try {
      const { data } = await authApi.sendEmailVerification({ email: form.email });
      setMailSent(true);
      setEmailVerified(false);
      localStorage.removeItem(verifiedKey(form.email));
      setDebugLink(data?.data?.debugVerificationUrl || '');
      await notify({
        title: '인증 메일 발송',
        message: '메일 안의 인증 페이지에서 인증하기 버튼을 눌러 주세요.',
        type: 'success'
      });
    } catch (err) {
      setError(err?.response?.data?.message || '인증 메일 발송에 실패했습니다.');
    } finally {
      setLoading('');
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading('signup');

    try {
      const { data } = await authApi.signup(form);
      localStorage.removeItem(verifiedKey(form.email));
      setSession({
        token: data.data.token,
        user: {
          userNo: data.data.userNo,
          userId: data.data.userId,
          userName: data.data.userName,
          role: data.data.role
        }
      });
      await notify({ title: '가입 완료', message: 'CampusOps 계정이 생성되었습니다.', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-card ${loading ? 'is-busy' : ''}`}>
        <div className="auth-card__brand">
          <img src="/campusops-mark.svg" alt="" />
          <span>CampusOps</span>
        </div>
        <span className="workspace-label">CREATE ACCOUNT</span>
        <h1>회원가입</h1>
        <p>이메일로 전송된 인증 페이지에서 인증하기 버튼을 누른 뒤 가입을 완료하세요.</p>

        <form onSubmit={onSubmit} className="workspace-form">
          <label>
            아이디
            <input required value={form.userId} onChange={(event) => updateForm('userId', event.target.value)} />
          </label>
          <label>
            비밀번호
            <input required type="password" value={form.userPw} onChange={(event) => updateForm('userPw', event.target.value)} />
          </label>
          <label>
            이름
            <input required value={form.userName} onChange={(event) => updateForm('userName', event.target.value)} />
          </label>
          <label>
            이메일
            <div className="inline-field">
              <input required type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
              <button className="secondary-button" type="button" disabled={Boolean(loading) || emailVerified} onClick={sendVerificationMail}>
                {emailVerified ? '인증 완료' : loading === 'send' ? '발송 중...' : mailSent ? '인증 메일 재발송' : '인증 메일 발송'}
              </button>
            </div>
          </label>

          {emailVerified ? (
            <div className="email-verify-hint is-verified">
              <strong>이메일 인증이 완료되었습니다.</strong>
              <span>아래 가입하기 버튼을 눌러 계정 생성을 마무리하세요.</span>
            </div>
          ) : mailSent ? (
            <div className="email-verify-hint">
              <strong>인증 메일을 보냈습니다.</strong>
              <span>메일함에서 CampusOps 인증 페이지를 열고 인증하기 버튼을 눌러 주세요. 인증 후 이 화면으로 돌아오면 상태가 자동으로 변경됩니다.</span>
              {debugLink ? <a href={debugLink} target="_blank" rel="noreferrer">개발 모드 인증 페이지 열기</a> : null}
            </div>
          ) : null}

          {error ? <div className="form-error">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={Boolean(loading)}>
            {loading === 'signup' ? <span className="button-spinner" /> : null}
            {loading === 'signup' ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <div className="auth-footer">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
}
