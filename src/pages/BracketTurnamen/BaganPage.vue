<template>
  <q-page class="bracket-page">
    <main class="bracket-content">
      <q-btn
        v-if="modePengisian"
        class="save-toggle-button"
        round
        flat
        :icon="tampilkanTombolSimpan ? 'visibility_off' : 'save'"
        color="black"
        :aria-label="
          tampilkanTombolSimpan ? 'Sembunyikan tombol simpan' : 'Tampilkan tombol simpan'
        "
        @click="tampilkanTombolSimpan = !tampilkanTombolSimpan"
      >
        <q-tooltip>
          {{ tampilkanTombolSimpan ? 'Sembunyikan tombol simpan' : 'Tampilkan simpan bagan' }}
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="modePengisian && tampilkanTombolSimpan"
        class="save-button"
        unelevated
        no-caps
        color="blue-1"
        text-color="black"
        icon="save"
        label="Simpan bagan"
        :loading="store.savingPengisian"
        @click="simpanBagan"
      />
      <q-btn
        class="download-pdf-button"
        round
        flat
        icon="picture_as_pdf"
        color="black"
        aria-label="Unduh bagan sebagai PDF"
        :loading="sedangMengunduhPdf"
        @click="cetakBaganPdf"
      >
        <q-tooltip>Unduh PDF</q-tooltip>
      </q-btn>
      <q-btn
        class="back-button"
        round
        flat
        icon="arrow_back"
        color="black"
        aria-label="Kembali"
        @click="router.push('/bracket-turnamen')"
      />

      <q-inner-loading :showing="store.loadingBagan || store.loadingPengisian" color="primary">
        <q-spinner-dots size="36px" />
      </q-inner-loading>

      <section v-if="!store.loadingBagan && !store.loadingPengisian && bagan" class="bracket-board">
        <div
          ref="bracketViewport"
          class="bracket-viewport"
          :style="{
            height: `${tinggiBaganTampil}px`,
            '--skala-cetak': skalaCetakBagan,
            '--lebar-cetak': `${bagan.lebar * skalaCetakBagan}px`,
            '--tinggi-cetak': `${bagan.tinggi * skalaCetakBagan}px`,
          }"
        >
          <div
            ref="bracketCanvas"
            class="bracket-canvas"
            :style="{
              width: `${bagan.lebar}px`,
              height: `${bagan.tinggi}px`,
              transform: `translateX(${offsetKiriBagan}px) scale(${skalaBagan})`,
            }"
          >
            <img
              class="event-watermark"
              src="@/assets/orado/logo-white.svg"
              alt=""
              aria-hidden="true"
              :style="{ left: `${bagan.watermarkX}px`, top: `${bagan.watermarkY}px` }"
            />
            <div
              class="event-identity"
              :style="{ left: `${bagan.identitasEventX}px`, top: `${bagan.identitasEventY}px` }"
            >
              <span>BAGAN <em>TURNAMEN</em></span>
              <strong>{{ store.event?.nama_event || 'EVENT ORADO' }}</strong>
              <small>
                <q-icon name="calendar_month" size="16px" />
                {{ store.event?.kode_event || 'ORADO Kota Probolinggo' }}
              </small>
            </div>
            <svg
              class="bracket-lines"
              :viewBox="`0 0 ${bagan.lebar} ${bagan.tinggi}`"
              :width="bagan.lebar"
              :height="bagan.tinggi"
              aria-hidden="true"
            >
              <path v-for="(jalur, index) in bagan.jalur" :key="index" :d="jalur" />
            </svg>

            <article
              v-for="pertandingan in bagan.pertandingan"
              :key="pertandingan.id"
              class="match-card match-card--clickable"
              :style="{ left: `${pertandingan.x}px`, top: `${pertandingan.y}px` }"
              @click="pilihPertandingan(pertandingan)"
            >
              <div
                class="team-slot"
                :class="{ 'team-slot--kosong': pertandingan.timSatu.kosong }"
                :title="detailAtlet(pertandingan.timSatu)"
              >
                <span>{{ pertandingan.timSatu.nama }}</span>
              </div>
              <div
                class="team-slot"
                :class="{ 'team-slot--kosong': pertandingan.timDua.kosong }"
                :title="detailAtlet(pertandingan.timDua)"
              >
                <span>{{ pertandingan.timDua.nama }}</span>
              </div>
            </article>

            <article
              class="match-card match-card--final match-card--clickable"
              :style="{ left: `${bagan.final.x}px`, top: `${bagan.final.y}px` }"
              @click="pilihPertandingan(bagan.final)"
            >
              <div
                class="team-slot"
                :class="{ 'team-slot--kosong': bagan.final.timSatu.kosong }"
                :title="detailAtlet(bagan.final.timSatu)"
              >
                <span>{{ bagan.final.timSatu.nama }}</span>
              </div>
              <div
                class="team-slot"
                :class="{ 'team-slot--kosong': bagan.final.timDua.kosong }"
                :title="detailAtlet(bagan.final.timDua)"
              >
                <span>{{ bagan.final.timDua.nama }}</span>
              </div>
            </article>

            <article
              class="match-card match-card--third-place match-card--clickable"
              :style="{ left: `${bagan.juaraTiga.x}px`, top: `${bagan.juaraTiga.y}px` }"
              @click="pilihPertandingan(bagan.juaraTiga)"
            >
              <div class="third-place-label">PEREBUTAN JUARA 3</div>
              <div v-if="bagan.juaraTiga.pemenang" class="third-place-result">
                JUARA 3: {{ bagan.juaraTiga.pemenang.nama }}
              </div>
              <div
                class="team-slot"
                :class="{ 'team-slot--kosong': bagan.juaraTiga.timSatu.kosong }"
                :title="detailAtlet(bagan.juaraTiga.timSatu)"
              >
                <span>{{ bagan.juaraTiga.timSatu.nama }}</span>
              </div>
              <div
                class="team-slot"
                :class="{ 'team-slot--kosong': bagan.juaraTiga.timDua.kosong }"
                :title="detailAtlet(bagan.juaraTiga.timDua)"
              >
                <span>{{ bagan.juaraTiga.timDua.nama }}</span>
              </div>
            </article>

            <div
              class="champion-mark"
              :style="{ left: `${bagan.final.x - 54}px`, top: `${bagan.hasilAkhirY}px` }"
            >
              <div class="champion-trophy">
                <img src="@/assets/orado/trophy-gold-laurel-clean.png" alt="Piala juara" />
              </div>
              <div class="champion-title">HASIL AKHIR</div>
              <div class="champion-result">
                <div class="champion-result-row">
                  <span>JUARA 1</span>
                  <strong>{{ bagan.final.pemenang?.nama || 'Belum ditentukan' }}</strong>
                </div>
                <div class="champion-result-row">
                  <span>JUARA 2</span>
                  <strong>{{ bagan.final.juaraDua?.nama || 'Belum ditentukan' }}</strong>
                </div>
                <div class="champion-result-row">
                  <span>JUARA 3</span>
                  <strong>{{ bagan.juaraTiga.pemenang?.nama || 'Belum ditentukan' }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer v-if="!store.loadingBagan && !store.loadingPengisian && bagan" class="bracket-footer">
        <div class="bracket-footer-message">
          <q-icon name="emoji_events" size="21px" />
          <strong>Selamat Bertanding, Junjung Sportifitas</strong>
        </div>
        <div class="bracket-footer-tags">
          #DominoNaikKelas&nbsp;&nbsp; #OradoMemintarkanIndonesia&nbsp;&nbsp;
          #OradoProbolinggoOdikTerus
        </div>
      </footer>

      <div v-else-if="!store.loadingBagan && !store.loadingPengisian" class="empty-state">
        Event ini belum memiliki kuota peserta. Tentukan kuota peserta terlebih dahulu agar bagan
        dapat dibuat.
      </div>

      <q-dialog v-model="dialogPertandingan">
        <q-card class="dialog-pertandingan">
          <q-card-section class="dialog-heading">
            <div>
              <strong>Isi pertandingan {{ pasanganAktif?.nomor_pertandingan }}</strong>
              <span>{{ keteranganPengisian }}</span>
            </div>
            <q-btn v-close-popup flat round icon="close" color="black" aria-label="Tutup" />
          </q-card-section>
          <q-card-section v-if="pasanganAktif" class="dialog-form">
            <q-select
              v-model="pasanganAktif.tim_satu_id"
              outlined
              clearable
              emit-value
              map-options
              use-input
              input-debounce="0"
              :disable="!bisaAturTim"
              :options="opsiTimUntuk('tim_satu_id')"
              option-value="id"
              option-label="nama_tim"
              label="Tim/Club A"
              @filter="(nilai, perbarui) => saringOpsiTim(nilai, 'tim_satu_id', perbarui)"
              @update:model-value="pastikanPemenangValid"
            />
            <q-select
              v-model="pasanganAktif.tim_dua_id"
              outlined
              clearable
              emit-value
              map-options
              use-input
              input-debounce="0"
              :disable="!bisaAturTim"
              :options="opsiTimUntuk('tim_dua_id')"
              option-value="id"
              option-label="nama_tim"
              label="Tim/Club B"
              @filter="(nilai, perbarui) => saringOpsiTim(nilai, 'tim_dua_id', perbarui)"
              @update:model-value="pastikanPemenangValid"
            />
            <q-select
              v-model="pasanganAktif.pemenang_id"
              outlined
              clearable
              emit-value
              map-options
              :disable="opsiPemenang.length !== 2"
              :options="opsiPemenang"
              option-value="id"
              option-label="nama_tim"
              label="Pemenang pertandingan"
              @update:model-value="tetapkanPemenang"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn v-close-popup flat no-caps color="black" label="Selesai" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </main>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useBracketTurnamenStore } from '@/stores/bracket-turnamen'

