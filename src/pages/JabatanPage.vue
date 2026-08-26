<template>
  <q-page class="jabatan-page">
    <main class="jabatan-content">
      <div class="page-heading">
        <div><span>Data Jabatan</span><p>Kelola struktur jabatan pengurus ORADO.</p></div>
        <q-btn round flat icon="arrow_back" color="primary" aria-label="Kembali" @click="router.push('/')" />
      </div>

      <section class="form-card">
        <div class="card-title"><q-icon name="badge" /> <span>{{ store.form.id ? 'Edit jabatan' : 'Tambah jabatan' }}</span></div>
        <q-form class="jabatan-form" @submit="store.saveData">
          <q-input v-model.trim="store.form.nama" outlined dense label="Nama jabatan" />
          <div class="form-actions">
            <q-btn v-if="store.form.id" flat no-caps label="Batal" color="grey-7" @click="store.resetForm" />
            <q-btn unelevated no-caps color="primary" type="submit" :loading="store.saving" :label="store.form.id ? 'Simpan perubahan' : 'Tambah jabatan'" />
          </div>
        </q-form>
      </section>

      <section class="list-card">
        <div class="list-header"><div><strong>Daftar jabatan</strong><span>{{ store.items.length }} jabatan dimuat</span></div><q-icon name="format_list_bulleted" /></div>
        <div v-for="position in store.items" :key="position.id" class="position-row">
          <span class="position-icon"><q-icon name="badge" /></span>
          <div class="position-copy"><strong>{{ position.nama }}</strong></div>
          <q-btn flat round dense icon="edit" color="primary" aria-label="Edit" @click="store.editData(position)" />
          <q-btn flat round dense icon="delete_outline" color="negative" aria-label="Hapus" @click="store.deleteData(position.id)" />
        </div>
        <q-infinite-scroll v-if="store.hasMore" :offset="150" @load="loadMore"><div class="row justify-center q-pa-md"><q-spinner-dots color="primary" size="28px" /></div></q-infinite-scroll>
        <div v-if="!store.loading && !store.items.length" class="empty-state">Belum ada data jabatan.</div>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useJabatanStore } from '@/stores/master/jabatan'

const router = useRouter()
const store = useJabatanStore()

function loadMore(index, done) {
  store.getData().finally(done)
}

</script>

<style scoped>
.jabatan-page { min-height: calc(100vh - 58px); padding: 20px 14px 40px; background: #f5f7fb; }.jabatan-content { max-width: 720px; margin: auto; }.page-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 17px; }.page-heading span { color: #0753b6; font-size: 10px; font-weight: 800; letter-spacing: .6px; }.page-heading p { margin: 3px 0 0; color: #74859b; font-size: 11px; }
.form-card,.list-card { border: 1px solid #e1e8f1; border-radius: 15px; background: #fff; box-shadow: 0 4px 14px rgba(27,57,96,.05); }.form-card { padding: 15px; }.card-title { display: flex; align-items: center; gap: 7px; margin-bottom: 14px; color: #1d3e69; font-size: 12px; font-weight: 700; }.jabatan-form { display: grid; gap: 10px; }.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 2px; }
.list-card { margin-top: 15px; overflow: hidden; }.list-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid #eaf0f5; color: #1a3b65; }.list-header strong,.list-header span { display: block; }.list-header strong { font-size: 15px; }.list-header span { margin-top: 3px; color: #8291a4; font-size: 11px; }.position-row { display: flex; align-items: center; gap: 11px; padding: 14px; border-bottom: 1px solid #edf1f5; }.position-row:last-child { border-bottom: 0; }.position-icon { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; border-radius: 10px; color: #0753b6; background: #edf4ff; }.position-icon .q-icon { font-size: 20px; }.position-copy { min-width: 0; flex: 1; }.position-copy strong { display: block; overflow: hidden; color: #213d63; font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }.empty-state { padding: 26px 14px; color: #8291a4; font-size: 12px; text-align: center; }
</style>
