import React, { useEffect, useState } from 'react';
import { noticeApi } from '../api/noticeApi';

const empty = { title: '', content: '', category: '', importantYn: false };

export default function AdminNoticePage() {
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const { data } = await noticeApi.list({ page: 1, size: 20 });
    setItems(data.data.items || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await noticeApi.update(editingId, form);
    } else {
      await noticeApi.create(form);
    }
    setForm(empty);
    setEditingId(null);
    load();
  };

  const remove = async (noticeNo) => {
    await noticeApi.remove(noticeNo);
    load();
  };

  return (
    <div className="content-grid two-col">
      <section className="content-card">
        <h1>공지 등록</h1>
        <form className="form-grid" onSubmit={submit}>
          <label>제목<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>카테고리<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label>내용<textarea rows="5" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
          <label className="checkbox-row"><input type="checkbox" checked={form.importantYn} onChange={(e) => setForm({ ...form, importantYn: e.target.checked })} /> 중요 공지</label>
          <button className="primary-button" type="submit">{editingId ? '수정' : '등록'}</button>
        </form>
      </section>
      <section className="content-card">
        <h2>공지 목록</h2>
        <div className="stack-list">
          {items.map((item) => (
            <div className="list-item" key={item.noticeNo}>
              <strong>{item.title}</strong>
              <span>{item.importantYn ? '중요' : '일반'}</span>
              <div className="inline-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setEditingId(item.noticeNo);
                    setForm({
                      title: item.title,
                      content: item.content,
                      category: item.category || '',
                      importantYn: Boolean(item.importantYn)
                    });
                  }}
                >
                  수정
                </button>
                <button className="secondary-button" onClick={() => remove(item.noticeNo)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
