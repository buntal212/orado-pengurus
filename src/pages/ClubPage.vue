<template>
  <q-page class="club-page">
    <main class="club-content">
      <div class="page-heading">
        <div><span>Data Club</span><p>Daftar club yang terdaftar di ORADO Kota Probolinggo.</p></div>
        <q-btn round flat icon="arrow_back" color="primary" aria-label="Kembali" @click="router.push('/')" />
      </div>

      <section class="list-card">
        <div class="list-header"><div><strong>Daftar club</strong><span>{{ store.items.length }} club dimuat</span></div><q-icon name="admin_panel_settings" /></div>
        <q-input v-model="store.params.search" dense borderless placeholder="Cari nama, kode, kecamatan, atau kelurahan" class="search-input" @update:model-value="searchData"><template #prepend><q-icon name="search" /></template></q-input>

        <article v-for="club in store.items" :key="club.id" class="club-row">
          <q-avatar size="48px" color="blue-1" text-color="primary" icon="groups" />
          <div class="club-copy">
            <strong>{{ club.nama_club }}</strong>
            <span class="club-code">{{ club.kode_club || '-' }}</span>
            <span><q-icon name="location_on" /> {{ club.kelurahan || '-' }}, {{ club.kecamatan || '-' }}</span>
            <span v-if="club.username"><q-icon name="person" /> {{ club.username }}</span>
          </div>
          <q-badge :color="statusColor(club.status)" :label="club.status || 'Belum ada status'" />
          <div v-if="isPending(club.status)" class="club-actions">
            <q-btn unelevated no-caps icon="verified" label="Verifikasi" color="primary" :loading="store.saving" @click="store.updateVerifikasi(club.id, 'verifikasi')" />
            <q-btn outline no-caps icon="close" label="Tolak" color="negative" :disable="store.saving" @click="store.updateVerifikasi(club.id, 'tolak')" />
          </div>
        </article>

        <q-infinite-scroll v-if="store.hasMore" :offset="150" @load="loadMore"><div class="row justify-center q-pa-md"><q-spinner-dots color="primary" size="28px" /></div></q-infinite-scroll>
        <div v-if="!store.loading && !store.items.length" class="empty-state">Belum ada data club.</div>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useClubStore } from '@/stores/master/club'

const router = useRouter()
const store = useClubStore()
let searchTimer

function loadMore(index, done) {
  store.getData().finally(done)
}

function searchData() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.getData({ reset: true }), 300)
}

function statusColor(status) {
  if (String(status).toLowerCase().includes('aktif')) return 'positive'
  if (String(status).toLowerCase().includes('menunggu')) return 'orange-8'
  return 'blue-grey-6'
}

function isPending(status) {
  return String(status).toLowerCase().includes('menunggu')
}
</script>

<style scoped>
.club-page { min-height: calc(100vh - 58px); padding: 20px 14px 40px; background: #f5f7fb; }.club-content { max-width: 720px; margin: auto; }.page-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 17px; }.page-heading span { color: #0753b6; font-size: 10px; font-weight: 800; letter-spacing: .6px; }.page-heading p { margin: 3px 0 0; color: #74859b; font-size: 11px; }.list-card { overflow: hidden; border: 1px solid #e1e8f1; border-radius: 15px; background: #fff; box-shadow: 0 4px 14px rgba(27,57,96,.05); }.list-header { display: flex; align-items: center; justify-content: space-between; padding: 14px; color: #1a3b65; }.list-header strong,.list-header span { display: block; }.list-header strong { font-size: 12px; }.list-header span { margin-top: 2px; color: #8291a4; font-size: 9px; }.search-input { margin: 0 12px 8px; padding: 7px 9px; border: 1px solid #e6edf4; border-radius: 9px; }.club-row { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; gap: 12px; align-items: start; padding: 15px 14px; border-top: 1px solid #edf1f5; }.club-copy { min-width: 0; padding-top: 2px; }.club-copy strong,.club-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.club-copy strong { color: #213d63; font-size: 15px; }.club-copy span { margin-top: 4px; color: #637b99; font-size: 12px; }.club-copy .club-code { color: #0b5bbd; font-size: 11px; font-weight: 700; }.club-copy .q-icon { margin-right: 2px; font-size: 13px; }.club-row .q-badge { margin-top: 4px; font-size: 10px; }.club-actions { display: flex; grid-column: 1 / -1; justify-content: flex-end; gap: 8px; padding-top: 11px; border-top: 1px solid #edf1f5; }.club-actions .q-btn { min-height: 37px; padding: 0 12px; border-radius: 9px; font-size: 12px; font-weight: 700; }.empty-state { padding: 26px 14px; color: #8291a4; font-size: 11px; text-align: center; }
</style>
