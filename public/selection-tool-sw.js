// Selection Tool service worker — app-shell offline resilience only.
// Diagnostic data itself lives in IndexedDB (see src/selectionTool/db.js);
// this worker's one job is making sure the app shell (HTML/JS/CSS) still
// boots with no network at all. It never touches /api/* — those calls fail
// naturally offline and the app already falls back to Dexie for that.
const CACHE = 'selection-tool-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // never cache API responses — Dexie is the offline store for data

  // Navigations (loading /selection-tool/* directly, or a reload while
  // offline): try the network, fall back to whatever shell we last cached.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/selection-tool')))
    );
    return;
  }

  // Everything else same-origin (JS/CSS bundles, icons): cache-first,
  // refresh in the background so the next load picks up a new deploy.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
