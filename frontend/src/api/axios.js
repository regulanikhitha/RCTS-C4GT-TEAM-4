import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('c4gt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Let the browser set multipart/form-data with the correct boundary
  // for FormData payloads; use application/json for everything else.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

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
