<template>
  <q-page class="anggota-page">
    <main class="anggota-content">
      <div class="page-heading">
        <div><span>Data Anggota</span><p>Kelola data anggota ORADO.</p></div>
        <q-btn round flat icon="arrow_back" color="primary" aria-label="Kembali" @click="router.push('/')" />
      </div>

      <section class="list-card">
        <div class="list-header"><div><strong>Daftar anggota</strong><span>{{ store.items.length }} anggota dimuat</span></div><q-icon name="groups" /></div>
        <q-input v-model="store.params.search" dense borderless placeholder="Cari nama, NIK, atau username" class="search-input" @update:model-value="searchData"><template #prepend><q-icon name="search" /></template></q-input>
        <div v-for="anggota in store.items" :key="anggota.id" class="anggota-row">
          <q-avatar size="48px" color="blue-1" text-color="primary" icon="person" />
          <div class="anggota-copy"><strong>{{ anggota.name }}</strong><span>NIK: {{ anggota.nik }}</span><span>HP: {{ anggota.no_hp || '-' }}</span><span>{{ anggota.email }}</span><span class="jabatan-info">Jabatan: {{ anggota.jabatan || 'Belum ada jabatan' }}</span></div>
          <div class="anggota-actions">
            <q-badge color="primary" :label="kelompokJabatanLabel(anggota.kelompok_jabatan)" />
            <q-btn flat dense no-caps icon="visibility" label="Detail" color="blue-grey-7" aria-label="Lihat detail anggota" @click="openDetailDialog(anggota)" />
          </div>
        </div>
        <q-infinite-scroll v-if="store.hasMore" :offset="150" @load="loadMore"><div class="row justify-center q-pa-md"><q-spinner-dots color="primary" size="28px" /></div></q-infinite-scroll>
        <div v-if="!store.loading && !store.items.length" class="empty-state">Belum ada data anggota.</div>
      </section>
    </main>

    <q-dialog v-model="detailDialog">
      <q-card class="detail-dialog">
        <q-card-section class="dialog-heading">
          <div><span>Detail anggota</span><p>Informasi keanggotaan ORADO</p></div>
          <q-btn round flat dense icon="close" color="grey-7" aria-label="Tutup" @click="detailDialog = false" />
        </q-card-section>
        <q-card-section v-if="selectedAnggota" class="detail-content">
          <q-avatar size="58px" color="blue-1" text-color="primary" icon="person" />
          <strong>{{ selectedAnggota.name }}</strong>
          <q-badge :color="selectedAnggota.flag === 2 ? 'positive' : 'orange-8'" :label="selectedAnggota.flag === 2 ? 'Terverifikasi' : 'Menunggu verifikasi'" />
          <div class="detail-grid">
            <div><span>NIK</span><p>{{ selectedAnggota.nik || '-' }}</p></div>
            <div><span>No. HP</span><p>{{ selectedAnggota.no_hp || '-' }}</p></div>
            <div><span>Email</span><p>{{ selectedAnggota.email || '-' }}</p></div>
            <div><span>Username</span><p>{{ selectedAnggota.username || '-' }}</p></div>
            <div class="detail-full"><span>Kelompok jabatan</span><p>{{ kelompokJabatanLabel(selectedAnggota.kelompok_jabatan) }}</p></div>
            <div class="detail-full"><span>Jabatan</span><p>{{ selectedAnggota.jabatan || 'Belum ada jabatan' }}</p></div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md"><q-btn flat no-caps label="Tutup" color="primary" @click="detailDialog = false" /></q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAnggotaStore } from '@/stores/master/anggota'

const router = useRouter()
const store = useAnggotaStore()
const detailDialog = ref(false)
const selectedAnggota = ref(null)
let searchTimer

function loadMore(index, done) {
  store.getData().finally(done)
}

function searchData() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.getData({ reset: true }), 300)
}

function openDetailDialog(anggota) {
  selectedAnggota.value = anggota
  detailDialog.value = true
}

function kelompokJabatanLabel(kelompokJabatan) {
  if (String(kelompokJabatan) === '1') return 'Anggota Kehormatan'
  if (String(kelompokJabatan) === '2') return 'Anggota Biasa'
  return 'Belum ditentukan'
}

</script>

<style scoped>
.anggota-page { min-height: calc(100vh - 58px); padding: 20px 14px 40px; background: #f5f7fb; }.anggota-content { max-width: 720px; margin: auto; }.page-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 17px; }.page-heading span { color: #0753b6; font-size: 10px; font-weight: 800; letter-spacing: .6px; }.page-heading p { margin: 3px 0 0; color: #74859b; font-size: 11px; }
.list-card { overflow: hidden; border: 1px solid #e1e8f1; border-radius: 15px; background: #fff; box-shadow: 0 4px 14px rgba(27,57,96,.05); }.list-header { display: flex; align-items: center; justify-content: space-between; padding: 14px; color: #1a3b65; }.list-header strong,.list-header span { display: block; }.list-header strong { font-size: 12px; }.list-header span { margin-top: 2px; color: #8291a4; font-size: 9px; }.search-input { margin: 0 12px 8px; padding: 7px 9px; border: 1px solid #e6edf4; border-radius: 9px; }.anggota-row { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 12px; padding: 15px 14px; border-top: 1px solid #edf1f5; }.anggota-copy { min-width: 0; padding-top: 2px; }.anggota-copy strong,.anggota-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.anggota-copy strong { color: #213d63; font-size: 15px; }.anggota-copy span { margin-top: 4px; color: #637b99; font-size: 12px; }.anggota-copy .jabatan-info { color: #0b5bbd; font-weight: 700; }.anggota-actions { display: flex; grid-column: 1 / -1; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 7px; padding-top: 12px; border-top: 1px solid #edf1f5; }.anggota-actions .q-badge { margin-right: auto; font-size: 11px; }.anggota-actions .q-btn { min-height: 38px; padding: 0 11px; border: 1px solid currentColor; border-radius: 9px; font-size: 12px; }.empty-state { padding: 26px 14px; color: #8291a4; font-size: 11px; text-align: center; }.verification-dialog,.detail-dialog { width: min(92vw, 390px); border-radius: 16px; }.dialog-heading { display: flex; align-items: flex-start; justify-content: space-between; }.dialog-heading span { color: #143963; font-size: 15px; font-weight: 800; }.dialog-heading p { margin: 3px 0 0; color: #71839a; font-size: 11px; }.dialog-info { margin: 12px 0 0; color: #647c99; font-size: 11px; line-height: 1.45; }.detail-content { display: flex; flex-direction: column; align-items: center; gap: 8px; }.detail-content > strong { color: #143963; font-size: 16px; }.detail-grid { display: grid; width: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 8px; }.detail-grid div { padding: 9px; border-radius: 10px; background: #f5f8fc; }.detail-grid span { color: #72839a; font-size: 9px; }.detail-grid p { margin: 3px 0 0; overflow: hidden; color: #1d3e69; font-size: 11px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }.detail-grid .detail-full { grid-column: 1 / -1; }
</style>
