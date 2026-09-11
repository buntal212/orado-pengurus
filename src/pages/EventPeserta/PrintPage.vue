<template>
  <q-page class="print-page">
    <div class="print-toolbar">
      <q-btn flat no-caps icon="arrow_back" label="Kembali" @click="router.back()" />
      <q-btn
        color="primary"
        no-caps
        icon="picture_as_pdf"
        label="Cetak / Simpan PDF"
        @click="cetak"
      />
    </div>

    <main class="print-sheet">
      <OradoReportHeader />
      <header class="report-header">
        <h1>Daftar Peserta Event ORADO Kota Probolinggo</h1>
        <span>Dicetak: {{ tanggalCetak }}</span>
        <p>{{ event?.nama_event || 'Semua Event' }}</p>
      </header>

      <div v-if="loading" class="report-status">
        <q-spinner-dots color="primary" size="30px" /> Memuat data peserta...
      </div>
      <div v-else-if="!reportGroups.length" class="report-status">
        Belum ada peserta untuk dicetak.
      </div>
      <table v-else class="report-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Data Atlet</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(group, groupIndex) in reportGroups" :key="group.id">
            <tr v-for="(atlet, atletIndex) in group.atlets" :key="atlet.id">
              <td v-if="atletIndex === 0" :rowspan="group.atlets.length">{{ groupIndex + 1 }}</td>
              <td class="athlete-record">
                <div v-if="atletIndex === 0" class="team-info">
                  <strong>{{ group.nama_tim || '-' }}</strong>
                  <span>Nomor daftar: {{ group.kode_pendaftaran || '-' }}</span>
                </div>
                <div class="athlete-name">
                  <span>{{ atlet.label }}</span>
                  <strong>{{ atlet.nama || '-' }}</strong>
                </div>
                <div class="athlete-data">
                  <span>NIK: {{ atlet.nik || '-' }}</span>
                  <span>Lahir: {{ formatTanggal(atlet.tanggal_lahir) }}</span>
                  <span>Umur: {{ hitungUmur(atlet.tanggal_lahir) }}</span>
                  <span>JK: {{ atlet.jenis_kelamin || '-' }}</span>
                  <span>HP: {{ atlet.no_hp || '-' }}</span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
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

const reportGroups = computed(() =>
  participants.value
    .map((participant) => ({
      ...participant,
      atlets: (participant.rincis || []).flatMap((rinci) => [
        {
          id: `${rinci.id}-1`,
          label: 'Atlet 1',
          nik: rinci.nik_atlet_satu,
          nama: rinci.nama_atlet_satu,
          tanggal_lahir: rinci.tanggal_lahir_atlet_satu,
          jenis_kelamin: rinci.jenis_kelamin_atlet_satu,
          no_hp: rinci.no_hp_atlet_satu,
        },
        {
          id: `${rinci.id}-2`,
          label: 'Atlet 2',
          nik: rinci.nik_atlet_dua,
          nama: rinci.nama_atlet_dua,
          tanggal_lahir: rinci.tanggal_lahir_atlet_dua,
          jenis_kelamin: rinci.jenis_kelamin_atlet_dua,
          no_hp: rinci.no_hp_atlet_dua,
        },
      ]),
    }))
    .filter((participant) => participant.atlets.length),
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

function cetak() {
  window.print()
}

function formatTanggal(tanggal) {
  if (!tanggal) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
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

  return `${umur} th`
}
</script>

<style scoped>
.print-page {
  min-height: calc(100vh - 58px);
  padding: 20px;
  background: #f4f7fb;
}
.print-toolbar {
  display: flex;
  width: min(1280px, 100%);
  justify-content: space-between;
  margin: 0 auto 14px;
}
.print-sheet {
  width: min(900px, 100%);
  margin: auto;
  padding: 28px;
  background: #fff;
  box-shadow: 0 3px 18px rgba(17, 47, 82, 0.12);
}
.report-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: flex-start;
  column-gap: 16px;
  row-gap: 2px;
  padding-top: 2px;
  margin-bottom: 3px;
  color: #173c69;
}
.report-header h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.1;
}
.report-header p,
.report-header > span {
  margin: 0;
  color: #617892;
  font-size: 12px;
  line-height: 1.1;
}
.report-header p {
  grid-column: 1 / -1;
  text-align: center;
}
.report-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 180px;
  color: #617892;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  color: #000;
  font-size: 12px;
}
.report-table th,
.report-table td {
  padding: 6px 5px;
  border: 1px solid #9eafc3;
  text-align: left;
  vertical-align: top;
}
.report-table th {
  color: #fff;
  background: #06366d;
  font-weight: 700;
}
.report-table th:first-child {
  width: 7%;
}
.report-table td:first-child,
.report-table th:first-child {
  text-align: center;
}
.athlete-name span,
.athlete-name strong {
  display: block;
}
.team-info strong,
.team-info span,
.athlete-name span {
  display: block;
}
.team-info span,
.athlete-name span {
  margin-top: 3px;
  color: #000;
  font-size: 11px;
}
.team-info {
  margin-bottom: 6px;
  padding-bottom: 5px;
  border-bottom: 1px dashed #b8c7d5;
}
.athlete-name {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 3px;
}
.athlete-name span {
  margin: 0;
  font-weight: 700;
}
.athlete-data {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 10px;
}
.athlete-data span {
  white-space: nowrap;
}
@media (max-width: 900px) {
  .print-sheet {
    padding: 16px;
  }
}
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm;
  }
  :global(.app-header),
  :global(.bottom-nav),
  .print-toolbar {
    display: none !important;
  }
  :global(.q-page-container) {
    padding: 0 !important;
  }
  .print-page,
  .print-sheet {
    min-height: 0;
    padding: 0;
    background: #fff;
    box-shadow: none;
  }
  .report-header {
    padding-top: 0;
    margin-bottom: 2px;
  }
  .report-header h1 {
    font-size: 15px;
  }
  .report-table {
    font-size: 9.5px;
  }
  .report-table th,
  .report-table td {
    padding: 3px 2px;
  }
  .report-table th {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .report-table thead {
    display: table-header-group;
  }
  .report-table tr {
    break-inside: avoid;
  }
  .team-info span,
  .athlete-name span {
    font-size: 8.5px;
  }
}
</style>
