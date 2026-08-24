const cacheName = "2026-08-24";
const contentToCache = [
	"rubikscube.html",
	"rubikscube.webmanifest",
	"icon-512-bg.png",
	"icon-512.png",
];

self.addEventListener("install", e => {
	e.waitUntil(
		caches.open(cacheName).then(cache => cache.addAll(contentToCache))
	);
});

self.addEventListener("activate", e => {
	e.waitUntil(
		caches.keys().then(keys => Promise.all(
			keys.map(key => key != cacheName ? caches.delete(key) : null)
		))
	);
});

self.addEventListener("fetch", e => {
	e.respondWith(
		caches.match(e.request)
		.then(cacheResponse =>
			cacheResponse ||
			fetch(e.request)
			.then(fetchResponse => {
				let clone = fetchResponse.clone();
				caches.open(cacheName).then(cache => cache.put(e.request, clone));
				return fetchResponse;
			})
		)
	);
});