/* global self, caches, Response */

const CACHE_NAME = "rectangle-cut-v1"
const APP_SHELL = ["/", "/manifest.webmanifest", "/favicon/favicon.ico"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/").then((response) => response || Response.error())),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then(
      (cachedResponse) =>
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseClone = networkResponse.clone()
            void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
          }

          return networkResponse
        }),
    ),
  )
})
