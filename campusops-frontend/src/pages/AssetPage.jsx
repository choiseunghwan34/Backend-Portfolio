import React, { useEffect, useState } from 'react';
import { assetApi } from '../api/assetApi';

export default function AssetPage() {
  const [assets, setAssets] = useState([]);
  const [myRentals, setMyRentals] = useState([]);

  const load = async () => {
    const [assetRes, rentalRes] = await Promise.all([assetApi.list(), assetApi.myRentals()]);
    setAssets(assetRes.data.data || []);
    setMyRentals(rentalRes.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const rent = async (assetNo) => {
    await assetApi.rent(assetNo, { rentalDays: 7 });
    load();
  };

  return (
    <div className="content-grid two-col">
      <section className="content-card">
        <h1>기자재 대여</h1>
        <div className="stack-list">
          {assets.map((asset) => (
            <div className="list-item" key={asset.assetNo}>
              <strong>{asset.assetName}</strong>
              <span>{asset.category || '기타'} · {asset.status}</span>
              <button className="secondary-button" onClick={() => rent(asset.assetNo)}>대여 신청</button>
            </div>
          ))}
        </div>
      </section>
      <section className="content-card">
        <h2>내 대여 내역</h2>
        <div className="stack-list">
          {myRentals.map((rental) => (
            <div className="list-item" key={rental.rentalNo}>
              <strong>기자재 #{rental.assetNo}</strong>
              <span>{rental.rentalStatus} · 반납예정 {String(rental.returnDueDate || '').slice(0, 10)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
