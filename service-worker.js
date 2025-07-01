const cacheName = "finance-app-v1";
const assets = [
  "/",
  "/index.html",
  "/admin.html",
  "/dashboard.html",
  "/script.js",
  "/admin.js",
  "/dashboard.js",
  "/firebase-config.js",
  "/manifest.json",
  "/service-worker.js",
  "/style.css",
  "/logo.svg",
  "/icon-192.png",
  "/icon-512.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});