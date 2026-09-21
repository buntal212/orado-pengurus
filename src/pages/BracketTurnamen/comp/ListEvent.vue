<template>
  <section class="list-card">
    <article v-for="event in store.items" :key="event.id" class="event-row">
      <q-avatar color="blue-1" text-color="black" icon="event" />
      <div class="event-copy">
        <strong>{{ event.nama_event }}</strong>
        <span>{{ event.kode_event }}</span>
        <span><q-icon name="calendar_month" /> {{ periodeEvent(event) }}</span>
        <span v-if="event.lokasi"><q-icon name="location_on" /> {{ event.lokasi }}</span>
      </div>
      <q-btn
        unelevated
        no-caps
        color="blue-1"
        text-color="black"
        icon="account_tree"
        label="Lihat bagan"
        @click="emit('lihatBagan', event.id)"
      />
      <!-- <q-btn
        unelevated
        no-caps
        color="blue-1"
        text-color="black"
        icon="edit_note"
        label="Isi bagan"
        @click="emit('isiBagan', event.id)"
      /> -->
    </article>

    <q-infinite-scroll
      v-if="store.hasMore && store.items.length"
      :offset="150"
      @load="muatBerikutnya"
    >
      <div class="row justify-center q-pa-md"><q-spinner-dots color="primary" size="28px" /></div>
    </q-infinite-scroll>

    <div v-if="!store.loading && !store.items.length" class="empty-state">
      Belum ada event yang dapat ditampilkan.
    </div>

    <div v-if="store.loading && !store.items.length" class="loading-state">
      <q-spinner-dots color="primary" size="32px" />
    </div>
  </section>
</template>

<script setup>
import { useBracketTurnamenStore } from '@/stores/bracket-turnamen'

const emit = defineEmits(['lihatBagan', 'isiBagan'])
const store = useBracketTurnamenStore()

async function muatBerikutnya(_, done) {
  await store.getData()
  done(!store.hasMore)
}

function periodeEvent(event) {
  const format = (tanggal) => String(tanggal || '-').slice(0, 10)

  return `${format(event.tanggal_mulai)} - ${format(event.tanggal_selesai)}`
}
</script>

<style scoped>
.list-card {
  position: relative;
  min-height: 120px;
  overflow: hidden;
  border: 1px solid #e1e8f1;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(27, 57, 96, 0.05);
}
.event-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 11px;
  padding: 14px;
  border-top: 1px solid #edf1f5;
}
.event-row:first-child {
  border-top: 0;
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
.event-copy .q-icon {
  font-size: 13px;
}
.event-row .q-btn {
  grid-column: 2;
  justify-self: start;
  min-height: 34px;
  margin-top: 5px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 700;
}
.event-row .q-btn + .q-btn {
  margin-top: -1px;
}
.empty-state {
  padding: 28px 14px;
  color: #000;
  font-size: 12px;
  text-align: center;
}
.loading-state {
  display: grid;
  min-height: 120px;
  place-items: center;
}
</style>
