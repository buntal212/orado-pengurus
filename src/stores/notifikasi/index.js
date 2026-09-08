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

function notificationUrl(data) {
  if (data?.type === 'event_registration' && data?.registration_code) {
    return `/event-peserta?search=${encodeURIComponent(data.registration_code)}`
  }

  if (data?.destination_url) return data.destination_url

  return data?.url || data?.route || null
}

export const useNotifikasiStore = defineStore('notifikasi', {
  state: () => ({
    items: readNotifications(),
    jumlahBelumDibacaDariServer: 0,
  }),

  getters: {
    jumlahBelumDibaca: (state) => state.jumlahBelumDibacaDariServer,
  },

  actions: {
    simpan() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },

    tambah({ title, body, url, menuLabel = null, serverId = null }) {
      if (serverId && this.items.some((item) => String(item.server_id) === String(serverId))) return

      this.items.unshift({
        id: serverId
          ? `server-${serverId}`
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        server_id: serverId,
        title: title || 'ORADO PROBOLINGGO',
        body: body || 'Ada notifikasi baru.',
        url: url || null,
        menu_label: menuLabel,
        dibaca: false,
        dibuat_pada: new Date().toISOString(),
      })
      this.items = this.items.slice(0, MAX_ITEMS)
      this.jumlahBelumDibacaDariServer += 1
      this.simpan()
    },

    async getData() {
      try {
        const response = await api.get('/notifikasi')
        const riwayatServer = (response.data?.data ?? []).map((item) => ({
          id: `server-${item.id}`,
          server_id: item.id,
          title: item.title,
          body: item.body,
          type: item.data?.type || null,
          url: notificationUrl(item.data),
          menu_label: item.data?.menu_label || null,
          dibaca: item.is_read === 1,
          dibuat_pada: item.created_at,
        }))
        const riwayatLokal = this.items.filter((item) => !item.server_id)
        this.items = [...riwayatServer, ...riwayatLokal].slice(0, MAX_ITEMS)
        this.jumlahBelumDibacaDariServer = response.data?.meta?.unread_count ?? 0
        this.simpan()
      } catch (error) {
        console.warn('[ORADO] Riwayat notifikasi tidak dapat dimuat.', error)
      }
    },

    async tandaiSemuaDibaca() {
      if (!this.jumlahBelumDibaca) return
      this.items.forEach((item) => {
        item.dibaca = true
      })
      this.jumlahBelumDibacaDariServer = 0
      this.simpan()

      try {
        await api.post('/notifikasi/tandai-semua-dibaca')
      } catch (error) {
        console.warn('[ORADO] Notifikasi tidak dapat ditandai sudah dibaca.', error)
        await this.getData()
      }
    },

    async tandaiDibaca(item) {
      if (item.dibaca) return

      item.dibaca = true
      this.jumlahBelumDibacaDariServer = Math.max(0, this.jumlahBelumDibacaDariServer - 1)
      this.simpan()

      if (!item.server_id) return

      try {
        const response = await api.post(`/notifikasi/${item.server_id}/tandai-dibaca`)
        this.jumlahBelumDibacaDariServer =
          response.data?.meta?.unread_count ?? this.jumlahBelumDibacaDariServer
      } catch (error) {
        console.warn('[ORADO] Notifikasi tidak dapat ditandai sudah dibaca.', error)
        await this.getData()
      }
    },

    buka(item) {
      void this.tandaiDibaca(item)
      if (item.url) window.location.assign(item.url)
    },
  },
})
