const cacheName = "rubikscube-2026-09-02";
const contentToCache = [
	"rubikscube.html",
	"rubikscube.webmanifest",
	"icon-64.webp",
	"icon-192.png",
	"icon-512.png",
];

self.addEventListener("install", e => {
	console.log(cacheName, "install");
	e.waitUntil(
		caches.open(cacheName).then(cache => cache.addAll(contentToCache))
	);
});

self.addEventListener("activate", e => {
	console.log(cacheName, "activate");
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
	console.log(cacheName, "fetch", e.request.url);
	e.respondWith(
		caches.match(e.request)
		//.then(cacheResponse => cacheResponse || fetch(e.request))
		.then(cacheResponse =>
			(cacheResponse && console.log(cacheName, "fetch response from cache", e.request.url), cacheResponse)
			||
			fetch(e.request).then(r=>(console.log(cacheName, "fetch loaded", e.request.url),r),r=>(console.log(cacheName, "fetch load error", e.request.url, r),null))
		)
	);
});