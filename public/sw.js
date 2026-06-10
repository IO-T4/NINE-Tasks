self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    self.registration.unregister()
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach(client => {
          if (client.url && "navigate" in client) {
            client.navigate(client.url);
          }
        });
      })
  );
});

// DO NOT INTERCEPT FETCH!
// Without a fetch listener, the SW doesn't do anything to network requests.
// Wait, to be completely transparent, we just don't add a fetch listener!