const LEBAR_KARTU = 142
const TINGGI_KARTU = 52
const JARAK_RONDE = 38
const JARAK_BARIS = 56
const PADDING = 16
const JARAK_FINAL = 48
const TINGGI_AREA_BAGAN = 116

const route = useRoute()
const router = useRouter()
const store = useBracketTurnamenStore()
const bracketViewport = ref(null)
const bracketCanvas = ref(null)
const lebarViewport = ref(0)
const tinggiLayar = ref(window.innerHeight)
const dialogPertandingan = ref(false)
const pasanganAktif = ref(null)
const pertandinganAktif = ref(null)
const tampilkanTombolSimpan = ref(false)
const sedangMengunduhPdf = ref(false)
const kataKunciTim = ref({ tim_satu_id: '', tim_dua_id: '' })
let resizeObserver

const modePengisian = computed(() => route.query.isi === '1')
const ruangTombolKanan = computed(() => {
  if (!modePengisian.value) return 0

  const ruangMinimum = tampilkanTombolSimpan.value ? 126 : 36
  const ruangMaksimum = tampilkanTombolSimpan.value ? 148 : 44

  return Math.min(ruangMaksimum, Math.max(ruangMinimum, lebarViewport.value * 0.18))
})
const semuaOpsiTim = computed(() =>
  store.peserta.map((peserta) => ({ id: peserta.id, nama_tim: peserta.nama_tim })),
)
const opsiPemenang = computed(() => {
  if (!pasanganAktif.value) return []

  const idTim = [pasanganAktif.value.tim_satu_id, pasanganAktif.value.tim_dua_id].filter(Boolean)
  return semuaOpsiTim.value.filter((tim) => idTim.includes(tim.id))
})
const bisaAturTim = computed(() => pertandinganAktif.value?.ronde === 0)
const keteranganPengisian = computed(() =>
  bisaAturTim.value
    ? 'Pilih dua Tim/Club, lalu tentukan pemenangnya.'
    : 'Tim masuk otomatis dari pemenang pertandingan sebelumnya. Tentukan pemenangnya.',
)

