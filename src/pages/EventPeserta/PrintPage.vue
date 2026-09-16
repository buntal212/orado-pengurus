<template>
  <q-page class="print-page">
    <div class="print-toolbar">
      <q-btn flat no-caps icon="arrow_back" label="Kembali" @click="router.back()" />
      <q-btn color="primary" no-caps icon="print" label="Cetak Kartu" @click="cetak" />
    </div>

    <main class="badge-sheet">
      <div v-if="loading" class="report-status">
        <q-spinner-dots color="primary" size="30px" /> Memuat kartu peserta...
      </div>
      <div v-else-if="!cards.length" class="report-status">Belum ada peserta untuk dicetak.</div>
      <section v-else class="badge-grid" aria-label="Kartu peserta event">
        <article v-for="(card, index) in cards" :key="card.id" class="participant-badge">
          <div class="badge-top">
            <div class="brand-mark" aria-label="ORADO Kota Probolinggo">
              <div class="brand-logos">
                <img
                  class="partner-logo koni-logo"
                  src="@/assets/partner/logo-koni.svg"
                  alt="Logo KONI"
                />
                <img class="brand-logo" src="@/assets/orado/logo-white.svg" alt="Logo ORADO" />
                <img
                  class="partner-logo tni-logo"
                  src="@/assets/partner/logo-tni.svg"
                  alt="Logo TNI"
                />
              </div>
            </div>
            <span class="badge-number">{{ String(index + 1).padStart(3, '0') }}</span>
          </div>

          <div class="badge-pattern pattern-top"></div>
          <div class="badge-pattern pattern-bottom"></div>
          <img class="badge-watermark" src="@/assets/orado/logo-white.svg" alt="" />

          <div class="badge-content">
            <p class="brand-copy badge-org">ORADO<small>KOTA PROBOLINGGO</small></p>
            <p class="badge-label">PESERTA</p>
            <p class="event-name">{{ event?.nama_event || 'EVENT ORADO' }}</p>

            <div class="participant-data">
              <span>Nama atlet</span>
              <strong>{{ card.nama || '-' }}</strong>
            </div>
            <div class="participant-data nik-data">
              <span>NIK atlet</span>
              <strong>{{ card.nik || '-' }}</strong>
            </div>
            <div class="club-data">
              <span>Nama club</span>
              <strong>{{ card.nama_tim || '-' }}</strong>
            </div>
          </div>

          <footer class="badge-footer">
            <span>{{ event?.kode_event || 'ORADO' }}</span>
            <span>OFFICIAL PARTICIPANT</span>
          </footer>
        </article>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const participants = ref([])
const event = ref(null)
const eventId = Number(route.query.master_event_id) || null

const cards = computed(() =>
  participants.value.flatMap((participant) =>
    (participant.rincis || []).flatMap((rinci) =>
      [
        {
          id: `${rinci.id}-1`,
          nama_tim: participant.nama_tim,
          nama: rinci.nama_atlet_satu,
          nik: rinci.nik_atlet_satu,
        },
        {
          id: `${rinci.id}-2`,
          nama_tim: participant.nama_tim,
          nama: rinci.nama_atlet_dua,
          nik: rinci.nik_atlet_dua,
        },
      ].filter((atlet) => atlet.nama || atlet.nik),
    ),
  ),
)

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
</script>

