import client from './client';

export const noticeApi = {
  list: (params) => client.get('/api/notices', { params }),
  detail: (noticeNo) => client.get(`/api/notices/${noticeNo}`),
  create: (payload) => client.post('/api/admin/notices', payload),
  update: (noticeNo, payload) => client.put(`/api/admin/notices/${noticeNo}`, payload),
  remove: (noticeNo) => client.delete(`/api/admin/notices/${noticeNo}`)
};
