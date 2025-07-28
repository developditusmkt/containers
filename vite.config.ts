import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/asaas': {
        target: 'https://www.asaas.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/asaas/, ''),
        headers: {
          'User-Agent': 'Sistema Alencar Orçamentos'
        }
      }
    }
  }
});
