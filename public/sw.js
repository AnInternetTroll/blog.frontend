const cacheName = "v1";

const cacheAssets = ["./", "/offline.html", "/manifest.json"];

// Call Install Event
self.addEventListener("install", (e) => {
	console.log("Service Worker: Installed");

	e.waitUntil(
		caches
			.open(cacheName)
			.then((cache) => {
				console.log("Service Worker: Caching Files");
				cache.addAll(cacheAssets);
			})
			.then(() => self.skipWaiting())
	);
});

// Call Activate Event
self.addEventListener("activate", (e) => {
	console.log("Service Worker: Activated");
	// Remove unwanted caches
	e.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cache) => {
					if (cache !== cacheName) {
						console.log("Service Worker: Clearing Old Cache");
						return caches.delete(cache);
					}
				})
			);
		})
	);
});

self.addEventListener("fetch", async (event) => {
	event.request.headers.Authorization ??= `Bearer ${await cookieStore.get("token") || "no token here :("}`;
	if (event.request.url.includes("api")) return fetch(event.request);
	event.respondWith(
		// Try the cache
		caches
			.match(event.request)
			.then((response) => {
				if (response) {
					return response;
				}
				return fetch(event.request).then((response) => {
					if (response.status === 404) {
						return caches.match("/404.html");
					}
					return response;
				});
			})
			.catch(() => {
				// If both fail, show a generic fallback:
				return caches.match("/offline.html");
			})
	);
});
