<template>
  <router-view />
  <PwaControl :allow-install-prompt="route.path === '/login'" />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PwaControl from '@/components/PwaControl.vue'

const route = useRoute()

onMounted(() => {
  const splash = document.getElementById('orado-splash')
  if (!splash) return

  splash.classList.add('is-hidden')
  window.setTimeout(() => splash.remove(), 220)
})
</script>
