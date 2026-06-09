const CACHE_NAME = 'nine-tasks-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Un service worker básico para que el navegador nos reconozca como PWA instalable
  // y nos permita usar el modo 'standalone' sin mostrar la barra del navegador.
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
