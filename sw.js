const version = 1;
const cacheName = `giftr-pwa-rami0101-v${version}`;

const cacheItems = ["/", "/index.html", "./css/main.css", "./js/main.js"];

const swCache = {
  getCache(ev) {
    return caches.match(ev.request).then((cacheResponse) => {
      //return cacheResponse if not null
      return cacheResponse || fetch(ev.request);
    });
  },
  cacheOnly(ev) {
    //only the response from the cache
    return caches.match(ev.request);
  },
  networkFirst(ev) {
    //try fetch then cache
    return fetch(ev.request).then((fetchResponse) => {
      if (fetchResponse.ok) return fetchResponse;
      return caches.match(ev.request);
    });
  },
  validateAndSaveCache(ev) {
    return fetch(ev.request, { mode: "cors", credentials: "omit" }).then(
      (fetchResponse) => {
        if (fetchResponse.ok) {
          //put in cache
          return caches.open(cacheName).then((cache) => {
            if (event.request.url.startsWith("http")) {
              cache.put(ev.request, fetchResponse.clone());
              return fetchResponse;
            }
          });
        } else {
          return caches.match(ev.request);
        }
      }
    );
  },

  getCacheName(ev) {
    const url = new URL(ev.request.url);
    if (url.origin.includes("giftr")) {
      return giftrCacheName;
    }
  },
};

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(cacheName).then((cache) => {
      cache.addAll(cacheItems);
    })
  );
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key != cacheName).map((nm) => caches.delete(nm))
      );
    })
  );
});

self.addEventListener("fetch", (ev) => {
  const mode = ev.request.mode;
  const url = new URL(ev.request.url);
  const isOnline = navigator.onLine;
  const isJS = url.pathname.endsWith(".js");
  const isCSS = url.pathname.endsWith(".css");
  const isFont =
    url.hostname.includes("gstatic") ||
    url.pathname.endsWith("woff2") ||
    url.hostname.includes("typekit");
  const isSelf = new URL(self.location);
  const isRemote = isSelf.origin !== url.origin;

  if (isOnline) {
    if (isJS || isCSS || isFont || isRemote) {
      ev.respondWith(swCache.validateAndSaveCache(ev));
    } else {
      ev.respondWith(swCache.networkFirst(ev));
    }
  } else {
    if (mode === "navigate") {
      ev.respondWith(swCache.getCache(ev));
    } else {
      ev.respondWith(swCache.cacheOnly(ev));
    }
  }
});

class NetworkError extends Error {
  constructor(msg) {
    super(msg);
    this.type = "NetworkError";
    this.message = msg;
  }
}
