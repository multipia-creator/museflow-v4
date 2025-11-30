/**
 * MuseFlow V4.0 - Service Worker
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'museflow-v4.0.0';
const OFFLINE_URL = '/dashboard';

// Assets to cache on install
const STATIC_CACHE_URLS = [
  '/dashboard',
  '/projects',
  '/canvas',
  '/budget',
  '/static/js/notification-system.js',
  '/static/js/collaboration-system.js',
  '/static/js/tracker.js',
  '/static/images/logo-neon-m.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS).catch((error) => {
        console.warn('[SW] Failed to cache some assets:', error);
      });
    })
  );
  
  // Take control immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip API requests (let them fail naturally to show error messages)
  if (request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response before caching
        const responseToCache = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache and offline, return offline page
          if (request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
          
          // For other resources, return a basic error response
          return new Response('Offline - resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MuseFlow 알림';
  const options = {
    body: data.body || '새로운 알림이 있습니다.',
    icon: '/static/images/logo-neon-m.png',
    badge: '/static/images/logo-neon-m.png',
    vibrate: [200, 100, 200],
    data: data.url || '/dashboard',
    actions: [
      { action: 'open', title: '열기' },
      { action: 'close', title: '닫기' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

console.log('[SW] Service Worker loaded successfully');
