import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'RentFlow',
        short_name: 'RentFlow',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    // Split code into chunks based on logical groupings
    rollupOptions: {
      output: {
        manualChunks: {
          // Core app dependencies
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // State management
          'state': ['zustand'],
          
          // UI/UX related
          'ui-core': ['framer-motion', 'react-icons'],
          
          // Data visualization
          'charts': ['chart.js', 'react-chartjs-2'],
          
          // Date handling and utilities
          'utils': ['date-fns'],
          
          // Network and API related
          'api': ['axios'],
          
          // UI notification libraries
          'notifications': ['react-toastify', 'sweetalert2'],
        }
      }
    },
    // Increase chunk size warning limit to avoid unnecessary warnings
    chunkSizeWarningLimit: 1000, // 1000 KB
    
    // Enable source maps for better debugging in production
    sourcemap: true,
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
  },
  // Keep your existing proxy configuration
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
  },
  // Add a configuration for caching and performance
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
    exclude: ['@vite/client', '@vite/env']
  },
});
