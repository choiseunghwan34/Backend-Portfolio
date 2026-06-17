import React, { useEffect, useState } from 'react';
import { noticeApi } from '../api/noticeApi';
import { confirmDialog, notify } from '../utils/dialog.jsx';

const empty = { title: '', content: '', category: '', importantYn: false };

export default function AdminNoticePage() {
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await noticeApi.list({ page: 1, size: 50 });
    setItems(data.data.items || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) await noticeApi.update(editingId, form);
      else await noticeApi.create(form);
      await notify({ title: editingId ? '수정 완료' : '등록 완료', message: '공지사항이 저장되었습니다.', type: 'success' });
      setForm(empty);
      setEditingId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.noticeNo);
    setForm({
      title: item.title,
      content: item.content,
      category: item.category || '',
      importantYn: Boolean(item.importantYn)
    });
  };

  const remove = async (noticeNo) => {
    const confirmed = await confirmDialog({
      title: '공지사항을 삭제할까요?',
      message: '삭제한 공지는 사용자 화면에서 더 이상 볼 수 없습니다.',
      type: 'warning',
      confirmText: '삭제',
      cancelText: '취소'
    });
    if (!confirmed) return;

    await noticeApi.remove(noticeNo);
    await notify({ title: '삭제 완료', message: '공지사항이 삭제되었습니다.', type: 'success' });
    if (editingId === noticeNo) {
      setEditingId(null);
      setForm(empty);
    }
    load();
  };

  return (
    <div className="workspace-page admin-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">NOTICE ADMIN</span>
          <h1>공지 관리</h1>
          <p>중요 공지와 운영 안내를 등록하고 수정합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>등록 공지</span><strong>{items.length}건</strong></div>
      </section>

      <div className="workspace-grid two">
        <section className="workspace-card">
          <div className="workspace-card__head">
            <div><h2>{editingId ? '공지 수정' : '공지 등록'}</h2><p>사용자에게 노출될 공지 내용을 작성합니다.</p></div>
          </div>
          <form className="workspace-form" onSubmit={submit}>
            <label>제목<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label>카테고리<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="공지, 시설, 대여, 예약" /></label>
            <label>내용<textarea required rows="7" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label>
            <label className="checkbox-row"><input type="checkbox" checked={form.importantYn} onChange={(event) => setForm({ ...form, importantYn: event.target.checked })} /> 중요 공지로 표시</label>
            <div className="workspace-actions">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? <span className="button-spinner" /> : null}
                {saving ? '저장 중...' : editingId ? '수정 저장' : '공지 등록'}
              </button>
              {editingId ? <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(empty); }}>취소</button> : null}
            </div>
          </form>
        </section>

        <section className="workspace-card">
          <div className="workspace-card__head">
            <div><h2>공지 목록</h2><p>등록된 공지를 수정하거나 삭제합니다.</p></div>
          </div>
          <div className="workspace-list">
            {items.map((item) => (
              <div className="workspace-row" key={item.noticeNo}>
                <div className="workspace-row__main"><strong>{item.title}</strong><span>{item.category || '일반'} · 조회 {item.viewCount || 0}</span></div>
                <div className="workspace-row__actions">
                  <span className={`status-pill ${item.importantYn ? 'rejected' : 'approved'}`}>{item.importantYn ? '중요' : '일반'}</span>
                  <button className="secondary-button" type="button" onClick={() => startEdit(item)}>수정</button>
                  <button className="secondary-button" type="button" onClick={() => remove(item.noticeNo)}>삭제</button>
                </div>
              </div>
            ))}
            {!items.length ? <div className="workspace-empty">등록된 공지가 없습니다.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
