<template>
  <q-page class="bracket-page">
    <main class="bracket-content">
      <header class="page-heading">
        <div>
          <span>BRACKET TURNAMEN</span>
          <p>Pilih event untuk melihat bagan pertandingan.</p>
        </div>
        <q-btn
          round
          flat
          icon="arrow_back"
          color="black"
          aria-label="Kembali"
          @click="router.push('/')"
        />
      </header>

      <ListEvent @lihat-bagan="lihatBagan" @isi-bagan="isiBagan" />
    </main>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ListEvent from './comp/ListEvent.vue'
import { useBracketTurnamenStore } from '@/stores/bracket-turnamen'

const router = useRouter()
const store = useBracketTurnamenStore()

onMounted(() => store.getData({ reset: true }))

function lihatBagan(eventId) {
  router.push(`/bracket-turnamen/${eventId}`)
}

function isiBagan(eventId) {
  router.push({ path: `/bracket-turnamen/${eventId}`, query: { isi: '1' } })
}
</script>

<style scoped>
.bracket-page {
  min-height: calc(100vh - 58px);
  padding: 20px 14px 40px;
  background: #f5f7fb;
}
.bracket-content {
  max-width: 720px;
  margin: auto;
}
.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 17px;
}
.page-heading span {
  color: #000;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
}
.page-heading p {
  margin: 4px 0 0;
  color: #000;
  font-size: 12px;
}
</style>
