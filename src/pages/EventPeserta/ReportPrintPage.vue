<template>
  <q-page class="report-page">
    <div class="print-toolbar">
      <q-btn flat no-caps icon="arrow_back" label="Kembali" @click="router.back()" />
      <q-btn color="primary" no-caps icon="print" label="Cetak Laporan" @click="cetak" />
    </div>

    <main class="report-sheet">
      <img class="report-watermark" src="@/assets/orado/logo-white.svg" alt="" aria-hidden="true" />
      <div v-if="loading" class="report-status">
        <q-spinner-dots color="primary" size="30px" /> Memuat laporan peserta...
      </div>
      <template v-else>
        <OradoReportHeader />
        <section class="report-heading">
          <div class="report-date">Dicetak: {{ tanggalCetak }}</div>
          <header class="report-title">
            <h1>Laporan Peserta Event</h1>
            <p>&quot;{{ namaEvent }}&quot;</p>
          </header>
        </section>

        <section class="report-info">
          <div>
            <span>Total tim</span>
            <strong>{{ participants.length }}</strong>
          </div>
          <div>
            <span>Total atlet</span>
            <strong>{{ rows.length }}</strong>
          </div>
          <div>
            <span>Total hadir technical meeting</span>
            <strong>{{ totalHadirTechnicalMeeting }}</strong>
          </div>
          <div>
            <span>Total hadir registrasi ulang</span>
            <strong>{{ totalHadirRegistrasiUlang }}</strong>
          </div>
        </section>

        <p v-if="!rows.length" class="report-empty">Belum ada peserta event untuk dicetak.</p>
        <table v-else class="report-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nomor Daftar</th>
              <th>Nama Tim</th>
              <th>Nama Atlet</th>
              <th>NIK</th>
              <th>Tanggal Lahir</th>
              <th>Jenis Kelamin</th>
              <th>No. WhatsApp</th>
              <th>Status</th>
              <th>Technical Meeting</th>
              <th>Registrasi Ulang</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.id">
              <td>{{ index + 1 }}</td>
              <td>{{ row.kodePendaftaran }}</td>
              <td>{{ row.namaTim }}</td>
              <td>{{ row.nama }}</td>
              <td>{{ row.nik }}</td>
              <td>{{ formatTanggal(row.tanggalLahir) }}</td>
              <td>{{ row.jenisKelamin }}</td>
              <td>{{ row.noHp }}</td>
              <td>{{ labelStatus(row.status) }}</td>
              <td>{{ labelKehadiran(row.hadirTechnicalMeeting) }}</td>
              <td>{{ labelKehadiran(row.hadirRegistrasiUlang) }}</td>
            </tr>
          </tbody>
        </table>

        <footer class="report-footer">Laporan peserta event ORADO Kota Probolinggo</footer>
      </template>
    </main>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'
import OradoReportHeader from '@/components/OradoReportHeader.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const participants = ref([])
const event = ref(null)
const eventId = Number(route.query.master_event_id) || null

const rows = computed(() =>
  participants.value
    .flatMap((tim) =>
      (tim.rincis || []).flatMap((detail) => [
        buatBaris(tim, detail, 1),
        buatBaris(tim, detail, 2),
      ]),
    )
    .filter((atlet) => atlet.adaData),
)
const namaEvent = computed(() => event.value?.nama_event || 'Semua Event')
const totalHadirTechnicalMeeting = computed(
  () => participants.value.filter((tim) => tim.hadir_technical_meeting).length,
)
const totalHadirRegistrasiUlang = computed(
  () => participants.value.filter((tim) => tim.hadir_registrasi_ulang).length,
)
const tanggalCetak = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date())

onMounted(loadData)

async function loadData() {
  loading.value = true
  try {
    const response = await api.get('/v3/event/peserta/cetak', {
      params: eventId ? { master_event_id: eventId } : {},
    })
    participants.value = response.data?.data ?? []
    event.value = response.data?.meta?.event ?? null
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Data peserta untuk cetak tidak dapat dimuat.',
    })
  } finally {
    loading.value = false
  }
}

