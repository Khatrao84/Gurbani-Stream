const CACHE_NAME = 'gurbani-app-v23'; 

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/haarimandr.png',
  '/audioharimandar.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key); 
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // BYPASS CACHE FOR LIVE APIs (Fixes "Robot" login error)
  if (url.hostname.includes('youtube.com') || 
      url.hostname.includes('googlevideo.com') || 
      url.hostname.includes('rss2json.com') ||
      url.hostname.includes('api.rss2json.com')) {
    return; // Bypass Service Worker, go to network directly
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(e.request).then((networkResponse) => {
        // Only cache local site files
        if (e.request.url.startsWith(self.location.origin)) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
