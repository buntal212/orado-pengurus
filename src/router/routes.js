const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/pages/Dashboard/IndexPage.vue'),
      },
      {
        path: 'jabatan',
        component: () => import('@/pages/Jabatan/IndexPage.vue'),
      },
      {
        path: 'anggota',
        component: () => import('@/pages/Anggota/IndexPage.vue'),
      },
      {
        path: 'club',
        component: () => import('@/pages/Club/IndexPage.vue'),
      },
      {
        path: 'event',
        component: () => import('@/pages/Event/IndexPage.vue'),
      },
      {
        path: 'event-peserta',
        component: () => import('@/pages/EventPeserta/IndexPage.vue'),
      },
      {
        path: 'notifikasi',
        component: () => import('@/pages/Notifikasi/IndexPage.vue'),
      },
      {
        path: 'verifikasi-pengajuan',
        component: () => import('@/pages/VerifikasiPengajuan/IndexPage.vue'),
      },
      {
        path: 'pengaturan',
        component: () => import('@/pages/Pengaturan/IndexPage.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/pages/Login/IndexPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/verifikasi-anggota',
    component: () => import('@/pages/VerifikasiAnggota/IndexPage.vue'),
    meta: { guestOnly: true },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
