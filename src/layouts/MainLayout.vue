<template>
  <q-layout view="lHh Lpr lFf" class="app-shell">
    <q-header class="app-header">
      <q-toolbar class="sso-toolbar">
        <q-avatar size="30px" class="header-logo">
          <img src="@/assets/orado/logo-white.svg" alt="ORADO" />
        </q-avatar>
        <q-toolbar-title>ORADO Kota Probolinggo</q-toolbar-title>

        <q-btn flat round dense icon="notifications_none" aria-label="Notifikasi">
          <q-badge
            v-if="notifikasi.jumlahBelumDibaca"
            floating
            rounded
            color="red"
            :label="badgeLabel"
          />
          <q-menu class="notification-menu" @show="notifikasi.tandaiSemuaDibaca">
            <q-card flat class="notification-card">
              <div class="notification-heading">
                <div>
                  <strong>Notifikasi</strong>
                  <span>{{ notifikasi.items.length ? 'Notifikasi terbaru ORADO' : 'Belum ada notifikasi' }}</span>
                </div>
                <q-icon name="notifications" color="primary" size="22px" />
              </div>
              <q-separator />
              <q-list v-if="notifikasi.items.length" separator>
                <q-item v-for="item in notifikasi.items" :key="item.id" clickable @click="notifikasi.buka(item)">
                  <q-item-section avatar top>
                    <q-avatar size="32px" color="blue-1" text-color="primary" icon="notifications" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="notification-title">{{ item.title }}</q-item-label>
                    <q-item-label caption lines="2">{{ item.body }}</q-item-label>
                    <q-item-label v-if="item.menu_label" caption class="notification-menu-label">
                      <q-icon name="open_in_new" /> {{ item.menu_label }}
                    </q-item-label>
                    <q-item-label caption class="notification-time">{{ waktuNotifikasi(item.dibuat_pada) }}</q-item-label>
                  </q-item-section>
                  <q-item-section v-if="!item.dibaca" side top><span class="unread-dot" /></q-item-section>
                </q-item>
              </q-list>
              <div v-else class="notification-empty">
                <q-icon name="notifications_none" size="34px" />
                <span>Notifikasi masuk akan tampil di sini.</span>
              </div>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container><router-view /></q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useNotifikasiStore } from '@/stores/notifikasi'

const notifikasi = useNotifikasiStore()
const badgeLabel = computed(() => (notifikasi.jumlahBelumDibaca > 99 ? '99+' : notifikasi.jumlahBelumDibaca))

let notificationInterval

onMounted(() => {
  notifikasi.getData()
  notificationInterval = window.setInterval(() => {
    if (document.visibilityState === 'visible') notifikasi.getData()
  }, 30000)
})

onBeforeUnmount(() => window.clearInterval(notificationInterval))

function waktuNotifikasi(value) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
</script>

<style lang="scss" scoped>
.app-shell { width: 100%; min-height: 100vh; background: #f7f9fc; }
.app-header { color: #fff; background: #002451; }
.sso-toolbar { width: 100%; max-width: 1030px; min-height: 58px; margin: 0 auto; padding: 0 10px; }
.q-toolbar-title { padding-left: 6px; font-size: 14px; font-weight: 700; letter-spacing: .2px; }
.header-logo { display: grid; place-items: center; background: rgba(255,255,255,.1); }
.header-logo img { width: 25px; height: 25px; object-fit: contain; }
.notification-menu { width: min(360px, calc(100vw - 24px)); margin-top: 8px; border-radius: 14px; }
.notification-card { overflow: hidden; background: #fff; }
.notification-heading { display: flex; align-items: center; justify-content: space-between; padding: 14px 15px; }
.notification-heading strong, .notification-heading span { display: block; }
.notification-heading strong { color: #123965; font-size: 14px; }
.notification-heading span { margin-top: 2px; color: #71839a; font-size: 10px; }
.notification-title { color: #1b426f; font-size: 12px; font-weight: 700; }
.notification-time { margin-top: 4px; color: #8293a7; font-size: 9px; }
.notification-menu-label { margin-top: 4px; color: #1976d2; font-size: 10px; font-weight: 700; }
.unread-dot { width: 8px; height: 8px; border-radius: 999px; background: #1976d2; }
.notification-empty { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 30px 15px; color: #87a0ba; font-size: 11px; text-align: center; }
</style>