function opsiTimUntuk(slot) {
  const idTimAktif = pasanganAktif.value?.[slot]
  const idTimTerpakai = new Set(
    store.formPasangan.flatMap((pasangan) => [pasangan.tim_satu_id, pasangan.tim_dua_id]),
  )
  const kataKunci = kataKunciTim.value[slot].trim().toLowerCase()

  return semuaOpsiTim.value.filter(
    (tim) =>
      (tim.id === idTimAktif || !idTimTerpakai.has(tim.id)) &&
      tim.nama_tim.toLowerCase().includes(kataKunci),
  )
}

function saringOpsiTim(nilai, slot, perbarui) {
  perbarui(() => {
    kataKunciTim.value[slot] = nilai || ''
  })
}

const timTerdaftar = computed(() => {
  const daftarTim = new Map()

  store.peserta.forEach((peserta) => {
    const namaTim = peserta.nama_tim?.trim()
    if (!namaTim || daftarTim.has(namaTim)) return

    const rinci = peserta.rincis?.[0]
    daftarTim.set(namaTim, {
      id: peserta.id,
      nama: namaTim,
      atlet: [rinci?.nama_atlet_satu, rinci?.nama_atlet_dua].filter(Boolean),
    })
  })

  return [...daftarTim.values()]
})
const pasanganBagan = computed(() => (modePengisian.value ? store.formPasangan : store.pasangan))
const gunakanSusunanDefault = computed(() => !modePengisian.value && !store.pasangan.length)

const jumlahPertandinganAwal = computed(() => {
  const kuota = Number(store.event?.kuota_peserta)
  if (!Number.isInteger(kuota) || kuota < 2) return 0

  return pangkatDuaBerikutnya(Math.ceil(kuota / 2)) / 2
})
const baganDasar = computed(() =>
  buatBagan(
    timTerdaftar.value,
    store.event?.kuota_peserta,
    JARAK_BARIS,
    pasanganBagan.value,
    gunakanSusunanDefault.value,
  ),
)
const skalaLebarBagan = computed(() => {
  if (!baganDasar.value || !lebarViewport.value) return 1

  return Math.min(
    1,
    Math.max(0.1, (lebarViewport.value - ruangTombolKanan.value - 8) / baganDasar.value.lebar),
  )
})
const jarakBarisBagan = computed(() => {
  if (!jumlahPertandinganAwal.value) return JARAK_BARIS

  const tinggiTarget = (tinggiLayar.value - TINGGI_AREA_BAGAN) / skalaLebarBagan.value
  return Math.max(JARAK_BARIS, (tinggiTarget - PADDING * 2) / jumlahPertandinganAwal.value)
})
const bagan = computed(() =>
  buatBagan(
    timTerdaftar.value,
    store.event?.kuota_peserta,
    jarakBarisBagan.value,
    pasanganBagan.value,
    gunakanSusunanDefault.value,
  ),
)
const skalaBagan = computed(() => {
  if (!bagan.value || !lebarViewport.value) return 1

  return Math.min(
    1,
    Math.max(0.1, (lebarViewport.value - ruangTombolKanan.value - 8) / bagan.value.lebar),
    Math.max(0.1, (tinggiLayar.value - TINGGI_AREA_BAGAN) / bagan.value.tinggi),
  )
})
const offsetKiriBagan = computed(() => {
  if (!bagan.value || !lebarViewport.value) return 0

  return Math.max(
    0,
    (lebarViewport.value - ruangTombolKanan.value - bagan.value.lebar * skalaBagan.value) / 2,
  )
})
const tinggiBaganTampil = computed(() => (bagan.value ? bagan.value.tinggi * skalaBagan.value : 0))
const skalaCetakBagan = computed(() => {
  if (!bagan.value) return 1

  return Math.min(2.2, 3000 / bagan.value.lebar, 2100 / bagan.value.tinggi)
})

