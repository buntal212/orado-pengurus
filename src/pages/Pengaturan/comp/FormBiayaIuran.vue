<template>
  <section class="form-card">
    <div class="form-title">
      <q-icon name="payments" />
      <div>
        <strong>Biaya iuran standar</strong><small>Nominal acuan iuran anggota setiap bulan.</small>
      </div>
    </div>
    <q-input
      v-model="formattedAmount"
      outlined
      dense
      prefix="Rp"
      label="Nominal iuran"
      inputmode="numeric"
    /><q-btn
      unelevated
      no-caps
      color="primary"
      icon="save"
      label="Simpan biaya iuran"
      class="save-button"
      @click="save"
    />
  </section>
</template>
<script setup>
import { computed } from 'vue'
import { Notify } from 'quasar'
import { usePengaturanStore } from '@/stores/pengaturan'
const store = usePengaturanStore()
const formattedAmount = computed({
  get: () => new Intl.NumberFormat('id-ID').format(store.biayaIuran),
  set: (value) => {
    store.biayaIuran = Number(String(value).replace(/\D/g, '')) || 0
  },
})
function save() {
  store.saveBiayaIuran()
  Notify.create({ type: 'positive', message: 'Biaya iuran standar berhasil disimpan.' })
}
</script>
<style scoped>
.form-card {
  margin-top: 30px;
  padding: 17px;
  border: 1px solid #ccdeec;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(10, 41, 80, 0.12);
}
.form-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.form-title > .q-icon {
  color: #0a5fbe;
  font-size: 30px;
}
.form-title strong,
.form-title small {
  display: block;
}
.form-title strong {
  color: #12365f;
  font-size: 14px;
}
.form-title small {
  margin-top: 3px;
  color: #7186a0;
  font-size: 10px;
}
.save-button {
  width: 100%;
  margin-top: 14px;
}
</style>
