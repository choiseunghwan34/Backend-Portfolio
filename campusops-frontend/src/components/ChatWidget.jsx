import React, { useRef, useState } from 'react';
import { chatApi } from '../api/chatApi';

const starterMessages = [
  '강의실 예약은 어떻게 하나요?',
  '시설 신고 처리 상태는 어디서 봐요?',
  '기자재 대여 신청 방법 알려줘'
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요. CampusOps AI입니다. 공지, 신고, 대여, 예약 이용 방법을 빠르게 안내해드릴게요.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const sendMessage = async (text = input) => {
    const content = text.trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const history = nextMessages.slice(-8).map(({ role, content: itemContent }) => ({ role, content: itemContent }));
      const { data } = await chatApi.ask({ message: content, history });
      setMessages([...nextMessages, { role: 'assistant', content: data.data.answer }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: error?.response?.data?.message || '지금은 답변을 만들지 못했어요. 잠시 후 다시 시도해 주세요.'
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className={`chat-widget ${open ? 'is-open' : ''}`}>
      {open ? (
        <section className="chat-panel" aria-label="CampusOps AI 챗봇">
          <header className="chat-panel__head">
            <div>
              <span>CampusOps AI</span>
              <strong>운영 안내 챗봇</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="챗봇 닫기">×</button>
          </header>

          <div className="chat-panel__body">
            {messages.map((message, index) => (
              <div className={`chat-message chat-message--${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {loading ? <div className="chat-message chat-message--assistant">답변을 정리하는 중입니다...</div> : null}
          </div>

          <div className="chat-panel__starters">
            {starterMessages.map((item) => (
              <button type="button" key={item} onClick={() => sendMessage(item)} disabled={loading}>
                {item}
              </button>
            ))}
          </div>

          <form
            className="chat-panel__form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="CampusOps 이용 방법을 물어보세요"
              maxLength={600}
            />
            <button type="submit" disabled={loading || !input.trim()}>전송</button>
          </form>
        </section>
      ) : null}

      <button className="chat-fab" type="button" onClick={() => setOpen((value) => !value)}>
        <span>AI</span>
        <strong>도움말</strong>
      </button>
    </div>
  );
}
