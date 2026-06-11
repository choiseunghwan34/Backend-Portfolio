import React from 'react';
import { Link } from 'react-router-dom';

const topLinks = ['학사안내', '학사일정', 'MOOC', '행정업무', '이용안내', '커뮤니티'];

const quickLinks = [
  { icon: '01', title: '강의실 예약', desc: '오늘 가능한 공간 확인' },
  { icon: '02', title: '기자재 대여', desc: '대여 신청과 반납 확인' },
  { icon: '03', title: '시설 신고', desc: '고장 접수와 처리 상태 확인' },
  { icon: '04', title: '공지사항', desc: '중요 공지와 운영 소식 확인' },
  { icon: '05', title: '알림센터', desc: '내 알림과 처리 결과 확인' },
  { icon: '06', title: 'Q&A', desc: '자주 묻는 질문과 문의' }
];

const shortcuts = [
  { icon: 'R', label: '강의실 바로가기' },
  { icon: 'N', label: '공지 바로가기' },
  { icon: 'A', label: '대여 신청' },
  { icon: 'F', label: '신고 접수' },
  { icon: 'K', label: '지식 베이스' },
  { icon: 'Q', label: '학사 문의' }
];

const notices = [
  { tag: '공지', title: '2026학년도 2학기 강의실 운영 일정 안내', date: '2026.06.11' },
  { tag: '공지', title: '기자재 대여 신청 가능 시간 변경 안내', date: '2026.06.10' },
  { tag: '공지', title: '공간 예약 가능 구역 업데이트', date: '2026.06.09' },
  { tag: '공지', title: '시설 신고 처리 절차 및 응답 기준 안내', date: '2026.06.08' }
];

const guides = [
  { tag: '이용안내', title: '신고는 장소와 증상을 함께 입력해 주세요', date: '2026.06.11' },
  { tag: '이용안내', title: '대여 승인 후 기자재 수령이 가능합니다', date: '2026.06.10' },
  { tag: '이용안내', title: '예약 취소는 마이 예약에서 직접 처리할 수 있습니다', date: '2026.06.09' },
  { tag: '이용안내', title: '읽지 않은 알림은 상단 알림 메뉴에서 확인합니다', date: '2026.06.08' }
];

const heroStats = [
  { label: '오늘 예약', value: '18건' },
  { label: '처리중 신고', value: '7건' },
  { label: '대여 승인 대기', value: '5건' }
];

const heroNotices = [
  '2학기 강의실 운영 일정 안내',
  '기자재 대여 신청 시간 변경',
  '공간 예약 가능 구역 업데이트'
];

export default function HomePage() {
  return (
    <div className="portal-home">
      <section className="campus-portal">
        <div className="campus-portal__top">
          <div className="campus-portal__logo">
            <span className="campus-portal__logo-mark">CO</span>
            <div>
              <strong>CampusOps</strong>
              <span>e-Campus Service Portal</span>
            </div>
          </div>
          <div className="campus-portal__top-links">
            {topLinks.map((item) => <a key={item} href="#">{item}</a>)}
          </div>
        </div>

        <div className="campus-portal__hero">
          <div className="campus-portal__ambient campus-portal__ambient--one" />
          <div className="campus-portal__ambient campus-portal__ambient--two" />
          <div className="campus-portal__headline">
            <div className="campus-portal__brandline">Dynamic Campus Operations</div>
            <h1>도전과 창조의 운영 포털</h1>
            <p>등록형 업무, 예약형 업무, 공지형 업무를 한 화면에서 연결하는 학교 운영 서비스</p>

            <div className="campus-portal__auth">
              <Link to="/login" className="campus-btn campus-btn--primary">로그인</Link>
              <Link to="/signup" className="campus-btn campus-btn--ghost">회원가입</Link>
            </div>

            <div className="campus-portal__dashboard">
              <div className="campus-portal__stats">
                {heroStats.map((item) => (
                  <div key={item.label} className="campus-portal__stat">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>

              <div className="campus-portal__bulletin">
                <div className="campus-portal__bulletin-title">최근 운영 안내</div>
                <ul>
                  {heroNotices.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <aside className="campus-portal__sidebar">
            <button className="campus-portal__sidebar-cta" type="button">내 강의실 바로가기</button>
            <div className="campus-portal__sidebar-list">
              {quickLinks.map((item, index) => (
                <button
                  key={item.title}
                  className="campus-portal__sidebar-item"
                  style={{ '--item-index': index }}
                  type="button"
                >
                  <span className="campus-portal__sidebar-icon">{item.icon}</span>
                  <span className="campus-portal__sidebar-copy">
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div className="campus-portal__shortcutbar">
            {shortcuts.map((item) => (
              <button key={item.label} type="button">
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-panels">
        <article className="portal-panel" id="notices">
          <div className="portal-panel__header">
            <h2>공지사항</h2>
            <button type="button">+</button>
          </div>
          <div className="portal-list">
            {notices.map((item) => (
              <div className="portal-row" key={item.title}>
                <span className="portal-row__tag">{item.tag}</span>
                <div className="portal-row__body">
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="portal-panel" id="guide">
          <div className="portal-panel__header">
            <h2>이용안내</h2>
            <button type="button">+</button>
          </div>
          <div className="portal-list">
            {guides.map((item) => (
              <div className="portal-row" key={item.title}>
                <span className="portal-row__tag portal-row__tag--muted">{item.tag}</span>
                <div className="portal-row__body">
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
