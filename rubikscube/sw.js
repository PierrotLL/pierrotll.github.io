const cacheName = "2026-08-23";
const contentToCache = [
	"index.html",
	"manifest.json",
	"icon-256.png",
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
		Promise.race([
			caches.match(e.request),
			fetch(e.request)
				.then(response => {
					let clone = response.clone();
					caches.open(cacheName).then(cache => cache.put(e.request, clone));
					return response;
				})
		])
	);
});