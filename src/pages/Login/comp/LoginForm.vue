<template>
  <section class="login-form-wrap">
    <div class="login-heading">
      <p class="eyebrow">Portal administrator</p>
      <h1>Login Pengurus</h1>
      <p>Silakan masuk untuk melanjutkan ke halaman pengurus ORADO.</p>
    </div>

    <q-form class="login-form" @submit="onSubmit">
      <label class="field-label" for="email">Email atau username</label>
      <q-input
        id="email"
        v-model="loginStore.form.email"
        outlined
        dense
        hide-bottom-space
        autocomplete="username"
        placeholder="Masukkan email atau username"
      >
        <template #prepend><q-icon name="person_outline" /></template>
      </q-input>

      <label class="field-label field-label--password" for="password">Password</label>
      <q-input
        id="password"
        v-model="loginStore.form.password"
        outlined
        dense
        hide-bottom-space
        autocomplete="current-password"
        placeholder="Masukkan password"
        :type="loginStore.showPassword ? 'text' : 'password'"
      >
        <template #prepend><q-icon name="lock_outline" /></template>
        <template #append>
          <q-icon
            class="cursor-pointer"
            :name="loginStore.showPassword ? 'visibility_off' : 'visibility'"
            @click="loginStore.showPassword = !loginStore.showPassword"
          />
        </template>
      </q-input>

      <div class="row items-center justify-between q-mt-sm">
        <q-checkbox v-model="loginStore.form.remember" dense label="Ingat saya" color="primary" />
        <q-btn flat dense no-caps class="forgot-btn" label="Lupa password?" />
      </div>

      <q-btn flat no-caps class="verify-btn" icon="person_add" label="Pendaftaran anggota" @click="router.push('/verifikasi-anggota')" />

      <q-btn
        unelevated
        no-caps
        type="submit"
        color="primary"
        class="full-width login-btn"
        label="Masuk"
        :loading="loginStore.loading"
        :disable="loginStore.loading"
      />
    </q-form>

    <p class="copyright">© 2026 ORADO. Hak cipta dilindungi.</p>
    <p class="support-by">Support by CV. UDUMBARA INFORMATIKA</p>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/login'

const loginStore = useLoginStore()
const router = useRouter()

async function onSubmit() {
  const isSuccess = await loginStore.login()

  if (isSuccess) await router.replace('/')
}
</script>

<style lang="scss" scoped>
.login-form-wrap {
  position: relative;
  z-index: 3;
  width: calc(100% - 18px);
  margin-top: -26px;
  margin-right: 9px;
  margin-left: 9px;
  padding: 22px 16px 18px;
  background: #fff;
  box-sizing: border-box;
  border-radius: 14px 14px 0 0;
}

.login-heading { margin-bottom: 24px; }
.login-heading { text-align: center; }
.eyebrow {
  margin: 0 0 3px;
  color: $primary;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #10243e;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.3;
}

.login-heading > p:last-child {
  margin: 6px 0 0;
  color: #748194;
  font-size: 11px;
  line-height: 1.55;
}

.field-label {
  display: block;
  margin: 0 0 7px;
  color: #34465d;
  font-size: 12px;
  font-weight: 600;
}

.field-label--password { margin-top: 16px; }
.login-form :deep(.q-field__control) {
  height: 48px;
  border-radius: 11px;
  color: $primary;
}
.login-form :deep(.q-field__native) { color: #23364e; font-size: 13px; }
.login-form :deep(.q-field__prepend),
.login-form :deep(.q-field__append) { color: #637891; }
.login-form :deep(.q-checkbox__label) { color: #5e6e80; font-size: 12px; }
.forgot-btn { color: $primary; font-size: 12px; font-weight: 600; }
.verify-btn { width: 100%; margin-top: 9px; color: #0a5ab8; font-size: 12px; font-weight: 600; }
.login-btn {
  min-height: 48px;
  margin-top: 22px;
  border-radius: 11px;
  box-shadow: 0 10px 22px rgba(0, 70, 161, 0.25);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.copyright { margin: 36px 0 0; color: #9da8b5; font-size: 10px; text-align: center; }
.support-by { margin: 5px 0 0; color: #667c94; font-size: 9px; font-weight: 800; letter-spacing: .2px; text-align: center; }
</style>
