import client from './client';

export const authApi = {
  login: (payload) => client.post('/api/auth/login', payload, { skipAuth: true }),
  signup: (payload) => client.post('/api/auth/signup', payload, { skipAuth: true }),
  sendEmailVerification: (payload) => client.post('/api/auth/email/send', payload, { skipAuth: true }),
  verifyEmail: (payload) => client.post('/api/auth/email/verify', payload, { skipAuth: true }),
  logout: () => client.post('/api/auth/logout'),
  me: () => client.get('/api/users/me')
};
