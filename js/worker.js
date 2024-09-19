const cacheName = "durak-helper-pwa-v1";
const contentToCache = [
  "/",
  "/index.html",
  "/style/fonts.css",
  "/style/reset.css",
  "/style/styles.css",
  "/js/script.js",
  "/assets/font/roboto_mono_600_latin.woff2",
  "/assets/font/roboto_mono_600_cyrillic.woff2",
  "/assets/club_suit.svg",
  "/assets/diamond_suit.svg",
  "/assets/favicon_180x180.png",
  "/assets/favicon.ico",
  "/assets/favicon.svg",
  "/assets/heart_suit.svg",
  "/assets/spade_suit.svg",
];

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching app data");
      await cache.addAll(contentToCache);
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const resource = await caches.match(event.request);
      console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
      if (resource) {
        return resource;
      }
      const response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      console.log(
        `[Service Worker] Caching new resource: ${event.request.url}`
      );
      cache.put(event.request, response.clone());
      return response;
    })()
  );
});
