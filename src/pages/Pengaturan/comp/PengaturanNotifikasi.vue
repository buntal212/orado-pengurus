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
    <q-btn
      outline
      no-caps
      color="primary"
      icon="send"
      :loading="store.loadingTestNotification"
      :disable="store.loadingNotification || store.loadingTestNotification"
      label="Uji notifikasi"
      class="test-button"
      @click="ujiNotifikasi"
    />
    <q-btn
      outline
      no-caps
      color="primary"
      icon="campaign"
      label="Buat pengumuman"
      class="test-button"
      @click="bukaPengumuman"
    />

    <q-dialog v-model="dialogPengumuman" persistent>
      <q-card class="announcement-dialog">
        <q-card-section><div class="text-h6">Buat pengumuman</div></q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-btn
            outline
            no-caps
            dense
            color="primary"
            icon="groups"
            label="Kirim ke semua pengurus"
            @click="pilihSemuaPenerima"
          />
          <q-select
            v-model="pengumuman.recipient_ids"
            :options="penerima"
            option-value="id"
            option-label="label"
            emit-value
            map-options
            multiple
            outlined
            dense
            label="Kirim kepada"
            use-chips
          />
          <q-input v-model="pengumuman.title" outlined dense label="Judul pengumuman" />
          <q-input v-model="pengumuman.body" outlined type="textarea" autogrow label="Pesan" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Batal" v-close-popup />
          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Kirim"
            :loading="mengirim"
            @click="kirimPengumuman"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { Notify } from 'quasar'
import { usePengaturanStore } from '@/stores/pengaturan'
import { pushNotificationSudahAktif } from '@/services/firebase-messaging'
import { api } from '@/boot/axios'

const store = usePengaturanStore()
const pushAktif = ref(pushNotificationSudahAktif())
const dialogPengumuman = ref(false)
const mengirim = ref(false)
const penerima = ref([])
const pengumuman = ref({ recipient_ids: [], title: '', body: '' })
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

async function ujiNotifikasi() {
  const result = await store.ujiNotifikasi()
  Notify.create({
    type: result.success ? 'positive' : 'negative',
    message: result.message || 'Notifikasi uji belum dapat dikirim.',
  })
}

async function bukaPengumuman() {
  try {
    const response = await api.get('/pengumuman/penerima')
    penerima.value = (response.data?.data ?? []).map((user) => ({
      id: user.id,
      label: user.name || user.username || user.email,
    }))
    dialogPengumuman.value = true
  } catch {
    Notify.create({ type: 'negative', message: 'Daftar penerima tidak dapat dimuat.' })
  }
}

async function kirimPengumuman() {
  mengirim.value = true
  try {
    const response = await api.post('/pengumuman', pengumuman.value)
    Notify.create({
      type: 'positive',
      message: response.data?.message || 'Pengumuman berhasil dikirim.',
    })
    pengumuman.value = { recipient_ids: [], title: '', body: '' }
    dialogPengumuman.value = false
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Pengumuman gagal dikirim.',
    })
  } finally {
    mengirim.value = false
  }
}

function pilihSemuaPenerima() {
  pengumuman.value.recipient_ids = penerima.value.map((user) => user.id)
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
.test-button {
  width: 100%;
  min-height: 42px;
  margin-top: 10px;
}
.announcement-dialog {
  width: min(420px, calc(100vw - 32px));
}
</style>
