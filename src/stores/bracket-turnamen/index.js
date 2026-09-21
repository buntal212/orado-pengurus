import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const REQUEST_TIMEOUT = 15000

function jumlahPertandinganBagan(kuotaPeserta) {
  const kuota = Number(kuotaPeserta)
  if (!Number.isInteger(kuota) || kuota < 2) return 0

  const slotPerSisi = 2 ** Math.ceil(Math.log2(Math.max(Math.ceil(kuota / 2), 2)))
  return slotPerSisi * 2
}

export const useBracketTurnamenStore = defineStore('bracket-turnamen', {
  state: () => ({
    loading: false,
    loadingBagan: false,
    loadingPengisian: false,
    savingPengisian: false,
    items: [],
    hasMore: true,
    params: { page: 1, per_page: 10 },
    event: null,
    peserta: [],
    pasangan: [],
    formPasangan: [],
  }),

  actions: {
    async getData({ reset = false } = {}) {
      if (reset) {
        this.loading = false
        this.items = []
        this.params.page = 1
        this.hasMore = true
      }

      if (this.loading || !this.hasMore) return

      this.loading = true
      try {
        const response = await api.get('/v3/event', {
          params: this.params,
          timeout: REQUEST_TIMEOUT,
        })
        const paginator = response.data?.data
        this.items.push(...(paginator?.data ?? []))
        this.hasMore = Boolean(paginator?.next_page_url)
        this.params.page += 1
      } catch (error) {
        this.hasMore = false
        Notify.create({
          type: 'negative',
          message:
            error.code === 'ECONNABORTED'
              ? 'Waktu memuat daftar event habis. Silakan coba lagi.'
              : error.response?.data?.message || 'Daftar event tidak dapat dimuat.',
        })
      } finally {
        this.loading = false
      }
    },

    async getBagan(eventId) {
      this.loadingBagan = true
      this.event = null
      this.peserta = []
      this.pasangan = []

      try {
        const response = await api.get(`/v3/event/${eventId}/bagan`, {
          timeout: REQUEST_TIMEOUT,
        })
        this.event = response.data?.data?.event ?? null
        this.peserta = response.data?.data?.peserta ?? []
        this.pasangan = response.data?.data?.pasangan ?? []
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Bagan turnamen tidak dapat dimuat.',
        })
      } finally {
        this.loadingBagan = false
      }
    },

    async getPengisian(eventId) {
      this.loadingPengisian = true
      this.event = null
      this.peserta = []
      this.pasangan = []
      this.formPasangan = []

      try {
        const response = await api.get(`/v3/event/${eventId}/bagan`, {
          timeout: REQUEST_TIMEOUT,
        })
        this.event = response.data?.data?.event ?? null
        this.peserta = response.data?.data?.peserta ?? []
        this.pasangan = response.data?.data?.pasangan ?? []

        const jumlahPertandingan = jumlahPertandinganBagan(this.event?.kuota_peserta)
        this.formPasangan = Array.from({ length: jumlahPertandingan }, (_, index) => {
          const pasangan = this.pasangan.find((item) => item.nomor_pertandingan === index + 1)

          return {
            nomor_pertandingan: index + 1,
            tim_satu_id: pasangan?.tim_satu_id ?? null,
            tim_dua_id: pasangan?.tim_dua_id ?? null,
            pemenang_id: pasangan?.pemenang_id ?? null,
          }
        })
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Data pengisian bagan tidak dapat dimuat.',
        })
      } finally {
        this.loadingPengisian = false
      }
    },

    async savePengisian(eventId) {
      this.savingPengisian = true
      try {
        const response = await api.post(
          `/v3/event/${eventId}/bagan`,
          { pasangan: this.formPasangan },
          { timeout: REQUEST_TIMEOUT },
        )
        this.pasangan = response.data?.data ?? []
        Notify.create({
          type: 'positive',
          message: response.data?.message || 'Bagan berhasil disimpan.',
        })
        return true
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Bagan tidak dapat disimpan.',
        })
        return false
      } finally {
        this.savingPengisian = false
      }
    },
  },
})
