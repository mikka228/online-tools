/* Online Tools service worker — same-origin pages + runtime CDN cache */
const SHELL_CACHE = 'ot-shell-v3';
const CDN_CACHE = 'ot-cdn-v1';
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
  './uuid.html'
];

const CDN_PRECACHE = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js'
];

function isCdn(url) {
  return (
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'unpkg.com'
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(SHELL);

    const cdn = await caches.open(CDN_CACHE);
    await Promise.all(
      CDN_PRECACHE.map(async (url) => {
        try {
          const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
          if (res && res.ok) await cdn.put(url, res.clone());
        } catch (e) {
          /* skip failed CDN during install */
        }
      })
    );

    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== SHELL_CACHE && k !== CDN_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // CDN: cache-first after first successful load
  if (isCdn(url)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req, { mode: 'cors', credentials: 'omit' });
        if (res && res.ok) {
          const cdn = await caches.open(CDN_CACHE);
          cdn.put(req, res.clone());
        }
        return res;
      } catch (e) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    try {
      const res = await fetch(req);
      if (res && res.ok) {
        const shell = await caches.open(SHELL_CACHE);
        shell.put(req, res.clone());
      }
      return res;
    } catch (e) {
      if (cached) return cached;
      // Navigation fallback
      if (req.mode === 'navigate') {
        const offline = await caches.match('./offline.html');
        if (offline) return offline;
      }
      return Response.error();
    }
  })());
});
