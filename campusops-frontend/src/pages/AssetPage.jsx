import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assetApi } from '../api/assetApi';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import StatusTimeline from '../components/StatusTimeline';
import { notify } from '../utils/dialog.jsx';

function statusClass(value = '') {
  return String(value).toLowerCase();
}

const assetStatusText = {
  AVAILABLE: '대여 가능',
  RENTED: '대여중',
  DISABLED: '사용 중지'
};

const rentalStatusText = {
  REQUESTED: '신청',
  APPROVED: '승인',
  REJECTED: '반려',
  RETURNED: '반납',
  OVERDUE: '연체'
};

export default function AssetPage() {
  const [assets, setAssets] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rentingNo, setRentingNo] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [assetRes, rentalRes] = await Promise.all([assetApi.list(), assetApi.myRentals()]);
      setAssets(assetRes.data.data || []);
      setMyRentals(rentalRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const rent = async (assetNo) => {
    setRentingNo(assetNo);
    try {
      await assetApi.rent(assetNo, { rentalDays: 7 });
      await notify({ title: '대여 신청 완료', message: '관리자 승인 후 대여가 확정됩니다.', type: 'success' });
      await load();
    } catch (error) {
      await notify({ title: '대여 신청 실패', message: error?.response?.data?.message || '잠시 후 다시 시도해 주세요.', type: 'danger' });
    } finally {
      setRentingNo(null);
    }
  };

  return (
    <div className="service-page service-page--asset">
      <section className="service-hero">
        <div>
          <span className="workspace-label">ASSET RENTAL</span>
          <h1>기자재 대여</h1>
          <p>수업, 행사, 동아리 운영에 필요한 기자재를 확인하고 대여를 신청하세요.</p>
        </div>
        <dl>
          <div><dt>대여 가능</dt><dd>{assets.filter((asset) => asset.status === 'AVAILABLE').length}개</dd></div>
          <div><dt>내 신청</dt><dd>{myRentals.length}건</dd></div>
        </dl>
      </section>

      <section className="service-guide">
        <strong>대여 이용 안내</strong>
        <p>대여 신청 후 관리자 승인 상태를 확인해 주세요. 기본 대여 기간은 7일이며, 반납 처리는 관리자 확인 후 반영됩니다.</p>
      </section>

      <div className="service-layout">
        <section className="service-panel service-panel--wide">
          <header><span>EQUIPMENT LIST</span><h2>기자재 목록</h2></header>
          {loading ? (
            <SkeletonList rows={5} />
          ) : (
            <div className="service-list">
              {assets.map((asset) => (
                <div className="service-row" key={asset.assetNo}>
                  <Link to={`/assets/${asset.assetNo}`}>
                    <strong>{asset.assetName}</strong>
                    <span>{asset.category || '기타'} · {asset.description || '설명 없음'}</span>
                  </Link>
                  <div className="service-row__actions">
                    <span className={`status-pill ${statusClass(asset.status)}`}>{assetStatusText[asset.status] || asset.status}</span>
                    <button className="secondary-button" type="button" disabled={asset.status !== 'AVAILABLE' || rentingNo === asset.assetNo} onClick={() => rent(asset.assetNo)}>
                      {rentingNo === asset.assetNo ? '신청 중...' : '대여 신청'}
                    </button>
                  </div>
                </div>
              ))}
              {!assets.length ? <EmptyState eyebrow="ASSET" title="등록된 기자재가 없습니다." description="관리자가 기자재를 등록하면 이곳에 표시됩니다." /> : null}
            </div>
          )}
        </section>

        <section className="service-panel">
          <header><span>MY RENTALS</span><h2>내 대여 내역</h2></header>
          {loading ? (
            <SkeletonList rows={4} />
          ) : (
            <div className="service-list">
              {myRentals.map((rental) => (
                <div className="service-row" key={rental.rentalNo}>
                  <div>
                    <strong>{rental.assetName || `기자재 #${rental.assetNo}`}</strong>
                    <span>반납 예정 {String(rental.returnDueDate || '').slice(0, 10) || '-'}</span>
                    <StatusTimeline steps={['REQUESTED', 'APPROVED', 'RETURNED']} current={rental.rentalStatus} />
                  </div>
                  <span className={`status-pill ${statusClass(rental.rentalStatus)}`}>{rentalStatusText[rental.rentalStatus] || rental.rentalStatus}</span>
                </div>
              ))}
              {!myRentals.length ? <EmptyState eyebrow="RENTAL" title="대여 신청 내역이 없습니다." description="필요한 기자재를 선택해 대여를 신청해 보세요." /> : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
