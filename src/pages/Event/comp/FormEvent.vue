<template>
  <section class="form-card">
    <div class="card-title">
      <q-icon name="event" /><span>{{ store.form.id ? 'Edit event' : 'Tambah event' }}</span>
    </div>
    <q-form class="event-form" @submit="save">
      <div class="form-grid">
        <q-input
          :model-value="store.form.kode_event || 'Dibuat otomatis saat event disimpan'"
          outlined
          dense
          readonly
          label="Kode event"
        />
        <q-select
          v-model="store.form.status"
          outlined
          dense
          label="Status"
          :options="statusOptions"
          emit-value
          map-options
        />
      </div>
      <q-input v-model.trim="store.form.nama_event" outlined dense label="Nama event" />
      <q-input v-model.trim="store.form.lokasi" outlined dense label="Lokasi" />
      <q-input
        v-model="store.form.deskripsi"
        outlined
        dense
        type="textarea"
        autogrow
        label="Deskripsi"
      />
      <div class="form-grid">
        <q-input
          v-model="store.form.tanggal_mulai"
          outlined
          dense
          type="date"
          label="Tanggal mulai"
          stack-label
        />
        <q-input
          v-model="store.form.tanggal_selesai"
          outlined
          dense
          type="date"
          label="Tanggal selesai"
          stack-label
        />
        <q-input
          v-model="store.form.pendaftaran_mulai"
          outlined
          dense
          type="date"
          label="Pendaftaran mulai"
          stack-label
        />
        <q-input
          v-model="store.form.pendaftaran_selesai"
          outlined
          dense
          type="date"
          label="Pendaftaran selesai"
          stack-label
        />
      </div>
      <div class="form-grid">
        <q-input
          v-model.number="store.form.kuota_peserta"
          outlined
          dense
          type="number"
          min="1"
          label="Kuota peserta"
        />
        <q-input
          v-model.number="store.form.biaya_pendaftaran"
          outlined
          dense
          type="number"
          min="0"
          prefix="Rp"
          label="Biaya pendaftaran"
        />
      </div>
      <q-input v-model.trim="store.form.poster" outlined dense label="URL poster (opsional)" />
      <div class="form-actions">
        <q-btn
          v-if="store.form.id"
          flat
          no-caps
          color="grey-7"
          label="Batal"
          @click="store.resetForm"
        />
        <q-btn
          unelevated
          no-caps
          color="primary"
          type="submit"
          :loading="store.saving"
          :label="store.form.id ? 'Simpan perubahan' : 'Simpan event'"
        />
      </div>
    </q-form>
  </section>
</template>

<script setup>
import { useEventStore } from '@/stores/event'

const emit = defineEmits(['saved'])
const store = useEventStore()
const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pendaftaran dibuka', value: 'dibuka' },
  { label: 'Pendaftaran ditutup', value: 'ditutup' },
]

async function save() {
  if (await store.saveData()) emit('saved')
}
</script>

<style scoped>
.form-card {
  padding: 15px;
  border: 1px solid #e1e8f1;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(27, 57, 96, 0.05);
}
.card-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
  color: #1d3e69;
  font-size: 12px;
  font-weight: 700;
}
.event-form {
  display: grid;
  gap: 10px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
}
@media (max-width: 420px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
