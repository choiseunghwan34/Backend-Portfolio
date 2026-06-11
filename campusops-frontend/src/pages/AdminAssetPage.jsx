import React, { useEffect, useState } from 'react';
import { assetApi } from '../api/assetApi';

const empty = { assetName: '', category: '', description: '' };

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
    <div className="content-grid two-col">
      <section className="content-card">
        <h1>기자재 등록</h1>
        <form className="form-grid" onSubmit={submit}>
          <label>이름<input value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })} /></label>
          <label>카테고리<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label>설명<textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <button className="primary-button" type="submit">등록</button>
        </form>
        <div className="stack-list">
          {items.map((asset) => (
            <div className="list-item" key={asset.assetNo}>
              <strong>{asset.assetName}</strong>
              <span>{asset.status}</span>
              <button className="secondary-button" onClick={() => assetApi.disable(asset.assetNo).then(load)}>비활성화</button>
            </div>
          ))}
        </div>
      </section>
      <section className="content-card">
        <h2>대여 신청 목록</h2>
        <div className="stack-list">
          {rentals.map((rental) => (
            <div className="list-item" key={rental.rentalNo}>
              <strong>#{rental.rentalNo}</strong>
              <span>{rental.rentalStatus}</span>
              <div className="inline-actions">
                <button className="secondary-button" onClick={() => assetApi.approve(rental.rentalNo).then(load)}>승인</button>
                <button className="secondary-button" onClick={() => assetApi.reject(rental.rentalNo).then(load)}>반려</button>
                <button className="secondary-button" onClick={() => assetApi.returnRental(rental.rentalNo).then(load)}>반납</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
