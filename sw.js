// Service worker de Nuage : la page vient toujours du réseau quand il y en a,
// sinon de la dernière copie, pour que l'appli s'ouvre même hors connexion.
var CACHE = "nuage-v1";
var ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png", "/icon-180.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).pathname.indexOf("/api/") === 0) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && new URL(req.url).origin === location.origin) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match("/"); });
    })
  );
});
