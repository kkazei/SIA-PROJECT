import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
);

// Register service worker only in production and avoid unnecessary duplicate registration.
if (import.meta.env.PROD && !import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;

        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window.dispatchEvent(
              new CustomEvent('app-sw-update-available', {
                detail: {
                  message: 'A new version is available. Reload to apply the latest changes.',
                  reload: () => window.location.reload(),
                },
              })
            );
          }
        });
      });

      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
          window.dispatchEvent(
            new CustomEvent('app-sw-updated', {
              detail: {
                message: 'The app has been updated. Refresh to activate the latest version.',
                reload: () => window.location.reload(),
              },
            })
          );
        },
        { once: true }
      );
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });
}
