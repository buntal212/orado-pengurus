/* ORADO Pengurus - Firebase Messaging Service Worker */

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

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('[ORADO FCM SW] Background message:', payload)

  const title = payload.notification?.title || payload.data?.title || 'ORADO Pengurus'
  const body = payload.notification?.body || payload.data?.body || ''

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-128x128.png',
    data: {
      target: payload.data?.url || payload.data?.route || '/',
    },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = event.notification.data?.target || '/'

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(async (clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            await client.navigate(target)
            return client.focus()
          }
        }

        return clients.openWindow(target)
      }),
  )
})
