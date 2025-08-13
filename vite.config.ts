import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mint-fastapi-app.cfapps.eu10-004.hana.ondemand.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
