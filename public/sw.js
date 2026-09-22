/* All application code is local and explicitly precached so a first successful
   online load is enough to launch the installed app without a connection. */
const CACHE = 'form-training-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/database.js',
  '/src/style.css',
  '/manifest.webmanifest',
  '/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // A navigation must always return the cached app shell after installation.
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.match('/index.html').then(cached => cached || fetch(event.request)));
    return;
  }

  // Cache-first keeps all same-origin application assets available in airplane mode.
  event.respondWith(caches.match(event.request).then(cached => {
    if (cached) return cached;
    return fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      }
      return response;
    });
  }));
});
