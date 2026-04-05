// Alabaster Service Worker (PWA Optimization)
const CACHE_NAME = 'alabaster-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch for now - simple PWA compliance
  event.respondWith(fetch(event.request));
});
