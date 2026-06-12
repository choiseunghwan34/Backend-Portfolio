import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const quickServices = [
  { no: '01', title: '강의실 예약', description: '오늘 가능한 강의실 확인', to: '/rooms' },
  { no: '02', title: '기자재 대여', description: '대여 가능 기자재 확인', to: '/assets' },
  { no: '03', title: '시설 신고', description: '고장 접수와 처리 상태 확인', to: '/reports' },
  { no: '04', title: '공간 예약', description: '회의실·세미나실 예약하기', to: '/rooms' },
  { no: '05', title: '알림센터', description: '내 알림과 처리 결과 확인', to: '/notifications' },
  { no: '06', title: 'Q&A', description: '자주 묻는 질문과 이용 문의', to: '/login' }
];

const heroStats = [
  { icon: 'calendar', label: '오늘 예약', value: '24건' },
  { icon: 'report', label: '처리중 신고', value: '9건' },
  { icon: 'check', label: '승인 대기', value: '7건' },
  { icon: 'bell', label: '알림', value: '3건' }
];

const actionLinks = [
  { icon: 'building', label: '강의실 바로가기', to: '/rooms' },
  { icon: 'notice', label: '공지 바로보기', to: '/notices' },
  { icon: 'edit', label: '신고 접수', to: '/reports' },
  { icon: 'box', label: '대여 신청', to: '/assets' },
  { icon: 'calendar', label: '예약 현황', to: '/rooms' },
  { icon: 'chat', label: '문의하기', to: '/login' }
];

const notices = [
  { category: '중요', title: '2026학년도 2학기 강의실 운영 일정 안내', date: '2026.06.11', important: true },
  { category: '대여', title: '기자재 대여 신청 가능 시간 변경 안내', date: '2026.06.10' },
  { category: '예약', title: '공간 예약 가능 구역 업데이트', date: '2026.06.09' },
  { category: '시설', title: '시설 신고 처리 절차 및 응답 기준 안내', date: '2026.06.08' }
];

const guides = [
  '신고는 장소와 증상을 함께 입력해 주세요',
  '대여 신청 가능 시간과 수령 절차 안내',
  '공간 예약 가능 구역 및 이용 수칙',
  '알림센터에서 처리 결과를 확인하는 방법'
];

const operations = [
  { label: '오늘 예약', description: '예정 24 · 이용중 18', value: 24, width: 72 },
  { label: '처리중 신고', description: '접수 9 · 처리 4', value: 9, width: 45 },
  { label: '승인 대기', description: '기자재 대여 요청', value: 7, width: 31 },
  { label: '완료된 알림', description: '오늘 새로 도착', value: 3, width: 18 }
];

