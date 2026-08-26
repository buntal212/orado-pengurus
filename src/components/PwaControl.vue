<template>
  <q-dialog v-model="installDialog">
    <q-card class="install-card">
      <q-card-section class="install-head text-center">
        <div class="install-logo"><img src="@/assets/orado/logo-white.svg" alt="ORADO" /></div>
        <div class="text-subtitle1 text-weight-bold q-mt-sm">Instal ORADO Pengurus</div>
        <div class="text-caption text-blue-grey-7 q-mt-xs">Akses cepat dari layar utama perangkat Anda.</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="benefit"><q-icon name="install_mobile" color="primary" /> <span>Terbuka seperti aplikasi biasa.</span></div>
        <div class="benefit"><q-icon name="system_update" color="primary" /> <span>Selalu mendapat pemberitahuan versi terbaru.</span></div>
        <div v-if="!canInstall" class="manual-guide">{{ manualGuide }}</div>
      </q-card-section>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps label="Nanti saja" color="grey-7" @click="installDialog = false" />
        <q-btn v-if="canInstall" unelevated no-caps label="Instal sekarang" color="primary" icon="download" @click="installApp" />
        <q-btn v-else unelevated no-caps label="Mengerti" color="primary" @click="installDialog = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="updateDialog" persistent>
    <q-card class="install-card">
      <q-card-section class="install-head text-center">
        <q-icon name="system_update" size="52px" color="primary" />
        <div class="text-subtitle1 text-weight-bold q-mt-sm">Pembaruan tersedia</div>
        <div class="text-caption text-blue-grey-7 q-mt-xs">Versi terbaru ORADO sudah siap. Perbarui agar fitur dan perbaikan terbaru dapat digunakan.</div>
      </q-card-section>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps label="Nanti" color="grey-7" @click="updateDialog = false" />
        <q-btn unelevated no-caps label="Update sekarang" color="primary" icon="system_update" @click="applyUpdate" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const installDialog = ref(false)
const canInstall = ref(Boolean(window.__oradoInstallPrompt))
const updateDialog = ref(false)
const updateRegistration = ref(null)
const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
const installStateKey = 'orado-pwa-installed'
const isInstalled = () => ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'].some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches) || window.navigator.standalone === true || document.referrer.startsWith('android-app://') || window.localStorage.getItem(installStateKey) === '1'
const manualGuide = computed(() => isIos
  ? 'Di Safari, tekan Bagikan lalu pilih Tambahkan ke Layar Utama.'
  : 'Buka menu browser lalu pilih Instal aplikasi atau Tambahkan ke layar utama.')

async function installApp() {
  const prompt = window.__oradoInstallPrompt
  if (!prompt) return
  await prompt.prompt()
  const result = await prompt.userChoice
  if (result.outcome === 'accepted') markInstalled()
  else installDialog.value = false
}

function markInstalled() {
  window.localStorage.setItem(installStateKey, '1')
  window.__oradoInstallPrompt = null
  canInstall.value = false
  installDialog.value = false
}

async function applyUpdate() {
  updateDialog.value = false
  const worker = updateRegistration.value?.waiting
  if (worker) worker.postMessage({ type: 'SKIP_WAITING' })
  else window.location.reload()
}

function showUpdate(event) {
  updateRegistration.value = event.detail?.registration || null
  updateDialog.value = true
}

function installReady() {
  if (isInstalled()) return
  canInstall.value = true
  installDialog.value = true
}

onMounted(() => {
  if (isInstalled()) markInstalled()
  else window.setTimeout(() => { installDialog.value = true }, 600)
  window.addEventListener('orado:pwa-install-ready', installReady)
  window.addEventListener('orado:pwa-installed', markInstalled)
  window.addEventListener('orado:pwa-update-available', showUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('orado:pwa-install-ready', installReady)
  window.removeEventListener('orado:pwa-installed', markInstalled)
  window.removeEventListener('orado:pwa-update-available', showUpdate)
})
</script>

<style scoped>
.install-card { width: min(390px, calc(100vw - 28px)); border-radius: 18px; }.install-head { padding-top: 24px; }.install-logo { display: grid; width: 66px; height: 66px; box-sizing: border-box; margin: 0 auto; padding: 6px; place-items: center; border-radius: 50%; background: #073572; }.install-logo img { display: block; width: 54px; height: 54px; object-fit: contain; transform: translateY(1px); }.benefit { display: flex; align-items: center; gap: 9px; padding: 7px 2px; color: #304967; font-size: 12px; }.manual-guide { margin-top: 10px; padding: 10px; border-radius: 9px; color: #607187; background: #f1f6fc; font-size: 11px; line-height: 1.45; }
</style>
