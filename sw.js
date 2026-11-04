// Never Twice the Same: offline cache for the app shell.
// Fixed name: this file never needs changing for a new version. Updates reach the app because
// index.html is fetched from the network first whenever the phone is online.
const CACHE = 'ntts-shell';
const SHELL = ['./', 'index.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  // The update check always goes to the network so new versions are seen.
  if (u.pathname.endsWith('/version.json')) return;
  // Network first, so online users always get the latest copy; fall back to the cache when offline.
  e.respondWith(
    // cache: 'no-cache' asks the server to confirm the copy, so the phone never reuses an old HTTP-cached index.html.
    fetch(new Request(e.request, { cache: 'no-cache' })).then(function (r) {
      if (r && r.ok) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (m) { return m || caches.match('index.html'); });
    })
  );
});
