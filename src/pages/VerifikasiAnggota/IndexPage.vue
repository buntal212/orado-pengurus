<template>
  <main class="registration-page">
    <section class="registration-shell">
      <div class="registration-hero"><i class="orbit orbit--one" /><i class="orbit orbit--two" /><div class="hero-logo"><img src="@/assets/orado/logo-white.svg" alt="ORADO" /></div><span>PORTAL ORADO</span><strong>Pendaftaran Anggota</strong><p>Kota Probolinggo</p></div>
      <section class="registration-card">
        <q-btn flat round dense icon="arrow_back" color="primary" class="back-button" aria-label="Kembali ke login" @click="router.push('/login')" />
        <div class="registration-heading"><span>FORM PENDAFTARAN</span><p>Lengkapi data berikut untuk membuat akun anggota ORADO.</p></div>
        <q-form class="registration-form" @submit="submitRegistration">
          <q-input v-model.trim="store.form.name" outlined label="Nama lengkap" placeholder="Masukkan nama lengkap"><template #prepend><q-icon name="person_outline" /></template></q-input>
          <q-input v-model.trim="store.form.nik" outlined label="NIK" inputmode="numeric" placeholder="Masukkan 16 digit NIK"><template #prepend><q-icon name="badge" /></template></q-input>
          <q-input v-model.trim="store.form.no_hp" outlined label="No. HP" inputmode="tel" placeholder="Masukkan nomor HP"><template #prepend><q-icon name="phone_android" /></template></q-input>
          <q-input v-model.trim="store.form.username" outlined label="Username" placeholder="Buat username"><template #prepend><q-icon name="alternate_email" /></template></q-input>
          <q-input v-model.trim="store.form.email" outlined label="Email" type="email" placeholder="Masukkan alamat email"><template #prepend><q-icon name="mail_outline" /></template></q-input>
          <q-input v-model="store.form.password" outlined label="Password" type="password" placeholder="Minimal 8 karakter"><template #prepend><q-icon name="lock_outline" /></template></q-input>
          <q-input v-model="store.form.password_confirmation" outlined label="Ketik ulang password" type="password" placeholder="Ulangi password"><template #prepend><q-icon name="lock_reset" /></template></q-input>
          <q-btn unelevated no-caps color="primary" class="full-width submit-button" type="submit" :loading="store.saving" label="Daftar sebagai anggota" />
        </q-form>
        <p class="login-link">Sudah memiliki akun? <button type="button" @click="router.push('/login')">Masuk</button></p>
      </section>
    </section>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVerifikasiAnggotaStore } from '@/stores/verifikasianggota'

const router = useRouter()
const store = useVerifikasiAnggotaStore()

onMounted(() => store.resetForm())

async function submitRegistration() {
  const success = await store.registerAnggota()
  if (success) router.replace('/login')
}
</script>

<style scoped>
.registration-page { display: grid; min-height: 100vh; place-items: center; padding: 24px; background: radial-gradient(circle at 50% 15%, #fff 0, #eef3fa 55%, #e7edf6 100%); }.registration-shell { width: min(100%, 440px); overflow: hidden; border: 1px solid rgba(214,225,239,.8); border-radius: 24px; background: #fff; box-shadow: 0 26px 60px rgba(5,38,82,.18); }.registration-hero { position: relative; overflow: hidden; padding: 27px 20px 47px; color: #fff; text-align: center; background: linear-gradient(145deg,#001b40,#064da1); }.orbit { position: absolute; border: 1px solid rgba(255,255,255,.1); border-radius: 50%; }.orbit--one { top: -95px; left: -82px; width: 210px; height: 210px; }.orbit--two { right: -120px; bottom: -135px; width: 265px; height: 265px; }.hero-logo { position: relative; z-index: 1; display: grid; width: 76px; height: 76px; margin: auto auto 10px; place-items: center; border: 1px solid rgba(255,255,255,.23); border-radius: 22px; background: rgba(0,17,55,.23); box-shadow: 0 10px 25px rgba(0,0,0,.2); }.hero-logo img { width: 62px; height: 62px; object-fit: contain; }.registration-hero span,.registration-hero strong,.registration-hero p { position: relative; z-index: 1; display: block; }.registration-hero span { color: rgba(255,255,255,.7); font-size: 9px; font-weight: 700; letter-spacing: 1.4px; }.registration-hero strong { margin-top: 4px; font-size: 17px; }.registration-hero p { margin: 4px 0 0; color: rgba(255,255,255,.7); font-size: 10px; }.registration-card { position: relative; margin-top: -21px; padding: 23px 20px 22px; border-radius: 21px 21px 0 0; background: #fff; }.back-button { position: absolute; top: 11px; right: 10px; }.registration-heading { padding-right: 30px; }.registration-heading > span { color: #0a5abb; font-size: 8px; font-weight: 800; letter-spacing: 1px; }.registration-heading h1 { margin: 5px 0 0; color: #12345e; font-size: 20px; letter-spacing: -.2px; }.registration-heading p { margin: 6px 0 18px; color: #74869d; font-size: 11px; line-height: 1.5; }.registration-form { display: grid; gap: 11px; }.submit-button { min-height: 47px; margin-top: 3px; border-radius: 11px; box-shadow: 0 9px 18px rgba(0,75,170,.22); font-weight: 700; }.login-link { margin: 16px 0 0; color: #73849b; font-size: 10px; text-align: center; }.login-link button { border: 0; color: #0759b7; background: transparent; font: inherit; font-weight: 700; cursor: pointer; }
</style>
