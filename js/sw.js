const cacheName = 'playlist-app-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json'
];

self.addEventListener('install', e => e.waitUntil(caches.open(cacheName).then(c => c.addAll(filesToCache))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));