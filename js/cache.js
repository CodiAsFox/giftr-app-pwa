const CACHE = {
  cacheName: null,
  userName: "rami0101",
  cache: null,

  init(cName, version) {
    CACHE.cacheName = `${cName}--${CACHE.userName}-1v${version}`;
    return CACHE.set();
  },
  set() {
    const cache = caches
      .open(CACHE.cacheName)
      .then((cache) => {
        CACHE.cache = cache;
        return caches.keys();
      })
      .then((cKeys) => {
        let cleared = false;
        cKeys.forEach((cKeys) => {
          if (CACHE.cacheName != cKeys) {
            caches.delete(cKeys);
            cleared = true;
          }
        });
        if (cleared) {
          console.info("The cache was cleared.");
        }
        return true;
      });

    return cache;
  },
  get(file) {
    // const cache = CACHE.cache.match(file);
    // return cache;

    return caches
      .open(CACHE.cacheName)
      .then((cache) => cache.match(file))
      .then((response) => {
        return response.text();
      });
  },

  getAll() {
    const cache = CACHE.cache.keys().then((results) => {
      const msg =
        results.length == 0
          ? "No saved files found"
          : `${results.length} files saved on cache.`;
      console.info(msg);
      return results;
    });

    return cache;
  },

  save(fileName, fileData, fileType) {
    const file = new File([fileData], fileName, {
      type: fileType,
    });
    const request = new Request(fileName);
    const resp = new Response(file, {
      status: 200,
      statusText: "OK",
    });
    const cache = CACHE.cache.put(request, resp);
    return cache;
  },
  delete(file) {
    const cache = CACHE.cache.delete(file);
    return cache;
  },
};

export default CACHE;
