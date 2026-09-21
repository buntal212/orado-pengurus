<template>
  <q-page class="pengisian-page">
    <main class="pengisian-content">
      <header class="page-heading">
        <div>
          <span>ISI BAGAN TURNAMEN</span>
          <h1>{{ store.event?.nama_event || 'Memuat event...' }}</h1>
          <p>Susun pasangan Tim/Club untuk babak awal secara manual.</p>
        </div>
        <q-btn
          round
          flat
          icon="arrow_back"
          color="black"
          aria-label="Kembali"
          @click="router.push('/bracket-turnamen')"
        />
      </header>

      <q-inner-loading :showing="store.loadingPengisian" color="primary">
        <q-spinner-dots size="36px" />
      </q-inner-loading>

      <q-form v-if="!store.loadingPengisian && store.event" @submit="simpanBagan">
        <section class="info-card">
          <strong>{{ store.peserta.length }} Tim/Club terdaftar</strong>
          <span>{{ store.formPasangan.length }} pertandingan babak awal</span>
        </section>

        <section class="pasangan-list">
          <article
            v-for="pasangan in store.formPasangan"
            :key="pasangan.nomor_pertandingan"
            class="pasangan-card"
          >
            <strong>Pertandingan {{ pasangan.nomor_pertandingan }}</strong>
            <q-select
              v-model="pasangan.tim_satu_id"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="opsiTim"
              option-value="id"
              option-label="nama_tim"
              label="Tim/Club A"
            />
            <q-select
              v-model="pasangan.tim_dua_id"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="opsiTim"
              option-value="id"
              option-label="nama_tim"
              label="Tim/Club B"
            />
          </article>
        </section>

        <div class="form-actions">
          <q-btn
            unelevated
            no-caps
            color="blue-1"
            text-color="black"
            label="Simpan pasangan bagan"
            type="submit"
            :loading="store.savingPengisian"
          />
        </div>
      </q-form>
    </main>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBracketTurnamenStore } from '@/stores/bracket-turnamen'

const route = useRoute()
const router = useRouter()
const store = useBracketTurnamenStore()
const opsiTim = computed(() =>
  store.peserta.map((peserta) => ({ id: peserta.id, nama_tim: peserta.nama_tim })),
)

onMounted(() => store.getPengisian(route.params.eventId))

async function simpanBagan() {
  const tersimpan = await store.savePengisian(route.params.eventId)
  if (tersimpan) router.push(`/bracket-turnamen/${route.params.eventId}`)
}
</script>

<style scoped>
.pengisian-page {
  min-height: calc(100vh - 58px);
  padding: 20px 14px 40px;
  background: #f5f7fb;
}
.pengisian-content {
  max-width: 760px;
  margin: auto;
}
.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 17px;
}
.page-heading span,
.page-heading h1,
.page-heading p,
.info-card,
.pasangan-card {
  color: #000;
}
.page-heading span {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
}
.page-heading h1 {
  margin: 5px 0 0;
  font-size: 19px;
}
.page-heading p {
  margin: 4px 0 0;
  font-size: 12px;
}
.info-card,
.pasangan-card {
  border: 1px solid #dbe6f1;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(27, 57, 96, 0.05);
}
.info-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 14px;
  font-size: 12px;
}
.pasangan-list {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}
.pasangan-card {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 11px;
}
.pasangan-card > strong {
  font-size: 12px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.form-actions .q-btn {
  min-height: 40px;
  font-weight: 700;
}
@media (max-width: 599px) {
  .pasangan-card {
    grid-template-columns: 1fr;
  }
}
</style>
