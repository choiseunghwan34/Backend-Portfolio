import React, { useEffect, useState } from 'react';
import { noticeApi } from '../api/noticeApi';

const empty = { title: '', content: '', category: '', importantYn: false };

export default function AdminNoticePage() {
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const { data } = await noticeApi.list({ page: 1, size: 50 });
    setItems(data.data.items || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await noticeApi.update(editingId, form);
    else await noticeApi.create(form);
    setForm(empty);
    setEditingId(null);
    load();
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
    if (!window.confirm('이 공지를 삭제할까요?')) return;
    await noticeApi.remove(noticeNo);
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
            <label>제목<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>카테고리<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="공지, 시설, 대여, 예약" /></label>
            <label>내용<textarea required rows="7" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
            <label className="checkbox-row"><input type="checkbox" checked={form.importantYn} onChange={(e) => setForm({ ...form, importantYn: e.target.checked })} /> 중요 공지로 표시</label>
            <div className="workspace-actions">
              <button className="primary-button" type="submit">{editingId ? '수정 저장' : '공지 등록'}</button>
              {editingId ? <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(empty); }}>취소</button> : null}
            </div>
          </form>
        </section>

        <section className="workspace-card">
          <div className="workspace-card__head">
            <div><h2>공지 목록</h2><p>등록한 공지를 수정하거나 삭제합니다.</p></div>
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
