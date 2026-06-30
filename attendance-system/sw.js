const CACHE = 'upcomers-toolkit-v1';
const CORE = [
  'upcomers-toolkit.html',
  'manifest.webmanifest',
  'vendor/d3.min.js',
  'vendor/bootstrap-icons.css',
  'vendor/fonts/bootstrap-icons.woff2',
  'vendor/fonts/bootstrap-icons.woff',
  'vendor/icon.svg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const url = new URL(req.url);
      const cacheable = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(url.host);
      if (cacheable && res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match('upcomers-toolkit.html')))
  );
});