onMounted(async () => {
  window.addEventListener('resize', perbaruiTinggiLayar)
  if (modePengisian.value) await store.getPengisian(route.params.eventId)
  else await store.getBagan(route.params.eventId)
  if (modePengisian.value) sinkronkanBaganOtomatis()
  await nextTick()
  amatiUkuranBagan()
})
watch(bagan, () => nextTick(amatiUkuranBagan))
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', perbaruiTinggiLayar)
})

function perbaruiTinggiLayar() {
  tinggiLayar.value = window.innerHeight
}

function pastikanPemenangValid() {
  if (!pasanganAktif.value) return

  const idTim = [pasanganAktif.value.tim_satu_id, pasanganAktif.value.tim_dua_id]
  if (!idTim.includes(pasanganAktif.value.pemenang_id)) pasanganAktif.value.pemenang_id = null
  sinkronkanBaganOtomatis()
}

function tetapkanPemenang(pemenangId) {
  if (!pasanganAktif.value) return

  pasanganAktif.value.pemenang_id = pemenangId
  sinkronkanBaganOtomatis()
}

async function pilihPertandingan(pertandingan) {
  if (!modePengisian.value) {
    await router.replace({ path: route.path, query: { isi: '1' } })
    await store.getPengisian(route.params.eventId)
    sinkronkanBaganOtomatis()
  }

  pertandinganAktif.value = pertandingan
  pasanganAktif.value = store.formPasangan.find(
    (pasangan) => pasangan.nomor_pertandingan === pertandingan.nomorPertandingan,
  )
  dialogPertandingan.value = Boolean(pasanganAktif.value)
}

async function simpanBagan() {
  sinkronkanBaganOtomatis()
  const tersimpan = await store.savePengisian(route.params.eventId)
  if (tersimpan) router.replace(`/bracket-turnamen/${route.params.eventId}`)
}

async function cetakBaganPdf() {
  if (!bagan.value || !bracketViewport.value || !bracketCanvas.value) return

  sedangMengunduhPdf.value = true
  await nextTick()

  const viewport = bracketViewport.value
  const canvasBagan = bracketCanvas.value
  const gayaViewport = {
    width: viewport.style.width,
    height: viewport.style.height,
    overflow: viewport.style.overflow,
  }
  const gayaCanvas = {
    transform: canvasBagan.style.transform,
    transformOrigin: canvasBagan.style.transformOrigin,
  }

  try {
    viewport.style.width = `${bagan.value.lebar}px`
    viewport.style.height = `${bagan.value.tinggi}px`
    viewport.style.overflow = 'visible'
    canvasBagan.style.transform = 'none'
    canvasBagan.style.transformOrigin = 'top left'

    await document.fonts?.ready
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])
    const gambarBagan = await html2canvas(viewport, {
      backgroundColor: '#172738',
      scale: 2,
      useCORS: true,
    })
    const pdf = new jsPDF({ format: 'a1', orientation: 'landscape', unit: 'mm' })
    const margin = 10
    const lebarHalaman = pdf.internal.pageSize.getWidth() - margin * 2
    const tinggiHalaman = pdf.internal.pageSize.getHeight() - margin * 2
    const rasioBagan = gambarBagan.width / gambarBagan.height
    let lebarGambar = lebarHalaman
    let tinggiGambar = lebarGambar / rasioBagan

    if (tinggiGambar > tinggiHalaman) {
      tinggiGambar = tinggiHalaman
      lebarGambar = tinggiGambar * rasioBagan
    }

    pdf.addImage(
      gambarBagan,
      'PNG',
      (pdf.internal.pageSize.getWidth() - lebarGambar) / 2,
      (pdf.internal.pageSize.getHeight() - tinggiGambar) / 2,
      lebarGambar,
      tinggiGambar,
      undefined,
      'FAST',
    )
    const namaEvent = (store.event?.nama_event || 'bagan-turnamen')
      .trim()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/(^-|-$)/g, '')
      .toLowerCase()
    pdf.save(`${namaEvent || 'bagan-turnamen'}.pdf`)
  } catch (error) {
    console.error('Gagal membuat PDF bagan:', error)
    Notify.create({ type: 'negative', message: 'PDF bagan gagal dibuat. Silakan coba lagi.' })
  } finally {
    viewport.style.width = gayaViewport.width
    viewport.style.height = gayaViewport.height
    viewport.style.overflow = gayaViewport.overflow
    canvasBagan.style.transform = gayaCanvas.transform
    canvasBagan.style.transformOrigin = gayaCanvas.transformOrigin
    sedangMengunduhPdf.value = false
  }
}

