import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const initialForm = () => ({ id: null, nama: '' })

export const useJabatanStore = defineStore('master-jabatan', {
  state: () => ({
    loading: false,
    saving: false,
    items: [],
    hasMore: true,
    params: { page: 1, per_page: 15 },
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
        const response = await api.get('/v1/master/jabatan', { params: this.params })
        const paginator = response.data?.data
        const rows = paginator?.data ?? []
        this.items.push(...rows)
        this.hasMore = Boolean(paginator?.next_page_url)
        this.params.page += 1
      } catch (error) {
        Notify.create({ type: 'negative', message: error.response?.data?.message || 'Data jabatan tidak dapat dimuat.' })
      } finally {
        this.loading = false
      }
    },

    async saveData() {
      this.saving = true
      try {
        const isEdit = Boolean(this.form.id)
        const endpoint = isEdit
          ? `/v1/master/jabatan/${this.form.id}/edit`
          : '/v1/master/jabatan/simpan'
        const response = await api.post(endpoint, { nama: this.form.nama })
        const item = response.data?.data

        if (isEdit) {
          const index = this.items.findIndex(row => row.id === item.id)
          if (index !== -1) this.items[index] = item
        } else {
          this.items.unshift(item)
        }

        Notify.create({ type: 'positive', message: response.data?.message || 'Jabatan berhasil disimpan.' })
        this.resetForm()
        return true
      } catch (error) {
        const message = error.response?.data?.errors?.nama?.[0] || error.response?.data?.message || 'Jabatan gagal disimpan.'
        Notify.create({ type: 'negative', message })
        return false
      } finally {
        this.saving = false
      }
    },

    editData(item) {
      this.form = { id: item.id, nama: item.nama }
    },

    async deleteData(id) {
      try {
        const response = await api.post(`/v1/master/jabatan/${id}/hapus`)
        this.items = this.items.filter(item => item.id !== id)
        if (this.form.id === id) this.resetForm()
        Notify.create({ type: 'positive', message: response.data?.message || 'Jabatan berhasil dihapus.' })
      } catch (error) {
        Notify.create({ type: 'negative', message: error.response?.data?.message || 'Jabatan gagal dihapus.' })
      }
    },

    resetForm() {
      this.form = initialForm()
    },
  },
})
