// Offline cache. Network-first, so new content shows up whenever you are online
// and the last good copy is used when you are not. Bump CACHE to force a clean slate.
const CACHE = "clm-daily-v1";
const SHELL = [
  "./", "index.html", "css/styles.css", "js/app.js",
  "js/data/words.js", "js/data/stretches.js", "js/data/news.js",
  "js/data/topics.js", "js/data/quotes.js",
  "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return; // fonts go straight to network
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match("index.html")))
  );
});
