const cacheName = "solitaire-v1";
const appShellFiles = [
  "index.html",
  "solitaire.css",
  "config.js",
  "solitaire.js",
];
const contentToCache = appShellFiles;

self.addEventListener("install", (e) => {
	e.waitUntil(
		caches.open(cacheName)
		.then(cache => cache.addAll(contentToCache))
	);
});

self.addEventListener("fetch", (e) => {
	e.respondWith(
		Promise.race([
			caches.match(e.request),
			fetch(e.request)
				.then(r => {
					caches.open(cacheName)
					.then(cache => cache.put(e.request, r));
					return r;
				})
		])
	);
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        }),
      );
    }),
  );
});