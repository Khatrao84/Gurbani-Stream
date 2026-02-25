const CACHE_NAME = 'gurbani-v24';
const ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.png', '/haarimandr.png', '/audioharimandar.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // BYPASS CACHE for all live stream APIs
  if (url.hostname.includes('youtube.com') || url.hostname.includes('googlevideo.com') || url.hostname.includes('rss2json.com')) {
    return; 
  }
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
