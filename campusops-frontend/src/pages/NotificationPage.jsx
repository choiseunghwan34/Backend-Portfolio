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

  return (
    <div className="content-card">
      <h1>알림</h1>
      <div className="stack-list">
        {notifications.map((notification) => (
          <div className={`list-item ${notification.readYn ? 'muted' : ''}`} key={notification.notificationNo}>
            <strong>{notification.title}</strong>
            <span>{notification.content}</span>
            {!notification.readYn ? <button className="secondary-button" onClick={() => markRead(notification.notificationNo)}>읽음</button> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
