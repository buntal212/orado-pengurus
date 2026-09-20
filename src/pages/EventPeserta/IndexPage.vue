<template>
  <q-page class="participant-page">
    <main class="participant-content">
      <div class="page-heading">
        <div>
          <span>DATA PESERTA EVENT</span>
          <p>Daftar tim dan atlet yang telah melakukan pendaftaran.</p>
        </div>
        <div class="page-actions">
          <q-btn
            flat
            no-caps
            icon="picture_as_pdf"
            color="black"
            label="Cetak PDF"
            @click="cetakPdf"
          />
          <q-btn
            flat
            no-caps
            icon="table_view"
            color="black"
            label="Excel"
            :loading="exporting"
            @click="exportExcel"
          />
          <q-btn
            round
            flat
            icon="arrow_back"
            color="black"
            aria-label="Kembali"
            @click="router.push('/')"
          />
        </div>
      </div>

      <section class="list-card">
        <q-input
          v-model="store.params.search"
          dense
          outlined
          placeholder="Cari nomor daftar, tim, atlet, atau event"
          @update:model-value="cari"
        >
          <template #prepend><q-icon name="search" /></template>
          <template #append>
            <q-btn
              v-if="store.params.search"
              flat
              round
              dense
              icon="close"
              color="black"
              aria-label="Hapus pencarian"
              @click="hapusPencarian"
            />
          </template>
        </q-input>
        <q-select
          v-model="store.params.master_event_id"
          :options="store.eventOptions"
          option-value="id"
          option-label="nama_event"
          emit-value
          map-options
          clearable
          dense
          outlined
          label="Filter event"
          @update:model-value="cari"
        >
          <template #prepend><q-icon name="event" /></template>
        </q-select>

        <section class="participant-list-area">
          <q-virtual-scroll
            v-if="store.items.length"
            ref="participantList"
            :items="store.items"
            :virtual-scroll-item-size="200"
            :virtual-scroll-slice-size="15"
            class="participant-virtual-list"
            @virtual-scroll="loadMore"
          >
            <template #default="{ item, index }">
              <article :key="item.id" class="participant-card">
                <div class="participant-row">
                  <q-avatar color="blue-1" text-color="black">{{ index + 1 }}</q-avatar>
                  <div class="participant-copy">
                    <strong>{{ item.nama_tim }}</strong>
                    <span class="registration-code">{{ item.kode_pendaftaran }}</span>
                    <span>{{ item.event?.nama_event }}</span>
                    <div v-for="detail in item.rincis" :key="detail.id" class="athletes">
                      <span
                        ><q-icon name="person" /> {{ detail.nama_atlet_satu }} &amp;
                        {{ detail.nama_atlet_dua }}</span
                      >
                    </div>
                  </div>
                  <q-badge
                    color="blue-1"
                    text-color="black"
                    :label="labelStatus(item.status_pendaftaran)"
                  />
                </div>
                <q-btn
                  flat
                  no-caps
                  class="detail-toggle"
                  color="black"
                  :icon="expandedId === item.id ? 'expand_less' : 'expand_more'"
                  :label="expandedId === item.id ? 'Tutup rincian atlet' : 'Lihat rincian atlet'"
                  @click="toggleDetail(item.id)"
                />
                <q-btn
                  flat
                  no-caps
                  class="edit-button"
                  color="primary"
                  icon="edit"
                  label="Edit data peserta"
                  @click="editPeserta(item)"
                />
                <div class="attendance-actions">
                  <q-btn
                    v-if="!item.hadir_technical_meeting"
                    unelevated
                    no-caps
                    dense
                    color="deep-purple-2"
                    text-color="black"
                    icon="groups"
                    label="Hadir Technical Meeting"
                    :loading="store.sedangMenandaiKehadiran(item.id, 'technical_meeting')"
                    @click="store.tandaiKehadiran(item.id, 'technical_meeting')"
                  />
                  <q-badge v-else color="deep-purple-2" text-color="black" class="attendance-badge">
                    <q-icon name="check_circle" size="15px" class="q-mr-xs" /> Hadir Technical
                    Meeting
                  </q-badge>
                  <q-btn
                    v-if="!item.hadir_registrasi_ulang"
                    unelevated
                    no-caps
                    dense
                    color="orange-2"
                    text-color="black"
                    icon="fact_check"
                    label="Hadir Registrasi Ulang"
                    :loading="store.sedangMenandaiKehadiran(item.id, 'registrasi_ulang')"
                    @click="store.tandaiKehadiran(item.id, 'registrasi_ulang')"
                  />
                  <q-badge v-else color="orange-2" text-color="black" class="attendance-badge">
                    <q-icon name="check_circle" size="15px" class="q-mr-xs" /> Hadir Registrasi
                    Ulang
                  </q-badge>
                </div>
                <q-slide-transition>
                  <section v-show="expandedId === item.id" class="detail-panel">
                    <div
                      v-for="detail in item.rincis"
                      :key="`detail-${detail.id}`"
                      class="athlete-detail-grid"
                    >
                      <div class="athlete-detail">
                        <div class="athlete-title"><q-icon name="looks_one" /> Atlet 1</div>
                        <strong>{{ detail.nama_atlet_satu }}</strong>
                        <span>NIK: {{ detail.nik_atlet_satu || '-' }}</span>
                        <span
                          >Tanggal lahir: {{ formatTanggal(detail.tanggal_lahir_atlet_satu) }}</span
                        >
                        <span>Umur: {{ hitungUmur(detail.tanggal_lahir_atlet_satu) }}</span>
                        <span>Jenis kelamin: {{ detail.jenis_kelamin_atlet_satu || '-' }}</span>
                        <span>No. WhatsApp: {{ detail.no_hp_atlet_satu || '-' }}</span>
                      </div>
                      <div class="athlete-detail">
                        <div class="athlete-title"><q-icon name="looks_two" /> Atlet 2</div>
                        <strong>{{ detail.nama_atlet_dua }}</strong>
                        <span>NIK: {{ detail.nik_atlet_dua || '-' }}</span>
                        <span
                          >Tanggal lahir: {{ formatTanggal(detail.tanggal_lahir_atlet_dua) }}</span
                        >
                        <span>Umur: {{ hitungUmur(detail.tanggal_lahir_atlet_dua) }}</span>
                        <span>Jenis kelamin: {{ detail.jenis_kelamin_atlet_dua || '-' }}</span>
                        <span>No. WhatsApp: {{ detail.no_hp_atlet_dua || '-' }}</span>
                      </div>
                    </div>
                  </section>
                </q-slide-transition>
              </article>
            </template>
          </q-virtual-scroll>

          <div v-if="!store.loading && !store.items.length" class="empty-state">
            Belum ada peserta event.
          </div>

          <q-inner-loading :showing="store.loading" color="primary">
            <q-spinner-dots size="34px" />
            <span class="loading-label">Memuat data peserta...</span>
          </q-inner-loading>
        </section>
      </section>
    </main>

    <q-dialog v-model="dialogEdit" @hide="store.resetForm()">
      <FormPeserta @close="dialogEdit = false" @saved="dialogEdit = false" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { utils, writeFile } from 'xlsx'
