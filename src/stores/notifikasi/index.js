import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

const STORAGE_KEY = 'orado_pengurus_notifikasi'
const MAX_ITEMS = 30

function readNotifications() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export const useNotifikasiStore = defineStore('notifikasi', {
  state: () => ({
    items: readNotifications(),
  }),

  getters: {
    jumlahBelumDibaca: (state) => state.items.filter((item) => !item.dibaca).length,
  },

  actions: {
    simpan() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },

    tambah({ title, body, url, menuLabel = null, serverId = null }) {
      if (serverId && this.items.some((item) => String(item.server_id) === String(serverId))) return

      this.items.unshift({
        id: serverId ? `server-${serverId}` : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        server_id: serverId,
        title: title || 'ORADO PROBOLINGGO',
        body: body || 'Ada notifikasi baru.',
        url: url || null,
        menu_label: menuLabel,
        dibaca: false,
        dibuat_pada: new Date().toISOString(),
      })
      this.items = this.items.slice(0, MAX_ITEMS)
      this.simpan()
    },

    async getData() {
      try {
        const response = await api.get('/notifikasi')
        const sudahDibaca = new Set(
          this.items.filter((item) => item.dibaca && item.server_id).map((item) => String(item.server_id)),
        )
        const riwayatServer = (response.data?.data ?? []).map((item) => ({
          id: `server-${item.id}`,
          server_id: item.id,
          title: item.title,
          body: item.body,
          url: item.data?.url || item.data?.route || null,
          menu_label: item.data?.menu_label || null,
          dibaca: sudahDibaca.has(String(item.id)),
          dibuat_pada: item.created_at,
        }))
        const riwayatLokal = this.items.filter((item) => !item.server_id)
        this.items = [...riwayatServer, ...riwayatLokal].slice(0, MAX_ITEMS)
        this.simpan()
      } catch (error) {
        console.warn('[ORADO] Riwayat notifikasi tidak dapat dimuat.', error)
      }
    },

    tandaiSemuaDibaca() {
      if (!this.jumlahBelumDibaca) return
      this.items.forEach((item) => {
        item.dibaca = true
      })
      this.simpan()
    },

    buka(item) {
      item.dibaca = true
      this.simpan()
      if (item.url) window.location.assign(item.url)
    },
  },
})
