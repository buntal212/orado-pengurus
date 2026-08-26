import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

export const useClubStore = defineStore('master-club', {
  state: () => ({
    loading: false,
    saving: false,
    items: [],
    hasMore: true,
    params: { page: 1, per_page: 15, search: '', status: 'terverifikasi' },
  }),

  actions: {
    async getData({ reset = false } = {}) {
      if (reset) {
        this.items = []
        this.params.page = 1
        this.hasMore = true
      }

      if (this.loading || !this.hasMore) return

      this.loading = true
      try {
        const response = await api.get('/v1/master/club', { params: this.params })
        const paginator = response.data?.data
        this.items.push(...(paginator?.data ?? []))
        this.hasMore = Boolean(paginator?.next_page_url)
        this.params.page += 1
      } catch (error) {
        Notify.create({ type: 'negative', message: error.response?.data?.message || 'Data club tidak dapat dimuat.' })
      } finally {
        this.loading = false
      }
    },

    async updateVerifikasi(id, action) {
      this.saving = true
      try {
        const response = await api.post(`/v1/master/club/${id}/${action}`)
        const item = response.data?.data
        const index = this.items.findIndex(row => row.id === item.id)
        if (index !== -1) this.items[index] = item
        Notify.create({ type: action === 'verifikasi' ? 'positive' : 'warning', message: response.data?.message || 'Status club berhasil diperbarui.' })
      } catch (error) {
        const message = Object.values(error.response?.data?.errors ?? {})?.[0]?.[0] || error.response?.data?.message || 'Status club gagal diperbarui.'
        Notify.create({ type: 'negative', message })
      } finally {
        this.saving = false
      }
    },
  },
})
