import client from './client';

export const dashboardApi = {
  userRecentNotices: () => client.get('/api/notices/recent'),
  unreadCount: () => client.get('/api/notifications/unread-count'),
  adminStats: () => client.get('/api/admin/dashboard/stats')
};