const workTabs = [
  {
    id: 'reports',
    label: '시설 신고',
    items: [
      { icon: 'report', title: '본관 3층 복도 조명 점검 요청', meta: '김민지 · 10분 전', status: '접수', tone: 'waiting' },
      { icon: 'tool', title: '스터디룸 냉방기 작동 이상', meta: '이도현 · 42분 전', status: '확인중', tone: 'checking' },
      { icon: 'report', title: '강의동 1층 출입문 수리 요청', meta: '박서준 · 1시간 전', status: '완료', tone: 'done' }
    ]
  },
  {
    id: 'rentals',
    label: '대여 신청',
    items: [
      { icon: 'box', title: '노트북 3대 대여 신청', meta: '컴퓨터공학과 · 15분 전', status: '접수', tone: 'waiting' },
      { icon: 'box', title: '빔프로젝터 대여 신청', meta: '경영학과 · 50분 전', status: '확인중', tone: 'checking' },
      { icon: 'box', title: '무선 마이크 2대 대여 신청', meta: '학생회 · 2시간 전', status: '반려', tone: 'rejected' }
    ]
  },
  {
    id: 'rooms',
    label: '공간 예약',
    items: [
      { icon: 'calendar', title: '회의실 A · 14:00 - 15:00', meta: '교무팀 · 8분 전', status: '완료', tone: 'done' },
      { icon: 'calendar', title: '스터디룸 2 · 16:00 - 18:00', meta: '김민지 · 35분 전', status: '확인중', tone: 'checking' },
      { icon: 'calendar', title: '강의실 301 · 18:00 - 20:00', meta: '학술동아리 · 2시간 전', status: '반려', tone: 'rejected' }
    ]
  }
];

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
    chat: <><path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-4A8 8 0 1 1 21 12Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    tool: <><path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-3-3 2.5-2.5Z" /></>
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[name]}</svg>;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('reports');
  const activeWork = workTabs.find((tab) => tab.id === activeTab);

  return (
    <div className="reference-home">
      <section className="reference-hero">
        <div className="reference-hero__body">
          <div className="reference-hero__left">
            <div className="reference-hero__copy">
              <span>DYNAMIC CAMPUS OPERATIONS</span>
              <h1>도전과 창조의<br />운영 포털</h1>
              <p>통합형 업무 · 예약형 업무 · 공간형 업무를 한 화면에서 연결하는<br />스마트한 캠퍼스 운영 플랫폼입니다.</p>
              <div className="reference-hero__buttons">
                <Link to="/login" className="reference-button reference-button--light">로그인 <span>→</span></Link>
                <Link to="/signup" className="reference-button reference-button--ghost">회원가입 <span>→</span></Link>
              </div>
            </div>

            <div className="reference-stats">
              {heroStats.map((stat) => (
                <div className="reference-stat" key={stat.label}>
                  <span className="reference-stat__icon"><LineIcon name={stat.icon} /></span>
                  <div><small>{stat.label}</small><strong>{stat.value}</strong></div>
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

      <section className="reference-dashboard">
        <article className="reference-card reference-notices">
          <header className="reference-card__head">
            <h2><LineIcon name="bell" />공지사항</h2>
            <Link to="/notices">전체보기 <span>›</span></Link>
          </header>
          <div className="reference-list">
            {notices.map((notice) => (
              <Link to="/notices" className="reference-list__row" key={notice.title}>
                <span className={notice.important ? 'important' : ''}>{notice.category}</span>
                <strong>{notice.title}</strong>
                <time>{notice.date}</time>
              </Link>
            ))}
          </div>
        </article>

        <article className="reference-card reference-guide">
          <header className="reference-card__head">
            <h2><LineIcon name="building" />서비스 가이드</h2>
            <Link to="/login">더보기 <span>›</span></Link>
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
            {operations.map((item) => (
              <div key={item.label}>
                <div><strong>{item.label}</strong><small>{item.description}</small></div>
                <b>{item.value}<small>건</small></b>
                <span><i style={{ width: `${item.width}%` }} /></span>
              </div>
            ))}
          </div>
        </article>

        <article className="reference-card reference-work">
          <header className="reference-card__head reference-work__head">
            <h2>최근 업무 현황</h2>
            <div className="reference-tabs" role="tablist" aria-label="최근 업무 종류">
              {workTabs.map((tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={activeTab === tab.id ? 'active' : ''}
                  onClick={() => setActiveTab(tab.id)}
                  key={tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>
          <div className="reference-work__list">
            {activeWork.items.map((item) => (
              <div className="reference-work__row" key={item.title}>
                <span><LineIcon name={item.icon} /></span>
                <div><strong>{item.title}</strong><small>{item.meta}</small></div>
                <b className={`ops-status ops-status--${item.tone}`}>{item.status}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="reference-banner">
          <div>
            <h2>더 나은 캠퍼스, 함께 만들어갑니다</h2>
            <p>CampusOps는 구성원 모두의 참여로<br />더 안전하고 편리한 캠퍼스를 만들어갑니다.</p>
            <Link to="/login">이용 안내 보기 <span>→</span></Link>
          </div>
          <img className="reference-banner__mark" src="/campusops-mark.svg" alt="" />
        </article>
      </section>
    </div>
  );
}
