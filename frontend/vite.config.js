import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: "/Excel-Analytics-Platform/",
  plugins: [tailwindcss(),react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': { // Proxy requests starting with /api
        target: 'http://localhost:8080', // Updated backend host and port
        changeOrigin: true,
      },
      // If you specifically want to use /api/version1, configure it like this:
      '/api/version1': {
        target: 'http://localhost:8080', // Updated backend host and port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/version1/, '/api'), // Remove /version1 when forwarding
      },
    },
  },
})
