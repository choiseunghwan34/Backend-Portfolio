import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { updateCurrentUser } from '../utils/auth';
import { notify } from '../utils/dialog.jsx';

const formatDate = (value) => {
  if (!value) return '-';
  return String(value).slice(0, 10);
};

const sessionUser = (user) => ({
  userNo: user.userNo,
  userId: user.userId,
  userName: user.userName,
  profileImageUrl: user.profileImageUrl,
  role: user.role
});

export default function MyPage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ userName: '', email: '' });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    authApi.me()
      .then(({ data }) => {
        if (!mounted) return;
        const user = data.data;
        setProfile(user);
        setPreview(user.profileImageUrl || '');
        setForm({ userName: user.userName || '', email: user.email || '' });
      })
      .catch(() => notify({ title: '내 정보를 불러오지 못했습니다.', message: '잠시 후 다시 시도해 주세요.', type: 'error' }))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const syncProfile = (updated) => {
    setProfile(updated);
    setPreview(updated.profileImageUrl || '');
    updateCurrentUser(sessionUser(updated));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.updateMe(form);
      syncProfile(data.data);
      await notify({ title: '내 정보가 수정되었습니다.', message: '상단 사용자 표시도 함께 갱신했어요.', type: 'success' });
    } catch (error) {
      await notify({
        title: '수정에 실패했습니다.',
        message: error?.response?.data?.message || '입력값을 확인해 주세요.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const onImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      await notify({ title: '이미지 파일만 등록할 수 있습니다.', message: 'jpg, png, webp 같은 이미지 파일을 선택해 주세요.', type: 'warning' });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    try {
      const { data } = await authApi.uploadProfileImage(file);
      syncProfile(data.data);
      await notify({ title: '프로필 사진이 변경되었습니다.', message: '마이페이지와 상단 사용자 배지에 바로 반영했어요.', type: 'success' });
    } catch (error) {
      setPreview(profile?.profileImageUrl || '');
      await notify({
        title: '업로드에 실패했습니다.',
        message: error?.response?.data?.message || 'Storage 환경변수와 파일 형식을 확인해 주세요.',
        type: 'error'
      });
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="workspace-page">
        <section className="mypage-card mypage-card--loading">내 정보를 불러오는 중입니다...</section>
      </div>
    );
  }

  return (
    <div className="workspace-page mypage">
      <section className="mypage-hero">
        <div>
          <span className="workspace-label">MY CAMPUSOPS</span>
          <h1>내 정보</h1>
          <p>계정 기본 정보와 프로필 사진을 관리하고, 내 업무 메뉴로 빠르게 이동할 수 있습니다.</p>
        </div>
        <div className="mypage-hero__badge">
          <span>{profile?.role === 'ADMIN' ? '관리자 계정' : '일반 사용자'}</span>
          <strong>{profile?.userId}</strong>
        </div>
      </section>

      <section className="mypage-grid">
        <article className="mypage-card">
          <div className="mypage-card__head">
            <div>
              <h2>프로필 수정</h2>
              <p>서비스 화면에 표시되는 이름, 이메일, 프로필 사진을 관리합니다.</p>
            </div>
          </div>

          <div className="mypage-profile">
            <button
              className="mypage-avatar"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="프로필 사진 변경"
            >
              {preview ? <img src={preview} alt="" /> : <span>{(profile?.userName || profile?.userId || 'U').slice(0, 1)}</span>}
              <em>{uploading ? '업로드 중' : '사진 변경'}</em>
            </button>
            <div>
              <strong>{profile?.userName || profile?.userId}</strong>
              <p>정사각형 이미지가 가장 자연스럽게 보입니다. 최대 10MB까지 등록할 수 있습니다.</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onImageChange} />
          </div>

          <form className="workspace-form mypage-form" onSubmit={onSubmit}>
            <label>
              아이디
              <input value={profile?.userId || ''} disabled />
            </label>
            <label>
              이름
              <input
                value={form.userName}
                onChange={(event) => setForm({ ...form, userName: event.target.value })}
                placeholder="이름을 입력해 주세요"
              />
            </label>
            <label>
              이메일
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="이메일을 입력해 주세요"
              />
            </label>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </form>
        </article>

        <aside className="mypage-card mypage-summary">
          <h2>계정 정보</h2>
          <dl>
            <div>
              <dt>회원 번호</dt>
              <dd>{profile?.userNo}</dd>
            </div>
            <div>
              <dt>권한</dt>
              <dd>{profile?.role}</dd>
            </div>
            <div>
              <dt>가입일</dt>
              <dd>{formatDate(profile?.createdAt)}</dd>
            </div>
          </dl>

          <div className="mypage-links">
            <Link to="/reports">내 신고 내역</Link>
            <Link to="/assets">내 대여 내역</Link>
            <Link to="/rooms">내 예약 내역</Link>
            <Link to="/notifications">알림 확인</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
