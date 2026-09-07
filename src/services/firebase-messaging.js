import { getToken } from 'firebase/messaging'

import { messaging } from '@/boot/firebase'
import { api } from '@/boot/axios'

const PUSH_ACTIVATED_KEY = 'orado_pengurus_push_activated'
const PWA_SERVICE_WORKER_FILE = `${import.meta.env.QUASAR_SERVICE_WORKER_FILE || '/sw.js'}?v=${encodeURIComponent(
  import.meta.env.VITE_PWA_VERSION || 'current',
)}`

async function simpanTokenPush() {
  const registration = await getFirebaseServiceWorkerRegistration()
  console.log('[FCM] service worker siap:', {
    scope: registration.scope,
    state: registration.active?.state,
  })
  const token = await withTimeout(
    getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    }),
    15000,
    'Pembuatan token notifikasi terlalu lama. Pastikan aplikasi dibuka sebagai PWA dan koneksi internet aktif.',
  )

  if (!token) {
    throw new Error('FCM token tidak berhasil dibuat.')
  }
  console.log('[FCM] token tersedia:', Boolean(token))

  console.log('[FCM] mengirim token ke backend...')
  const response = await withTimeout(
    api.post('/fcm/token', {
      token,
      app_type: 'pengurus',
      device_name: getDeviceName(),
    }),
    15000,
    'Penyimpanan token notifikasi terlalu lama. Silakan coba lagi.',
  )
  console.log('[FCM] respons backend:', response.status)
  localStorage.setItem(PUSH_ACTIVATED_KEY, '1')
}

async function getFirebaseServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker belum didukung browser ini.')
  }

  let registration = await navigator.serviceWorker.getRegistration()
  console.log('[FCM] service worker terdaftar:', registration
    ? { scope: registration.scope, state: registration.active?.state }
    : null)

  if (!registration) {
    try {
      registration = await navigator.serviceWorker.register(PWA_SERVICE_WORKER_FILE, {
        updateViaCache: 'none',
      })
      console.log('[FCM] service worker PWA didaftarkan:', registration.scope)
    } catch (error) {
      console.error('[FCM] pendaftaran service worker gagal:', error)
      throw new Error(`Service worker PWA gagal didaftarkan: ${error.message}`, {
        cause: error,
      })
    }
  }

  const readyRegistration = await withTimeout(
    navigator.serviceWorker.ready,
    30000,
    'Service worker ORADO belum siap. Periksa status sw.js pada server atau lihat log diagnostik browser.',
  )

  if (!readyRegistration.active) {
    throw new Error('Service worker ORADO belum aktif.')
  }

  return readyRegistration
}

function withTimeout(promise, timeout, message) {
  let timer

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error(message)), timeout)
    }),
  ]).finally(() => window.clearTimeout(timer))
}

export async function enablePushNotification() {
  try {
    if (!window.isSecureContext) {
      throw new Error(
        'Notifikasi Android memerlukan alamat HTTPS. Buka ORADO PROBOLINGGO dari domain produksi, bukan alamat IP atau HTTP lokal.',
      )
    }

    if (!('Notification' in window)) {
      throw new Error('Browser ini tidak mendukung notifikasi.')
    }

    if (!messaging) {
      throw new Error('Firebase Messaging belum siap.')
    }

    if (Notification.permission === 'denied') {
      throw new Error('Izin notifikasi diblokir di browser. Aktifkan melalui pengaturan browser.')
    }

    const permission = await Notification.requestPermission()
    console.log('[FCM] permission:', permission)

    if (permission !== 'granted') {
      throw new Error('Izin notifikasi belum diberikan.')
    }

    await simpanTokenPush()

    return {
      success: true,
    }
  } catch (error) {
    console.error('[FCM] aktivasi gagal:', error)
    console.error('[FCM] respons backend:', error?.response?.data)

    return {
      success: false,
      message: getErrorMessage(error),
    }
  }
}

export async function refreshPushNotificationToken() {
  if (!messaging || !('Notification' in window) || Notification.permission !== 'granted') {
    return false
  }

  try {
    await simpanTokenPush()
    return true
  } catch (error) {
    console.warn('[ORADO FCM] Gagal memperbarui token:', error)
    return false
  }
}

export async function testPushNotification() {
  try {
    const response = await api.post('/fcm/test')

    return { success: true, message: response.data?.message }
  } catch (error) {
    console.error('[FCM] pengujian gagal:', error)
    return { success: false, message: getErrorMessage(error) }
  }
}

export async function removePushNotificationToken() {
  try {
    if (!messaging || !('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const registration = await getFirebaseServiceWorkerRegistration()

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      await api.delete('/fcm/token', {
        data: { token },
      })
      localStorage.removeItem(PUSH_ACTIVATED_KEY)
    }
  } catch (error) {
    console.warn('[ORADO FCM] Gagal menghapus token:', error)
  }
}

export function pushNotificationSudahAktif() {
  return localStorage.getItem(PUSH_ACTIVATED_KEY) === '1'
}

function getDeviceName() {
  const userAgent = navigator.userAgent

  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Firefox\//.test(userAgent)
      ? 'Firefox'
      : /CriOS\//.test(userAgent)
        ? 'Chrome'
        : /Chrome\//.test(userAgent)
          ? 'Chrome'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : 'Browser'

  const platform = /iPhone|iPad|iPod/.test(userAgent)
    ? 'iPhone'
    : /Android/.test(userAgent)
      ? 'Android'
      : /Windows/.test(userAgent)
        ? 'Windows'
        : /Mac OS/.test(userAgent)
          ? 'macOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : 'Perangkat'

  return `${browser} - ${platform}`.slice(0, 255)
}

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return 'Sesi login berakhir. Silakan masuk kembali.'
  }

  if (error.response?.status === 422) {
    return (
      error.response?.data?.errors?.token?.[0] ||
      error.response?.data?.message ||
      'Data notifikasi tidak valid.'
    )
  }

  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.message) {
    return error.message
  }

  return 'Notifikasi belum dapat diaktifkan. Periksa koneksi internet Anda.'
}
