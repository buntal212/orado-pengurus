import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json' },
})

let redirectingToLogin = false

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('orado_pengurus_token') ||
    sessionStorage.getItem('orado_pengurus_token')

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !redirectingToLogin) {
      const hasSession = Boolean(
        localStorage.getItem('orado_pengurus_token') ||
          sessionStorage.getItem('orado_pengurus_token'),
      )

      if (hasSession) {
        redirectingToLogin = true
        localStorage.removeItem('orado_pengurus_token')
        sessionStorage.removeItem('orado_pengurus_token')
        localStorage.removeItem('orado_pengurus_user')
        sessionStorage.removeItem('orado_pengurus_user')
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  },
)

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
