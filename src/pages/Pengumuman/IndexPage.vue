<template>
  <q-page class="announcement-page">
    <main class="announcement-content">
      <div class="page-heading">
        <div>
          <span>PUSAT INFORMASI</span>
          <h1>Pengumuman</h1>
          <p>Pengumuman yang dikirim untuk Anda.</p>
        </div>
        <q-btn
          round
          flat
          icon="arrow_back"
          color="primary"
          aria-label="Kembali"
          @click="router.back()"
        />
      </div>

      <section class="announcement-list">
        <article
          v-for="item in pengumuman"
          :key="item.id"
          class="announcement-row"
          @click="notifikasi.tandaiDibaca(item)"
        >
          <q-avatar color="blue-1" text-color="primary" icon="campaign" />
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.body }}</p>
            <time>{{ waktu(item.dibuat_pada) }}</time>
          </div>
          <span v-if="!item.dibaca" class="unread-dot" />
        </article>
        <div v-if="!pengumuman.length" class="empty-state">Belum ada pengumuman untuk Anda.</div>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifikasiStore } from '@/stores/notifikasi'

const router = useRouter()
const notifikasi = useNotifikasiStore()
const pengumuman = computed(() => notifikasi.items.filter((item) => item.type === 'announcement'))

onMounted(() => notifikasi.getData())

function waktu(value) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}
</script>

<style scoped>
.announcement-page {
  min-height: calc(100vh - 58px);
  padding: 20px 14px 40px;
  background: #f5f7fb;
}
.announcement-content {
  max-width: 720px;
  margin: auto;
}
.page-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 17px;
}
.page-heading span {
  color: #0753b6;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.7px;
}
.page-heading h1 {
  margin: 4px 0 0;
  color: #173b67;
  font-size: 23px;
}
.page-heading p {
  margin: 5px 0 0;
  color: #71839a;
  font-size: 12px;
}
.announcement-list {
  overflow: hidden;
  border: 1px solid #e1e9f2;
  border-radius: 14px;
  background: #fff;
}
.announcement-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 11px;
  padding: 14px;
  border-top: 1px solid #edf1f5;
  cursor: pointer;
}
.announcement-row:first-child {
  border-top: 0;
}
.announcement-row strong {
  color: #173b67;
  font-size: 13px;
}
.announcement-row p {
  margin: 4px 0;
  color: #526f91;
  font-size: 12px;
  line-height: 1.45;
}
.announcement-row time {
  color: #8293a7;
  font-size: 10px;
}
.unread-dot {
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 50%;
  background: #1976d2;
}
.empty-state {
  padding: 38px 20px;
  color: #8191a3;
  text-align: center;
  font-size: 12px;
}
</style>
