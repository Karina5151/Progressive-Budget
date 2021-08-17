const BUDGET_CACHE = "budget-cache-v1";
const DATA_CACHE = "data-cache-v1";

// Array of all urls the PWA should cache
const urlsToCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

//  PWA install
self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(BUDGET_CACHE).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Listener event for service worker to listen for any events where a fetch (api call) is being made
self.addEventListener("fetch", function(event) {
  // cache all get requests to /api routes
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        // Attempt to fetch using an Internet connection
        return fetch(event.request)
          .then(response => {
            // If response was good, clone it and store it in the cache
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })

          // This code runs if the fetch fails; ie: there is no Internet connection
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  // This code block handles all home page calls
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});