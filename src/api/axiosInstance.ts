// src/api/axiosInstance.ts
import axios from 'axios';

const otpInstance = axios.create({
  baseURL: import.meta.env.App_Host, // ✅ defined in .env file
  headers: {
    'Content-Type': 'application/json',
  },
});

const pageInstance = axios.create({
  baseURL: import.meta.env.App_Host,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Add Authorization header dynamically
pageInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { otpInstance, pageInstance };
