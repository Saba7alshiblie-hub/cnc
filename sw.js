const STATIC_CACHE = 'ilmiyya-static-v9';
const DYNAMIC_CACHE = 'ilmiyya-dynamic-v9';
const OFFLINE_PAGE = './offline.html';
const NOT_FOUND_PAGE = './404.html';

const urlsToCache = [
  './',
  './index.html',
  './offline.html',
  './404.html',
  './logo.png',
  './my-new-icon-192.png',
  './my-new-icon-512.png',
  './manifest.json',
  './robots.txt',
  './sitemap.xml',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.0/firebase-database-compat.js'
];

// Install event: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Opened static cache');
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Some assets failed to cache:', err);
          // Still continue even if some fail
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// منظف للتخزين - حذف النسخ القديمة من التطبيق المخزنة في المتصفح
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event handler
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Strategy 1: Network-first for Firebase data
  // This ensures you always get the latest data when connected
  if (url.origin === 'https://ilmiyya-clinic-default-rtdb.asia-southeast1.firebasedatabase.app') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline - try cache, if not found return offline page
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If nothing in cache, show offline page
              return caches.match(OFFLINE_PAGE);
            });
        })
    );
    return;
  }

  // Strategy 2: Cache-first for static assets
  // This makes the app load instantly from cache
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(networkResponse => {
          // Check for successful response (200-299)
          if (!networkResponse || networkResponse.status < 200 || networkResponse.status >= 300) {
            // Return offline page for failed requests
            return caches.match(OFFLINE_PAGE)
              .then(offlineResponse => offlineResponse || networkResponse);
          }

          return caches.open(DYNAMIC_CACHE).then(cache => {
            // Store successful responses
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // Network failed - return cached or offline page
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Default to offline page
              return caches.match(OFFLINE_PAGE);
            });
        });
      })
      .catch(() => {
        // If match fails, try offline page
        return caches.match(OFFLINE_PAGE);
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  const title = 'العيادة العلمية';
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من العيادة',
    icon: 'my-new-icon-512.png',
    badge: 'my-new-icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'clinic-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق',
        icon: 'my-new-icon-192.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: 'my-new-icon-192.png'
      }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if app window already exists
      for (let client of clientList) {
        if (client.url === './index.html' && 'focus' in client) {
          return client.focus();
        }
      }
      // If app not open, open it
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-patient-data') {
    event.waitUntil(
      // Attempt to sync patient data when back online
      fetch('./index.html')
        .then(response => console.log('Sync successful', response))
        .catch(err => console.log('Sync failed:', err))
    );
  }
});

// Periodic background sync (if needed)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-check') {
    event.waitUntil(
      fetch('./manifest.json')
        .then(response => response.json())
        .then(manifest => {
          console.log('Update check completed', manifest);
        })
        .catch(err => console.log('Update check failed:', err))
    );
  }
});
