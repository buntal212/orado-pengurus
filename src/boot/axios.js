import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('orado_pengurus_token') ||
    sessionStorage.getItem('orado_pengurus_token')

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
