/*
 * ORADO Pengurus Custom Service Worker
 * Quasar PWA - InjectManifest
 */

import { clientsClaim } from 'workbox-core'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

console.log('[ORADO SW] Firebase config', {
  hasApiKey: Boolean(firebaseConfig.apiKey),
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
})

try {
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.messagingSenderId ||
    !firebaseConfig.appId
  ) {
    throw new Error('Firebase config service worker tidak lengkap')
  }

  const firebaseApp = initializeApp(firebaseConfig)

  console.log('[ORADO SW] Firebase initialized', {
    name: firebaseApp.name,
    projectId: firebaseApp.options.projectId,
  })

  const messaging = getMessaging(firebaseApp)

  onBackgroundMessage(messaging, (payload) => {
    const title = payload.notification?.title || 'ORADO Pengurus'
    const body = payload.notification?.body || 'Ada notifikasi baru.'
    const target = internalPath(payload.data?.url || payload.data?.route)

    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: {
        target,
      },
    })
  })
} catch (error) {
  console.error('[ORADO SW] Firebase Messaging gagal diinisialisasi:', error)
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
