import axios from 'axios';
import { handleMockRequest } from '../utils/mockApi';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusops_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('campusops_token');
      localStorage.removeItem('campusops_user');
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
