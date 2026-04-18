const CACHE_NAME = 'maktab-cache-v1';
const DYNAMIC_CACHE = 'maktab-dynamic-v1';

const STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/css/main.css',
    '/css/mobile.css',
    '/css/desktop.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/admin.js',
    '/js/teacher.js',
    '/js/db-local.js',
    '/js/pwa.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_FILES);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // API so'rovlar uchun Network First strategiyasi
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    return response;
                })
                .catch(() => {
                    // API ishlamasa yomon bo'lmasligi uchun json qaytarish mumkin edi, lekin
                    // UI IndexedDB bilan ishlaydi, shuning uchun bu yerdan fetch xatosi tashlanadi.
                    throw new Error('Offline API request');
                })
        );
    } else {
        // Statik fayllar uchun Cache First strategiyasi
        event.respondWith(
            caches.match(event.request).then((cacheRes) => {
                return cacheRes || fetch(event.request).then((fetchRes) => {
                    return caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(event.request.url, fetchRes.clone());
                        return fetchRes;
                    });
                });
            }).catch(() => {
                // Agar HTML so'ralgan bo'lsa va tarmoq yo'q bo'lsa, offline sahifani ko'rsatish
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/offline.html');
                }
            })
        );
    }
});
