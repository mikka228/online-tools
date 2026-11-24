/* Online Tools service worker — self-hosted assets, full offline */
const SHELL_CACHE = 'ot-shell-v5';
const CACHE_PREFIX = 'ot-';

const SHELL = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './recent.js',
  './about.html',
  './privacy.html',
  './contact.html',
  './merge-pdf.html',
  './compress-pdf.html',
  './split-pdf.html',
  './organize-pdf.html',
  './rotate-pdf.html',
  './jpg-to-pdf.html',
  './pdf-to-jpg.html',
  './compress.html',
  './batch-compress.html',
  './resize.html',
  './convert.html',
  './qr.html',
  './json.html',
  './base64.html',
  './timestamp.html',
  './text-case.html',
  './password.html',
  './signature.html',
  './lorem.html',
  './url-encode.html',
  './uuid.html',
  './vendor/qrcode.min.js',
  './vendor/qrcodejs.min.js',
  './vendor/pdf-lib.min.js',
  './vendor/jszip.min.js',
  './vendor/pdf.min.js',
  './vendor/pdf.worker.min.js',
  './vendor/jspdf.umd.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    try {
      const res = await fetch(req);
      if (res && res.ok) {
        const cache = await caches.open(SHELL_CACHE);
        cache.put(req, res.clone());
      }
      return res;
    } catch (e) {
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const offline = await caches.match('./offline.html');
        if (offline) return offline;
      }
      return Response.error();
    }
  })());
});