function sinkronkanBaganOtomatis() {
  if (!modePengisian.value || !bagan.value) return

  const pertandingan = bagan.value.pertandingan
  const pasanganBerdasarkanNomor = new Map(
    store.formPasangan.map((pasangan) => [pasangan.nomor_pertandingan, pasangan]),
  )
  const rondeTerakhir = Math.max(...pertandingan.map((match) => match.ronde))
  const slotOtomatis = new Map()
  const isiSlotOtomatis = (nomorPertandingan, posisi, timId) => {
    if (!slotOtomatis.has(nomorPertandingan)) slotOtomatis.set(nomorPertandingan, [null, null])
    slotOtomatis.get(nomorPertandingan)[posisi] = timId || null
  }
  const timKalah = (pasangan) => {
    if (!pasangan?.pemenang_id || !pasangan.tim_satu_id || !pasangan.tim_dua_id) return null

    return pasangan.tim_satu_id === pasangan.pemenang_id
      ? pasangan.tim_dua_id
      : pasangan.tim_satu_id
  }

  pertandingan.forEach((match) => {
    const pasangan = pasanganBerdasarkanNomor.get(match.nomorPertandingan)
    if (match.ronde < rondeTerakhir) {
      const tujuan = pertandingan.find(
        (target) =>
          target.sisi === match.sisi &&
          target.ronde === match.ronde + 1 &&
          target.nomor === Math.floor(match.nomor / 2),
      )
      if (tujuan) isiSlotOtomatis(tujuan.nomorPertandingan, match.nomor % 2, pasangan?.pemenang_id)
      return
    }

    if (match.sisi === 'kiri') {
      isiSlotOtomatis(bagan.value.final.nomorPertandingan, 0, pasangan?.pemenang_id)
      isiSlotOtomatis(bagan.value.juaraTiga.nomorPertandingan, 0, timKalah(pasangan))
    } else {
      isiSlotOtomatis(bagan.value.final.nomorPertandingan, 1, pasangan?.pemenang_id)
      isiSlotOtomatis(bagan.value.juaraTiga.nomorPertandingan, 1, timKalah(pasangan))
    }
  })

  const pertandinganOtomatis = [
    ...pertandingan.filter((match) => match.ronde > 0),
    bagan.value.final,
    bagan.value.juaraTiga,
  ]
  pertandinganOtomatis.forEach((match) => {
    const pasangan = pasanganBerdasarkanNomor.get(match.nomorPertandingan)
    if (!pasangan) return

    const [timSatuId, timDuaId] = slotOtomatis.get(match.nomorPertandingan) || [null, null]
    pasangan.tim_satu_id = timSatuId
    pasangan.tim_dua_id = timDuaId
    if (![timSatuId, timDuaId].includes(pasangan.pemenang_id)) pasangan.pemenang_id = null
  })
}

function amatiUkuranBagan() {
  if (!bracketViewport.value) return

  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(([entry]) => {
    lebarViewport.value = entry.contentRect.width
  })
  resizeObserver.observe(bracketViewport.value)
}

function buatBagan(daftarTim, kuotaEvent, jarakBaris, daftarPasangan, gunakanSusunanDefault) {
  const kuota = Number(kuotaEvent)
  if (!Number.isInteger(kuota) || kuota < 2) return null

  const kuotaKiri = Math.ceil(kuota / 2)
  const kuotaKanan = Math.floor(kuota / 2)
  const slotBaganPerSisi = pangkatDuaBerikutnya(Math.max(kuotaKiri, kuotaKanan))
  const jumlahRonde = Math.log2(slotBaganPerSisi)
  const jumlahPertandinganAwal = slotBaganPerSisi / 2
  const tinggiPertandingan = jumlahPertandinganAwal * jarakBaris + PADDING * 2
  const tinggi = tinggiPertandingan + TINGGI_KARTU + PADDING
  const langkahX = LEBAR_KARTU + JARAK_RONDE
  const xKiriAkhir = PADDING + (jumlahRonde - 1) * langkahX
  const xFinal = xKiriAkhir + LEBAR_KARTU + JARAK_FINAL
  const xKananAkhir = xFinal + LEBAR_KARTU + JARAK_FINAL
  const lebar = xKananAkhir + (jumlahRonde - 1) * langkahX + LEBAR_KARTU + PADDING
  const batasTimKiri = Math.ceil(daftarTim.length / 2)
  const timKiri = isiSlot(
    gunakanSusunanDefault ? daftarTim.slice(0, batasTimKiri) : [],
    slotBaganPerSisi,
  )
  const timKanan = isiSlot(
    gunakanSusunanDefault ? daftarTim.slice(batasTimKiri, kuota) : [],
    slotBaganPerSisi,
  )
  const pertandingan = [
    ...buatSisi('kiri', timKiri, jumlahRonde, langkahX, PADDING, tinggiPertandingan, jarakBaris, 0),
    ...buatSisi(
      'kanan',
      timKanan,
      jumlahRonde,
      langkahX,
      lebar - PADDING - LEBAR_KARTU,
      tinggiPertandingan,
      jarakBaris,
      jumlahPertandinganAwal,
    ),
  ]
  const urutanPertandingan = []
  for (let ronde = 0; ronde < jumlahRonde; ronde += 1) {
    urutanPertandingan.push(
      ...pertandingan.filter((match) => match.ronde === ronde && match.sisi === 'kiri'),
      ...pertandingan.filter((match) => match.ronde === ronde && match.sisi === 'kanan'),
    )
  }
  urutanPertandingan.forEach((match, index) => {
    match.nomorPertandingan = index + 1
  })

  const final = {
    id: 'final',
    ronde: jumlahRonde,
    nomorPertandingan: urutanPertandingan.length + 1,
    x: xFinal,
    y: tinggiPertandingan / 2 - TINGGI_KARTU / 2,
    timSatu: timMenunggu(),
    timDua: timMenunggu(),
    pemenang: null,
  }
  const juaraTiga = {
    id: 'juara-tiga',
    ronde: jumlahRonde,
    nomorPertandingan: final.nomorPertandingan + 1,
    x: xFinal,
    y: final.y + TINGGI_KARTU + 18,
    timSatu: timMenunggu(),
    timDua: timMenunggu(),
    pemenang: null,
  }
  const pasanganBerdasarkanNomor = new Map(
    daftarPasangan.map((pasangan) => [pasangan.nomor_pertandingan, pasangan]),
  )
  const timBerdasarkanId = new Map(daftarTim.map((tim) => [tim.id, tim]))

  ;[...pertandingan, final, juaraTiga].forEach((match) => {
    const pasangan = pasanganBerdasarkanNomor.get(match.nomorPertandingan)
    if (!pasangan) return

    match.timSatu = timBerdasarkanId.get(pasangan.tim_satu_id) || timKosong(match.ronde)
    match.timDua = timBerdasarkanId.get(pasangan.tim_dua_id) || timKosong(match.ronde)
    match.pemenang = timBerdasarkanId.get(pasangan.pemenang_id) || null
  })
  final.juaraDua = final.pemenang
    ? [final.timSatu, final.timDua].find((tim) => tim.id !== final.pemenang.id) || null
    : null

  const identitasEventY = Math.max(PADDING + 12, final.y - 390)
  const hasilAkhirY = Math.max(identitasEventY + 160, final.y - 230)

  return {
    kuota,
    kuotaKiri,
    kuotaKanan,
    lebar,
    tinggi,
    pertandingan,
    final,
    juaraTiga,
    hasilAkhirY,
    identitasEventX: final.x + LEBAR_KARTU / 2 - 220,
    identitasEventY,
    watermarkX: lebar / 2 - 260,
    watermarkY: tinggi / 2 - 260,
    jalur: buatJalur(pertandingan, jumlahRonde, final),
  }
}

