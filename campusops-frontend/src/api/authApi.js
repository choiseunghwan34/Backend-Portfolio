import client from './client';

export const authApi = {
  login: (payload) => client.post('/api/auth/login', payload, { skipAuth: true }),
  signup: (payload) => client.post('/api/auth/signup', payload, { skipAuth: true }),
  logout: () => client.post('/api/auth/logout'),
  me: () => client.get('/api/users/me')
};
