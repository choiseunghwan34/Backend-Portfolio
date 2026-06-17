import client from './client';

export const noticeApi = {
  list: (params, config = {}) => client.get('/api/notices', { ...config, params }),
  detail: (noticeNo, config = {}) => client.get(`/api/notices/${noticeNo}`, config),
  create: (payload) => client.post('/api/admin/notices', payload),
  update: (noticeNo, payload) => client.put(`/api/admin/notices/${noticeNo}`, payload),
  remove: (noticeNo) => client.delete(`/api/admin/notices/${noticeNo}`)
};
