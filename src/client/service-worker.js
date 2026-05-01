const CACHE_NAME = 'soundshare-v1';

// FILES TO CACHE
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/chats.html',
  '/audiotest.html',
  '/css/base.css',
  '/css/index.css',
  '/css/chats.css',
  '/css/audiorecord.css',
  '/css/modal.css',
  '/js/index.js',
  '/js/chats.js',
  '/js/createroom.js',
  '/js/audiorecord.js',
  '/manifest.json',
  '/assets/soundshare_logo.png',
  '/assets/soundshare_name_logo.png'
];

// INSTALL
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          // Update the cache with the new version from the network
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // Return the cached response if it exists, otherwise wait for the network
        return cachedResponse || fetchedResponse;
      });
    })
  );
});