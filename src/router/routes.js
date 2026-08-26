const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/pages/IndexPage.vue'),
      },
      {
        path: 'jabatan',
        component: () => import('@/pages/JabatanPage.vue'),
      },
      {
        path: 'anggota',
        component: () => import('@/pages/AnggotaPage.vue'),
      },
      {
        path: 'club',
        component: () => import('@/pages/ClubPage.vue'),
      },
      {
        path: 'verifikasi-pengajuan',
        component: () => import('@/pages/VerifikasiPengajuanPage.vue'),
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
    component: () => import('@/pages/VerifikasiAnggotaPage.vue'),
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
