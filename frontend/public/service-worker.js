// Service worker version - increment to force update
const CACHE_VERSION = 'v1.2';
const CACHE_NAME = `rentflow-${CACHE_VERSION}`;

// Assets that should be cached immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest'
];

// SPA routes that should be handled by returning index.html
const SPA_ROUTES = [
  '/dashboard',
  '/landlord',
  '/tenant',
  '/admin',
  '/profile',
  '/settings',
  '/apartments',
  '/maintenance'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing new version', CACHE_VERSION);
  
  // Precache critical assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Activate immediately without waiting for tabs to close
        console.log('[ServiceWorker] Skipping waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating new version', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('rentflow-') && name !== CACHE_NAME)
            .map(name => {
              console.log('[ServiceWorker] Deleting old cache', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all clients
        console.log('[ServiceWorker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Is this a navigation to an SPA route?
const isSpaRoute = (url) => {
  const pathname = new URL(url).pathname;
  return SPA_ROUTES.some(route => pathname.startsWith(route));
};

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;
  
  // Handle SPA routes by serving index.html
  if (isSpaRoute(url.href) || (event.request.mode === 'navigate' && url.pathname !== '/')) {
    console.log('[ServiceWorker] Handling SPA route', url.pathname);
    
    event.respondWith(
      // Try network first for navigation
      fetch(event.request)
        .catch(() => {
          console.log('[ServiceWorker] Navigation fetch failed, serving from cache');
          return caches.match('/index.html');
        })
    );
    return;
  }
  
  // For API requests, always go to network first
  if (url.pathname.startsWith('/api/')) {
    console.log('[ServiceWorker] API request', url.pathname);
    
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[ServiceWorker] API fetch failed, trying cache');
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For static assets (JS, CSS, images), use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[ServiceWorker] Serving from cache', url.pathname);
          return cachedResponse;
        }
        
        // Not in cache, get from network
        console.log('[ServiceWorker] Fetching from network', url.pathname);
        return fetch(event.request)
          .then(response => {
            // Don't cache if response is not valid
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone the response to cache it
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            console.error('[ServiceWorker] Fetch failed:', error);
            
            // For HTML pages, return the offline page
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // Otherwise just propagate the error
            throw error;
          });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Skip waiting message received');
    self.skipWaiting();
  }
});

// Log any errors that occurred during service worker execution
self.addEventListener('error', event => {
  console.error('[ServiceWorker] Error:', event.error);
});

console.log('[ServiceWorker] Service worker registered with version', CACHE_VERSION);