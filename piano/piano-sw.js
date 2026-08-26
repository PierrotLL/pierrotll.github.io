const cacheName = "piano-2026-08-26-v3";
const contentToCache = [
	"piano.html",
	"piano.webmanifest",
	"icon-64.webp",
	"icon-192.webp",
	"icon-512.png",
	"FClef.svg",
	"GClef.svg",
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