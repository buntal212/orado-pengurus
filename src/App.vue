<template>
  <router-view />
  <PwaControl />
</template>

<script setup>
import { onMounted } from 'vue'
import PwaControl from '@/components/PwaControl.vue'

onMounted(() => {
  const splash = document.getElementById('orado-splash')
  if (!splash) return

  splash.classList.add('is-hidden')
  window.setTimeout(() => splash.remove(), 220)
})
</script>
