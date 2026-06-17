import React, { useEffect, useState } from 'react';
import { assetApi } from '../api/assetApi';
import { confirmDialog, notify } from '../utils/dialog.jsx';

const empty = { assetName: '', category: '', description: '' };

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const assetStatusText = { AVAILABLE: '대여 가능', RENTED: '대여 중', DISABLED: '사용 중지' };
const rentalStatusText = { REQUESTED: '신청', APPROVED: '승인', REJECTED: '반려', RETURNED: '반납', OVERDUE: '연체' };

export default function AdminAssetPage() {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [rentals, setRentals] = useState([]);

  const load = async () => {
    const [assetRes, rentalRes] = await Promise.all([assetApi.list(), assetApi.rentals()]);
    setItems(assetRes.data.data || []);
    setRentals(rentalRes.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (editingId) await assetApi.update(editingId, form);
    else await assetApi.create(form);
    await notify({ title: '저장 완료', message: '기자재 정보가 저장되었습니다.', type: 'success' });
    setForm(empty);
    setEditingId(null);
    load();
  };

  const startEdit = (asset) => {
    setEditingId(asset.assetNo);
    setForm({ assetName: asset.assetName, category: asset.category || '', description: asset.description || '' });
  };

  const disable = async (assetNo) => {
    const confirmed = await confirmDialog({
      title: '기자재를 비활성화할까요?',
      message: '비활성화된 기자재는 일반 사용자가 대여 신청할 수 없습니다.',
      type: 'warning',
      confirmText: '비활성화',
      cancelText: '취소'
    });
    if (!confirmed) return;
    await assetApi.disable(assetNo);
    await notify({ title: '비활성화 완료', message: '기자재 상태가 변경되었습니다.', type: 'success' });
    load();
  };

  const handleRental = async (action, rentalNo, message) => {
    await action(rentalNo);
    await notify({ title: '처리 완료', message, type: 'success' });
    load();
  };

  return (
    <div className="workspace-page admin-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">ASSET ADMIN</span>
          <h1>기자재 관리</h1>
          <p>기자재를 등록·수정하고 대여 신청을 승인, 반려, 반납 처리합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>등록 기자재</span><strong>{items.length}개</strong></div>
      </section>

      <div className="workspace-grid two">
        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>{editingId ? '기자재 수정' : '기자재 등록'}</h2><p>대여 가능한 기자재 정보를 관리합니다.</p></div></div>
          <form className="workspace-form" onSubmit={submit}>
            <label>이름<input required value={form.assetName} onChange={(event) => setForm({ ...form, assetName: event.target.value })} /></label>
            <label>카테고리<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
            <label>설명<textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <div className="workspace-actions">
              <button className="primary-button" type="submit">{editingId ? '수정 저장' : '등록'}</button>
              {editingId ? <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(empty); }}>취소</button> : null}
            </div>
          </form>

          <div className="workspace-list">
            {items.map((asset) => (
              <div className="workspace-row" key={asset.assetNo}>
                <div className="workspace-row__main"><strong>{asset.assetName}</strong><span>{asset.category || '기타'} · {asset.description || '설명 없음'}</span></div>
                <div className="workspace-row__actions">
                  <span className={`status-pill ${statusClass(asset.status)}`}>{assetStatusText[asset.status] || asset.status}</span>
                  <button className="secondary-button" type="button" onClick={() => startEdit(asset)}>수정</button>
                  <button className="secondary-button" type="button" disabled={asset.status === 'DISABLED'} onClick={() => disable(asset.assetNo)}>비활성화</button>
                </div>
              </div>
            ))}
            {!items.length ? <div className="workspace-empty">등록된 기자재가 없습니다.</div> : null}
          </div>
        </section>

        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>대여 신청 목록</h2><p>사용자 신청을 검토하고 처리합니다.</p></div></div>
          <div className="workspace-list">
            {rentals.map((rental) => (
              <div className="workspace-row" key={rental.rentalNo}>
                <div className="workspace-row__main"><strong>{rental.assetName || `신청 #${rental.rentalNo}`}</strong><span>기자재 #{rental.assetNo} · 사용자 #{rental.userNo}</span></div>
                <div className="workspace-row__actions">
                  <span className={`status-pill ${statusClass(rental.rentalStatus)}`}>{rentalStatusText[rental.rentalStatus] || rental.rentalStatus}</span>
                  <button className="secondary-button" type="button" onClick={() => handleRental(assetApi.approve, rental.rentalNo, '대여 신청이 승인되었습니다.')}>승인</button>
                  <button className="secondary-button" type="button" onClick={() => handleRental(assetApi.reject, rental.rentalNo, '대여 신청이 반려되었습니다.')}>반려</button>
                  <button className="secondary-button" type="button" onClick={() => handleRental(assetApi.returnRental, rental.rentalNo, '반납 처리되었습니다.')}>반납</button>
                </div>
              </div>
            ))}
            {!rentals.length ? <div className="workspace-empty">대여 신청이 없습니다.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
