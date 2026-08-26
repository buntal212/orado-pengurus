import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const initialMemberForm = () => ({ id: null, name: '', jabatan: '' })

export const useVerifikasiStore = defineStore('verifikasi', {
  state: () => ({
    loadingAnggota: false,
    loadingClub: false,
    saving: false,
    anggota: [],
    clubs: [],
    anggotaHasMore: true,
    clubHasMore: true,
    anggotaParams: { page: 1, per_page: 15, status: 'menunggu' },
    clubParams: { page: 1, per_page: 15, status: 'menunggu' },
    jabatanOptions: [],
    memberForm: initialMemberForm(),
  }),

  actions: {
    async getAnggota({ reset = false } = {}) {
      if (reset) {
        this.anggota = []
        this.anggotaParams.page = 1
        this.anggotaHasMore = true
      }
      if (this.loadingAnggota || !this.anggotaHasMore) return

      this.loadingAnggota = true
      try {
        const response = await api.get('/v1/master/anggota', { params: this.anggotaParams })
        const paginator = response.data?.data
        this.anggota.push(...(paginator?.data ?? []))
        this.anggotaHasMore = Boolean(paginator?.next_page_url)
        this.anggotaParams.page += 1
      } catch (error) {
        Notify.create({ type: 'negative', message: error.response?.data?.message || 'Data anggota menunggu verifikasi tidak dapat dimuat.' })
      } finally {
        this.loadingAnggota = false
      }
    },

    async getClub({ reset = false } = {}) {
      if (reset) {
        this.clubs = []
        this.clubParams.page = 1
        this.clubHasMore = true
      }
      if (this.loadingClub || !this.clubHasMore) return

      this.loadingClub = true
      try {
        const response = await api.get('/v1/master/club', { params: this.clubParams })
        const paginator = response.data?.data
        this.clubs.push(...(paginator?.data ?? []))
        this.clubHasMore = Boolean(paginator?.next_page_url)
        this.clubParams.page += 1
      } catch (error) {
        Notify.create({ type: 'negative', message: error.response?.data?.message || 'Data club menunggu verifikasi tidak dapat dimuat.' })
      } finally {
        this.loadingClub = false
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

    openMemberVerification(item) {
      this.memberForm = { id: item.id, name: item.name, jabatan: item.jabatan || '' }
    },

    async verifyMember() {
      this.saving = true
      try {
        const response = await api.post(`/v1/master/anggota/${this.memberForm.id}/verifikasi`, { jabatan: this.memberForm.jabatan })
        this.anggota = this.anggota.filter(item => item.id !== response.data?.data?.id)
        Notify.create({ type: 'positive', message: response.data?.message || 'Anggota berhasil diverifikasi.' })
        this.memberForm = initialMemberForm()
        return true
      } catch (error) {
        const message = Object.values(error.response?.data?.errors ?? {})?.[0]?.[0] || error.response?.data?.message || 'Anggota gagal diverifikasi.'
        Notify.create({ type: 'negative', message })
        return false
      } finally {
        this.saving = false
      }
    },

    async updateClub(id, action) {
      this.saving = true
      try {
        const response = await api.post(`/v1/master/club/${id}/${action}`)
        this.clubs = this.clubs.filter(item => item.id !== response.data?.data?.id)
        Notify.create({ type: action === 'verifikasi' ? 'positive' : 'warning', message: response.data?.message || 'Status club berhasil diperbarui.' })
      } catch (error) {
        const message = Object.values(error.response?.data?.errors ?? {})?.[0]?.[0] || error.response?.data?.message || 'Status club gagal diperbarui.'
        Notify.create({ type: 'negative', message })
      } finally {
        this.saving = false
      }
    },

    resetMemberForm() {
      this.memberForm = initialMemberForm()
    },
  },
})
