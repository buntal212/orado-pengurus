<template>
  <q-page class="notification-page">
    <main class="notification-content">
      <div class="page-heading">
        <div>
          <span>PUSAT INFORMASI</span>
          <h1>Notifikasi</h1>
          <p>Informasi terbaru untuk pengurus ORADO.</p>
        </div>
        <q-btn round flat icon="arrow_back" color="primary" aria-label="Kembali" @click="router.back()" />
      </div>

      <section class="notification-list">
        <article
          v-for="item in notifikasi.items"
          :key="item.id"
          class="notification-row"
          :class="{ unread: !item.dibaca }"
          @click="notifikasi.buka(item)"
        >
          <q-avatar color="blue-1" text-color="primary" icon="notifications" />
          <div class="notification-copy">
            <strong>{{ item.title }}</strong>
            <span>{{ item.body }}</span>
            <small v-if="item.menu_label"><q-icon name="open_in_new" /> {{ item.menu_label }}</small>
            <time>{{ waktuNotifikasi(item.dibuat_pada) }}</time>
          </div>
          <span v-if="!item.dibaca" class="unread-dot" />
          <q-icon v-else-if="item.url" name="chevron_right" color="blue-grey-3" />
        </article>
        <div v-if="!notifikasi.items.length" class="empty-state">
          <q-icon name="notifications_none" size="42px" />
          <strong>Belum ada notifikasi.</strong>
          <span>Notifikasi baru akan tampil di halaman ini.</span>
        </div>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifikasiStore } from '@/stores/notifikasi'

const router = useRouter()
const notifikasi = useNotifikasiStore()

onMounted(() => {
  notifikasi.getData()
  notifikasi.tandaiSemuaDibaca()
})

function waktuNotifikasi(value) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
</script>

<style scoped>
.notification-page { min-height: calc(100vh - 58px); padding: 20px 14px 40px; background: #f5f7fb; }
.notification-content { max-width: 720px; margin: auto; }
.page-heading { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 17px; }
.page-heading span { color: #0753b6; font-size: 10px; font-weight: 800; letter-spacing: .7px; }
.page-heading h1 { margin: 4px 0 0; color: #173b67; font-size: 23px; line-height: 1.1; }
.page-heading p { margin: 5px 0 0; color: #71839a; font-size: 12px; }
.notification-list { overflow: hidden; border: 1px solid #e1e9f2; border-radius: 14px; background: #fff; box-shadow: 0 5px 18px #173b6e0a; }
.notification-row { position: relative; display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; gap: 11px; align-items: start; padding: 14px; border-top: 1px solid #edf1f5; cursor: pointer; }
.notification-row:first-child { border-top: 0; }
.notification-row.unread { background: #f5faff; }
.notification-copy { min-width: 0; }
.notification-copy strong, .notification-copy span, .notification-copy small, .notification-copy time { display: block; }
.notification-copy strong { color: #1d416d; font-size: 13px; }
.notification-copy span { margin-top: 3px; color: #58708e; font-size: 12px; line-height: 1.4; }
.notification-copy small { margin-top: 5px; color: #1976d2; font-size: 10px; font-weight: 700; }
.notification-copy time { margin-top: 5px; color: #8a9aac; font-size: 10px; }
.unread-dot { width: 8px; height: 8px; margin-top: 5px; border-radius: 999px; background: #1976d2; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 45px 20px; color: #8ba0b8; font-size: 12px; text-align: center; }
.empty-state strong { color: #43668d; font-size: 14px; }
</style>
