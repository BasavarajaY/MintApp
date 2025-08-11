import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/mint_proxy': {
        target: 'https://mint-fastapi-app.cfapps.eu10-004.hana.ondemand.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/mint_proxy/, ''),
      },
      '/source_proxy': {
        target: 'https://l701057-tmn.hci.eu2.hana.ondemand.com:443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/source_proxy/, ''),
      },
    },
  },
});
