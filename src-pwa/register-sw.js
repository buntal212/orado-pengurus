import { register } from 'register-service-worker'

let announcedWorker = null
let reloading = false

function announceUpdate(registration) {
  if (!registration.waiting || registration.waiting === announcedWorker) return
  announcedWorker = registration.waiting
  window.dispatchEvent(new CustomEvent('orado:pwa-update-available', { detail: { registration } }))
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })
}

register(import.meta.env.QUASAR_SERVICE_WORKER_FILE, {
  registrationOptions: { updateViaCache: 'none' },
  registered(registration) {
    registration.update().then(() => announceUpdate(registration)).catch(() => {})
    window.setInterval(() => {
      if (navigator.onLine) registration.update()
    }, 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) registration.update()
    })
  },
  updated(registration) {
    announceUpdate(registration)
  },
  error(error) {
    console.error('Service worker ORADO gagal didaftarkan:', error)
  },
})
