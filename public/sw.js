/**
 * MuseFlow V10.0 - Service Worker
 * Purpose: PWA support - offline caching, background sync, push notifications
 */

const CACHE_NAME = 'museflow-v10.4';
const RUNTIME_CACHE = 'museflow-runtime-v10.4';
const IMAGE_CACHE = 'museflow-images-v10.4';
const API_CACHE = 'museflow-api-v10.4';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/dashboard',
    '/budget',
    '/canvas-v3',
    '/landing.html',
    '/static/js/api-client-d1.js',
    '/static/js/notification-system.js',
    '/static/js/error-logger.js',
    '/static/js/notification-automation.js',
    '/static/js/onboarding-tour.js',
    '/static/js/advanced-features.js',
    '/static/components/unified-navbar.html',
    '/static/images/logo-neon-m.png',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - pre-cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Pre-caching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Keep current version caches
                            return cacheName !== CACHE_NAME && 
                                   cacheName !== RUNTIME_CACHE &&
                                   cacheName !== IMAGE_CACHE &&
                                   cacheName !== API_CACHE;
                        })
                        .map(cacheName => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                // Limit cache sizes
                limitCacheSize(IMAGE_CACHE, 50); // Max 50 images
                limitCacheSize(RUNTIME_CACHE, 100); // Max 100 assets
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip API calls (always fetch fresh)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache successful API responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached API response if offline
                    return caches.match(request);
                })
        );
        return;
    }

    // Network-first strategy for HTML pages
    if (request.mode === 'navigate' || request.headers.get('Accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache successful responses
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Fallback to offline page
                            return caches.match('/dashboard');
                        });
                })
        );
        return;
    }

    // Image-specific caching strategy
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(request).then(response => {
                        // Cache images with longer expiry
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(IMAGE_CACHE).then(cache => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    }).catch(() => {
                        // Fallback placeholder image
                        return new Response('<svg>...</svg>', {
                            headers: { 'Content-Type': 'image/svg+xml' }
                        });
                    });
                })
        );
        return;
    }

    // Cache-first strategy for static assets (JS, CSS)
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version immediately
                    // But also fetch update in background (stale-while-revalidate)
                    fetch(request).then(response => {
                        if (response.ok) {
                            caches.open(RUNTIME_CACHE).then(cache => {
                                cache.put(request, response);
                            });
                        }
                    }).catch(() => {});
                    
                    return cachedResponse;
                }

                return fetch(request).then(response => {
                    // Cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
    );
});

// Background sync event
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-projects') {
        event.waitUntil(syncProjects());
    }
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received:', event);
    
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'MuseFlow 알림';
    const options = {
        body: data.body || '새로운 업데이트가 있습니다',
        icon: '/static/icons/icon-192x192.png',
        badge: '/static/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: data,
        actions: [
            {
                action: 'open',
                title: '열기'
            },
            {
                action: 'close',
                title: '닫기'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event);
    
    event.notification.close();

    if (event.action === 'open') {
        const url = event.notification.data?.url || '/dashboard';
        event.waitUntil(
            clients.openWindow(url)
        );
    }
});

// Helper: Sync projects
async function syncProjects() {
    try {
        const response = await fetch('/api/projects?userId=2');
        if (response.ok) {
            console.log('[Service Worker] Projects synced');
        }
    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
    }
}

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        if (keys.length > maxItems) {
            // Delete oldest items (FIFO)
            const itemsToDelete = keys.length - maxItems;
            for (let i = 0; i < itemsToDelete; i++) {
                await cache.delete(keys[i]);
            }
            console.log(`[Service Worker] Trimmed ${cacheName}: removed ${itemsToDelete} items`);
        }
    } catch (error) {
        console.error('[Service Worker] Cache size limit failed:', error);
    }
}

// Message event (communication from main thread)
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('[Service Worker] Loaded - Version:', CACHE_NAME);
