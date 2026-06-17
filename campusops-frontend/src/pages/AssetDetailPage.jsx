import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { assetApi } from '../api/assetApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const assetStatusText = {
  AVAILABLE: '대여 가능',
  RENTED: '대여중',
  DISABLED: '사용 중지'
};

export default function AssetDetailPage() {
  const { assetNo } = useParams();
  const [asset, setAsset] = useState(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await assetApi.detail(assetNo);
    setAsset(data.data);
  };

  useEffect(() => { load(); }, [assetNo]);

  const rent = async () => {
    await assetApi.rent(assetNo, { rentalDays: 7 });
    setMessage('대여 신청이 접수되었습니다.');
    load();
  };

  if (!asset) return <div className="workspace-card detail-article">불러오는 중...</div>;

  const createdDate = String(asset.createdAt || '').slice(0, 10) || '-';
  const statusText = assetStatusText[asset.status] || asset.status || '확인 필요';
  const canRent = asset.status === 'AVAILABLE';

  return (
    <div className="workspace-page detail-article">
      <article className="workspace-card detail-card">
        <div className="detail-head">
          <div>
            <span className="workspace-label">EQUIPMENT RENTAL</span>
            <h1>{asset.assetName}</h1>
            <div className="detail-meta">
              <span className="detail-badge">{asset.category || '기자재'}</span>
              <span>등록일 {createdDate}</span>
              <span>기본 7일 대여</span>
            </div>
          </div>
          <div className="workspace-actions">
            <span className={`status-pill ${statusClass(asset.status)}`}>{statusText}</span>
            <Link className="secondary-button" to="/assets">목록</Link>
          </div>
        </div>

        <div className="detail-layout">
          <section className="detail-body">
            <h2>기자재 안내</h2>
            <p className="body-text">{asset.description || '등록된 설명이 없습니다.'}</p>
            {message ? <div className="detail-message">{message}</div> : null}
            <div className="detail-action-panel">
              <div>
                <span className="workspace-label">RENTAL REQUEST</span>
                <h3>{canRent ? '지금 대여 신청이 가능합니다' : '현재는 대여 신청이 어렵습니다'}</h3>
                <p>{canRent ? '신청 후 관리자 승인을 받으면 대여가 확정됩니다.' : '관리자 확인 후 상태가 변경되면 다시 신청할 수 있습니다.'}</p>
              </div>
              <button className="primary-button" type="button" disabled={!canRent} onClick={rent}>대여 신청</button>
            </div>
          </section>
          <aside className="detail-side">
            <div className="detail-side__summary">
              <span>대여 상태</span>
              <strong>{statusText}</strong>
              <p>{canRent ? '예약 충돌 없이 바로 신청할 수 있는 기자재입니다.' : '현재 대여중 또는 비활성 상태입니다.'}</p>
            </div>
            <div><span>관리 번호</span><strong>#{asset.assetNo}</strong></div>
            <div><span>분류</span><strong>{asset.category || '기자재'}</strong></div>
            <div><span>대여 기준</span><p>신청일 기준 기본 7일이며, 반납 처리는 관리자 승인 후 반영됩니다.</p></div>
          </aside>
        </div>
      </article>
    </div>
  );
}
