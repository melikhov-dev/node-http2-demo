let cacheName = 'v1';

this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll([
        'index.html',
        'common.css'
      ].map(u => new Request(u, { credentials: 'include' })))
    }).then(()=> console.log('done'))
  );
  this.skipWaiting();
});

this.addEventListener('fetch', function(event) {
  console.log('SW Fetching... ')
  var response;
  event.respondWith(async function() {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return cachedResponse;
    response = await fetch(event.request);
    caches.open(cacheName).then(function(cache) {
      cache.put(event.request, response);
    });
    return response.clone();
  }());
});

this.addEventListener('activate', function(event) {
  console.log('SW Activating... ')
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
            console.log(cacheName);
            return caches.delete(cacheName);
        })
      );
    })
  );
});