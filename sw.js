/**
 * Service Worker für Anagram-PWA: Offline-Cache der App und zentraler Assets.
 * Gilt nur bei Auslieferung über HTTPS (oder localhost).
 */
const CACHE_NAME = 'anagram-pwa-v1';
const URLS_TO_CACHE = [
  './anagram-game.html',
  './manifest.webmanifest',
  './Geschafft Feuerwerk.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ? Promise.resolve(cached) : fetch(event.request).then((response) => {
        const clone = response.clone();
        if (response.status === 200 && event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
    )
  );
});
