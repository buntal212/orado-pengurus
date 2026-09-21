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
          :style="{ height: `${tinggiBaganTampil}px` }"
        >
          <div
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
              <span>BAGAN TURNAMEN</span>
              <strong>{{ store.event?.nama_event || 'EVENT ORADO' }}</strong>
              <small>{{ store.event?.kode_event || 'ORADO Kota Probolinggo' }}</small>
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
              :style="{ left: `${bagan.final.x - 29}px`, top: `${bagan.hasilAkhirY}px` }"
            >
              <q-icon name="emoji_events" size="34px" />
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
      <div
        v-if="!store.loadingBagan && !store.loadingPengisian && bagan"
        class="bracket-ticker"
        aria-label="Pesan semangat pertandingan"
      >
        <span>
          Selamat Bertanding, Junjung Sportifitas ...... #DominoNaikKelas #OradoMemintarkanIndonesia #OradoProbolinggoOdikTerus
        </span>
      </div>

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
              :disable="!bisaAturTim"
              :options="opsiTim"
              option-value="id"
              option-label="nama_tim"
              label="Tim/Club A"
              @update:model-value="pastikanPemenangValid"
            />
            <q-select
              v-model="pasanganAktif.tim_dua_id"
              outlined
              clearable
              emit-value
              map-options
              :disable="!bisaAturTim"
              :options="opsiTim"
              option-value="id"
              option-label="nama_tim"
              label="Tim/Club B"
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
import { useBracketTurnamenStore } from '@/stores/bracket-turnamen'

const LEBAR_KARTU = 142
const TINGGI_KARTU = 52
const JARAK_RONDE = 38
const JARAK_BARIS = 56
const PADDING = 16
const JARAK_FINAL = 48
const TINGGI_AREA_BAGAN = 88

const route = useRoute()
const router = useRouter()
const store = useBracketTurnamenStore()
const bracketViewport = ref(null)
const lebarViewport = ref(0)
const tinggiLayar = ref(window.innerHeight)
const dialogPertandingan = ref(false)
const pasanganAktif = ref(null)
const pertandinganAktif = ref(null)
const tampilkanTombolSimpan = ref(false)
let resizeObserver

