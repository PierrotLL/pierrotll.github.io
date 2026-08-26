const cacheName = "rubikscube-2026-08-26-v3";
const contentToCache = [
	"rubikscube.html",
	"rubikscube.webmanifest",
	"icon-64.png",
	"icon-192.png",
	"icon-512.png",
];

self.addEventListener("install", e => {
	e.waitUntil(
		caches.open(cacheName).then(cache => cache.addAll(contentToCache))
	);
});

self.addEventListener("activate", e => {
	let appName = cacheName.substring(0, cacheName.indexOf("-"));
	e.waitUntil(
		caches.keys()
		.then(keys => Promise.all(
			keys.reduce(key => key.substring(0, key.indexOf("-")) == appName && key != cacheName)
				.map(caches.delete)
		))
	);
});

self.addEventListener("fetch", e => {
	e.respondWith(
		caches.match(e.request)
		.then(cacheResponse => cacheResponse || fetch(e.request))
	);
});