import { api } from '@/boot/axios'
import { usePesertaEventStore } from '@/stores/peserta-event'
import FormPeserta from './comp/FormPeserta.vue'

const router = useRouter()
const route = useRoute()
const store = usePesertaEventStore()
let timer
const expandedId = ref(null)
const participantList = ref(null)
const exporting = ref(false)
const dialogEdit = ref(false)
const searchDariNotifikasi = String(route.query.search || '').trim()

// Isi filter lebih awal agar request pertama langsung memakai nomor registrasi
// dari notifikasi.
store.params.search = searchDariNotifikasi

onMounted(async () => {
  await store.getEventOptions()
  store.pilihEventAktif()
  await store.getData({ reset: true })

  if (searchDariNotifikasi && store.items.length === 1) {
    expandedId.value = store.items[0].id
    await nextTick()
    participantList.value?.refresh()
  }
})

function cari() {
  window.clearTimeout(timer)
  timer = window.setTimeout(async () => {
    expandedId.value = null
    await store.getData({ reset: true })
  }, 350)
}

async function hapusPencarian() {
  window.clearTimeout(timer)
  store.params.search = ''
  expandedId.value = null
  await store.getData({ reset: true })
}

function cetakPdf() {
  router.push({
    path: '/event-peserta/laporan',
    query: store.params.master_event_id ? { master_event_id: store.params.master_event_id } : {},
  })
}

function editPeserta(item) {
  store.editData(item)
  dialogEdit.value = true
}

async function exportExcel() {
  exporting.value = true

  try {
    const response = await api.get('/v3/event/peserta/cetak', {
      params: store.params.master_event_id ? { master_event_id: store.params.master_event_id } : {},
    })
    const peserta = response.data?.data ?? []
    const namaEvent = response.data?.meta?.event?.nama_event || 'Semua Event'
    const rows = peserta.flatMap((tim, index) =>
      (tim.rincis || []).flatMap((detail) => [
        buatBarisExcel(index + 1, tim, detail, 1),
        buatBarisExcel(index + 1, tim, detail, 2),
      ]),
    )

    if (!rows.length) {
      Notify.create({ type: 'warning', message: 'Belum ada peserta event untuk diekspor.' })
      return
    }

    const worksheet = utils.json_to_sheet(rows)
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 24 },
      { wch: 18 },
      { wch: 28 },
      { wch: 10 },
      { wch: 28 },
      { wch: 22 },
      { wch: 16 },
      { wch: 10 },
      { wch: 16 },
      { wch: 18 },
      { wch: 14 },
    ]
    worksheet['!autofilter'] = { ref: `A1:L${rows.length + 1}` }

    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Peserta Event')
    const namaFile = `peserta-event-${slugFile(namaEvent)}.xlsx`
    writeFile(workbook, namaFile, { compression: true })

    Notify.create({ type: 'positive', message: 'File Excel berhasil dibuat.' })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'File Excel tidak dapat dibuat.',
    })
  } finally {
    exporting.value = false
  }
}

