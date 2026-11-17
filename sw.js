const prefix = 'asg-interlining-' + self.registration.scope + '-';
const cacheName = prefix + 'v4';
const files = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const urls = new Set(files.map(file => new URL(file, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(prefix) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !urls.has(request.url)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) return response;
    } catch {
      // Fall back to the installed app.
    }
    const cache = await caches.open(cacheName);
    return await cache.match(request) || Response.error();
  })());
});



