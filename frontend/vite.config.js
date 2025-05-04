import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    base: isProduction ? '/Excel-Analytics-Platform/' : '/',
    plugins: [tailwindcss(),react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
    server: {
      proxy: {
        '/api/version1/auth/login': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/version1\/auth/, '/api/auth'),
        },
        '/api/version1/users/profile': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
        '/api/version1/analysis': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
        '/api/version1/upload': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
        '/api/version1/users': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
        '/api/version1/users/': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
        '/api/version1': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
  };
});