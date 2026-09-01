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

// Keep the signed-in session stable during normal dashboard navigation.
// Only redirect when there is no saved login session at all.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const hasStoredSession = Boolean(localStorage.getItem('c4gt_token') || localStorage.getItem('c4gt_user'));
      if (!hasStoredSession) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
