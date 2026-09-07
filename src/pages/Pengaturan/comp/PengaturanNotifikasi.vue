<template>
  <section class="notification-card">
    <span class="notification-icon"><q-icon name="notifications_active" /></span
    ><strong>Notifikasi ORADO</strong>
    <p>
      Terima pemberitahuan pengajuan, informasi kegiatan, dan pembaruan penting langsung di
      perangkat Anda.
    </p>
    <q-btn
      unelevated
      no-caps
      color="primary"
      icon="notifications_active"
      :loading="store.loadingNotification"
      :disable="store.loadingNotification"
      :label="notificationLabel"
      class="activate-button"
      @click="aktifkanNotifikasi"
    />
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { Notify } from 'quasar'
import { usePengaturanStore } from '@/stores/pengaturan'
import { pushNotificationSudahAktif } from '@/services/firebase-messaging'

const store = usePengaturanStore()
const pushAktif = ref(pushNotificationSudahAktif())
const notificationLabel = computed(() =>
  pushAktif.value ? 'Notifikasi sudah aktif' : 'Aktifkan notifikasi',
)

async function aktifkanNotifikasi() {
  const result = await store.aktifkanNotifikasi()
  if (result.success) {
    pushAktif.value = true
    Notify.create({ type: 'positive', message: 'Notifikasi berhasil diaktifkan.' })
  } else
    Notify.create({ type: 'negative', message: result.message || 'Gagal mengaktifkan notifikasi' })
}
</script>
<style scoped>
.notification-card {
  margin-top: 30px;
  padding: 26px 18px 20px;
  border: 1px solid #ccdeec;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(10, 41, 80, 0.12);
  text-align: center;
}
.notification-icon {
  display: grid;
  width: 62px;
  height: 62px;
  margin: 0 auto 13px;
  place-items: center;
  border-radius: 18px;
  color: #0a5fbe;
  background: #e2efff;
}
.notification-icon :deep(.q-icon) {
  font-size: 34px;
}
.notification-card strong {
  color: #12365f;
  font-size: 16px;
}
.notification-card p {
  max-width: 295px;
  margin: 10px auto 20px;
  color: #7186a0;
  font-size: 11px;
  line-height: 1.5;
}
.activate-button {
  width: 100%;
  min-height: 42px;
}
</style>
