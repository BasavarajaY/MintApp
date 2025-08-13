// src/api/axiosInstance.ts
import axios from 'axios';

const baseURL =
  import.meta.env.VITE_APP_HOST ||
  (import.meta.env.DEV ? '/api' : '');

const otpInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const pageInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

pageInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { otpInstance, pageInstance };
