import { boot } from 'quasar/wrappers'

export default boot(() => {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    window.__oradoInstallPrompt = event
    window.dispatchEvent(new CustomEvent('orado:pwa-install-ready'))
  })

  window.addEventListener('appinstalled', () => {
    window.__oradoInstallPrompt = null
    window.dispatchEvent(new CustomEvent('orado:pwa-installed'))
  })
})
