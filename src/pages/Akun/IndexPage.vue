<template>
  <q-page class="account-page">
    <main class="account-content">
      <header class="account-heading">
        <div>
          <span>AKUN PENGURUS</span>
          <h1>Informasi Pengurus</h1>
          <p>Kartu identitas digital ORADO Kota Probolinggo.</p>
        </div>
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="download"
          label="Unduh ID Card"
          :loading="sedangMengunduh"
          @click="unduhIdCard"
        />
      </header>

      <section ref="idCard" class="id-card" aria-label="ID Card pengurus ORADO">
        <div class="id-card__ray id-card__ray--one" />
        <div class="id-card__ray id-card__ray--two" />
        <div class="id-card__ray id-card__ray--three" />
        <div class="id-card__pattern" aria-hidden="true">
          <i v-for="nomor in 8" :key="nomor" />
        </div>

        <div class="id-card__header">
          <div class="id-card__brand">
            <strong>ORADO</strong>
            <small>FEDERASI OLAHRAGA DOMINO NASIONAL</small>
            <span>ORADO PROBOLINGGO</span>
          </div>
          <canvas
            ref="logoKartu"
            class="id-card__logo"
            width="316"
            height="309"
            role="img"
            aria-label="Logo ORADO"
          />
        </div>
        <div class="id-card__line" />

        <div class="id-card__identity">
          <div class="id-card__role">{{ jabatan }}</div>
          <h2>{{ namaPengurus }}</h2>
          <span class="id-card__number">ID PENGURUS · {{ nomorPengurus }}</span>
        </div>

        <div class="id-card__footer">
          <span>ORADO KOTA PROBOLINGGO</span>
          <strong>FEDERASI OLAHRAGA DOMINO</strong>
        </div>
      </section>

      <section class="profile-card">
        <div class="profile-card__title">
          <q-avatar color="blue-1" text-color="primary" icon="person" />
          <div>
            <strong>{{ namaPengurus }}</strong>
            <span>{{ jabatan }}</span>
          </div>
        </div>
        <q-separator />
        <div class="profile-info">
          <div>
            <q-icon name="badge" />
            <span>Jabatan</span>
            <strong>{{ jabatan }}</strong>
          </div>
          <div>
            <q-icon name="phone" />
            <span>Nomor WhatsApp</span>
            <strong>{{ anggota?.no_hp || '-' }}</strong>
          </div>
          <div>
            <q-icon name="alternate_email" />
            <span>Email</span>
            <strong>{{ pengguna?.email || anggota?.email || '-' }}</strong>
          </div>
          <div>
            <q-icon name="pin" />
            <span>NIK</span>
            <strong>{{ anggota?.nik || '-' }}</strong>
          </div>
        </div>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { Notify } from 'quasar'
import { useLoginStore } from '@/stores/login'
import logoOrado from '@/assets/orado/logo-white.svg'

const loginStore = useLoginStore()
const idCard = ref(null)
const logoKartu = ref(null)
const sedangMengunduh = ref(false)
let logoSiap = Promise.resolve()

const pengguna = computed(() => loginStore.user)
const anggota = computed(() => pengguna.value?.anggota || null)
const namaPengurus = computed(
  () =>
    anggota.value?.name ||
    anggota.value?.nama ||
    pengguna.value?.name ||
    pengguna.value?.username ||
    'PENGURUS ORADO',
)
const jabatan = computed(
  () => anggota.value?.jabatan || anggota.value?.kelompok_jabatan || 'PENGURUS ORADO',
)
const nomorPengurus = computed(() =>
  String(pengguna.value?.id || anggota.value?.id || '-').padStart(5, '0'),
)

onMounted(async () => {
  logoSiap = renderLogoKartu()
  if (!anggota.value) await loginStore.getUser()
})

