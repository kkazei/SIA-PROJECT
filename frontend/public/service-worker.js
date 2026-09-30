const CACHE_VERSION = 'v2';
const STATIC_CACHE = `rentflow-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rentflow-runtime-${CACHE_VERSION}`;
const NAVIGATION_CACHE = `rentflow-navigation-${CACHE_VERSION}`;
const IMAGE_CACHE = `rentflow-images-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/brand-mark.svg',
];

const CACHE_PREFIX = 'rentflow-';

const isSameOrigin = (url) => url.origin === self.location.origin;

const isApiRequest = (url) => {
  const pathname = url.pathname.toLowerCase();
  return pathname.startsWith('/api/') || pathname.startsWith('/auth/') || pathname.includes('/login') || pathname.includes('/signup') || pathname.includes('/logout') || pathname.includes('/refresh') || pathname.includes('/token') || pathname.includes('/check-auth') || pathname.includes('/verify-email') || pathname.includes('/forgot-password') || pathname.includes('/reset-password') || pathname.includes('/google');
};

const isNavigationRequest = (request, url) => {
  const acceptHeader = request.headers.get('accept') || '';
  return request.mode === 'navigate' || (acceptHeader.includes('text/html') && !isApiRequest(url));
};

const isStaticAssetRequest = (request, url) => {
  const destination = request.destination || '';
  const pathname = url.pathname;

  return ['script', 'style', 'font', 'worker', 'manifest'].includes(destination) || /\.(?:js|mjs|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot)$/i.test(pathname);
};

const isImageRequest = (request, url) => {
  const destination = request.destination || '';
  const pathname = url.pathname;

  return destination === 'image' || /\.(?:png|jpe?g|gif|webp|svg|ico)$/i.test(pathname);
};

const shouldBypassCache = (request, url) => {
  if (request.method !== 'GET') return true;
  if (!isSameOrigin(url)) return true;
  if (request.cache === 'only-if-cached') return true;
  if (request.mode === 'navigate' && url.pathname === '/') return false;

  return isApiRequest(url) || request.headers.has('authorization') || request.credentials === 'include';
};

const cacheResponse = async (cacheName, request, response) => {
  if (!response || response.status === 0 || response.type === 'opaque') return;
  if (response.status >= 400) return;

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
};

const handleStaticAsset = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.ok) {
    const cacheName = isImageRequest(request, new URL(request.url)) ? IMAGE_CACHE : RUNTIME_CACHE;
    await cacheResponse(cacheName, request, networkResponse);
  }

  return networkResponse;
};

const handleNavigationRequest = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      await cacheResponse(NAVIGATION_CACHE, new URL(request.url).pathname === '/' ? '/' : '/index.html', networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedFallback = await caches.match('/index.html');
    if (cachedFallback) {
      return cachedFallback;
    }

    return Response.error();
  }
};

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing new version', CACHE_VERSION);

  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      await staticCache.addAll(APP_SHELL);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating new version', CACHE_VERSION);

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const activeCacheNames = new Set([STATIC_CACHE, RUNTIME_CACHE, NAVIGATION_CACHE, IMAGE_CACHE]);

      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && !activeCacheNames.has(name))
          .map(async (name) => {
            console.log('[ServiceWorker] Deleting old cache', name);
            await caches.delete(name);
          })
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (shouldBypassCache(event.request, url)) {
    return;
  }

  if (isNavigationRequest(event.request, url)) {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }

  if (isStaticAssetRequest(event.request, url)) {
    event.respondWith(handleStaticAsset(event.request));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => Response.error()));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Skip waiting message received');
    self.skipWaiting();
  }
});

self.addEventListener('error', (event) => {
  console.error('[ServiceWorker] Error:', event.error);
});

console.log('[ServiceWorker] Service worker registered with version', CACHE_VERSION);