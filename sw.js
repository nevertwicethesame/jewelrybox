// Never Twice the Same: offline cache for the app page.
// Only the app page (index.html) is cached. Icons, images and every other file go straight to the network
// and are never replaced by the page, so a missing icon can no longer come back as HTML.
// The cache name changed in 2.0.12, so the old cache (with older copies of files) is cleared on the next load.
const CACHE = 'ntts-shell-2';
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
  var req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== self.location.origin) return;
  // The update check always goes to the network so new versions are seen.
  if (u.pathname.endsWith('/version.json')) return;
  // Only the app page is handled here. Anything else (icons, images, other files) is not touched.
  var isPage = req.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  if (!isPage) return;
  // Network first, so online users always get the latest page; fall back to the cached page when offline.
  e.respondWith(
    // cache: 'no-cache' asks the server to confirm the copy, so the phone never reuses an old HTTP-cached page.
    fetch(new Request(req, { cache: 'no-cache' })).then(function (r) {
      if (r && r.ok) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return r;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match('index.html'); });
    })
  );
});