<style scoped>
.print-page {
  min-height: calc(100vh - 58px);
  padding: 20px;
  background: #edf2f6;
}
.print-toolbar {
  display: flex;
  width: min(920px, 100%);
  justify-content: space-between;
  margin: 0 auto 14px;
}
.badge-sheet {
  width: min(920px, 100%);
  min-height: 300px;
  margin: auto;
  padding: 22px;
  background: #fff;
  box-shadow: 0 3px 18px rgba(17, 47, 82, 0.12);
}
.badge-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  justify-items: center;
}
.participant-badge {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 388px;
  min-height: 535px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e8b275;
  border-radius: 5px;
  background: #fffdf9;
  box-shadow: 0 3px 12px rgba(131, 61, 20, 0.18);
  color: #2f241e;
}
.participant-badge::before {
  position: absolute;
  z-index: 0;
  top: 68px;
  right: -38px;
  width: 168px;
  height: 168px;
  border: 22px solid rgba(224, 113, 30, 0.09);
  border-radius: 50%;
  content: '';
}
.badge-top,
.badge-content,
.badge-footer {
  position: relative;
  z-index: 1;
}
.badge-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 22px 0;
  color: #bd5b1c;
}
.brand-mark {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.7px;
}
.brand-copy small {
  display: block;
  margin-top: 1px;
  font-size: 5px;
  font-weight: 700;
  letter-spacing: 0.35px;
}
.brand-logos {
  display: flex;
  align-items: center;
  gap: 4px;
}
.brand-logo {
  width: 27px;
  height: 27px;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(40%) sepia(69%) saturate(813%) hue-rotate(343deg)
    brightness(86%) contrast(92%);
}
.partner-logo {
  width: 26px;
  height: 27px;
  object-fit: contain;
}
.koni-logo {
  width: 24px;
}
.tni-logo {
  width: 27px;
}
.badge-number {
  padding-top: 2px;
  color: #bc6c33;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}
.badge-pattern {
  position: absolute;
  z-index: 0;
  width: 220px;
  height: 115px;
  background: repeating-linear-gradient(
    72deg,
    transparent 0 16px,
    rgba(206, 75, 26, 0.16) 17px 19px,
    transparent 20px 33px
  );
}
.pattern-top {
  top: 42px;
  left: -106px;
  transform: rotate(-18deg);
}
.pattern-bottom {
  right: -100px;
  bottom: 32px;
  transform: rotate(164deg);
}
.badge-watermark {
  position: absolute;
  z-index: 0;
  top: 50%;
  left: 50%;
  width: 245px;
  height: 245px;
  opacity: 0.07;
  transform: translate(-50%, -33%);
  filter: brightness(0) saturate(100%) invert(39%) sepia(50%) saturate(1775%) hue-rotate(346deg)
    brightness(89%) contrast(91%);
}
.badge-content {
  padding: 66px 30px 22px;
  text-align: center;
}
.badge-org {
  margin: 0 0 10px;
  color: #bd5b1c;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 1;
}
.badge-org small {
  color: #9e4d1c;
}
.badge-label {
  margin: 0;
  color: #d65f1e;
  font-size: 47px;
  font-weight: 900;
  letter-spacing: 3px;
  line-height: 0.95;
}
.event-name {
  min-height: 36px;
  margin: 13px auto 41px;
  color: #9e4d1c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  line-height: 1.25;
  text-transform: uppercase;
}
.participant-data,
.club-data {
  position: relative;
  z-index: 1;
  text-align: left;
}
.participant-data span,
.club-data span {
  display: block;
  margin-bottom: 4px;
  color: #a85b2c;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.participant-data strong,
.club-data strong {
  display: block;
  overflow-wrap: anywhere;
  color: #1f1b19;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.12;
}
.nik-data {
  margin-top: 23px;
}
.nik-data strong {
  color: #51301e;
  font-size: 16px;
  letter-spacing: 0.4px;
}
.club-data {
  margin-top: 28px;
  padding: 16px 17px;
  border-left: 5px solid #d65f1e;
  background: #f9e8d8;
}
.club-data strong {
  color: #b65019;
  font-size: 20px;
  text-transform: uppercase;
}
.badge-footer {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding: 13px 22px;
  background: #c9531b;
  color: #fff7ee;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.7px;
}
.report-status {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #617892;
}
@media (max-width: 640px) {
  .print-page {
    padding: 12px;
  }
  .badge-sheet {
    padding: 14px;
  }
  .badge-grid {
    grid-template-columns: 1fr;
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
  .badge-sheet {
    min-height: 0;
    padding: 0;
    background: #fff;
    box-shadow: none;
  }
  .badge-sheet {
    width: 100%;
  }
  .badge-grid {
    width: 183mm;
    height: 269mm;
    margin: 0 auto;
    grid-template-columns: repeat(2, 89mm);
    grid-template-rows: repeat(2, 132mm);
    gap: 5mm;
    align-content: start;
  }
  .participant-badge {
    width: 89mm;
    max-width: none;
    height: 132mm;
    min-height: 0;
    break-inside: avoid;
    box-shadow: none;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
