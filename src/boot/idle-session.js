import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { useLoginStore } from '@/stores/login'
import { refreshPushNotificationToken } from '@/services/firebase-messaging'

const IDLE_TIMEOUT = 15 * 60 * 1000
const LAST_ACTIVITY_KEY = 'orado_pengurus_last_activity'
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart']

export default boot(({ router, store }) => {
  let timer
  let isLoggingOut = false

  const hasToken = () =>
    Boolean(
      localStorage.getItem('orado_pengurus_token') ||
      sessionStorage.getItem('orado_pengurus_token'),
    )

  const logoutForInactivity = async () => {
    if (isLoggingOut || !hasToken()) return

    isLoggingOut = true
    window.clearTimeout(timer)
    const loginStore = useLoginStore(store)
    void loginStore.logout({ removePushToken: false, immediate: true })
    Notify.create({
      type: 'warning',
      message: 'Anda keluar otomatis karena tidak ada aktivitas selama 15 menit.',
    })
    await router.replace('/login')
    isLoggingOut = false
  }

  const waktuAktivitasTerakhir = () => {
    const waktu = Number(localStorage.getItem(LAST_ACTIVITY_KEY))
    return Number.isFinite(waktu) && waktu > 0 ? waktu : null
  }

  const jadwalkanPemeriksaan = () => {
    window.clearTimeout(timer)
    if (!hasToken()) return

    const terakhirAktif = waktuAktivitasTerakhir()
    if (!terakhirAktif) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
      return jadwalkanPemeriksaan()
    }

    const sisaWaktu = IDLE_TIMEOUT - (Date.now() - terakhirAktif)
    if (sisaWaktu <= 0) {
      void logoutForInactivity()
      return
    }

    timer = window.setTimeout(periksaMasaAktif, sisaWaktu)
  }

  const periksaMasaAktif = () => {
    if (!hasToken() || isLoggingOut) return

    const terakhirAktif = waktuAktivitasTerakhir()
    if (terakhirAktif && Date.now() - terakhirAktif >= IDLE_TIMEOUT) {
      void logoutForInactivity()
      return
    }

    jadwalkanPemeriksaan()
  }

  const catatAktivitas = () => {
    if (!hasToken() || isLoggingOut) return

    periksaMasaAktif()
    if (!hasToken() || isLoggingOut) return

    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
    jadwalkanPemeriksaan()
  }

  ACTIVITY_EVENTS.forEach((event) =>
    window.addEventListener(event, catatAktivitas, { passive: true }),
  )
  window.addEventListener('focus', periksaMasaAktif)
  window.addEventListener('storage', (event) => {
    if (event.key === LAST_ACTIVITY_KEY) jadwalkanPemeriksaan()
  })
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) periksaMasaAktif()
  })
  router.afterEach(catatAktivitas)
  periksaMasaAktif()

  if (hasToken()) {
    void refreshPushNotificationToken()
  }
})
