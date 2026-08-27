const cacheName = "rubikscube-2026-08-27";
const contentToCache = [
	"rubikscube.html",
	"rubikscube.webmanifest",
	"icon-64.png",
	"icon-192.png",
	"icon-512.png",
];

self.addEventListener("install", e => {
	console.log("sw install", cacheName);
	e.waitUntil(
		caches.open(cacheName).then(cache => cache.addAll(contentToCache))
	);
});

self.addEventListener("activate", e => {
	console.log("sw activate", cacheName);
	const appName = cacheName.replace(/-.*/,"");
	e.waitUntil(
		caches.keys()
		.then(keys => Promise.all(
			keys.filter(key => key.replace(/-.*/,"") == appName && key != cacheName)
				.map(caches.delete)
		))
	);
});

self.addEventListener("fetch", e => {
	console.log("sw fetch", cacheName, e.request);
	e.respondWith(
		caches.match(e.request)
		.then(cacheResponse => cacheResponse || fetch(e.request))
		.then(r=>(console.log(e.request, r),r), r=>(console.log(e.request, r),r))
	);
});