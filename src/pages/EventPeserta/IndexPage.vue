<template>
  <q-page class="participant-page">
    <main class="participant-content">
      <div class="page-heading">
        <div>
          <span>DATA PESERTA EVENT</span>
          <p>Daftar tim dan atlet yang telah melakukan pendaftaran.</p>
        </div>
        <q-btn round flat icon="arrow_back" color="primary" aria-label="Kembali" @click="router.push('/')" />
      </div>

      <section class="list-card">
        <q-input
          v-model="store.params.search"
          dense
          outlined
          placeholder="Cari nomor daftar, tim, atau event"
          @update:model-value="cari"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>

        <article v-for="item in store.items" :key="item.id" class="participant-card">
          <div class="participant-row">
            <q-avatar color="blue-1" text-color="primary" icon="groups" />
            <div class="participant-copy">
              <strong>{{ item.nama_tim }}</strong>
              <span class="registration-code">{{ item.kode_pendaftaran }}</span>
              <span>{{ item.event?.nama_event }}</span>
              <div v-for="detail in item.rincis" :key="detail.id" class="athletes">
                <span><q-icon name="person" /> {{ detail.nama_atlet_satu }} &amp; {{ detail.nama_atlet_dua }}</span>
              </div>
            </div>
            <q-badge color="blue-1" text-color="primary" :label="labelStatus(item.status_pendaftaran)" />
          </div>
          <q-btn
            flat
            no-caps
            class="detail-toggle"
            color="primary"
            :icon="expandedId === item.id ? 'expand_less' : 'expand_more'"
            :label="expandedId === item.id ? 'Tutup rincian atlet' : 'Lihat rincian atlet'"
            @click="toggleDetail(item.id)"
          />
          <q-slide-transition>
            <section v-show="expandedId === item.id" class="detail-panel">
              <div v-for="detail in item.rincis" :key="`detail-${detail.id}`" class="athlete-detail-grid">
                <div class="athlete-detail">
                  <div class="athlete-title"><q-icon name="looks_one" /> Atlet 1</div>
                  <strong>{{ detail.nama_atlet_satu }}</strong>
                  <span>NIK: {{ detail.nik_atlet_satu || '-' }}</span>
                  <span>Tanggal lahir: {{ formatTanggal(detail.tanggal_lahir_atlet_satu) }}</span>
                  <span>Umur: {{ hitungUmur(detail.tanggal_lahir_atlet_satu) }}</span>
                  <span>Jenis kelamin: {{ detail.jenis_kelamin_atlet_satu || '-' }}</span>
                  <span>No. WhatsApp: {{ detail.no_hp_atlet_satu || '-' }}</span>
                </div>
                <div class="athlete-detail">
                  <div class="athlete-title"><q-icon name="looks_two" /> Atlet 2</div>
                  <strong>{{ detail.nama_atlet_dua }}</strong>
                  <span>NIK: {{ detail.nik_atlet_dua || '-' }}</span>
                  <span>Tanggal lahir: {{ formatTanggal(detail.tanggal_lahir_atlet_dua) }}</span>
                  <span>Umur: {{ hitungUmur(detail.tanggal_lahir_atlet_dua) }}</span>
                  <span>Jenis kelamin: {{ detail.jenis_kelamin_atlet_dua || '-' }}</span>
                  <span>No. WhatsApp: {{ detail.no_hp_atlet_dua || '-' }}</span>
                </div>
              </div>
            </section>
          </q-slide-transition>
        </article>

        <q-infinite-scroll :offset="120" @load="loadMore">
          <template #loading>
            <div class="row justify-center q-pa-md"><q-spinner-dots color="primary" size="26px" /></div>
          </template>
        </q-infinite-scroll>
        <div v-if="!store.loading && !store.items.length" class="empty-state">Belum ada peserta event.</div>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePesertaEventStore } from '@/stores/peserta-event'

const router = useRouter()
const store = usePesertaEventStore()
let timer
const expandedId = ref(null)

onMounted(() => store.getData({ reset: true }))

function cari() {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => store.getData({ reset: true }), 350)
}

function labelStatus(status) {
  return String(status).toLowerCase() === 'menunggu' ? 'Terdaftar' : status
}

function toggleDetail(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatTanggal(tanggal) {
  if (!tanggal) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${tanggal}T00:00:00`))
}

function hitungUmur(tanggal) {
  if (!tanggal) return '-'

  const lahir = new Date(`${tanggal}T00:00:00`)
  const hariIni = new Date()
  let umur = hariIni.getFullYear() - lahir.getFullYear()
  const belumUlangTahun =
    hariIni.getMonth() < lahir.getMonth() ||
    (hariIni.getMonth() === lahir.getMonth() && hariIni.getDate() < lahir.getDate())

  if (belumUlangTahun) umur -= 1

  return `${umur} tahun`
}

async function loadMore(index, done) {
  await store.getData()
  done(store.hasMore)
}
</script>

<style scoped>
.participant-page {
  min-height: calc(100vh - 58px);
  padding: 20px 14px 40px;
  background: #f5f7fb;
}
.participant-content { max-width: 720px; margin: auto; }
.page-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 17px; }
.page-heading span { color: #0753b6; font-size: 11px; font-weight: 800; letter-spacing: 0.6px; }
.page-heading p { margin: 4px 0 0; color: #74859b; font-size: 13px; }
.list-card { overflow: hidden; border: 1px solid #e2eaf2; border-radius: 12px; background: #fff; box-shadow: 0 4px 18px #173b6e0a; }
.list-card > .q-input { margin: 13px; }
.participant-card { border-top: 1px solid #edf1f5; }
.participant-row { display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; gap: 11px; padding: 14px 14px 7px; }
.participant-copy { min-width: 0; }
.participant-copy strong, .participant-copy > span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.participant-copy strong { color: #213d63; font-size: 16px; }
.participant-copy > span { margin-top: 4px; color: #637b99; font-size: 12px; }
.participant-copy .registration-code { color: #0b5bbd; font-size: 11px; font-weight: 700; }
.athletes span { display: block; margin-top: 7px; color: #3b6188; font-size: 12px; }
.athletes .q-icon { font-size: 14px; }
.participant-row .q-badge { align-self: start; font-size: 10px; }
.detail-toggle { min-height: 34px; margin: 0 10px 8px 66px; font-size: 11px; font-weight: 700; }
.detail-panel { margin: 0 14px 14px 66px; padding: 12px; border: 1px solid #dbe9f8; border-radius: 10px; background: #f7fbff; }
.athlete-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.athlete-detail { display: flex; flex-direction: column; gap: 4px; padding: 11px; border-radius: 8px; background: #fff; color: #536f8f; font-size: 11px; }
.athlete-detail strong { margin: 2px 0; color: #174a81; font-size: 14px; }
.athlete-title { color: #0870d1; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.empty-state { padding: 25px; color: #8191a3; text-align: center; font-size: 12px; }
@media (max-width: 480px) {
  .participant-row { grid-template-columns: 38px minmax(0, 1fr); }
  .participant-row .q-badge { grid-column: 2; }
  .participant-row .q-avatar { width: 38px; height: 38px; }
  .detail-toggle { margin-left: 52px; }
  .detail-panel { margin-left: 52px; }
  .athlete-detail-grid { grid-template-columns: 1fr; }
}
</style>
