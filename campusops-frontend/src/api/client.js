import axios from 'axios';
import { clearSession, getToken, setAuthNotice } from '../utils/auth';
import { notify } from '../utils/dialog.jsx';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      if (error?.config?.skipAuth) return Promise.reject(error);
      const message = error?.response?.data?.message || '세션이 종료되었습니다. 다시 로그인해 주세요.';
      clearSession();
      setAuthNotice(message);
      if (!window.location.pathname.startsWith('/login')) {
        await notify({
          title: '세션이 종료되었습니다',
          message,
          type: error?.response?.headers?.['x-auth-error'] === 'DUPLICATE_LOGIN' ? 'warning' : 'info',
          confirmText: '로그인하기'
        });
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default client;
