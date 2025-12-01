import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // We use simple string concatenation to avoid PowerShell escaping errors
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export default api;