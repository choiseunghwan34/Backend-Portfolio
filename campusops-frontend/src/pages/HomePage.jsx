import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { homeApi } from '../api/homeApi';
import { clearSession, getCurrentUser } from '../utils/auth';
import { toast } from '../utils/dialog.jsx';

const quickServices = [
  { no: '01', title: '강의실 예약', description: '오늘 가능한 강의실 확인', to: '/rooms' },
  { no: '02', title: '기자재 대여', description: '대여 가능 기자재 확인', to: '/assets' },
  { no: '03', title: '시설 신고', description: '고장 접수와 처리 상태 확인', to: '/reports' },
  { no: '04', title: '공간 예약', description: '회의실과 세미나실 예약하기', to: '/rooms' },
  { no: '05', title: '알림센터', description: '내 알림과 처리 결과 확인', to: '/notifications' },
  { no: '06', title: 'Q&A', description: '자주 묻는 질문과 이용 문의', to: '/qna' }
];

const actionLinks = [
  { icon: 'building', label: '강의실 바로가기', to: '/rooms' },
  { icon: 'notice', label: '공지 바로보기', to: '/notices' },
  { icon: 'edit', label: '신고 접수', to: '/reports' },
  { icon: 'box', label: '대여 신청', to: '/assets' },
  { icon: 'calendar', label: '예약 현황', to: '/rooms' },
  { icon: 'chat', label: '문의하기', to: '/qna' }
];

const guides = [
  '신고는 장소와 증상을 함께 입력해 주세요',
  '대여 신청 가능 시간과 수령 절차 안내',
  '공간 예약 가능 구역 및 이용 수칙',
  '알림센터에서 처리 결과를 확인하는 방법'
];

const reportStatusText = { RECEIVED: '접수', CHECKING: '확인중', COMPLETED: '완료', REJECTED: '반려' };
const rentalStatusText = { REQUESTED: '접수', APPROVED: '승인', REJECTED: '반려', RETURNED: '반납', OVERDUE: '연체' };
const reservationStatusText = { RESERVED: '예약', CANCELLED: '취소', COMPLETED: '완료' };
const toneByStatus = {
  RECEIVED: 'waiting',
  REQUESTED: 'waiting',
  RESERVED: 'checking',
  CHECKING: 'checking',
  APPROVED: 'checking',
  COMPLETED: 'done',
  RETURNED: 'done',
  REJECTED: 'rejected',
  CANCELLED: 'rejected',
  OVERDUE: 'rejected'
};

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.list)) return value.list;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

function formatDate(value) {
  if (!value) return '-';
  return String(value).slice(0, 10).replaceAll('-', '.');
}

function formatTime(value) {
  if (!value) return '-';
  return String(value).slice(0, 5);
}

function progressWidth(value, max) {
  if (!max) return 12;
  return Math.min(100, Math.max(12, Math.round((value / max) * 100)));
}

function LineIcon({ name }) {
  const icons = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h6" /></>,
    report: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3h6v4H9zM9 11h6M9 15h6" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16.5 8" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    building: <><path d="m3 9 9-5 9 5M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16M3 21h18" /></>,
    notice: <><path d="M4 13V9l13-5v14L4 13ZM17 8h3M7 14l1 5h4l-2-4" /></>,
    edit: <><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20ZM13.5 7l3.5 3.5" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9" /></>,
    chat: <><path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-4A8 8 0 1 1 21 12Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[name]}</svg>;
}

