import React, { useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    const { data } = await notificationApi.list();
    setNotifications(data.data || []);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (notificationNo) => {
    await notificationApi.markRead(notificationNo);
    load();
  };

  const unread = notifications.filter((item) => !item.readYn).length;

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__copy">
          <span className="workspace-label">NOTIFICATION CENTER</span>
          <h1>알림센터</h1>
          <p>신고 처리, 대여 승인, 예약 변경 등 CampusOps 처리 결과를 확인합니다.</p>
        </div>
        <div className="workspace-hero__aside"><span>읽지 않은 알림</span><strong>{unread}건</strong></div>
      </section>

      <section className="workspace-card">
        <div className="workspace-card__head"><div><h2>내 알림</h2><p>읽음 처리한 알림은 흐리게 표시됩니다.</p></div></div>
        <div className="workspace-list">
          {notifications.map((notification) => (
            <div className={`workspace-row ${notification.readYn ? 'muted' : ''}`} key={notification.notificationNo}>
              <div className="workspace-row__main">
                <strong>{notification.title}</strong>
                <span>{notification.content} · {String(notification.createdAt || '').slice(0, 10)}</span>
              </div>
              {!notification.readYn ? <button className="secondary-button" onClick={() => markRead(notification.notificationNo)}>읽음 처리</button> : <span className="status-pill completed">읽음</span>}
            </div>
          ))}
          {!notifications.length ? <div className="workspace-empty">도착한 알림이 없습니다.</div> : null}
        </div>
      </section>
    </div>
  );
}
