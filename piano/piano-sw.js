const cacheName = "piano-2026-08-27";
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
	const appName = cacheName.replace(/-.*/,"");
	e.waitUntil(
		caches.keys()
		.then(keys => Promise.all(
			keys.filter(key => key.replace(/-.*/,"") == appName && key != cacheName)
				.map(caches.delete, caches)
		))
	);
});

self.addEventListener("fetch", e => {
	e.respondWith(
		caches.match(e.request)
		.then(cacheResponse => cacheResponse || fetch(e.request))
	);
});