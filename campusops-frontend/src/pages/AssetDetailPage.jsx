import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { assetApi } from '../api/assetApi';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

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

  return (
    <div className="workspace-page detail-article">
      <article className="workspace-card detail-card">
        <div className="detail-head">
          <div>
            <span className="workspace-label">ASSET DETAIL</span>
            <h1>{asset.assetName}</h1>
            <p>{asset.category || '기타'} · 등록일 {String(asset.createdAt || '').slice(0, 10) || '-'}</p>
          </div>
          <div className="workspace-actions">
            <span className={`status-pill ${statusClass(asset.status)}`}>{asset.status}</span>
            <Link className="secondary-button" to="/assets">목록</Link>
          </div>
        </div>

        <div className="detail-layout">
          <section className="detail-body">
            <h2>기자재 설명</h2>
            <p className="body-text">{asset.description || '등록된 설명이 없습니다.'}</p>
            {message ? <div className="detail-message">{message}</div> : null}
            <button className="primary-button" disabled={asset.status !== 'AVAILABLE'} onClick={rent}>대여 신청</button>
          </section>
          <aside className="detail-side">
            <div><span>자산 번호</span><strong>#{asset.assetNo}</strong></div>
            <div><span>카테고리</span><strong>{asset.category || '기타'}</strong></div>
            <div><span>현재 상태</span><strong>{asset.status}</strong></div>
            <div><span>대여 기간</span><p>기본 7일 대여로 신청됩니다.</p></div>
          </aside>
        </div>
      </article>
    </div>
  );
}