function isiSlot(daftarTim, jumlahSlot) {
  return Array.from({ length: jumlahSlot }, (_, index) => ({
    nama: daftarTim[index]?.nama || 'Slot kosong',
    atlet: daftarTim[index]?.atlet || [],
    kosong: daftarTim[index]?.kosong ?? !daftarTim[index],
  }))
}

function timKosong(ronde) {
  return ronde === 0 ? { nama: 'Slot kosong', atlet: [], kosong: true } : timMenunggu()
}

function timMenunggu() {
  return { nama: 'Menunggu pemenang', atlet: [], kosong: true }
}

function detailAtlet(tim) {
  if (tim.kosong) return ''
  if (!tim.atlet.length) return 'Data atlet belum tersedia.'

  return `Atlet tim:\n${tim.atlet.join('\n')}`
}

function buatSisi(sisi, daftarTim, jumlahRonde, langkahX, xAwal, tinggi, jarakBaris, nomorAwal) {
  const pertandingan = []

  for (let ronde = 0; ronde < jumlahRonde; ronde += 1) {
    const jumlahMatch = daftarTim.length / 2 ** (ronde + 1)
    for (let nomor = 0; nomor < jumlahMatch; nomor += 1) {
      const tengahMatch = PADDING + (2 ** ronde * jarakBaris) / 2 + nomor * 2 ** ronde * jarakBaris
      const awal = ronde === 0 ? nomor * 2 : 0
      const timSatu =
        ronde === 0 ? daftarTim[awal] : { nama: 'Menunggu pemenang', atlet: [], kosong: true }
      const timDua =
        ronde === 0 ? daftarTim[awal + 1] : { nama: 'Menunggu pemenang', atlet: [], kosong: true }
      const posisiX = sisi === 'kiri' ? xAwal + ronde * langkahX : xAwal - ronde * langkahX

      pertandingan.push({
        id: `${sisi}-${ronde}-${nomor}`,
        sisi,
        ronde,
        nomor,
        nomorPertandingan: ronde === 0 ? nomorAwal + nomor + 1 : null,
        x: posisiX,
        y: Math.min(tengahMatch - TINGGI_KARTU / 2, tinggi - PADDING - TINGGI_KARTU),
        tengahY: tengahMatch,
        label: ronde === 0 ? `PERTANDINGAN ${nomor + 1}` : namaRonde(jumlahMatch),
        timSatu,
        timDua,
      })
    }
  }

  return pertandingan
}

function buatJalur(pertandingan, jumlahRonde, final) {
  const jalur = []
  for (const sisi of ['kiri', 'kanan']) {
    for (let ronde = 0; ronde < jumlahRonde - 1; ronde += 1) {
      const sumber = pertandingan.filter((match) => match.sisi === sisi && match.ronde === ronde)
      const tujuan = pertandingan.filter(
        (match) => match.sisi === sisi && match.ronde === ronde + 1,
      )

      for (let index = 0; index < sumber.length; index += 2) {
        const pertama = sumber[index]
        const kedua = sumber[index + 1]
        const target = tujuan[index / 2]
        const keluar = sisi === 'kiri' ? pertama.x + LEBAR_KARTU : pertama.x
        const keluarKedua = sisi === 'kiri' ? kedua.x + LEBAR_KARTU : kedua.x
        const masuk = sisi === 'kiri' ? target.x : target.x + LEBAR_KARTU
        const tengahX = (keluar + masuk) / 2

        jalur.push(
          `M ${keluar} ${pertama.tengahY} H ${tengahX} V ${kedua.tengahY} H ${keluarKedua}`,
        )
        jalur.push(`M ${tengahX} ${target.tengahY} H ${masuk}`)
      }
    }

    const terakhir = pertandingan.find(
      (match) => match.sisi === sisi && match.ronde === jumlahRonde - 1,
    )
    const keluar = sisi === 'kiri' ? terakhir.x + LEBAR_KARTU : terakhir.x
    const masuk = sisi === 'kiri' ? final.x : final.x + LEBAR_KARTU
    jalur.push(`M ${keluar} ${terakhir.tengahY} H ${masuk}`)
  }

  return jalur
}

