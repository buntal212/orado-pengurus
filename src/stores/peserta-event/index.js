import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

export const usePesertaEventStore = defineStore('peserta-event', {
  state: () => ({
    loading: false,
    items: [],
    hasMore: true,
    eventOptions: [],
    params: { page: 1, search: '', master_event_id: null },
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
        const response = await api.get('/v3/event/peserta', {
          params: this.params,
        })
        const paginator = response.data?.data
        this.items.push(...(paginator?.data ?? []))
        this.hasMore = Boolean(paginator?.next_page_url)
        this.params.page += 1
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Data peserta event tidak dapat dimuat.',
        })
      } finally {
        this.loading = false
      }
    },

    async getEventOptions() {
      try {
        const response = await api.get('/v3/event', { params: { per_page: 100 } })
        this.eventOptions = response.data?.data?.data ?? []
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Pilihan event tidak dapat dimuat.',
        })
      }
    },
  },
})