export default function HomePage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState('reports');
  const [home, setHome] = useState({
    notices: [],
    assets: [],
    rooms: [],
    reports: [],
    rentals: [],
    reservations: [],
    unreadCount: 0,
    todayReservations: 0,
    pendingReports: 0,
    requestedRentals: 0,
    availableRooms: 0,
    availableAssets: 0,
    loading: true,
    error: ''
  });

  const logout = async () => {
    try {
      await authApi.logout();
      toast({ title: '로그아웃 완료', message: '현재 기기에서 세션이 종료되었습니다.', type: 'success' });
    } finally {
      clearSession();
      navigate('/home');
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadHomeData() {
      const { data } = await homeApi.summary();
      if (!mounted) return;

      const payload = data?.data || {};
      const rooms = toArray(payload.rooms);
      const assets = toArray(payload.assets);
      setHome({
        notices: toArray(payload.notices),
        assets,
        rooms,
        reports: toArray(payload.reports),
        rentals: toArray(payload.rentals),
        reservations: toArray(payload.reservations),
        unreadCount: Number(payload.unreadCount ?? 0),
        todayReservations: Number(payload.todayReservations ?? 0),
        pendingReports: Number(payload.pendingReports ?? 0),
        requestedRentals: Number(payload.requestedRentals ?? 0),
        availableRooms: Number(payload.availableRooms ?? rooms.filter((room) => room.status !== 'DISABLED').length),
        availableAssets: Number(payload.availableAssets ?? assets.filter((asset) => asset.status === 'AVAILABLE').length),
        loading: false,
        error: ''
      });
    }

    loadHomeData().catch(() => {
      if (!mounted) return;
      setHome((prev) => ({ ...prev, loading: false, error: '운영 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' }));
    });

    return () => { mounted = false; };
  }, []);

  const derived = useMemo(() => {
    const maxOperation = Math.max(home.todayReservations, home.pendingReports, home.requestedRentals, home.unreadCount, 1);

    return {
      heroStats: [
        { icon: 'calendar', label: '오늘 예약', value: `${home.todayReservations}건` },
        { icon: 'report', label: '처리중 신고', value: `${home.pendingReports}건` },
        { icon: 'check', label: '승인 대기', value: `${home.requestedRentals}건` },
        { icon: 'bell', label: '알림', value: `${home.unreadCount}건` }
      ],
      operations: [
        { label: '오늘 예약', description: `예약 가능 공간 ${home.availableRooms}곳`, value: home.todayReservations, width: progressWidth(home.todayReservations, maxOperation) },
        { label: '처리중 신고', description: currentUser ? `내 신고 ${home.reports.length}건` : '전체 접수 현황', value: home.pendingReports, width: progressWidth(home.pendingReports, maxOperation) },
        { label: '승인 대기', description: `대여 가능 기자재 ${home.availableAssets}개`, value: home.requestedRentals, width: progressWidth(home.requestedRentals, maxOperation) },
        { label: '읽지 않은 알림', description: currentUser ? '확인 필요한 알림' : '로그인 후 확인', value: home.unreadCount, width: progressWidth(home.unreadCount, maxOperation) }
      ],
      workTabs: [
        {
          id: 'reports',
          label: '시설 신고',
          items: home.reports.slice(0, 3).map((item) => ({
            icon: 'report',
            title: item.title,
            meta: `${item.place || '시설'} · ${formatDate(item.createdAt)}`,
            status: reportStatusText[item.status] || item.status,
            tone: toneByStatus[item.status] || 'waiting'
          }))
        },
        {
          id: 'rentals',
          label: '대여 신청',
          items: home.rentals.slice(0, 3).map((item) => ({
            icon: 'box',
            title: item.assetName || `기자재 #${item.assetNo}`,
            meta: `반납 예정 · ${formatDate(item.returnDueDate || item.createdAt)}`,
            status: rentalStatusText[item.rentalStatus] || item.rentalStatus,
            tone: toneByStatus[item.rentalStatus] || 'waiting'
          }))
        },
        {
          id: 'rooms',
          label: '공간 예약',
          items: home.reservations.slice(0, 3).map((item) => ({
            icon: 'calendar',
            title: `${item.roomName || `공간 #${item.roomNo}`} · ${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,
            meta: formatDate(item.reservationDate),
            status: reservationStatusText[item.status] || item.status,
            tone: toneByStatus[item.status] || 'checking'
          }))
        }
      ]
    };
  }, [currentUser, home]);

  const activeWork = derived.workTabs.find((tab) => tab.id === activeTab) || derived.workTabs[0];
  const dashboardPath = currentUser?.role === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <div className="reference-home">
      <section className="reference-hero">
        <div className="reference-hero__body">
          <div className="reference-hero__left">
            <div className="reference-hero__copy">
              <span>DYNAMIC CAMPUS OPERATIONS</span>
              <h1>도전과 창조의<br />운영 포털</h1>
              <p>통합형 업무 · 예약형 업무 · 공지형 업무를 한 화면에서 연결하는<br />스마트한 캠퍼스 운영 플랫폼입니다.</p>
              <div className="reference-hero__buttons">
                {currentUser ? (
                  <>
                    <Link to={dashboardPath} className="reference-button reference-button--light">대시보드 <span>→</span></Link>
                    <button type="button" className="reference-button reference-button--ghost" onClick={logout}>로그아웃 <span>→</span></button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="reference-button reference-button--light">로그인 <span>→</span></Link>
                    <Link to="/signup" className="reference-button reference-button--ghost">회원가입 <span>→</span></Link>
                  </>
                )}
              </div>
            </div>

            <div className="reference-stats">
              {derived.heroStats.map((stat) => (
                <div className="reference-stat" key={stat.label}>
                  <span className="reference-stat__icon"><LineIcon name={stat.icon} /></span>
                  <div><small>{stat.label}</small><strong>{home.loading ? '-' : stat.value}</strong></div>
                </div>
              ))}
            </div>
          </div>

          <aside className="reference-services">
            <div className="reference-services__head">
              <span>QUICK SERVICE</span>
              <h2>주요 서비스</h2>
            </div>
            <div className="reference-services__list">
              {quickServices.map((service) => (
                <Link to={service.to} className="reference-service" key={service.no}>
                  <span className="reference-service__no">{service.no}</span>
                  <div><strong>{service.title}</strong><small>{service.description}</small></div>
                  <span className="reference-service__arrow">›</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>

        <nav className="reference-actions" aria-label="빠른 메뉴">
          {actionLinks.map((action) => (
            <Link to={action.to} key={action.label}>
              <LineIcon name={action.icon} />
              <strong>{action.label}</strong>
            </Link>
          ))}
        </nav>
      </section>

      {!currentUser ? (
        <section className="demo-entry-card">
          <div>
            <span className="workspace-label">TRY CAMPUSOPS</span>
            <h2>둘러보기 계정이 준비되어 있습니다</h2>
            <p>회원가입 없이 일반 사용자와 관리자 화면을 바로 체험할 수 있습니다. 로그인 화면 하단의 체험 계정 버튼을 이용해 주세요.</p>
          </div>
          <Link className="primary-button" to="/login">데모 로그인으로 이동</Link>
        </section>
      ) : null}

      {home.error && <p className="reference-data-note">{home.error}</p>}

      <section className="reference-dashboard">
        <article className="reference-card reference-notices">
          <header className="reference-card__head">
            <h2><LineIcon name="bell" />공지사항</h2>
            <Link to="/notices">전체보기 <span>›</span></Link>
          </header>
          <div className="reference-list">
            {home.notices.length > 0 ? home.notices.map((notice) => (
              <Link to={`/notices/${notice.noticeNo}`} className="reference-list__row" key={notice.noticeNo}>
                <span className={notice.importantYn ? 'important' : ''}>{notice.importantYn ? '중요' : notice.category || '공지'}</span>
                <strong>{notice.title}</strong>
                <time>{formatDate(notice.createdAt)}</time>
              </Link>
            )) : <div className="reference-empty">등록된 공지사항이 없습니다.</div>}
          </div>
        </article>

        <article className="reference-card reference-guide">
          <header className="reference-card__head">
            <h2><LineIcon name="building" />서비스 가이드</h2>
            <Link to="/qna">더보기 <span>›</span></Link>
          </header>
          <div className="reference-guide__list">
            {guides.map((guide, index) => (
              <div key={guide}><span>{String(index + 1).padStart(2, '0')}</span><strong>{guide}</strong></div>
            ))}
          </div>
        </article>

        <article className="reference-operation">
          <header>
            <h2>운영 현황</h2>
            <span><i />실시간 업데이트</span>
          </header>
          <div className="reference-operation__list">
            {derived.operations.map((item) => (
              <div key={item.label}>
                <div><strong>{item.label}</strong><small>{item.description}</small></div>
                <b>{home.loading ? '-' : item.value}<small>건</small></b>
                <span><i style={{ width: `${item.width}%` }} /></span>
              </div>
            ))}
          </div>
        </article>

        <article className="reference-card reference-work">
          <header className="reference-card__head reference-work__head">
            <h2>최근 업무 현황</h2>
            <div className="reference-tabs" role="tablist" aria-label="최근 업무 종류">
              {derived.workTabs.map((tab) => (
                <button type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)} key={tab.id}>
                  {tab.label}
                </button>
              ))}
            </div>
          </header>
          <div className="reference-work__list">
            {activeWork.items.length > 0 ? activeWork.items.map((item) => (
              <div className="reference-work__row" key={`${item.title}-${item.meta}`}>
                <span><LineIcon name={item.icon} /></span>
                <div><strong>{item.title}</strong><small>{item.meta}</small></div>
                <b className={`ops-status ops-status--${item.tone}`}>{item.status}</b>
              </div>
            )) : <div className="reference-empty">로그인하면 개인 업무 현황을 확인할 수 있습니다.</div>}
          </div>
        </article>

        <article className="reference-banner">
          <div>
            <h2>더 나은 캠퍼스, 함께 만들어갑니다</h2>
            <p>CampusOps는 구성원 모두의 참여로<br />더 안전하고 편리한 캠퍼스를 만들어갑니다.</p>
            <Link to="/notices">이용 안내 보기 <span>→</span></Link>
          </div>
          <img className="reference-banner__mark" src="/campusops-mark.svg" alt="" />
        </article>
      </section>
    </div>
  );
}
