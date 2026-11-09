/**
 * Service Worker: VISIT-AE GriyaNet PWA
 * Strategi Network-First untuk App Shell agar pembaruan kode segera aktif
 */
const CACHE_NAME = "visit-ae-cache-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const reqUrl = event.request.url;

  // Jangan pernah cache atau intersep panggilan API Google Apps Script dan pihak luar
  if (
    event.request.method !== "GET" ||
    reqUrl.indexOf("script.google.com") !== -1 ||
    reqUrl.indexOf("script.googleusercontent.com") !== -1 ||
    reqUrl.indexOf(self.location.origin) !== 0
  ) {
    return;
  }

  // Network-First untuk shell HTML agar update GitHub Pages langsung terasa
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => cached || caches.match("./index.html"));
      })
  );
});
