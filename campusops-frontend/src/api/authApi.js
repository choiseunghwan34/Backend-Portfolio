import client from './client';

export const authApi = {
  login: (payload) => client.post('/api/auth/login', payload, { skipAuth: true }),
  signup: (payload) => client.post('/api/auth/signup', payload, { skipAuth: true }),
  sendEmailVerification: (payload) => client.post('/api/auth/email/send', payload, { skipAuth: true }),
  verifyEmail: (payload) => client.post('/api/auth/email/verify', payload, { skipAuth: true }),
  logout: () => client.post('/api/auth/logout'),
  me: () => client.get('/api/users/me'),
  updateMe: (payload) => client.put('/api/users/me', payload),
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/api/users/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
