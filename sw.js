const CACHE_NAME = 'gurbani-v30.3'; 
const ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.png', '/haarimandr.png', '/audioharimandar.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => {
    return Promise.all(keys.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); }));
  }).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // DO NOT INTERFERE with these - let the Linux browser handle them 
  // with your logged-in Google ID
  if (url.hostname.includes('youtube.com') || 
      url.hostname.includes('google.com') || 
      url.hostname.includes('googlevideo.com') ||
      url.hostname.includes('rss2json.com')) {
    return; 
  }

  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
