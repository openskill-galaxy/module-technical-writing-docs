const CACHE_NAME = "openskill-galaxy-module-v5";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  const offlineResponse = () =>
    new Response("Offline", { status: 503, statusText: "Service Unavailable" });

  // Network-first for content data (/data/*.json) so updates surface immediately
  if (url.pathname.includes("/data/") && url.pathname.endsWith(".json")) {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        fetch(e.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() =>
            cache.match(e.request).then((cached) => cached || offlineResponse())
          )
      )
    );
    return;
  }

  // Stale-While-Revalidate strategy for static resources
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        return (
          cachedResponse ||
          fetchPromise.then((networkResponse) => networkResponse || offlineResponse())
        );
      });
    })
  );
});
