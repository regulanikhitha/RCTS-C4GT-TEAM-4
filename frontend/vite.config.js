import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget =
    env.VITE_API_URL ||
    env.VITE_BACKEND_URL ||
    env.VITE_API_BASE_URL ||
    env.BACKEND_URL ||
    env.API_URL ||
    'http://localhost:5000';

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'BACKEND_', 'API_', 'REACT_APP_'],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget.replace(/\/api\/?$/, ''),
          changeOrigin: true,
        },
      },
    },
  };
});
