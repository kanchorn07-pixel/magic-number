// Magic Number — Service Worker v1.0
const CACHE_NAME = 'magic-number-v1';

// ไฟล์ที่ cache ไว้ใช้ offline
const CACHE_FILES = [
  '/magic-number/sales_program_v3.html',
  '/magic-number/dashboard.html'
];

// ติดตั้ง SW — cache ไฟล์หลัก
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES).catch(() => {
        // ถ้า cache ไม่ได้ก็ไม่เป็นไร (Firebase ต้องการ internet อยู่ดี)
      });
    })
  );
  self.skipWaiting();
});

// Activate — ลบ cache เก่า
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — Network first, fallback to cache
self.addEventListener('fetch', event => {
  // ไม่ cache Firebase requests
  if (event.request.url.includes('firebasedatabase.app')) return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        // อัปเดต cache ทุกครั้งที่ online
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
