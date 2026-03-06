const STATIC_CACHE = 'ilmiyya-static-v7';
const DYNAMIC_CACHE = 'ilmiyya-dynamic-v7';

const urlsToCache = [
  './',
  './index.html',
  './logo.png',
  './my-new-icon-192.png',
  './my-new-icon-512.png',
  './manifest.json',
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
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// هذا الجزء مهم جداً: يقوم بحذف النسخ القديمة من التطبيق المخزنة في المتصفح
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
    })
  );
});

// Fetch event: serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  // لا تعترض الطلبات التي ليست من نوع GET
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // الاستراتيجية 1: الشبكة أولاً، ثم الكاش لبيانات Firebase
  // هذا يضمن أنك تحصل دائمًا على أحدث البيانات من قاعدة البيانات عند الاتصال بالإنترنت.
  if (url.origin === 'https://ilmiyya-clinic-default-rtdb.asia-southeast1.firebasedatabase.app') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // إذا نجح الجلب، قم بنسخ الاستجابة وتخزينها في الكاش.
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // إذا فشل طلب الشبكة (على سبيل المثال، في حالة عدم الاتصال بالإنترنت)، حاول تقديمه من الكاش.
          return caches.match(event.request);
        })
    );
    return;
  }

  // الاستراتيجية 2: الكاش أولاً، ثم الشبكة لجميع الأصول الأخرى (واجهة التطبيق، الخطوط، إلخ).
  // هذا يجعل التطبيق يتم تحميله على الفور من الكاش.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كان المورد في الكاش، قم بإرجاعه.
        // وإلا، قم بجلبه من الشبكة، وخزنه في الكاش، ثم قم بإرجاعه.
        return response || fetch(event.request).then(networkResponse => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            // تخزين الاستجابة الجديدة في الكاش للاستخدام في المستقبل دون اتصال بالإنترنت.
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
  );
});

// Push event: handle incoming push notifications
self.addEventListener('push', event => {
  const title = 'العيادة العلمية';
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من العيادة',
    icon: 'my-new-icon-512.png',
    vibrate: [200, 100, 200],
    tag: 'clinic-notification',
    renotify: true,
    badge: 'my-new-icon-512.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./index.html')
  );
});
