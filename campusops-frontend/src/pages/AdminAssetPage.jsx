import React, { useEffect, useState } from 'react';
import { assetApi } from '../api/assetApi';

const empty = { assetName: '', category: '', description: '' };

function statusClass(value = '') {
  return String(value).toLowerCase();
}

export default function AdminAssetPage() {
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState([]);
  const [rentals, setRentals] = useState([]);

  const load = async () => {
    const [assetRes, rentalRes] = await Promise.all([assetApi.list(), assetApi.rentals()]);
    setItems(assetRes.data.data || []);
    setRentals(rentalRes.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await assetApi.create(form);
    setForm(empty);
    load();
  };

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy"><span className="workspace-label">ASSET ADMIN</span><h1>기자재 관리</h1><p>기자재를 등록하고 대여 신청을 승인, 반려, 반납 처리합니다.</p></div>
        <div className="workspace-hero__aside"><span>등록 기자재</span><strong>{items.length}개</strong></div>
      </section>
      <div className="workspace-grid two">
        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>기자재 등록</h2><p>대여 가능한 기자재 정보를 등록합니다.</p></div></div>
          <form className="workspace-form" onSubmit={submit}>
            <label>이름<input required value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })} /></label>
            <label>카테고리<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
            <label>설명<textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <button className="primary-button" type="submit">등록</button>
          </form>
          <div className="workspace-list">
            {items.map((asset) => (
              <div className="workspace-row" key={asset.assetNo}>
                <div className="workspace-row__main"><strong>{asset.assetName}</strong><span>{asset.category || '기타'} · {asset.description || '설명 없음'}</span></div>
                <div className="workspace-row__actions"><span className={`status-pill ${statusClass(asset.status)}`}>{asset.status}</span><button className="secondary-button" onClick={() => assetApi.disable(asset.assetNo).then(load)}>비활성화</button></div>
              </div>
            ))}
          </div>
        </section>
        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>대여 신청 목록</h2><p>사용자 신청을 검토하고 처리합니다.</p></div></div>
          <div className="workspace-list">
            {rentals.map((rental) => (
              <div className="workspace-row" key={rental.rentalNo}>
                <div className="workspace-row__main"><strong>신청 #{rental.rentalNo}</strong><span>기자재 #{rental.assetNo} · 사용자 #{rental.userNo}</span></div>
                <div className="workspace-row__actions">
                  <span className={`status-pill ${statusClass(rental.rentalStatus)}`}>{rental.rentalStatus}</span>
                  <button className="secondary-button" onClick={() => assetApi.approve(rental.rentalNo).then(load)}>승인</button>
                  <button className="secondary-button" onClick={() => assetApi.reject(rental.rentalNo).then(load)}>반려</button>
                  <button className="secondary-button" onClick={() => assetApi.returnRental(rental.rentalNo).then(load)}>반납</button>
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
