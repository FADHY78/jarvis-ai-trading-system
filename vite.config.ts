import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.NEXT_PUBLIC_GEMINI_API_KEY': JSON.stringify(env.NEXT_PUBLIC_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.NEXT_PUBLIC_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.DERIV_TOKEN': JSON.stringify(env.DERIV_TOKEN),
        'process.env.TELEGRAM_BOT_TOKEN': JSON.stringify(env.TELEGRAM_BOT_TOKEN),
        'process.env.TELEGRAM_CHAT_ID': JSON.stringify(env.TELEGRAM_CHAT_ID)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
