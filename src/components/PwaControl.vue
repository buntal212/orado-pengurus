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
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const installDialog = ref(false)
const canInstall = ref(Boolean(window.__oradoInstallPrompt))
const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
const manualGuide = computed(() => isIos
  ? 'Di Safari, tekan Bagikan lalu pilih Tambahkan ke Layar Utama.'
  : 'Buka menu browser lalu pilih Instal aplikasi atau Tambahkan ke layar utama.')

async function installApp() {
  const prompt = window.__oradoInstallPrompt
  if (!prompt) return
  await prompt.prompt()
  await prompt.userChoice
  installDialog.value = false
}

async function applyUpdate(registration) {
  const worker = registration?.waiting
  if (worker) worker.postMessage({ type: 'SKIP_WAITING' })
  else window.location.reload()
}

function showUpdate(event) {
  $q.notify({
    color: 'orange', textColor: 'dark', icon: 'system_update', timeout: 0, multiLine: true,
    message: 'Versi ORADO Pengurus terbaru tersedia.',
    actions: [{ label: 'Nanti', color: 'dark' }, { label: 'Update sekarang', color: 'primary', handler: () => applyUpdate(event.detail?.registration) }],
  })
}

function installReady() {
  canInstall.value = true
  if (!isInstalled()) installDialog.value = true
}

onMounted(() => {
  if (!isInstalled()) window.setTimeout(() => { installDialog.value = true }, 600)
  window.addEventListener('orado:pwa-install-ready', installReady)
  window.addEventListener('orado:pwa-update-available', showUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('orado:pwa-install-ready', installReady)
  window.removeEventListener('orado:pwa-update-available', showUpdate)
})
</script>

<style scoped>
.install-card { width: min(390px, calc(100vw - 28px)); border-radius: 18px; }.install-head { padding-top: 24px; }.install-logo { display: grid; width: 66px; height: 66px; box-sizing: border-box; margin: 0 auto; padding: 6px; place-items: center; border-radius: 50%; background: #073572; }.install-logo img { display: block; width: 54px; height: 54px; object-fit: contain; transform: translateY(1px); }.benefit { display: flex; align-items: center; gap: 9px; padding: 7px 2px; color: #304967; font-size: 12px; }.manual-guide { margin-top: 10px; padding: 10px; border-radius: 9px; color: #607187; background: #f1f6fc; font-size: 11px; line-height: 1.45; }
</style>
