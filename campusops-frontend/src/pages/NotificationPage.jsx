import React, { useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import { toast } from '../utils/dialog.jsx';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await notificationApi.list();
      setNotifications(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (notificationNo) => {
    await notificationApi.markRead(notificationNo);
    toast({ title: '읽음 처리 완료', message: '알림 상태가 업데이트되었습니다.', type: 'success' });
    load();
  };

  const unread = notifications.filter((item) => !item.readYn).length;

  return (
    <div className="service-page service-page--notification">
      <section className="service-hero">
        <div>
          <span className="workspace-label">NOTIFICATION CENTER</span>
          <h1>알림센터</h1>
          <p>신고 처리, 대여 승인, 예약 변경 등 CampusOps 업무 처리 결과를 확인합니다.</p>
        </div>
        <dl>
          <div><dt>전체 알림</dt><dd>{notifications.length}건</dd></div>
          <div><dt>읽지 않음</dt><dd>{unread}건</dd></div>
        </dl>
      </section>

      <section className="service-guide">
        <strong>알림 안내</strong>
        <p>처리 결과를 확인한 알림은 읽음 처리할 수 있습니다. 중요한 운영 알림은 업무 진행 상태와 함께 계속 보관됩니다.</p>
      </section>

      <section className="service-panel">
        <header><span>MY NOTIFICATIONS</span><h2>내 알림</h2></header>
        {loading ? (
          <SkeletonList rows={5} />
        ) : (
          <div className="notice-inbox">
            {notifications.map((notification) => (
              <div className={`notice-inbox__row ${notification.readYn ? 'read' : ''}`} key={notification.notificationNo}>
                <i />
                <div>
                  <strong>{notification.title}</strong>
                  <span>{notification.content} · {String(notification.createdAt || '').slice(0, 10)}</span>
                </div>
                {!notification.readYn
                  ? <button className="secondary-button" type="button" onClick={() => markRead(notification.notificationNo)}>읽음 처리</button>
                  : <span className="status-pill completed">읽음</span>}
              </div>
            ))}
            {!notifications.length ? <EmptyState eyebrow="NOTIFICATION" title="아직 받은 알림이 없습니다." description="신고, 대여, 예약 처리 결과가 생기면 이곳에 표시됩니다." /> : null}
          </div>
        )}
      </section>
    </div>
  );
}
