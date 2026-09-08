import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const initialForm = () => ({
  id: null,
  nama_event: '',
  deskripsi: '',
  lokasi: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  pendaftaran_mulai: '',
  pendaftaran_selesai: '',
  kuota_peserta: null,
  biaya_pendaftaran: 0,
  poster: '',
  status: 'draft',
})

const toDate = (value) => (value ? String(value).slice(0, 10) : '')

export const useEventStore = defineStore('event', {
  state: () => ({
    loading: false,
    saving: false,
    items: [],
    hasMore: true,
    params: { page: 1, per_page: 15, search: '' },
    form: initialForm(),
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
        const response = await api.get('/v3/event', { params: this.params })
        const paginator = response.data?.data
        this.items.push(...(paginator?.data ?? []))
        this.hasMore = Boolean(paginator?.next_page_url)
        this.params.page += 1
      } catch (error) {
        // Jangan biarkan infinite scroll terus mencoba request yang sama saat gagal.
        this.hasMore = false
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Data event tidak dapat dimuat.',
        })
      } finally {
        this.loading = false
      }
    },

    async saveData() {
      this.saving = true
      try {
        const isEdit = Boolean(this.form.id)
        const endpoint = isEdit ? `/v3/event/${this.form.id}/edit` : '/v3/event/simpan'
        const response = await api.post(endpoint, this.form)
        const event = response.data?.data

        if (isEdit) {
          const index = this.items.findIndex((item) => item.id === event.id)
          if (index !== -1) this.items[index] = event
        } else {
          this.items.unshift(event)
        }

        Notify.create({
          type: 'positive',
          message: response.data?.message || 'Event berhasil disimpan.',
        })
        this.resetForm()
        return true
      } catch (error) {
        const message =
          Object.values(error.response?.data?.errors ?? {})?.[0]?.[0] ||
          error.response?.data?.message ||
          'Event gagal disimpan.'
        Notify.create({ type: 'negative', message })
        return false
      } finally {
        this.saving = false
      }
    },

    editData(event) {
      this.form = {
        ...initialForm(),
        ...event,
        tanggal_mulai: toDate(event.tanggal_mulai),
        tanggal_selesai: toDate(event.tanggal_selesai),
        pendaftaran_mulai: toDate(event.pendaftaran_mulai),
        pendaftaran_selesai: toDate(event.pendaftaran_selesai),
      }
    },

    async deleteData(id) {
      try {
        const response = await api.post(`/v3/event/${id}/hapus`)
        this.items = this.items.filter((item) => item.id !== id)
        if (this.form.id === id) this.resetForm()
        Notify.create({
          type: 'positive',
          message: response.data?.message || 'Event berhasil dihapus.',
        })
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Event gagal dihapus.',
        })
      }
    },

    resetForm() {
      this.form = initialForm()
    },
  },
})
