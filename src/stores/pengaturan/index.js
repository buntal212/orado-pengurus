import { defineStore } from 'pinia'
import { enablePushNotification, testPushNotification } from '@/services/firebase-messaging'

export const usePengaturanStore = defineStore('pengaturan', {
  state: () => ({
    activeMenu: 'menu',
    loadingNotification: false,
    loadingTestNotification: false,
    biayaIuran: Number(localStorage.getItem('orado_pengurus_biaya_iuran')) || 0,
  }),

  actions: {
    open(menu) {
      this.activeMenu = menu
    },

    saveBiayaIuran() {
      localStorage.setItem('orado_pengurus_biaya_iuran', String(this.biayaIuran))
    },

    async aktifkanNotifikasi() {
      this.loadingNotification = true
      const result = await enablePushNotification()
      this.loadingNotification = false
      return result
    },

    async ujiNotifikasi() {
      this.loadingTestNotification = true
      const result = await testPushNotification()
      this.loadingTestNotification = false
      return result
    },
  },
})
