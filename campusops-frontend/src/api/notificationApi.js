import client from './client';

export const notificationApi = {
  list: () => client.get('/api/notifications'),
  markRead: (notificationNo) => client.patch(`/api/notifications/${notificationNo}/read`),
  unreadCount: () => client.get('/api/notifications/unread-count')
};
