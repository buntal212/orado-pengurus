<template>
  <q-card class="form-card">
    <q-card-section class="form-heading">
      <div>
        <div class="form-title">Edit peserta event</div>
        <div class="form-subtitle">{{ store.form.kode_pendaftaran }}</div>
      </div>
      <q-btn flat round dense icon="close" aria-label="Tutup" @click="tutup" />
    </q-card-section>

    <q-separator />

    <q-form class="participant-form" @submit="simpan">
      <q-card-section>
        <div class="section-title">Data tim</div>
        <q-input
          v-model.trim="store.form.nama_tim"
          outlined
          dense
          label="Nama tim"
          class="q-mt-sm"
        />

        <div class="section-title q-mt-lg">Atlet 1</div>
        <div class="form-grid">
          <q-input v-model.trim="store.form.nama_atlet_satu" outlined dense label="Nama atlet 1" />
          <q-input v-model.trim="store.form.nik_atlet_satu" outlined dense label="NIK atlet 1" />
          <q-input
            v-model="store.form.tanggal_lahir_atlet_satu"
            outlined
            dense
            type="date"
            label="Tanggal lahir atlet 1"
            stack-label
          />
          <q-select
            v-model="store.form.jenis_kelamin_atlet_satu"
            outlined
            dense
            label="Jenis kelamin atlet 1"
            :options="jenisKelamin"
          />
          <q-input
            v-model.trim="store.form.no_hp_atlet_satu"
            outlined
            dense
            label="Nomor WhatsApp atlet 1"
          />
        </div>

        <div class="section-title q-mt-lg">Atlet 2</div>
        <div class="form-grid">
          <q-input v-model.trim="store.form.nama_atlet_dua" outlined dense label="Nama atlet 2" />
          <q-input v-model.trim="store.form.nik_atlet_dua" outlined dense label="NIK atlet 2" />
          <q-input
            v-model="store.form.tanggal_lahir_atlet_dua"
            outlined
            dense
            type="date"
            label="Tanggal lahir atlet 2"
            stack-label
          />
          <q-select
            v-model="store.form.jenis_kelamin_atlet_dua"
            outlined
            dense
            label="Jenis kelamin atlet 2"
            :options="jenisKelamin"
          />
          <q-input
            v-model.trim="store.form.no_hp_atlet_dua"
            outlined
            dense
            label="Nomor WhatsApp atlet 2"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat no-caps color="grey-7" label="Batal" @click="tutup" />
        <q-btn
          unelevated
          no-caps
          color="primary"
          type="submit"
          label="Simpan perubahan"
          :loading="store.saving"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { usePesertaEventStore } from '@/stores/peserta-event'

const emit = defineEmits(['close', 'saved'])
const store = usePesertaEventStore()
const jenisKelamin = ['Laki-laki', 'Perempuan']

function tutup() {
  store.resetForm()
  emit('close')
}

async function simpan() {
  if (await store.saveData()) emit('saved')
}
</script>

<style scoped>
.form-card {
  width: min(720px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow: auto;
}
.form-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.form-title {
  color: #000;
  font-size: 16px;
  font-weight: 800;
}
.form-subtitle {
  margin-top: 3px;
  color: #000;
  font-size: 11px;
  font-weight: 700;
}
.participant-form {
  color: #000;
}
.section-title {
  color: #000;
  font-size: 13px;
  font-weight: 800;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}
@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