function buatBarisExcel(nomor, tim, detail, nomorAtlet) {
  const suffix = nomorAtlet === 1 ? 'satu' : 'dua'
  const tanggalLahir = detail[`tanggal_lahir_atlet_${suffix}`]

  return {
    No: nomor,
    'Nama Club': tim.nama_tim || '-',
    'Nomor Daftar': tim.kode_pendaftaran || '-',
    Event: tim.event?.nama_event || '-',
    Atlet: `Atlet ${nomorAtlet}`,
    'Nama Atlet': detail[`nama_atlet_${suffix}`] || '-',
    NIK: detail[`nik_atlet_${suffix}`] || '-',
    'Tanggal Lahir': formatTanggal(tanggalLahir),
    Umur: hitungUmur(tanggalLahir),
    'Jenis Kelamin': detail[`jenis_kelamin_atlet_${suffix}`] || '-',
    'No. WhatsApp': detail[`no_hp_atlet_${suffix}`] || '-',
    Status: labelStatus(tim.status_pendaftaran),
  }
}

function slugFile(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function labelStatus(status) {
  return String(status).toLowerCase() === 'menunggu' ? 'Terdaftar' : status
}

async function toggleDetail(id) {
  expandedId.value = expandedId.value === id ? null : id
  await nextTick()
  participantList.value?.refresh()
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

function loadMore({ index, to }) {
  if (index > 0 && to >= store.items.length - 3) void store.getData()
}
</script>

<style scoped>
.participant-page {
  min-height: calc(100vh - 58px);
  padding: 20px 14px 40px;
  background: #f5f7fb;
}
.participant-content {
  max-width: 720px;
  margin: auto;
}
.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 17px;
}
.page-actions {
  display: flex;
  align-items: center;
  gap: 3px;
}
.page-heading span {
  color: #000;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
}
.page-heading p {
  margin: 4px 0 0;
  color: #000;
  font-size: 13px;
}
.list-card {
  overflow: hidden;
  border: 1px solid #e2eaf2;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 18px #173b6e0a;
}
.list-card > .q-input {
  margin: 13px;
}
.list-card > .q-select {
  margin: 0 13px 13px;
}
.list-card :deep(.q-field__label),
.list-card :deep(.q-field__native),
.list-card :deep(.q-field__input) {
  color: #000;
}
.participant-card {
  border-top: 1px solid #edf1f5;
}
.participant-list-area {
  position: relative;
  min-height: 160px;
}
.loading-label {
  margin-top: 8px;
  color: #000;
  font-size: 12px;
}
.participant-virtual-list {
  height: min(65vh, 680px);
}
.participant-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 11px;
  padding: 14px 14px 7px;
}
.participant-copy {
  min-width: 0;
}
.participant-copy strong,
.participant-copy > span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.participant-copy strong {
  color: #000;
  font-size: 16px;
}
.participant-copy > span {
  margin-top: 4px;
  color: #000;
  font-size: 12px;
}
.participant-copy .registration-code {
  color: #000;
  font-size: 11px;
  font-weight: 700;
}
.athletes span {
  display: block;
  margin-top: 7px;
  color: #000;
  font-size: 12px;
}
.athletes .q-icon {
  font-size: 14px;
}
.participant-row .q-badge {
  align-self: start;
  font-size: 10px;
}
.detail-toggle {
  min-height: 34px;
  margin: 0 10px 8px 66px;
  font-size: 11px;
  font-weight: 700;
}
.edit-button {
  min-height: 34px;
  margin: 0 10px 8px 66px;
  font-size: 11px;
  font-weight: 700;
}
.attendance-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 0 10px 10px 66px;
}
.attendance-actions .q-btn,
.attendance-badge {
  min-height: 28px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
}
.attendance-badge {
  display: inline-flex;
  align-items: center;
}
.detail-panel {
  margin: 0 14px 14px 66px;
  padding: 12px;
  border: 1px solid #dbe9f8;
  border-radius: 10px;
  background: #f7fbff;
}
.athlete-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.athlete-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 11px;
  border-radius: 8px;
  background: #fff;
  color: #000;
  font-size: 11px;
}
.athlete-detail strong {
  margin: 2px 0;
  color: #000;
  font-size: 14px;
}
.athlete-title {
  color: #000;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}
.empty-state {
  padding: 25px;
  color: #000;
  text-align: center;
  font-size: 12px;
}
@media (max-width: 480px) {
  .participant-row {
    grid-template-columns: 38px minmax(0, 1fr);
  }
  .participant-row .q-badge {
    grid-column: 2;
  }
  .participant-row .q-avatar {
    width: 38px;
    height: 38px;
  }
  .detail-toggle {
    margin-left: 52px;
  }
  .edit-button {
    margin-left: 52px;
  }
  .attendance-actions {
    margin-left: 52px;
  }
  .detail-panel {
    margin-left: 52px;
  }
  .athlete-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
