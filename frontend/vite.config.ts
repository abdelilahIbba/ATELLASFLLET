import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // In production builds (Vercel), point to the Render backend.
    // In dev, the Vite proxy forwards /api to localhost:8000.
    const apiBaseUrl = mode === 'production'
      ? 'https://atellasfleet-backend.onrender.com/api'
      : (env.VITE_API_BASE_URL || '/api');

    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        // HTTPS is required for iOS Safari to expose navigator.mediaDevices.getUserMedia().
        // Without it, the camera API is undefined on any non-localhost origin (including
        // local-network IPs like 192.168.x.x).
        https: {},
        historyApiFallback: true,
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:8000',
            changeOrigin: true,
            secure: false,
          },
          '/storage': {
            target: 'http://127.0.0.1:8000',
            changeOrigin: true,
            secure: false,
          },
        },
      },
      plugins: [react(), basicSsl()],
      define: {
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
