import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

export const useVerifikasiAnggotaStore = defineStore('verifikasi-anggota', {
  state: () => ({
    loading: false,
    saving: false,
    anggota: null,
    form: { name: '', nik: '', no_hp: '', username: '', email: '', password: '', password_confirmation: '' },
  }),

  actions: {
    async registerAnggota() {
      this.saving = true
      try {
        const response = await api.post('/v1/auth/pendaftaran-anggota', this.form)
        Notify.create({ type: 'positive', message: response.data?.message || 'Pendaftaran anggota berhasil.' })
        return true
      } catch (error) {
        const message = Object.values(error.response?.data?.errors ?? {})?.[0]?.[0] || error.response?.data?.message || 'Pendaftaran anggota gagal.'
        Notify.create({ type: 'negative', message })
        return false
      } finally {
        this.saving = false
      }
    },

    resetForm() {
      this.anggota = null
      this.form = { name: '', nik: '', no_hp: '', username: '', email: '', password: '', password_confirmation: '' }
    },

    async findAnggota() {
      this.loading = true
      try {
        const response = await api.get('/v1/auth/verifikasi-anggota', { params: { nik: this.form.nik } })
        this.anggota = response.data?.data ?? null
        Notify.create({ type: 'positive', message: response.data?.message || 'Data anggota ditemukan.' })
        return true
      } catch (error) {
        this.anggota = null
        const message = Object.values(error.response?.data?.errors ?? {})?.[0]?.[0] || error.response?.data?.message || 'Data anggota tidak ditemukan.'
        Notify.create({ type: 'negative', message })
        return false
      } finally {
        this.loading = false
      }
    },

    async saveAkun() {
      this.saving = true
      try {
        const response = await api.post('/v1/auth/verifikasi-anggota/simpan', this.form)
        Notify.create({ type: 'positive', message: response.data?.message || 'Pendaftaran anggota berhasil.' })
        return true
      } catch (error) {
        const message = Object.values(error.response?.data?.errors ?? {})?.[0]?.[0] || error.response?.data?.message || 'Pendaftaran anggota gagal.'
        Notify.create({ type: 'negative', message })
        return false
      } finally {
        this.saving = false
      }
    },
  },
})
