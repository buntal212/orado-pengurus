import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

export const useLoginStore = defineStore('login', {
  state: () => ({
    loading: false,
    user: null,
    showPassword: false,
    form: {
      email: '',
      password: '',
      remember: false,
    },
  }),
  actions: {
    async login() {
      this.loading = true

      try {
        const response = await api.post('/v1/auth/login', {
          login: this.form.email,
          password: this.form.password,
          device_name: 'orado-pengurus',
        })
        const data = response.data?.data
        // Sesi login pengurus disimpan persisten agar router guard tetap mengenali user.
        this.clearSession()
        window.localStorage.setItem('orado_pengurus_token', String(data.token))
        window.localStorage.setItem('orado_pengurus_user', JSON.stringify(data.user))
        this.user = data.user
        this.form.password = ''
        Notify.create({ type: 'positive', message: response.data?.message || 'Login berhasil.' })
        return true
      } catch (error) {
        const message =
          error.response?.data?.errors?.login?.[0] ||
          error.response?.data?.message ||
          'Tidak dapat terhubung ke server.'

        Notify.create({ type: 'negative', message })
        return false
      } finally {
        this.loading = false
      }
    },

    async getUser() {
      try {
        const response = await api.get('/v1/auth/me')
        this.user = response.data?.data ?? null
        return this.user
      } catch (error) {
        this.clearSession()
        console.error(error)
        return null
      }
    },

    async logout() {
      this.loading = true

      try {
        await api.post('/v1/auth/logout')
      } catch (error) {
        console.error(error)
      } finally {
        this.clearSession()
        this.loading = false
      }
    },

    clearSession() {
      localStorage.removeItem('orado_pengurus_token')
      sessionStorage.removeItem('orado_pengurus_token')
      localStorage.removeItem('orado_pengurus_user')
      sessionStorage.removeItem('orado_pengurus_user')
      this.user = null
    },
  },
})