async function unduhIdCard() {
  if (!idCard.value) return

  sedangMengunduh.value = true
  await nextTick()

  try {
    await document.fonts?.ready
    await logoSiap
    const { default: html2canvas } = await import('html2canvas')
    const gambarKartu = await html2canvas(idCard.value, {
      backgroundColor: '#052b5d',
      scale: 3,
      useCORS: true,
    })
    const blob = await new Promise((selesai) => gambarKartu.toBlob(selesai, 'image/png'))

    if (!blob) throw new Error('Gambar ID Card tidak dapat dibuat.')

    const tautanUnduh = document.createElement('a')
    const namaFile = namaPengurus.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    tautanUnduh.href = URL.createObjectURL(blob)
    tautanUnduh.download = `id-card-orado-${namaFile || 'pengurus'}.png`
    tautanUnduh.click()
    URL.revokeObjectURL(tautanUnduh.href)
  } catch (error) {
    console.error('Gagal mengunduh ID Card:', error)
    Notify.create({ type: 'negative', message: 'ID Card gagal diunduh. Silakan coba lagi.' })
  } finally {
    sedangMengunduh.value = false
  }
}

function renderLogoKartu() {
  return new Promise((selesai, gagal) => {
    const canvas = logoKartu.value
    const konteks = canvas?.getContext('2d')
    if (!canvas || !konteks) {
      selesai()
      return
    }

    const logo = new Image()
    logo.onload = () => {
      konteks.clearRect(0, 0, canvas.width, canvas.height)
      konteks.drawImage(logo, 0, 0, canvas.width, canvas.height)
      konteks.globalCompositeOperation = 'source-in'
      const warnaEmas = konteks.createLinearGradient(0, 0, canvas.width, canvas.height)
      warnaEmas.addColorStop(0, '#fff0b6')
      warnaEmas.addColorStop(0.38, '#e5b750')
      warnaEmas.addColorStop(1, '#9e6614')
      konteks.fillStyle = warnaEmas
      konteks.fillRect(0, 0, canvas.width, canvas.height)
      konteks.globalCompositeOperation = 'source-over'
      selesai()
    }
    logo.onerror = gagal
    logo.src = logoOrado
  })
}
</script>

