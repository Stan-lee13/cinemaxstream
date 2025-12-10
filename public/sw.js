
const CACHE_NAME = 'cinemaxstream-v3';
const STATIC_CACHE = 'cinemaxstream-static-v3';
const DYNAMIC_CACHE = 'cinemaxstream-dynamic-v3';
const IMAGE_CACHE = 'cinemaxstream-images-v3';
const API_CACHE = 'cinemaxstream-api-v3';
const MEDIA_CACHE = 'cinemaxstream-media-v3';

const STATIC_CACHE_URLS = [
  '/',
  '/home',
  '/movies',
  '/series',
  '/anime',
  '/manifest.json',
  '/offline.html',
  '/lovable-uploads/15970653-43b4-4ace-962f-9f28c645ad97.png'
];

// Cache configuration
const MAX_CACHE_SIZE = {
  static: 50,
  dynamic: 100,
  media: 500,  // Increased for media files
  images: 200,
  api: 100
};

const MAX_AGE = {
  static: 30 * 24 * 60 * 60 * 1000,  // 30 days
  dynamic: 7 * 24 * 60 * 60 * 1000,  // 7 days
  media: 14 * 24 * 60 * 60 * 1000,   // 14 days
  images: 14 * 24 * 60 * 60 * 1000,  // 14 days
  api: 1 * 24 * 60 * 60 * 1000       // 1 day
};

// Helper function to clean old cache entries
const cleanCache = async (cacheName, maxSize = MAX_CACHE_SIZE) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    const oldestKeys = keys.slice(0, keys.length - maxSize);
    await Promise.all(oldestKeys.map(key => cache.delete(key)));
  }
};

// Check if cache entry is expired
const isCacheExpired = (response) => {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  const cacheDate = new Date(dateHeader).getTime();
  return Date.now() - cacheDate > MAX_AGE;
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      // Pre-cache critical resources
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE];
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Clean up oversized caches
      cleanCache(DYNAMIC_CACHE),
      cleanCache(IMAGE_CACHE),
      cleanCache(API_CACHE)
    ]).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Static assets - Cache First
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response && !isCacheExpired(response)) {
            return response;
          }
          return fetch(request).then(fetchResponse => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Images - Cache First with size management
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response && !isCacheExpired(response)) {
            return response;
          }
          return fetch(request).then(fetchResponse => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
              cleanCache(IMAGE_CACHE);
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // API requests - Network First with fallback
  if (url.pathname.includes('/api/') || url.hostname.includes('api.')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
              cleanCache(API_CACHE);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.open(API_CACHE).then(cache => {
            return cache.match(request);
          });
        })
    );
    return;
  }

  // Navigation requests - Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            return cache.match(request) || cache.match('/');
          });
        })
    );
    return;
  }

  // Default strategy - Cache First
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response && !isCacheExpired(response)) {
          return response;
        }
        return fetch(request).then(fetchResponse => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        // Offline fallback for navigation
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});
