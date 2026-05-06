const CACHE_NAME = 'cinemaxstream-v4';
const STATIC_CACHE = 'cinemaxstream-static-v4';
const DYNAMIC_CACHE = 'cinemaxstream-dynamic-v4';
const IMAGE_CACHE = 'cinemaxstream-images-v4';
const API_CACHE = 'cinemaxstream-api-v4';

const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/app-icon.png',
];

const MAX_CACHE_SIZE = { static: 50, dynamic: 100, images: 300, api: 100 };
const MAX_AGE = {
  static: 30 * 24 * 60 * 60 * 1000,
  dynamic: 7 * 24 * 60 * 60 * 1000,
  images: 14 * 24 * 60 * 60 * 1000,
  api: 1 * 24 * 60 * 60 * 1000,
};

// Image hosts allowed for cross-origin caching
const IMAGE_HOSTS = ['wsrv.nl', 'image.tmdb.org', 'images.unsplash.com'];

const cleanCache = async (cacheName, maxSize = 100) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    const oldestKeys = keys.slice(0, keys.length - maxSize);
    await Promise.all(oldestKeys.map((key) => cache.delete(key)));
  }
};

const isCacheExpired = (response, kind = 'dynamic') => {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  const cacheDate = new Date(dateHeader).getTime();
  const ttl = MAX_AGE[kind] ?? MAX_AGE.dynamic;
  return Date.now() - cacheDate > ttl;
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_CACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) return caches.delete(cacheName);
          })
        )
      ),
      cleanCache(DYNAMIC_CACHE, MAX_CACHE_SIZE.dynamic),
      cleanCache(IMAGE_CACHE, MAX_CACHE_SIZE.images),
      cleanCache(API_CACHE, MAX_CACHE_SIZE.api),
    ]).then(() => self.clients.claim())
  );
});

// ── Push notifications ────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = { title: 'CineMaxStream', body: 'You have a new update.', route: '/' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/app-icon.png',
      badge: '/app-icon.png',
      data: { route: payload.route || '/' },
      tag: payload.tag || `push-${Date.now()}`,
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  // Best-effort: notify clients to re-subscribe
  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true }).then((list) => {
      list.forEach((c) => c.postMessage({ type: 'PUSH_RESUBSCRIBE' }));
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const route = (event.notification.data && event.notification.data.route) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(route);
          return;
        }
      }
      return self.clients.openWindow(route);
    })
  );
});

// ── Fetch handler ─────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const { request } = event;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Cross-origin: only intercept whitelisted image hosts
  if (!sameOrigin) {
    if (request.destination === 'image' && IMAGE_HOSTS.some((h) => url.hostname.endsWith(h))) {
      event.respondWith(
        caches.open(IMAGE_CACHE).then((cache) =>
          cache.match(request).then((response) => {
            if (response && !isCacheExpired(response, 'images')) return response;
            return fetch(request)
              .then((fetchResponse) => {
                if (fetchResponse.ok) {
                  cache.put(request, fetchResponse.clone());
                  cleanCache(IMAGE_CACHE, MAX_CACHE_SIZE.images);
                }
                return fetchResponse;
              })
              .catch(() => response);
          })
        )
      );
    }
    return;
  }

  // Static JS/CSS — Cache First
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((response) => {
          if (response && !isCacheExpired(response, 'static')) return response;
          return fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        })
      )
    );
    return;
  }

  // Same-origin images
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((response) => {
          if (response && !isCacheExpired(response, 'images')) return response;
          return fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
              cleanCache(IMAGE_CACHE, MAX_CACHE_SIZE.images);
            }
            return fetchResponse;
          });
        })
      )
    );
    return;
  }

  // Navigation — Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.open(DYNAMIC_CACHE).then((cache) =>
            cache.match(request).then((r) => r || cache.match('/') || caches.match('/offline.html'))
          )
        )
    );
    return;
  }

  // Default — Cache First
  event.respondWith(
    caches.match(request).then((response) => {
      if (response && !isCacheExpired(response, 'dynamic')) return response;
      return fetch(request)
        .then((fetchResponse) => {
          if (fetchResponse.ok) {
            const clone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return fetchResponse;
        })
        .catch(() => response);
    })
  );
});
