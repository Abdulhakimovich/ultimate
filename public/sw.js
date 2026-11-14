// Ultimate Habit Tracker - Service Worker
const CACHE_NAME = 'ultimate-static-v2';

// ONLY precache static assets. NEVER precache authenticated routes or dynamic pages.
const STATIC_PRECACHE = [
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Never intercept or cache requests to external domains (e.g. Supabase, OAuth providers)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Never cache auth routes, API endpoints, or user dashboard pages
  const isProtectedOrAuth =
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/tracker') ||
    url.pathname.startsWith('/planner') ||
    url.pathname.startsWith('/analytics');

  if (isProtectedOrAuth) {
    return;
  }

  // 3. For HTML navigation requests: strictly network-only, do not cache
  if (event.request.mode === 'navigate') {
    return;
  }

  // 4. For static assets (_next/static, images, fonts, icons): Cache-first with network fallback
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|woff|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});
