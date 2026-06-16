import client from './client';

export const reportApi = {
  create: (payload) => client.post('/api/reports', payload),
  my: () => client.get('/api/reports/my'),
  detail: (reportNo) => client.get(`/api/reports/${reportNo}`),
  all: () => client.get('/api/admin/reports'),
  status: (reportNo, payload) => client.patch(`/api/admin/reports/${reportNo}/status`, payload),
  reply: (reportNo, payload) => client.patch(`/api/admin/reports/${reportNo}/reply`, payload)
};
