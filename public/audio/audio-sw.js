const STATIC_CACHE = 'islamic-audio-static-v1';
const AUDIO_CACHE = 'islamic-official-quran-audio-v1';
const STATIC_ASSETS = ['./', './index.html', './audio.css?v=1', './audio.js?v=1', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key !== STATIC_CACHE && key !== AUDIO_CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    if (url.hostname === 'download.quranicaudio.com') {
      event.respondWith(caches.open(AUDIO_CACHE).then(async cache => {
        const saved = await cache.match(event.request, { ignoreVary: true });
        if (saved) return saved;
        return fetch(event.request);
      }));
    }
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(STATIC_CACHE).then(cache => cache.put('./index.html', copy));
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
