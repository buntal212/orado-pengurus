import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const initialVerificationForm = () => ({ id: null, name: '', jabatan: '' })

export const useAnggotaStore = defineStore('master-anggota', {
  state: () => ({
    loading: false,
    saving: false,
    items: [],
    hasMore: true,
    jabatanOptions: [],
    params: { page: 1, per_page: 15, search: '', status: 'terverifikasi' },
    verificationForm: initialVerificationForm(),
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
        const response = await api.get('/v1/master/anggota', { params: this.params })
        const paginator = response.data?.data
        this.items.push(...(paginator?.data ?? []))
        this.hasMore = Boolean(paginator?.next_page_url)
        this.params.page += 1
      } catch (error) {
        Notify.create({ type: 'negative', message: error.response?.data?.message || 'Data anggota tidak dapat dimuat.' })
      } finally {
        this.loading = false
      }
    },

    async verifyMember() {
      this.saving = true
      try {
        const response = await api.post(`/v1/master/anggota/${this.verificationForm.id}/verifikasi`, {
          jabatan: this.verificationForm.jabatan,
        })
        const item = response.data?.data
        const index = this.items.findIndex(row => row.id === item.id)
        if (index !== -1) this.items[index] = item
        Notify.create({ type: 'positive', message: response.data?.message || 'Data anggota berhasil diverifikasi.' })
        this.resetVerificationForm()
        return true
      } catch (error) {
        const message = Object.values(error.response?.data?.errors ?? {})?.[0]?.[0] || error.response?.data?.message || 'Data anggota gagal diverifikasi.'
        Notify.create({ type: 'negative', message })
        return false
      } finally {
        this.saving = false
      }
    },

    async getJabatanOptions() {
      try {
        const response = await api.get('/v1/master/jabatan', { params: { per_page: 100 } })
        this.jabatanOptions = (response.data?.data?.data ?? []).map(item => item.nama)
      } catch (error) {
        Notify.create({ type: 'negative', message: error.response?.data?.message || 'Pilihan jabatan tidak dapat dimuat.' })
      }
    },

    openVerification(item) {
      this.verificationForm = { id: item.id, name: item.name, jabatan: item.jabatan || '' }
    },

    async deleteData(id) {
      try {
        const response = await api.post(`/v1/master/anggota/${id}/hapus`)
        this.items = this.items.filter(item => item.id !== id)
        if (this.verificationForm.id === id) this.resetVerificationForm()
        Notify.create({ type: 'positive', message: response.data?.message || 'Data anggota berhasil dihapus.' })
      } catch (error) {
        Notify.create({ type: 'negative', message: error.response?.data?.message || 'Data anggota gagal dihapus.' })
      }
    },

    resetVerificationForm() {
      this.verificationForm = initialVerificationForm()
    },
  },
})