const modePengisian = computed(() => route.query.isi === '1')
const ruangTombolKanan = computed(() => {
  if (!modePengisian.value) return 0

  const ruangMinimum = tampilkanTombolSimpan.value ? 126 : 36
  const ruangMaksimum = tampilkanTombolSimpan.value ? 148 : 44

  return Math.min(ruangMaksimum, Math.max(ruangMinimum, lebarViewport.value * 0.18))
})
const opsiTim = computed(() =>
  store.peserta.map((peserta) => ({ id: peserta.id, nama_tim: peserta.nama_tim })),
)
const opsiPemenang = computed(() => {
  if (!pasanganAktif.value) return []

  const idTim = [pasanganAktif.value.tim_satu_id, pasanganAktif.value.tim_dua_id].filter(Boolean)
  return opsiTim.value.filter((tim) => idTim.includes(tim.id))
})
const bisaAturTim = computed(() => pertandinganAktif.value?.ronde === 0)
const keteranganPengisian = computed(() =>
  bisaAturTim.value
    ? 'Pilih dua Tim/Club, lalu tentukan pemenangnya.'
    : 'Tim masuk otomatis dari pemenang pertandingan sebelumnya. Tentukan pemenangnya.',
)

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

  return {
    kuota,
    kuotaKiri,
    kuotaKanan,
    lebar,
    tinggi,
    pertandingan,
    final,
    juaraTiga,
    hasilAkhirY: Math.max(PADDING, final.y - 156),
    identitasEventX: final.x + LEBAR_KARTU / 2 - 180,
    identitasEventY: Math.max(PADDING + 12, final.y - 290),
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
  height: calc(100vh - 58px);
  min-height: 0;
  overflow: hidden;
  padding: 0;
  background:
    radial-gradient(circle at 50% -20%, rgba(49, 122, 190, 0.12), transparent 38%),
    linear-gradient(135deg, #eef5fb 0%, #f9fbfe 48%, #edf4fa 100%);
}
.bracket-content {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  width: 100%;
  margin: auto;
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
  right: 48px;
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
  border: 1px solid #cbddeb;
  border-radius: 18px 18px 0 0;
  background: #fff;
  box-shadow: 0 12px 30px rgba(27, 57, 96, 0.12);
}
.empty-state {
  border-radius: 18px;
}
.bracket-ticker {
  display: flex;
  height: 28px;
  flex: none;
  align-items: center;
  overflow: hidden;
  padding: 0 12px;
  box-sizing: border-box;
  border: 1px solid #cbddeb;
  border-top: 0;
  border-radius: 0 0 18px 18px;
  background: #fff;
  color: #000;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.5px;
  box-shadow: 0 12px 30px rgba(27, 57, 96, 0.12);
  white-space: nowrap;
}
.bracket-ticker span {
  display: inline-block;
  padding-left: 100%;
  animation: bracket-ticker 32s linear infinite;
}
@keyframes bracket-ticker {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
.bracket-viewport {
  position: relative;
  overflow: hidden;
  transition: height 0.2s ease;
  background-color: #fafdff;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55)),
    radial-gradient(#cbd8e5 0.7px, transparent 0.7px);
  background-size:
    auto,
    16px 16px;
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
  opacity: 0.05;
  filter: invert(1);
  pointer-events: none;
}
.event-identity {
  position: absolute;
  z-index: 2;
  display: grid;
  width: 360px;
  justify-items: center;
  padding: 10px 16px;
  box-sizing: border-box;
  border: 1px solid #bbcee0;
  border-top: 3px solid #163a5e;
  border-bottom: 3px solid #163a5e;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8px 20px rgba(32, 68, 107, 0.1);
  color: #000;
  pointer-events: none;
  text-align: center;
}
.event-identity span {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 2.4px;
}
.event-identity strong {
  display: -webkit-box;
  max-width: 100%;
  margin: 4px 0;
  overflow: hidden;
  color: #000;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.4px;
  line-height: 1.08;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.event-identity small {
  color: #000;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}
.bracket-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bracket-lines path {
  fill: none;
  stroke: #71869b;
  stroke-width: 1.5;
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
  margin-bottom: 3px;
  color: #000;
  font-size: 8px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
}
.third-place-result {
  margin-bottom: 3px;
  color: #000;
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
  border-color: #4786b8;
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
  border: 1px solid #4786b8;
  border-radius: 6px;
  background: #e7f3ff;
  box-shadow: 0 3px 8px rgba(24, 47, 70, 0.13);
  color: #163a59;
  font-size: 12px;
  font-weight: 650;
}
.match-card--final .team-slot {
  border-color: #000;
  background: #fff4ca;
}
.team-slot + .team-slot:not(.team-slot--kosong) {
  border-color: #9270bc;
  background: #f2ebff;
  color: #543a75;
}
.team-slot span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.team-slot--kosong {
  border-color: #aab4be !important;
  background: #f1f3f5 !important;
  color: #697582 !important;
  font-style: italic;
  font-weight: 500;
}
.champion-mark {
  position: absolute;
  display: flex;
  width: 200px;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  color: #000;
}
.champion-title {
  margin: 2px 0 5px;
  font-size: 10px;
  font-weight: 900;
  text-align: center;
}
.champion-result {
  width: 100%;
  overflow: hidden;
  border: 1px solid #a76b00;
  border-radius: 7px;
  background: #fff7e4;
  box-shadow: 0 5px 12px rgba(117, 85, 23, 0.12);
}
.champion-result-row {
  display: grid;
  grid-template-columns: 62px 1fr;
  gap: 5px;
  padding: 4px 7px;
  font-size: 10px;
  line-height: 1.15;
}
.champion-result-row + .champion-result-row {
  border-top: 1px solid #e0c58f;
}
.champion-result-row span {
  font-weight: 900;
}
.champion-result-row strong {
  overflow: hidden;
  font-size: 10px;
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
</style>
