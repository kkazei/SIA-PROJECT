import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Split code into smaller chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'react-icons', 'sweetalert2'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-utils': ['date-fns', 'axios', 'zustand'],
        }
      }
    },
    // Increase warning limit (optional)
    chunkSizeWarningLimit: 800,
  },
  server: {
    proxy: {
      '/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nominatim/, ''),
        secure: false,
        headers: {
          'User-Agent': 'RentFlow/1.0 unitpaysolutions@gmail.com'
        }
      }
    }
  }
});