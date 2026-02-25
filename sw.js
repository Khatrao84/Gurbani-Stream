// sw.js
const CACHE_NAME = 'gurbani-app-v27'; 

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

  // --- THE LOGIN FIX ---
  // If the request is for YouTube, Google login, or RSS, 
  // we RETURN immediately and do NOT call e.respondWith().
  // This forces the browser to handle the request 100% normally
  // including sending your login ID and cookies.
  if (
    url.hostname.includes('youtube.com') || 
    url.hostname.includes('google.com') || 
    url.hostname.includes('gstatic.com') || 
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('rss2json.com')
  ) {
    return; // Browser takes over, Service Worker stays out of it.
  }

  // For your local app files, use the normal cache logic
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).then((networkResponse) => {
        // Only cache your own local files
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
