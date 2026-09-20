import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const initialForm = () => ({
  id: null,
  kode_pendaftaran: '',
  nama_tim: '',
  nik_atlet_satu: '',
  nama_atlet_satu: '',
  tanggal_lahir_atlet_satu: '',
  jenis_kelamin_atlet_satu: '',
  no_hp_atlet_satu: '',
  nik_atlet_dua: '',
  nama_atlet_dua: '',
  tanggal_lahir_atlet_dua: '',
  jenis_kelamin_atlet_dua: '',
  no_hp_atlet_dua: '',
})

export const usePesertaEventStore = defineStore('peserta-event', {
  state: () => ({
    loading: false,
    saving: false,
    items: [],
    hasMore: true,
    eventOptions: [],
    attendanceLoading: {},
    params: { page: 1, search: '', master_event_id: null },
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

    pilihEventAktif() {
      if (this.params.master_event_id || !this.eventOptions.length) return

      const hariIni = tanggalLokal(new Date())
      const eventAktif = this.eventOptions
        .map((event) => ({ event, prioritas: prioritasEventAktif(event, hariIni) }))
        .filter(({ prioritas }) => prioritas !== null)
        .sort((a, b) => a.prioritas - b.prioritas)[0]?.event

      this.params.master_event_id = eventAktif?.id ?? null
    },

    async tandaiKehadiran(participantId, jenis) {
      const key = `${participantId}-${jenis}`
      if (this.attendanceLoading[key]) return

      this.attendanceLoading[key] = true
      try {
        const response = await api.post(`/v3/event/peserta/${participantId}/kehadiran`, { jenis })
        const participant = this.items.find((item) => item.id === participantId)

        if (participant) {
          participant.hadir_technical_meeting = Boolean(
            response.data?.data?.hadir_technical_meeting,
          )
          participant.hadir_registrasi_ulang = Boolean(response.data?.data?.hadir_registrasi_ulang)
        }

        Notify.create({
          type: 'positive',
          message: response.data?.message || 'Kehadiran berhasil dicatat.',
        })
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Kehadiran tidak dapat dicatat.',
        })
      } finally {
        this.attendanceLoading[key] = false
      }
    },

    sedangMenandaiKehadiran(participantId, jenis) {
      return Boolean(this.attendanceLoading[`${participantId}-${jenis}`])
    },

    editData(participant) {
      const detail = participant.rincis?.[0] || {}
      this.form = {
        ...initialForm(),
        ...detail,
        id: participant.id,
        kode_pendaftaran: participant.kode_pendaftaran,
        nama_tim: participant.nama_tim,
        tanggal_lahir_atlet_satu: toDate(detail.tanggal_lahir_atlet_satu),
        tanggal_lahir_atlet_dua: toDate(detail.tanggal_lahir_atlet_dua),
      }
    },

    resetForm() {
      this.form = initialForm()
    },

    async saveData() {
      if (!this.form.id) return false

      this.saving = true
      try {
        const response = await api.post(`/v3/event/peserta/${this.form.id}/edit`, this.form)
        const participant = response.data?.data
        const index = this.items.findIndex((item) => item.id === participant?.id)

        if (index !== -1) this.items[index] = participant
        Notify.create({
          type: 'positive',
          message: response.data?.message || 'Data peserta event berhasil diperbarui.',
        })
        this.resetForm()
        return true
      } catch (error) {
        const message =
          Object.values(error.response?.data?.errors ?? {})?.[0]?.[0] ||
          error.response?.data?.message ||
          'Data peserta event gagal diperbarui.'
        Notify.create({ type: 'negative', message })
        return false
      } finally {
        this.saving = false
      }
    },
  },
})

function toDate(value) {
  return value ? String(value).slice(0, 10) : ''
}

function prioritasEventAktif(event, hariIni) {
  const status = String(event.status || '').toLowerCase()
  const dibuka = ['dibuka', 'aktif', 'berjalan'].includes(status)
  const mulai = event.tanggal_mulai || null
  const selesai = event.tanggal_selesai || null
  const sedangBerjalan = mulai && selesai && mulai <= hariIni && selesai >= hariIni
  const belumSelesai = !selesai || selesai >= hariIni

  if (dibuka && sedangBerjalan) return 0
  if (dibuka && belumSelesai) return 1

  return null
}

function tanggalLokal(tanggal) {
  const tahun = tanggal.getFullYear()
  const bulan = String(tanggal.getMonth() + 1).padStart(2, '0')
  const hari = String(tanggal.getDate()).padStart(2, '0')

  return `${tahun}-${bulan}-${hari}`
}
