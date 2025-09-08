// Service Worker for Cubist Inspired Portraits
const CACHE_NAME = 'cubist-portraits-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Assets to cache for offline functionality
const urlsToCache = [
  '/',
  '/main.tsx',
  '/App.tsx',
  '/styles/globals.css',
  '/offline.html',
  '/manifest.json',
  // Add your component files
  '/components/Sidebar.tsx',
  '/components/Canvas.tsx',
  '/components/MobileHeader.tsx',
  '/components/DrawingTools.tsx',
  '/components/LayersPanel.tsx',
  '/components/CanvasElement.tsx',
  // UI components (most commonly used)
  '/components/ui/button.tsx',
  '/components/ui/input.tsx',
  '/components/ui/select.tsx',
  '/components/ui/slider.tsx',
  '/components/ui/scroll-area.tsx',
  '/components/ui/tooltip.tsx',
  '/components/ui/popover.tsx',
  '/components/ui/tabs.tsx'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, { credentials: 'same-origin' })));
      })
      .catch((error) => {
        console.log('Cache install error:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Clone the request for fetching
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          // Open cache and store the response
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache successful responses for app files
              if (event.request.url.includes('main.tsx') || 
                  event.request.url.includes('.tsx') || 
                  event.request.url.includes('.css') ||
                  event.request.url === self.location.origin + '/') {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(() => {
          // If both cache and network fail, show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// Handle background sync for saving artworks
self.addEventListener('sync', (event) => {
  if (event.tag === 'save-artwork') {
    event.waitUntil(
      // Handle background saving when back online
      saveArtworkWhenOnline()
    );
  }
});

async function saveArtworkWhenOnline() {
  // This would handle any queued artwork saves when the user comes back online
  console.log('Background sync: Ready to save artwork when online');
}

// Handle push notifications (if needed later)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/android-icon-192x192.png',
      badge: '/icons/android-icon-96x96.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1'
      },
      actions: [
        {
          action: 'explore',
          title: 'Open App',
          icon: '/icons/android-icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/android-icon-96x96.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('Cubist Portraits', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle app shortcuts
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker loaded for Cubist Inspired Portraits');