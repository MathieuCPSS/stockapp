const CACHE_NAME = "stockapp"; // nom fixe
const FILES_TO_CACHE = [
  "/", 
  "/stock.html",
  "/manifest.json",
  "/favicon.ico"
  // ajoute ici les autres fichiers nécessaires
];

// Installation : met en cache les fichiers en les téléchargeant à chaque fois
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        FILES_TO_CACHE.map(url =>
          fetch(url).then(response => {
            if (response.ok) {
              return cache.put(url, response);
            }
          })
        )
      )
    )
  );
  self.skipWaiting(); // active immédiatement la nouvelle version
});

// Activation : prend le contrôle des pages ouvertes
self.addEventListener("activate", event => {
  event.waitUntil(clients.claim());
});

// Fetch : essaie le réseau d’abord, sinon le cache
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});