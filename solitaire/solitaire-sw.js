const cacheName = "solitaire-2026-08-28";
const contentToCache = [
  "solitaire.html",
  "solitaire.css",
  "solitaire.js",
  "boards.js",
  "icon-64.webp",
  "icon-192-bg.webp",
  "icon-512-bg.png",
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