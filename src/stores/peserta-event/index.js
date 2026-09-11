import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

export const usePesertaEventStore = defineStore('peserta-event', {
  state: () => ({
    loading: false,
    items: [],
    hasMore: true,
    params: { page: 1, search: '' },
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
  },
})
