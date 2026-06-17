import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reportApi } from '../api/reportApi';
import { getCurrentUser } from '../utils/auth';

const faqs = [
  {
    category: '예약',
    question: '공간 예약은 언제까지 신청할 수 있나요?',
    answer: '예약 가능 공간은 날짜별 현황에서 확인할 수 있으며, 이미 예약된 시간대는 중복 신청할 수 없습니다.'
  },
  {
    category: '대여',
    question: '기자재 대여 신청 후 승인 여부는 어디서 확인하나요?',
    answer: '기자재 대여 페이지의 내 대여 내역과 알림센터에서 승인, 반려, 반납 처리 상태를 확인할 수 있습니다.'
  },
  {
    category: '신고',
    question: '시설 신고를 잘못 등록했을 때는 어떻게 하나요?',
    answer: '관리자 확인 전이라면 같은 내용으로 다시 등록하지 말고 Q&A 문의나 시설 신고 상세에서 처리 상태를 확인해 주세요.'
  },
  {
    category: '계정',
    question: '관리자 권한은 어떻게 받을 수 있나요?',
    answer: '관리자 권한은 운영 담당자가 계정 역할을 ADMIN으로 부여해야 합니다. 권한 요청은 Q&A 문의로 남겨 주세요.'
  }
];

export default function QnaPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [form, setForm] = useState({ title: '', content: '' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await reportApi.create({
        place: '온라인 문의',
        category: 'Q&A',
        title: form.title,
        content: form.content
      });
      setForm({ title: '', content: '' });
      setMessage('문의가 접수되었습니다. 처리 결과는 알림센터와 시설 신고 내역에서 확인할 수 있습니다.');
    } catch (error) {
      setMessage(error?.response?.data?.message || '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="qna-page">
      <section className="qna-hero">
        <div>
          <span className="workspace-label">HELP CENTER</span>
          <h1>Q&A</h1>
          <p>CampusOps 이용 중 자주 묻는 질문을 확인하고, 필요한 문의를 운영 담당자에게 남길 수 있습니다.</p>
        </div>
        <div className="qna-hero__card">
          <strong>운영 문의 접수</strong>
          <span>문의는 관리자 업무함으로 전달됩니다.</span>
          <Link to={user ? '/notifications' : '/login'}>{user ? '알림 확인하기' : '로그인 후 문의하기'}</Link>
        </div>
      </section>

      <section className="qna-layout">
        <article className="qna-panel qna-panel--faq">
          <header>
            <span>FAQ</span>
            <h2>자주 묻는 질문</h2>
          </header>
          <div className="qna-list">
            {faqs.map((faq) => (
              <details key={faq.question} className="qna-item">
                <summary>
                  <span>{faq.category}</span>
                  <strong>{faq.question}</strong>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </article>

        <article className="qna-panel">
          <header>
            <span>CONTACT</span>
            <h2>문의 남기기</h2>
          </header>
          <form className="service-form qna-form" onSubmit={submit}>
            <label>
              문의 제목
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="예: 관리자 권한 요청"
              />
            </label>
            <label>
              문의 내용
              <textarea
                required
                rows="7"
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                placeholder="문의 내용을 구체적으로 입력해 주세요."
              />
            </label>
            {message ? <div className={message.includes('실패') ? 'form-error' : 'detail-message'}>{message}</div> : null}
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? '접수 중...' : user ? '문의 접수' : '로그인 후 문의하기'}
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}
