<template>
  <q-page class="settings-page">
    <main class="settings-content">
      <div class="page-heading">
        <q-btn flat round icon="arrow_back" aria-label="Kembali" @click="back" />
        <div>
          <span>PENGATURAN</span>
          <h1>{{ title }}</h1>
        </div>
      </div>

      <PengaturanMenu v-if="store.activeMenu === 'menu'" @open="store.open" />
      <FormBiayaIuran v-else-if="store.activeMenu === 'biaya-iuran'" />
      <PengaturanNotifikasi v-else @back="store.open('menu')" />
    </main>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import FormBiayaIuran from './comp/FormBiayaIuran.vue'
import PengaturanMenu from './comp/PengaturanMenu.vue'
import PengaturanNotifikasi from './comp/PengaturanNotifikasi.vue'
import { usePengaturanStore } from '@/stores/pengaturan'

const router = useRouter()
const store = usePengaturanStore()
const title = computed(
  () =>
    ({
      menu: 'Pengaturan aplikasi',
      'biaya-iuran': 'Setting biaya iuran',
      notifikasi: 'Aktifkan notifikasi',
    })[store.activeMenu],
)
function back() {
  if (store.activeMenu === 'menu') router.back()
  else store.open('menu')
}
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 58px);
  padding: 18px 14px;
  background: linear-gradient(180deg, #002451 0, #002451 150px, #eaf0f8 150px);
}
.settings-content {
  max-width: 430px;
  margin: auto;
}
.page-heading {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: #fff;
}
.page-heading :deep(.q-btn) {
  margin-top: 11px;
  color: #fff;
}
.page-heading span {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.7px;
}
.page-heading h1 {
  margin: 5px 0 0;
  font-size: 19px;
  line-height: 1.25;
}
</style>
