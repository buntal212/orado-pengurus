<template>
  <q-page class="event-page">
    <main class="event-content">
      <div class="page-heading">
        <div>
          <span>Data Event</span>
          <p>Kelola event dan periode pendaftarannya.</p>
        </div>
        <q-btn
          round
          flat
          icon="arrow_back"
          color="primary"
          aria-label="Kembali"
          @click="router.push('/')"
        />
      </div>

      <FormEvent @saved="scrollToList" />
      <ListEvent ref="listEvent" />
    </main>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FormEvent from './comp/FormEvent.vue'
import ListEvent from './comp/ListEvent.vue'

const router = useRouter()
const listEvent = ref(null)

function scrollToList() {
  listEvent.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.event-page {
  min-height: calc(100vh - 58px);
  padding: 20px 14px 40px;
  background: #f5f7fb;
}
.event-content {
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
  color: #0753b6;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
}
.page-heading p {
  margin: 3px 0 0;
  color: #74859b;
  font-size: 11px;
}
</style>
