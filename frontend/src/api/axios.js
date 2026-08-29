import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('c4gt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('c4gt_token');
      localStorage.removeItem('c4gt_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
