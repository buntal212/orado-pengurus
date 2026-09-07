import { getToken } from 'firebase/messaging'

import { messaging } from '@/boot/firebase'
import { api } from '@/boot/axios'

async function simpanTokenPush() {
  const registration = await getFirebaseServiceWorkerRegistration()
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

  await withTimeout(
    api.post('/fcm/token', {
      token,
      app_type: 'pengurus',
      device_name: getDeviceName(),
    }),
    15000,
    'Penyimpanan token notifikasi terlalu lama. Silakan coba lagi.',
  )
}

async function getFirebaseServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker belum didukung browser ini.')
  }

  let registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    registration = await withTimeout(
      navigator.serviceWorker.register('/sw.js'),
      15000,
      'Service worker ORADO tidak dapat dipasang. Periksa koneksi internet lalu coba lagi.',
    )
  }

  await withTimeout(
    registration.update(),
    15000,
    'Pembaruan service worker ORADO terlalu lama. Periksa koneksi internet lalu coba lagi.',
  )

  return withTimeout(
    navigator.serviceWorker.ready,
    30000,
    'Service worker ORADO belum siap. Tutup aplikasi, buka kembali, lalu coba aktifkan notifikasi sekali lagi.',
  )
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

    if (permission !== 'granted') {
      throw new Error('Izin notifikasi belum diberikan.')
    }

    await simpanTokenPush()

    return {
      success: true,
    }
  } catch (error) {
    console.error('[ORADO FCM]', error)

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
    }
  } catch (error) {
    console.warn('[ORADO FCM] Gagal menghapus token:', error)
  }
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