<style scoped>
.account-page {
  min-height: calc(100vh - 58px);
  padding: 24px 16px 40px;
  background: radial-gradient(circle at 80% 0%, rgba(34, 111, 189, 0.16), transparent 28%), #f4f7fb;
}
.account-content {
  width: min(100%, 620px);
  margin: auto;
}
.account-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}
.account-heading span {
  color: #07539c;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.8px;
}
.account-heading h1 {
  margin: 4px 0;
  color: #092f5f;
  font-size: 24px;
  line-height: 1.1;
}
.account-heading p {
  margin: 0;
  color: #617795;
  font-size: 12px;
}
.id-card {
  position: relative;
  isolation: isolate;
  width: 100%;
  aspect-ratio: 1.586 / 1;
  overflow: hidden;
  border: 1px solid rgba(197, 155, 70, 0.72);
  border-radius: 22px;
  background:
    radial-gradient(circle at 38% 54%, rgba(49, 132, 214, 0.3), transparent 39%),
    linear-gradient(130deg, #031a38, #063b75 58%, #02152e);
  box-shadow: 0 20px 36px rgba(4, 31, 67, 0.28);
  color: #fff;
}
.id-card__header,
.id-card__identity,
.id-card__footer,
.id-card__line {
  position: absolute;
  z-index: 2;
}
.id-card__header {
  top: 9.5%;
  right: 8%;
  left: 8%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.id-card__brand {
  display: grid;
  align-content: start;
}
.id-card__brand strong {
  color: #e8bd64;
  font-size: clamp(25px, 7vw, 41px);
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 0.82;
}
.id-card__brand span {
  margin-top: 5px;
  color: #f2d69d;
  font-size: clamp(8px, 2vw, 12px);
  font-weight: 800;
  letter-spacing: 0.8px;
}
.id-card__brand small {
  margin-top: 6px;
  color: #c8dced;
  font-size: clamp(6px, 1.55vw, 9px);
  font-weight: 700;
  letter-spacing: 0.45px;
}
.id-card__logo {
  display: block;
  width: clamp(55px, 16vw, 84px);
  height: auto;
  filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.25));
}
.id-card__line {
  top: 37%;
  right: 28%;
  left: 8%;
  height: 1px;
  background: linear-gradient(90deg, #e2b85e, rgba(226, 184, 94, 0));
  box-shadow: 0 0 7px rgba(236, 193, 99, 0.65);
}
.id-card__identity {
  top: 43%;
  right: 8%;
  left: 8%;
}
.id-card__role {
  color: #a7cdf5;
  font-size: clamp(8px, 1.8vw, 11px);
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.id-card__identity h2 {
  max-width: 75%;
  margin: 5px 0 4px;
  color: #f1c869;
  font-size: clamp(22px, 6.2vw, 37px);
  font-weight: 900;
  letter-spacing: -0.7px;
  line-height: 0.98;
  text-transform: uppercase;
}
.id-card__number {
  color: #d5e8fb;
  font-size: clamp(8px, 2vw, 12px);
  font-weight: 700;
  letter-spacing: 0.45px;
}
.id-card__footer {
  right: 8%;
  bottom: 8%;
  left: 8%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #dcecff;
  font-size: clamp(7px, 1.7vw, 10px);
  font-weight: 700;
  letter-spacing: 0.35px;
}
.id-card__footer strong {
  color: #e6bc63;
  font-weight: 800;
}
.id-card__ray {
  position: absolute;
  z-index: 1;
  width: 45%;
  height: 150%;
  opacity: 0.45;
  transform: rotate(35deg);
}
.id-card__ray--one {
  right: -20%;
  bottom: -82%;
  background: linear-gradient(90deg, transparent 5%, rgba(110, 181, 249, 0.48), transparent 66%);
}
.id-card__ray--two {
  right: -3%;
  bottom: -88%;
  background: linear-gradient(90deg, transparent 5%, rgba(232, 189, 100, 0.65), transparent 67%);
}
.id-card__ray--three {
  right: -37%;
  bottom: -80%;
  background: linear-gradient(90deg, transparent 5%, rgba(72, 149, 220, 0.45), transparent 67%);
}
.id-card__pattern {
  position: absolute;
  z-index: 1;
  right: -3%;
  bottom: -14%;
  display: grid;
  width: 42%;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  opacity: 0.15;
  transform: rotate(-30deg);
}
.id-card__pattern i {
  display: block;
  aspect-ratio: 1;
  background: linear-gradient(145deg, #b9dbfa, transparent);
}
.profile-card {
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid #dce7f4;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(15, 58, 107, 0.08);
}
.profile-card__title {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px;
}
.profile-card__title strong,
.profile-card__title span {
  display: block;
}
.profile-card__title strong {
  color: #102f54;
  font-size: 15px;
}
.profile-card__title span {
  margin-top: 3px;
  color: #67809e;
  font-size: 11px;
}
.profile-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.profile-info > div {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 2px 8px;
  align-items: center;
  min-width: 0;
  padding: 14px;
}
.profile-info > div:nth-child(odd) {
  border-right: 1px solid #e8eff7;
}
.profile-info > div:nth-child(n + 3) {
  border-top: 1px solid #e8eff7;
}
.profile-info .q-icon {
  grid-row: span 2;
  color: #0d5ca5;
  font-size: 20px;
}
.profile-info span,
.profile-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-info span {
  color: #6e829a;
  font-size: 10px;
}
.profile-info strong {
  color: #173858;
  font-size: 12px;
}
@media (max-width: 460px) {
  .account-page {
    padding: 18px 13px 30px;
  }
  .account-heading h1 {
    font-size: 21px;
  }
  .account-heading .q-btn {
    min-height: 34px;
    padding: 0 9px;
    font-size: 10px;
  }
  .id-card {
    border-radius: 17px;
  }
  .profile-info {
    grid-template-columns: 1fr;
  }
  .profile-info > div:nth-child(odd) {
    border-right: 0;
  }
  .profile-info > div:nth-child(n + 2) {
    border-top: 1px solid #e8eff7;
  }
}
</style>
