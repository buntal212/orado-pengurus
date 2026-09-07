import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported, onMessage } from 'firebase/messaging'
import { Notify } from 'quasar'
import { useNotifikasiStore } from '@/stores/notifikasi'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const firebaseApp = initializeApp(firebaseConfig)

let messaging = null

export default boot(async ({ store }) => {
  if (await isSupported()) {
    messaging = getMessaging(firebaseApp)
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || payload.data?.title || 'ORADO PROBOLINGGO'
      const body = payload.notification?.body || payload.data?.body || 'Ada notifikasi baru.'
      const target = internalPath(payload.data?.url || payload.data?.route)
      useNotifikasiStore(store).tambah({
        title,
        body,
        url: target,
        menuLabel: payload.data?.menu_label || null,
        serverId: payload.data?.notification_id || null,
      })

      Notify.create({
        type: 'info',
        message: body,
        caption: title,
        timeout: 7000,
        actions: target
          ? [
              {
                label: 'Buka',
                color: 'white',
                handler: () => window.location.assign(target),
              },
            ]
          : [],
      })
    })
  } else {
    console.warn('Firebase Messaging tidak didukung browser ini.')
  }
})

function internalPath(value) {
  if (!value || typeof value !== 'string') return null

  try {
    const url = new URL(value, window.location.origin)
    if (url.origin !== window.location.origin) return null

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

export { firebaseApp, messaging }
