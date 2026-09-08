<template>
  <section class="list-card">
    <div class="list-header">
      <div>
        <strong>Daftar event</strong><span>{{ store.items.length }} event dimuat</span>
      </div>
      <q-icon name="event_note" />
    </div>
    <q-input
      v-model="store.params.search"
      dense
      borderless
      placeholder="Cari kode, nama, atau lokasi event"
      class="search-input"
      @update:model-value="searchData"
      ><template #prepend><q-icon name="search" /></template
    ></q-input>

    <article v-for="event in store.items" :key="event.id" class="event-row">
      <q-avatar size="44px" color="blue-1" text-color="primary" icon="event" />
      <div class="event-copy">
        <strong>{{ event.nama_event }}</strong>
        <span class="event-code">{{ event.kode_event }}</span>
        <span
          ><q-icon name="calendar_month" /> {{ formatDate(event.tanggal_mulai) }} -
          {{ formatDate(event.tanggal_selesai) }}</span
        >
        <span v-if="event.lokasi"><q-icon name="location_on" /> {{ event.lokasi }}</span>
        <span
          >{{ formatCurrency(event.biaya_pendaftaran) }} · Kuota
          {{ event.kuota_peserta || '-' }}</span
        >
      </div>
      <q-badge :color="statusColor(event.status)" :label="statusLabel(event.status)" />
      <div class="row-actions">
        <q-btn
          flat
          round
          dense
          icon="edit"
          color="primary"
          aria-label="Edit"
          @click="store.editData(event)"
        /><q-btn
          flat
          round
          dense
          icon="delete_outline"
          color="negative"
          aria-label="Hapus"
          @click="store.deleteData(event.id)"
        />
      </div>
    </article>

    <q-infinite-scroll v-if="store.hasMore" :offset="150" @load="loadMore"
      ><div class="row justify-center q-pa-md"><q-spinner-dots color="primary" size="28px" /></div
    ></q-infinite-scroll>
    <div v-if="!store.loading && !store.items.length" class="empty-state">
      Belum ada data event.
    </div>
  </section>
</template>

<script setup>
import { useEventStore } from '@/stores/event'

const store = useEventStore()
let searchTimer

async function loadMore(index, done) {
  await store.getData()
  done(!store.hasMore)
}
function searchData() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.getData({ reset: true }), 300)
}
function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date) : '-'
}
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}
function statusLabel(status) {
  return { draft: 'Draft', dibuka: 'Dibuka', ditutup: 'Ditutup' }[status] || status
}
function statusColor(status) {
  return { draft: 'blue-grey-6', dibuka: 'positive', ditutup: 'negative' }[status] || 'blue-grey-6'
}
</script>

<style scoped>
.list-card {
  margin-top: 15px;
  overflow: hidden;
  border: 1px solid #e1e8f1;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(27, 57, 96, 0.05);
}
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  color: #1a3b65;
}
.list-header strong,
.list-header span {
  display: block;
}
.list-header strong {
  font-size: 12px;
}
.list-header span {
  margin-top: 2px;
  color: #8291a4;
  font-size: 9px;
}
.search-input {
  margin: 0 12px 8px;
  padding: 7px 9px;
  border: 1px solid #e6edf4;
  border-radius: 9px;
}
.event-row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 11px;
  align-items: start;
  padding: 14px;
  border-top: 1px solid #cddded;
  background: #fff;
}
.event-copy {
  min-width: 0;
}
.event-copy strong,
.event-copy span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-copy strong {
  color: #000;
  font-size: 14px;
}
.event-copy span {
  margin-top: 3px;
  color: #000;
  font-size: 11px;
}
.event-copy .event-code {
  color: #000;
  font-size: 10px;
  font-weight: 700;
}
.event-copy .q-icon {
  margin-right: 2px;
  font-size: 12px;
}
.event-row .q-badge {
  margin-top: 3px;
  font-size: 9px;
}
.row-actions {
  display: flex;
  grid-column: 2 / -1;
  justify-content: flex-end;
}
.empty-state {
  padding: 26px 14px;
  color: #8291a4;
  font-size: 11px;
  text-align: center;
}
</style>
