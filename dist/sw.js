// Alabasta Service Worker (PWA Optimization)
const CACHE_NAME = 'Alabasta-cache-v2';
const ASSET_CACHE = 'Alabasta-assets-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
    OFFLINE_URL,
    '/manifest.json',
    '/favicon.ico',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== ASSET_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Navigation requests (HTML) - Network first, fallback to offline
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    // 2. JS, CSS, and Images - Stale-While-Revalidate
    const isAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2|json)$/) || 
                    url.host.includes('ik.imagekit.io'); // Include our CDN images

    if (isAsset) {
        event.respondWith(
            caches.open(ASSET_CACHE).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    const fetchedResponse = fetch(request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    });

                    return cachedResponse || fetchedResponse;
                });
            })
        );
        return;
    }

    // 3. API calls and other requests - Network only (no cache)
    // Convex and auth requests should not be cached here
});
