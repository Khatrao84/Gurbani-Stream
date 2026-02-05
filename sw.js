// UPDATED TO VERSION 20 (Forces update)
const CACHE_NAME = 'gurbani-app-v20'; 

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  // Add other images like 'haarimandr.png' here if needed
];

// 1. Install Service Worker & Cache Files
self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

// 2. Activate & Delete Old Caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key); 
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

// 3. Serve from Cache, then Network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
