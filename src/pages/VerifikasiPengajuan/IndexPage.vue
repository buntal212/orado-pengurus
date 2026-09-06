<template>
  <q-page class="verification-page">
    <main class="verification-content">
      <div class="page-heading">
        <div><span>Verifikasi & Pengajuan</span><p>Periksa pendaftaran anggota dan club yang masih menunggu.</p></div>
        <q-btn round flat icon="arrow_back" color="primary" aria-label="Kembali" @click="router.push('/')" />
      </div>

      <section class="list-card">
        <div class="list-header"><div><strong>Anggota menunggu verifikasi</strong><span>{{ store.anggota.length }} anggota dimuat</span></div><q-icon name="person_add" /></div>
        <article v-for="anggota in store.anggota" :key="anggota.id" class="data-row">
          <q-avatar size="44px" color="blue-1" text-color="primary" icon="person" />
          <div class="copy"><strong>{{ anggota.name }}</strong><span>NIK: {{ anggota.nik }}</span><span>{{ anggota.email || '-' }}</span></div>
          <q-btn unelevated no-caps icon="verified" label="Verifikasi" color="primary" :loading="store.saving" @click="handleMemberVerification(anggota)" />
        </article>
        <q-infinite-scroll v-if="store.anggotaHasMore" :offset="150" @load="loadAnggota"><div class="row justify-center q-pa-md"><q-spinner-dots color="primary" size="28px" /></div></q-infinite-scroll>
        <div v-if="!store.loadingAnggota && !store.anggota.length" class="empty-state">Tidak ada anggota yang menunggu verifikasi.</div>
      </section>

      <section class="list-card q-mt-md">
        <div class="list-header"><div><strong>Club menunggu verifikasi</strong><span>{{ store.clubs.length }} club dimuat</span></div><q-icon name="groups" /></div>
        <article v-for="club in store.clubs" :key="club.id" class="data-row club-row">
          <q-avatar size="44px" color="blue-1" text-color="primary" icon="groups" />
          <div class="copy"><strong>{{ club.nama_club }}</strong><span>{{ club.kode_club }}</span><span>{{ club.kelurahan }}, {{ club.kecamatan }}</span></div>
          <div class="club-actions"><q-btn unelevated no-caps icon="verified" label="Verifikasi" color="primary" :loading="store.saving" @click="store.updateClub(club.id, 'verifikasi')" /><q-btn outline no-caps icon="close" label="Tolak" color="negative" :disable="store.saving" @click="store.updateClub(club.id, 'tolak')" /></div>
        </article>
        <q-infinite-scroll v-if="store.clubHasMore" :offset="150" @load="loadClub"><div class="row justify-center q-pa-md"><q-spinner-dots color="primary" size="28px" /></div></q-infinite-scroll>
        <div v-if="!store.loadingClub && !store.clubs.length" class="empty-state">Tidak ada club yang menunggu verifikasi.</div>
      </section>
    </main>

    <q-dialog v-model="memberDialog" persistent>
      <q-card class="member-dialog">
        <q-card-section class="dialog-heading"><div><strong>Verifikasi anggota</strong><span>{{ store.memberForm.name }}</span></div><q-btn round flat dense icon="close" aria-label="Tutup" @click="closeMemberDialog" /></q-card-section>
        <q-form @submit="verifyMember"><q-card-section><q-select v-model="store.memberForm.jabatan" outlined label="Jabatan" :options="store.jabatanOptions" /><p>Pilih jabatan sebelum anggota diverifikasi.</p></q-card-section><q-card-actions align="right"><q-btn flat no-caps label="Batal" color="grey-7" @click="closeMemberDialog" /><q-btn unelevated no-caps type="submit" label="Simpan & verifikasi" color="primary" :loading="store.saving" /></q-card-actions></q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVerifikasiStore } from '@/stores/verifikasi'

const router = useRouter()
const store = useVerifikasiStore()
const memberDialog = ref(false)

function loadAnggota(index, done) { store.getAnggota().finally(done) }
function loadClub(index, done) { store.getClub().finally(done) }
function openMemberDialog(anggota) { store.openMemberVerification(anggota); memberDialog.value = true }
function handleMemberVerification(anggota) {
  if (String(anggota.kelompok_jabatan) === '1') {
    openMemberDialog(anggota)
    return
  }
  store.verifyRegularMember(anggota)
}
function closeMemberDialog() { memberDialog.value = false; store.resetMemberForm() }
async function verifyMember() { if (await store.verifyMember()) memberDialog.value = false }

onMounted(() => store.getJabatanOptions())
</script>

<style scoped>
.verification-page { min-height: calc(100vh - 58px); padding: 20px 14px 40px; background: #f5f7fb; }.verification-content { max-width: 720px; margin: auto; }.page-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 17px; }.page-heading span { color: #0753b6; font-size: 13px; font-weight: 800; letter-spacing: .6px; }.page-heading p { margin: 5px 0 0; color: #74859b; font-size: 13px; line-height: 1.45; }.list-card { overflow: hidden; border: 1px solid #e1e8f1; border-radius: 15px; background: #fff; box-shadow: 0 4px 14px rgba(27,57,96,.05); }.list-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 14px; color: #1a3b65; }.list-header strong,.list-header span { display: block; }.list-header strong { font-size: 14px; }.list-header span { margin-top: 3px; color: #8291a4; font-size: 11px; }.data-row { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; gap: 11px; align-items: center; padding: 14px; border-top: 1px solid #edf1f5; }.copy { min-width: 0; }.copy strong,.copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.copy strong { color: #213d63; font-size: 16px; }.copy span { margin-top: 4px; color: #637b99; font-size: 13px; }.data-row > .q-btn,.club-actions .q-btn { min-height: 38px; padding: 0 12px; border-radius: 9px; font-size: 13px; font-weight: 700; }.club-row { align-items: start; }.club-actions { display: flex; grid-column: 1 / -1; justify-content: flex-end; gap: 8px; padding-top: 10px; border-top: 1px solid #edf1f5; }.empty-state { padding: 28px 14px; color: #8291a4; font-size: 13px; text-align: center; }.member-dialog { width: min(92vw, 390px); border-radius: 16px; }.dialog-heading { display: flex; align-items: flex-start; justify-content: space-between; }.dialog-heading strong,.dialog-heading span { display: block; }.dialog-heading strong { color: #143963; font-size: 17px; }.dialog-heading span,.member-dialog p { margin-top: 4px; color: #71839a; font-size: 13px; }.member-dialog p { line-height: 1.45; }
</style>