function pangkatDuaBerikutnya(angka) {
  return 2 ** Math.ceil(Math.log2(Math.max(angka, 2)))
}

function namaRonde(jumlahMatch) {
  if (jumlahMatch === 1) return 'FINAL SISI'
  if (jumlahMatch === 2) return 'SEMIFINAL'
  if (jumlahMatch === 4) return 'PEREMPAT FINAL'
  return `RONDE ${jumlahMatch * 2}`
}
</script>

<style scoped>
.bracket-page {
  position: fixed;
  top: 58px;
  right: 0;
  left: 0;
  z-index: 1;
  height: calc(100vh - 58px);
  width: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  background:
    radial-gradient(circle at 50% 38%, rgba(44, 119, 191, 0.08), transparent 30%),
    linear-gradient(
      135deg,
      rgba(34, 117, 195, 0.1) 0 7%,
      transparent 7% 49%,
      rgba(34, 117, 195, 0.05) 49% 57%,
      transparent 57%
    ),
    linear-gradient(135deg, #eaf4ff 0%, #fff 30%, #f8fbff 70%, #e7f2ff 100%);
}
.bracket-content {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  margin: 0 auto;
}
.back-button {
  position: absolute;
  z-index: 3;
  top: 4px;
  right: 4px;
  border: 1px solid rgba(179, 197, 215, 0.8);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(27, 57, 96, 0.12);
}
.download-pdf-button {
  position: absolute;
  z-index: 3;
  top: 4px;
  right: 48px;
  border: 1px solid rgba(179, 197, 215, 0.8);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(27, 57, 96, 0.12);
}
.save-button {
  position: absolute;
  z-index: 4;
  top: 44px;
  right: 10px;
  min-height: 34px;
  border: 1px solid #b9d2e9;
  border-radius: 9px;
  box-shadow: 0 4px 12px rgba(27, 57, 96, 0.12);
  font-size: 11px;
  font-weight: 700;
}
.save-toggle-button {
  position: absolute;
  z-index: 4;
  top: 4px;
  right: 92px;
  border: 1px solid rgba(179, 197, 215, 0.8);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(27, 57, 96, 0.12);
}
.match-card,
.champion-mark,
.empty-state {
  color: #000;
}
.bracket-board,
.empty-state {
  overflow: hidden;
  border: 1px solid #b9d8f2;
  border-radius: 0;
  background: #fff;
  box-shadow: 0 14px 34px rgba(24, 73, 128, 0.16);
}
.empty-state {
  border-radius: 18px;
}
.bracket-footer {
  position: relative;
  display: grid;
  height: 56px;
  flex: none;
  align-content: center;
  justify-items: center;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  background:
    linear-gradient(135deg, transparent 0 89%, #efbe2d 89% 92%, transparent 92%),
    linear-gradient(
      135deg,
      rgba(16, 96, 174, 0.4) 0 12%,
      transparent 12% 24%,
      rgba(16, 96, 174, 0.23) 24% 36%,
      transparent 36%
    ),
    linear-gradient(135deg, #032c5c, #064d91 52%, #032a58);
  color: #fff;
  text-align: center;
}
.bracket-footer::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 110px;
  background: linear-gradient(135deg, rgba(0, 20, 50, 0.36) 0 42%, transparent 42%);
  content: '';
}
.bracket-footer-message,
.bracket-footer-tags {
  position: relative;
  z-index: 1;
}
.bracket-footer-message {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  line-height: 1.2;
}
.bracket-footer-message :deep(.q-icon) {
  color: #f5bf2f;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.28));
}
.bracket-footer-tags {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.94);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15px;
}
.bracket-viewport {
  position: relative;
  overflow: hidden;
  transition: height 0.2s ease;
  background-color: #172738;
  background-image: linear-gradient(
    135deg,
    rgba(81, 171, 244, 0.16) 0 7%,
    transparent 7% 48%,
    rgba(81, 171, 244, 0.08) 48% 58%,
    transparent 58%
  );
}
.bracket-canvas {
  position: relative;
  min-width: 100%;
  transform-origin: top left;
}
.event-watermark {
  position: absolute;
  z-index: 0;
  width: 520px;
  height: 520px;
  opacity: 0.1;
  filter: brightness(0) invert(1);
  pointer-events: none;
}
.event-identity {
  position: absolute;
  z-index: 2;
  display: grid;
  width: 440px;
  justify-items: center;
  padding: 15px 24px;
  box-sizing: border-box;
  border: 2px solid #f0be2f;
  border-radius: 20px;
  background:
    linear-gradient(
      135deg,
      transparent 0 16%,
      rgba(30, 113, 192, 0.2) 16% 28%,
      transparent 28% 77%,
      rgba(30, 113, 192, 0.18) 77%
    ),
    linear-gradient(135deg, #04366f, #0759a5 55%, #043165);
  box-shadow:
    0 10px 22px rgba(9, 61, 116, 0.25),
    inset 0 1px rgba(255, 255, 255, 0.25);
  color: #fff;
  pointer-events: none;
  text-align: center;
}
.event-identity span {
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 3px;
}
.event-identity span em {
  color: #f4c33b;
  font-style: normal;
}
.event-identity strong {
  display: -webkit-box;
  max-width: 100%;
  margin: 6px 0 7px;
  overflow: hidden;
  color: #fff;
  font-size: 29px;
  font-weight: 900;
  letter-spacing: -0.4px;
  line-height: 1.08;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.event-identity small {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e5f2ff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
}
.bracket-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bracket-lines path {
  fill: none;
  stroke: #58abef;
  stroke-width: 1.8;
}
.match-card {
  position: absolute;
  z-index: 1;
  width: 142px;
  overflow: visible;
}
.match-card--final {
  width: 142px;
}
.match-card--third-place {
  width: 142px;
}
.third-place-label {
  width: max-content;
  margin: 0 auto 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #07569f;
  color: #fff;
  font-size: 8px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
}
.third-place-result {
  margin-bottom: 3px;
  color: #07569f;
  font-size: 8px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
}
.match-card--third-place .team-slot {
  border-color: #a76b00;
  background: #fff7e4;
}
.match-card--clickable {
  cursor: pointer;
}
.match-card--clickable .team-slot {
  border-color: #d04444;
}
.match-card--clickable:hover .team-slot:not(.team-slot--kosong) {
  filter: brightness(0.96);
}
.team-slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  height: 24px;
  min-height: 0;
  gap: 4px;
  padding: 2px 6px;
  margin-bottom: 2px;
  border: 1px solid #d04444;
  border-radius: 7px;
  background: linear-gradient(180deg, #fff7f7, #ffd1d1);
  box-shadow: 0 4px 10px rgba(157, 42, 42, 0.22);
  color: #861f1f;
  font-size: 12px;
  font-weight: 700;
}
.match-card--final .team-slot {
  border-color: #e4a81e;
  background: linear-gradient(180deg, #fffdf5, #ffefbd);
}
.team-slot + .team-slot:not(.team-slot--kosong) {
  border-color: #d6a313;
  background: linear-gradient(180deg, #fffbed, #ffe49a);
  color: #765508;
}
.team-slot span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.team-slot--kosong {
  border-color: #b4c8dc !important;
  background: linear-gradient(180deg, #fafdff, #eaf2fa) !important;
  color: #54708d !important;
  font-style: italic;
  font-weight: 500;
}
.champion-mark {
  position: absolute;
  display: flex;
  width: 250px;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  color: #0a4f94;
}
.champion-trophy {
  position: relative;
  display: grid;
  width: 136px;
  height: 82px;
  place-items: center;
}
.champion-trophy img {
  display: block;
  max-width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 4px rgba(128, 83, 0, 0.28));
  transform: translateY(-42px);
}
.champion-title {
  margin: 0 0 8px;
  padding: 6px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #063c76, #0a69b8);
  box-shadow: 0 4px 8px rgba(12, 72, 129, 0.18);
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.3px;
  text-align: center;
}
.champion-result {
  width: 100%;
  overflow: hidden;
  border: 1px solid #e5a820;
  border-radius: 10px;
  background: linear-gradient(135deg, #fffdf4, #fff0c9);
  box-shadow: 0 7px 14px rgba(117, 85, 23, 0.16);
}
.champion-result-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 7px;
  align-items: center;
  padding: 5px 9px;
  font-size: 11px;
  line-height: 1.15;
}
.champion-result-row + .champion-result-row {
  border-top: 1px solid #ecd69e;
}
.champion-result-row span {
  padding: 4px 5px;
  border-radius: 5px;
  background: #e0e6eb;
  color: #173d65;
  font-weight: 900;
  text-align: center;
}
.champion-result-row:first-child span {
  background: #f1bd2b;
  color: #1f2c3a;
}
.champion-result-row:last-child span {
  background: #d88943;
  color: #fff;
}
.champion-result-row strong {
  overflow: hidden;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty-state {
  padding: 34px;
  font-size: 12px;
  text-align: center;
}
.dialog-pertandingan {
  width: min(92vw, 460px);
  border-radius: 14px;
}
.dialog-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.dialog-heading strong,
.dialog-heading span {
  display: block;
  color: #000;
}
.dialog-heading strong {
  font-size: 16px;
}
.dialog-heading span {
  margin-top: 4px;
  font-size: 12px;
}
.dialog-form {
  display: grid;
  gap: 12px;
}

@media print {
  @page {
    size: A1 landscape;
    margin: 8mm;
  }

  :global(.q-header),
  :global(.q-drawer),
  :global(.q-footer) {
    display: none !important;
  }

  :global(.q-page-container) {
    padding: 0 !important;
  }

  .bracket-page {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    background: #fff;
  }

  .bracket-content {
    display: block;
    height: auto;
  }

  .back-button,
  .download-pdf-button,
  .save-button,
  .save-toggle-button,
  .bracket-footer {
    display: none !important;
  }

  .bracket-board {
    overflow: visible;
    border: 0;
    box-shadow: none;
  }

  .bracket-viewport {
    width: var(--lebar-cetak) !important;
    height: var(--tinggi-cetak) !important;
    overflow: visible;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .bracket-canvas {
    min-width: 0;
    transform: scale(var(--skala-cetak)) !important;
  }
}
</style>
