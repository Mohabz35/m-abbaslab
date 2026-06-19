/// <reference lib="webworker" />

const CACHE_NAME = 'm-abbaslab-v1';
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  (event as ExtendableEvent).waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  (event as ExtendableEvent).waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  (self as unknown as { clients: Client[] }).clients.claim();
});

self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  const { request } = fetchEvent;

  if (request.method !== 'GET') return;

  if (request.url.includes('/api/')) {
    fetchEvent.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request) as Promise<Response | undefined>)
    );
    return;
  }

  if (request.url.includes('supabase.co/storage') || request.url.includes('res.cloudinary.com')) {
    fetchEvent.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      }) as Promise<Response>
    );
    return;
  }

  fetchEvent.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request) as Promise<Response | undefined>)
  );
});
