/* global firebase */
/*
 * ORADO Pengurus Custom Service Worker
 * Quasar PWA + Firebase Cloud Messaging
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

/*
 * Firebase Cloud Messaging
 * Pakai compat SDK supaya stabil di custom service worker.
 */
try {
  importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js')
  importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js')

  firebase.initializeApp({
    apiKey: 'AIzaSyBfUnHqeKtNWMl9QZ-W6iNGFmJznhvTfGM',
    authDomain: 'orado-99dd1.firebaseapp.com',
    projectId: 'orado-99dd1',
    storageBucket: 'orado-99dd1.firebasestorage.app',
    messagingSenderId: '497115988745',
    appId: '1:497115988745:web:1a761e066ae745683e89d8',
  })

  firebase.messaging().onBackgroundMessage((payload) => {
    console.log('[ORADO SW] Background message:', payload)

    const title = payload.notification?.title || payload.data?.title || 'ORADO PROBOLINGGO'
    const body = payload.notification?.body || payload.data?.body || ''

    return self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-128x128.png',
      data: { target: '/notifikasi' },
    })
  })
} catch (error) {
  console.error('[ORADO SW] Firebase Messaging belum dapat dimuat.', error)
}

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
