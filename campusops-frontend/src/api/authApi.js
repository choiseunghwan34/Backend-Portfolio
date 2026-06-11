import client from './client';

export const authApi = {
  login: (payload) => client.post('/api/auth/login', payload),
  signup: (payload) => client.post('/api/auth/signup', payload),
  me: () => client.get('/api/users/me')
};
