import axios from 'axios';
import { handleMockRequest } from '../utils/mockApi';
import { clearSession, getToken } from '../utils/auth';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    if (!error?.response || error?.code === 'ERR_NETWORK' || error?.response?.status >= 500) {
      return handleMockRequest(error.config);
    }
    return Promise.reject(error);
  }
);

export default client;
