import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-plugin',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const indexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;

      const indexHtml = fs.readFileSync(indexPath, 'utf-8');

      // 1. Create 404.html (Render static sites serve 404.html for unmatched routes)
      fs.writeFileSync(path.join(distDir, '404.html'), indexHtml);

      // 2. Create subdirectories for all routes so direct refresh loads index.html natively
      const routes = [
        'login',
        'forgot-password',
        'dashboard',
        'admin-dashboard',
        'coordinator-dashboard',
        'student-dashboard',
        'permission-dashboard',
        'attendance',
        'permissions',
        'members',
        'calendar',
        'reports',
        'notifications',
      ];

      routes.forEach((route) => {
        const routeDir = path.join(distDir, route);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml);
      });
    },
  };
}

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
    plugins: [react(), spaFallbackPlugin()],
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
