import axios from 'axios';

/**
 * Resolves the backend base URL dynamically.
 * Supports:
 * - VITE_API_URL / VITE_BACKEND_URL / VITE_API_BASE_URL
 * - BACKEND_URL / API_URL (exposed via vite envPrefix)
 * - Defaults to '/api' for local dev proxy
 */
const resolveBaseURL = () => {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_SERVER_URL ||
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.BACKEND_URL ||
    import.meta.env.API_URL ||
    ''
  ).trim();

  // If no env variable is set, default to '/api' (for local Vite proxy)
  if (!envUrl) {
    return '/api';
  }

  // Remove trailing slashes
  let cleanUrl = envUrl.replace(/\/+$/, '');

  // Backend routes are mounted on '/api'. If user gave e.g. https://xxx.onrender.com, append '/api'
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl += '/api';
  }

  return cleanUrl;
};

const api = axios.create({
  baseURL: resolveBaseURL(),
});

// Attach JWT to every request & normalize endpoint paths
api.interceptors.request.use((config) => {
  // Normalize if config.url starts with '/api/' to avoid duplicate '/api/api/...'
  if (config.url && config.url.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '');
  }

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
// Only redirect when there is no saved login session and not already on auth pages.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAuthRoute =
        err.config?.url?.includes('/auth/login') ||
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/forgot-password');

      const hasStoredSession = Boolean(
        localStorage.getItem('c4gt_token') || localStorage.getItem('c4gt_user')
      );

      if (!hasStoredSession && !isAuthRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
