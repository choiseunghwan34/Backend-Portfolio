import React, { useEffect, useState } from 'react';
import { assetApi } from '../api/assetApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

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
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">ASSET RENTAL</span>
          <h1>기자재 대여</h1>
          <p>노트북, 태블릿, 카메라, 프로젝터 등 학습 운영에 필요한 기자재를 신청합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>대여 가능 기자재</span><strong>{assets.filter((a) => a.status === 'AVAILABLE').length}개</strong></div>
      </section>

      <div className="workspace-grid two">
        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>기자재 목록</h2><p>사용 가능한 기자재를 확인하고 대여 신청하세요.</p></div></div>
          <div className="workspace-list">
            {assets.map((asset) => (
              <div className="workspace-row" key={asset.assetNo}>
                <div className="workspace-row__main">
                  <strong>{asset.assetName}</strong>
                  <span>{asset.category || '기타'} · {asset.description || '설명 없음'}</span>
                </div>
                <div className="workspace-row__actions">
                  <span className={`status-pill ${statusClass(asset.status)}`}>{asset.status}</span>
                  <button className="secondary-button" disabled={asset.status !== 'AVAILABLE'} onClick={() => rent(asset.assetNo)}>대여 신청</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="workspace-card">
          <div className="workspace-card__head"><div><h2>내 대여 내역</h2><p>승인 상태와 반납 예정일을 확인합니다.</p></div></div>
          <div className="workspace-list">
            {myRentals.map((rental) => (
              <div className="workspace-row" key={rental.rentalNo}>
                <div className="workspace-row__main">
                  <strong>기자재 #{rental.assetNo}</strong>
                  <span>반납 예정 {String(rental.returnDueDate || '').slice(0, 10) || '-'}</span>
                </div>
                <span className={`status-pill ${statusClass(rental.rentalStatus)}`}>{rental.rentalStatus}</span>
              </div>
            ))}
            {!myRentals.length ? <div className="workspace-empty">대여 신청 내역이 없습니다.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
