import client from './client';

export const authApi = {
  login: (payload) => client.post('/api/auth/login', payload),
  signup: (payload) => client.post('/api/auth/signup', payload),
  logout: () => client.post('/api/auth/logout'),
  me: () => client.get('/api/users/me')
};
