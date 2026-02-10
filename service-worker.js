/**
 * Service Worker
 * Handles offline caching and PWA functionality
 */

const CACHE_NAME = 'project-cost-tracker-v1.0.0';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Assets to cache immediately
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/db.js',
    './js/sync.js',
    './js/ui.js',
    './js/charts.js',
    './js/app.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

/**
 * Install Event
 * Caches essential assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                return self.skipWaiting(); // Force activation
            })
            .catch((error) => {
                console.error('[Service Worker] Precaching failed:', error);
            })
    );
});

/**
 * Activate Event
 * Cleans up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated successfully');
                return self.clients.claim(); // Take control immediately
            })
    );
});

/**
 * Fetch Event
 * Implements Cache-First strategy with Network Fallback
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Chrome extensions and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Different strategies for different requests
    if (url.origin === location.origin) {
        // Same-origin requests: Cache First, Network Fallback
        event.respondWith(cacheFirst(request));
    } else {
        // Third-party requests: Network First, Cache Fallback
        event.respondWith(networkFirst(request));
    }
});

/**
 * Cache First Strategy
 * Tries cache first, falls back to network
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        console.log('[Service Worker] Serving from cache:', request.url);
        return cached;
    }
    
    try {
        console.log('[Service Worker] Fetching from network:', request.url);
        const response = await fetch(request);
        
        // Cache successful responses
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', request.url, error);
        
        // Return offline page if available
        return caches.match('./index.html');
    }
}

/**
 * Network First Strategy
 * Tries network first, falls back to cache
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        
        // Cache successful responses
        if (response.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('[Service Worker] Network failed, using cache:', request.url);
        
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        
        throw error;
    }
}

/**
 * Background Sync Event (Future Enhancement)
 * Can be used for syncing data when connection is restored
 */
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Trigger sync logic here
            syncDataInBackground()
        );
    }
});

async function syncDataInBackground() {
    try {
        console.log('[Service Worker] Syncing data in background...');
        
        // Send message to all clients to trigger sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                message: 'Triggering background sync'
            });
        });
        
        return Promise.resolve();
    } catch (error) {
        console.error('[Service Worker] Background sync failed:', error);
        return Promise.reject(error);
    }
}

/**
 * Push Notification Event (Future Enhancement)
 */
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-192x192.png',
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification('Project Cost Tracker', options)
    );
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

/**
 * Message Event
 * Handle messages from the main app
 */
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_URLS') {
        caches.open(CACHE_NAME).then(cache => {
            cache.addAll(event.data.urls);
        });
    }
});

console.log('[Service Worker] Loaded');
