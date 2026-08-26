import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { useLoginStore } from '@/stores/login'

const IDLE_TIMEOUT = 15 * 60 * 1000
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart']

export default boot(({ router, store }) => {
  let timer
  let isLoggingOut = false

  const hasToken = () => Boolean(
    localStorage.getItem('orado_pengurus_token') || sessionStorage.getItem('orado_pengurus_token'),
  )

  const logoutForInactivity = async () => {
    if (isLoggingOut || !hasToken()) return
    isLoggingOut = true
    const loginStore = useLoginStore(store)
    await loginStore.logout()
    Notify.create({ type: 'warning', message: 'Anda keluar otomatis karena tidak ada aktivitas selama 15 menit.' })
    router.replace('/login')
    isLoggingOut = false
  }

  const resetTimer = () => {
    window.clearTimeout(timer)
    if (hasToken()) timer = window.setTimeout(logoutForInactivity, IDLE_TIMEOUT)
  }

  ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, resetTimer, { passive: true }))
  router.afterEach(resetTimer)
  resetTimer()
})
