/*
 * ORADO Pengurus Custom Service Worker
 * Quasar PWA - InjectManifest
 */

import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = internalPath(event.notification.data?.target) || '/'

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(async (windows) => {
        const client = windows[0]

        if (client) {
          await client.navigate(target)
          return client.focus()
        }

        return self.clients.openWindow(target)
      }),
  )
})

function internalPath(value) {
  if (!value || typeof value !== 'string') {
    return null
  }

  try {
    const url = new URL(value, self.location.origin)

    if (url.origin !== self.location.origin) {
      return null
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

if (import.meta.env.QUASAR_PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(import.meta.env.QUASAR_PWA_FALLBACK_HTML), {
      denylist: [new RegExp(import.meta.env.QUASAR_PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
    }),
  )
}
