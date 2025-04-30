import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Change from 'autoUpdate' to 'prompt' for better control
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
      // Add proper Service Worker configuration
      workbox: {
        // Force the Service Worker to update on new deployments
        clientsClaim: true,
        skipWaiting: true,
        
        // Don't precache the big JS bundles - let them be handled by runtimeCaching
        globPatterns: ['**/*.{html,css,ico,png,svg}'],
        
        // Configure caching strategies
        runtimeCaching: [
          {
            // Cache JS assets
            urlPattern: /\.(?:js)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'js-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 24 * 60 * 60 // 1 day
              },
              networkTimeoutSeconds: 10 // Fallback to cache if network is slow
            }
          },
          {
            // Cache CSS assets
            urlPattern: /\.(?:css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'css-cache'
            }
          },
          {
            // Cache image assets
            urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            // Cache API calls
            urlPattern: /^https:\/\/sia-project-fg0k\.onrender\.com\/api/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 5 * 60 // 5 minutes
              },
              networkTimeoutSeconds: 10 // Fallback to cache if network is slow
            }
          }
        ]
      },
      // Add versioning to enable cache busting
      injectManifest: {
        injectionPoint: undefined,
        rollupFormat: 'iife',
        maximumFileSizeToCacheInBytes: 3000000
      },
      devOptions: {
        // Enable PWA in development for testing
        enabled: true,
        type: 'module'
      }
    }),
  ],
  build: {
    // Split code into chunks based on logical groupings
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state': ['zustand'],
          'ui-core': ['framer-motion', 'react-icons'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'utils': ['date-fns'],
          'api': ['axios'],
          'notifications': ['react-toastify', 'sweetalert2'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Consider disabling sourcemaps in production as they increase bundle size
    sourcemap: false, // Changed from true to false
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
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
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
    exclude: ['@vite/client', '@vite/env']
  },
});