function buatBaris(tim, detail, nomorAtlet) {
  const suffix = nomorAtlet === 1 ? 'satu' : 'dua'
  return {
    id: `${detail.id}-${nomorAtlet}`,
    kodePendaftaran: tim.kode_pendaftaran || '-',
    namaTim: tim.nama_tim || '-',
    nama: detail[`nama_atlet_${suffix}`] || '-',
    nik: detail[`nik_atlet_${suffix}`] || '-',
    tanggalLahir: detail[`tanggal_lahir_atlet_${suffix}`],
    jenisKelamin: detail[`jenis_kelamin_atlet_${suffix}`] || '-',
    noHp: detail[`no_hp_atlet_${suffix}`] || '-',
    status: tim.status_pendaftaran,
    hadirTechnicalMeeting: tim.hadir_technical_meeting,
    hadirRegistrasiUlang: tim.hadir_registrasi_ulang,
    adaData: Boolean(detail[`nama_atlet_${suffix}`] || detail[`nik_atlet_${suffix}`]),
  }
}

function formatTanggal(tanggal) {
  if (!tanggal) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${tanggal}T00:00:00`))
}

function labelStatus(status) {
  return String(status).toLowerCase() === 'menunggu' ? 'Terdaftar' : status || '-'
}

function labelKehadiran(hadir) {
  return hadir ? 'Hadir' : 'Belum Hadir'
}

function cetak() {
  window.print()
}
</script>

<style scoped>
.report-page {
  min-height: calc(100vh - 58px);
  padding: 20px;
  background: #edf2f6;
}
.print-toolbar {
  display: flex;
  width: min(1120px, 100%);
  justify-content: space-between;
  margin: 0 auto 14px;
}
.report-sheet {
  position: relative;
  isolation: isolate;
  width: min(1120px, 100%);
  min-height: 300px;
  margin: auto;
  padding: 28px;
  background: #fff;
  box-shadow: 0 3px 18px rgba(17, 47, 82, 0.12);
}
.report-watermark {
  position: fixed;
  z-index: 0;
  top: 50%;
  left: 50%;
  width: 290px;
  height: 290px;
  opacity: 0.06;
  pointer-events: none;
  transform: translate(-50%, -50%);
  filter: brightness(0);
}
.report-sheet > :not(.report-watermark) {
  position: relative;
  z-index: 1;
}
.report-status,
.report-empty {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #000;
}
.report-heading {
  position: relative;
  min-height: 56px;
  margin-top: 8px;
}
.report-title {
  width: 100%;
  text-align: center;
}
.report-title h1 {
  margin: 0;
  color: #000;
  font-size: 21px;
  line-height: 1.1;
}
.report-title p {
  margin: 5px 0 0;
  color: #000;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.1;
}
.report-date {
  position: absolute;
  top: 0;
  right: 0;
  color: #000;
  font-size: 11px;
  text-align: right;
}
.report-info {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0;
}
.report-info div {
  padding: 10px 12px;
  border: 1px solid #dce7f4;
  border-radius: 6px;
  background: #f7fbff;
}
.report-info span,
.report-info strong {
  display: block;
}
.report-info span {
  color: #000;
  font-size: 10px;
  text-transform: uppercase;
}
.report-info strong {
  margin-top: 3px;
  color: #000;
  font-size: 13px;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}
.report-table th {
  padding: 9px 7px;
  background: #e8e8e8;
  color: #000;
  font-size: 9px;
  text-align: left;
  text-transform: uppercase;
}
.report-table td {
  padding: 8px 7px;
  border-bottom: 1px solid #dfe7f0;
  color: #000;
  vertical-align: top;
}
.report-table tbody tr:nth-child(even) {
  background: #f7faff;
}
.report-table th:first-child,
.report-table td:first-child {
  width: 30px;
  text-align: center;
}
.report-footer {
  margin-top: 18px;
  color: #000;
  font-size: 10px;
  text-align: right;
}
@media (max-width: 640px) {
  .report-page {
    padding: 12px;
  }
  .report-sheet {
    padding: 16px;
    overflow-x: auto;
  }
  .report-info {
    grid-template-columns: 1fr;
  }
  .report-date {
    display: none;
  }
  .report-table {
    min-width: 850px;
  }
}
@media print {
  @page {
    size: A4 landscape;
    margin: 10mm;
  }
  :global(.app-header),
  :global(.bottom-nav),
  .print-toolbar {
    display: none !important;
  }
  :global(.q-page-container) {
    padding: 0 !important;
  }
  .report-page,
  .report-sheet {
    min-height: 0;
    padding: 0;
    background: #fff;
    box-shadow: none;
  }
  .report-sheet {
    width: 100%;
  }
  .report-watermark {
    width: 235px;
    height: 235px;
  }
  .report-table {
    font-size: 10px;
  }
  .report-table th {
    font-size: 9px;
  }
  .report-table th,
  .report-table td {
    padding: 6px 4px;
  }
  .report-table thead {
    display: table-header-group;
  }
  .report-table tr {
    break-inside: avoid;
  }
}
</style>
