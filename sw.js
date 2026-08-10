const CACHE = "control-horario-v2";

const FILES = [
  "./",
  "./index.html",
  "./css.css",
  "./js.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())

  );

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


self.addEventListener("fetch", event => {

  // Las peticiones al Apps Script
  // SIEMPRE deben ir a Internet.
  if (
    event.request.url.includes("script.google.com")
  ) {

    event.respondWith(
      fetch(event.request)
    );

    return;
  }


  // Archivos de la aplicación:
  // primero intenta red y si falla usa caché.
  event.respondWith(

    fetch(event.request)
      .then(response => {

        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {

          const copia = response.clone();

          caches.open(CACHE)
            .then(cache => {
              cache.put(
                event.request,
                copia
              );
            });

        }

        return response;

      })
      .catch(() => {

        return caches.match(
          event.request
        );

      })

  );

});
