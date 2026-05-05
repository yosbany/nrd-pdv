// Service Worker for NRD PDV
const CACHE_NAME = 'nrd-pdv-v1-' + Date.now();
const getBasePath = () => {
  const path = self.location.pathname;
  return path.substring(0, path.lastIndexOf('/') + 1);
};
const BASE_PATH = getBasePath();

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('nrd-pdv-')) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;
  if (event.request.url.includes('service-worker.js')) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (event.request.url.includes('version.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  if (event.request.url.includes('firebasejs') || event.request.url.includes('gstatic.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (event.request.url.includes('cdn.jsdelivr.net') || event.request.url.includes('cdn.tailwindcss.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (event.request.url.includes('.html') || event.request.url.includes('.js') || event.request.url.includes('.css')) {
    if (event.request.url.includes('?v=') || event.request.url.includes('&v=')) {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match(event.request.url.split('?')[0]).then((c) => c || (event.request.mode === 'navigate' ? caches.match(BASE_PATH + 'index.html') : null));
        })
      );
      return;
    }
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).then((response) => response).catch(() => {
        return caches.match(event.request).then((c) => c || (event.request.mode === 'navigate' ? caches.match(BASE_PATH + 'index.html') : null));
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      });
    })
  );
});
