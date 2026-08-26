<template>
  <q-page class="sso-page">
    <main class="sso-content">
      <section class="welcome-card">
        <div class="welcome-avatar">
          <img src="@/assets/orado/logo-white.svg" alt="ORADO" />
        </div>
        <div class="welcome-copy">
          <span>Selamat datang,</span>
          <strong>{{ currentUser?.name || 'Pengurus ORADO' }}</strong>
          <p>Kelola organisasi dengan lebih mudah dan terintegrasi.</p>
        </div>
        <q-icon name="chevron_right" class="welcome-arrow" />
      </section>

      <div class="section-heading">
        <span>MENU APLIKASI</span>
        <small>12 layanan</small>
      </div>

      <section class="menu-panel">
        <div class="menu-grid">
          <button v-for="menu in menus" :key="menu.title" type="button" class="menu-card" @click="openMenu(menu)">
            <span class="menu-icon"><q-icon :name="menu.icon" /></span>
            <span class="menu-title">{{ menu.title }}</span>
          </button>
        </div>
      </section>

      <div class="section-heading dashboard-heading">
        <span>DASHBOARD DATA</span>
        <small>Update hari ini</small>
      </div>

      <section class="dashboard-panel">
        <div class="stat-grid">
          <article v-for="item in summaryStats" :key="item.label" :class="['stat-card', `stat-card--${item.tone}`]">
            <span class="stat-icon"><q-icon :name="item.icon" /></span>
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
            <small :class="item.trendType">{{ item.trend }}</small>
          </article>
        </div>

        <article class="balance-card">
          <div><span>Saldo organisasi</span><strong>Rp 67.850.000</strong><small><q-icon name="trending_up" /> Stabil bulan ini</small></div>
          <span class="balance-icon"><q-icon name="account_balance_wallet" /></span>
        </article>

        <div class="activity-title"><span>Aktivitas terbaru</span><small>Lihat semua</small></div>
        <div v-for="activity in activities" :key="activity.title" class="activity-row">
          <span class="activity-icon"><q-icon :name="activity.icon" /></span>
          <div><strong>{{ activity.title }}</strong><span>{{ activity.time }}</span></div>
          <small :class="activity.type">{{ activity.value }}</small>
        </div>
      </section>

    </main>

    <nav class="bottom-nav" aria-label="Navigasi utama">
      <button type="button" class="nav-item nav-item--active"><q-icon name="home" /><span>Home</span></button>
      <button type="button" class="nav-item"><q-icon name="person_outline" /><span>Akun</span></button>
      <button type="button" class="nav-item" @click="handleLogout"><q-icon name="logout" /><span>Logout</span></button>
    </nav>
  </q-page>
</template>

<script setup>
import { useLoginStore } from '@/stores/login'
import { useRouter } from 'vue-router'

const loginStore = useLoginStore()
const router = useRouter()
const currentUser =
  loginStore.user ||
  JSON.parse(
    localStorage.getItem('orado_pengurus_user') ||
      sessionStorage.getItem('orado_pengurus_user') ||
      'null',
  )

const menus = [
  { title: 'Data\nJabatan', icon: 'badge', to: '/jabatan' },
  { title: 'Verifikasi &\nPengajuan', icon: 'assignment_turned_in', to: '/verifikasi-pengajuan' },
  { title: 'Data\nAnggota', icon: 'groups', to: '/anggota' },
  { title: 'Data Club', icon: 'admin_panel_settings', to: '/club' },
  { title: 'Keuangan', icon: 'account_balance_wallet' },
  { title: 'Pemasukan', icon: 'south' },
  { title: 'Pengeluaran', icon: 'north' },
  { title: 'Laporan &\nAnalitik', icon: 'description' },
  { title: 'Kegiatan', icon: 'calendar_month' },
  { title: 'Pengumuman', icon: 'campaign' },
  { title: 'Pengaturan\nSistem', icon: 'settings' },
  { title: 'Manajemen\nPengguna', icon: 'manage_accounts' },
]

const summaryStats = [
  { label: 'Club aktif', value: '48', trend: '+4 bulan ini', trendType: 'trend-up', tone: 'blue', icon: 'admin_panel_settings' },
  { label: 'Anggota', value: '1.248', trend: '+12%', trendType: 'trend-up', tone: 'teal', icon: 'groups' },
  { label: 'Pengajuan', value: '12', trend: '3 menunggu', trendType: 'trend-warn', tone: 'orange', icon: 'assignment' },
  { label: 'Kegiatan', value: '8', trend: 'Bulan ini', trendType: 'trend-neutral', tone: 'purple', icon: 'calendar_month' },
]

const activities = [
  { title: 'Pendaftaran anggota baru', time: '10 menit yang lalu', value: '+ 6 anggota', type: 'income', icon: 'person_add' },
  { title: 'Laporan keuangan diterima', time: '1 jam yang lalu', value: 'Club Garuda', type: 'neutral', icon: 'description' },
  { title: 'Pengajuan kegiatan', time: '2 jam yang lalu', value: 'Menunggu', type: 'waiting', icon: 'event_note' },
]

async function handleLogout() {
  await loginStore.logout()
  router.replace('/login')
}

function openMenu(menu) {
  if (menu.to) router.push(menu.to)
}
</script>

<style lang="scss" scoped>
.sso-page {
  min-height: calc(100vh - 58px);
  padding: 0 14px 92px;
  color: #122a4c;
  background: linear-gradient(180deg, #002451 0, #002451 86px, #eaf0f8 86px);
}

.sso-content { width: 100%; max-width: 430px; margin: 0 auto; }

.welcome-card {
  position: relative; top: 14px; display: flex; min-height: 116px; align-items: center;
  gap: 13px; padding: 17px 15px; border: 1px solid #d2dfed;
  border-radius: 14px; background: #fff; box-shadow: 0 10px 26px rgba(12, 40, 79, .16);
}
.welcome-avatar {
  display: grid; width: 64px; height: 64px; flex: 0 0 64px; place-items: center;
  overflow: hidden; border-radius: 50%; background: #073572;
}
.welcome-avatar img { display: block; width: 52px; height: 52px; object-fit: contain; object-position: center; transform: translateX(1px); }
.welcome-copy { min-width: 0; flex: 1; }
.welcome-copy span { display: block; color: #526b89; font-size: 10px; }
.welcome-copy strong { display: block; margin-top: 2px; color: #092d5d; font-size: 14px; line-height: 1.25; }
.welcome-copy p { max-width: 230px; margin: 5px 0 0; color: #5a7393; font-size: 10px; line-height: 1.45; }
.welcome-arrow { color: #47709e; font-size: 20px; }

.section-heading { display: flex; align-items: center; justify-content: space-between; margin: 35px 2px 10px; }
.section-heading span { color: #113963; font-size: 10px; font-weight: 800; letter-spacing: .55px; }
.section-heading small { color: #607b9a; font-size: 9px; }

.menu-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
.menu-panel { padding: 10px; border: 1px solid #cbdceb; border-radius: 15px; background: #fff; box-shadow: 0 9px 22px rgba(27, 57, 96, .10); }
.menu-card {
  min-height: 102px; padding: 12px 5px; border: 1px solid #dbe6f1; border-radius: 11px;
  background: #fff; box-shadow: 0 2px 5px rgba(20, 57, 99, .04); cursor: pointer;
}
.menu-card:active { background: #edf5ff; transform: translateY(1px); }
.menu-icon {
  display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center;
  border-radius: 10px; color: #0758b8; background: #dcecff;
}
.menu-icon .q-icon { font-size: 22px; }
.menu-title { display: block; margin-top: 8px; color: #0b315f; font-size: 12px; font-weight: 700; line-height: 1.3; white-space: pre-line; }

.dashboard-heading { margin-top: 21px; }
.dashboard-panel { padding: 14px; border: 1px solid #cbdceb; border-radius: 18px; background: linear-gradient(180deg, #fff, #f6faff); box-shadow: 0 10px 28px rgba(27, 57, 96, .10); }
.stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.stat-card { position: relative; min-height: 110px; padding: 14px; overflow: hidden; border: 1px solid #dbe6f1; border-radius: 13px; background: #fff; transition: transform .18s ease, box-shadow .18s ease; }.stat-card::after { position: absolute; top: 0; right: 0; width: 38px; height: 3px; border-radius: 0 13px 0 8px; content: ''; background: currentColor; opacity: .85; }.stat-card:hover { box-shadow: 0 7px 16px rgba(27,57,96,.12); transform: translateY(-1px); }
.stat-icon { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; color: inherit; background: currentColor; }.stat-icon .q-icon { color: #fff; font-size: 19px; }.stat-card--blue { color: #0b61c5; }.stat-card--teal { color: #11827b; }.stat-card--orange { color: #d07a0a; }.stat-card--purple { color: #7554ba; }
.stat-card > strong { display: block; margin-top: 10px; color: #163760; font-size: 21px; line-height: 1; }.stat-card > span:not(.stat-icon) { display: block; margin-top: 6px; color: #708198; font-size: 11px; }.stat-card > small { display: block; margin-top: 5px; font-size: 9px; }
.trend-up { color: #15805f; }.trend-warn { color: #c47913; }.trend-neutral { color: #718198; }
.balance-card { position: relative; display: flex; align-items: center; justify-content: space-between; min-height: 91px; margin-top: 13px; padding: 16px; overflow: hidden; border-radius: 14px; color: #fff; background: linear-gradient(135deg, #062d61, #0b66c6); box-shadow: 0 8px 18px rgba(8,78,161,.22); }.balance-card::before { position: absolute; right: -25px; bottom: -50px; width: 130px; height: 130px; border: 20px solid rgba(255,255,255,.08); border-radius: 50%; content: ''; }.balance-card > div { position: relative; z-index: 1; }.balance-card span, .balance-card strong, .balance-card small { display: block; }.balance-card span { color: rgba(255,255,255,.76); font-size: 11px; }.balance-card strong { margin-top: 6px; font-size: 22px; letter-spacing: -.2px; }.balance-card small { display: flex; align-items: center; gap: 3px; margin-top: 6px; color: #bde3ff; font-size: 9px; }.balance-icon { position: relative; z-index: 1; display: grid !important; width: 43px; height: 43px; place-items: center; border: 1px solid rgba(255,255,255,.18); border-radius: 11px; color: #fff !important; background: rgba(255,255,255,.13); }.balance-icon .q-icon { font-size: 26px; }
.activity-title { display: flex; justify-content: space-between; margin: 22px 2px 10px; }.activity-title span { color: #213b60; font-size: 14px; font-weight: 800; }.activity-title small { color: #0b5aba; font-size: 11px; font-weight: 600; }
.activity-row { display: flex; align-items: center; gap: 12px; padding: 14px 2px; border-top: 1px solid #edf1f5; }.activity-icon { display: grid; width: 40px; height: 40px; flex: 0 0 40px; place-items: center; border-radius: 11px; color: #2765ad; background: #edf5ff; }.activity-icon .q-icon { font-size: 21px; }.activity-row div { min-width: 0; flex: 1; }.activity-row strong, .activity-row div span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.activity-row strong { color: #274260; font-size: 14px; font-weight: 700; }.activity-row div span { margin-top: 4px; color: #8190a4; font-size: 11px; }.activity-row > small { padding: 5px 7px; border-radius: 6px; font-size: 10px; font-weight: 700; }.income { color: #14805d; background: #e6f8ef; }.waiting { color: #a96409; background: #fff4de; }.neutral { color: #52718e; background: #edf3f8; }

.security-card, .account-card {
  display: flex; align-items: center; gap: 11px; padding: 13px; border: 1px solid #e2e9f2;
  border-radius: 12px; background: #fff;
}
.security-card { margin-top: 14px; border-color: #dbe8fb; background: #edf5ff; }
.security-icon { display: grid; width: 36px; height: 36px; flex: 0 0 36px; place-items: center; border-radius: 10px; color: #0753b6; background: #fff; }
.security-icon .q-icon { font-size: 23px; }
.security-card strong { display: block; color: #173a6a; font-size: 10px; }
.security-card p { margin: 3px 0 0; color: #71839a; font-size: 9px; }
.account-card { margin-top: 12px; box-shadow: 0 3px 10px rgba(26, 54, 91, .05); }
.account-copy { min-width: 0; flex: 1; }
.account-copy strong, .account-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.account-copy strong { color: #173456; font-size: 11px; }
.account-copy span { margin-top: 2px; color: #8090a5; font-size: 9px; }
.account-card > .q-icon { color: #9aa8ba; }

.bottom-nav {
  position: fixed; right: 0; bottom: 0; left: 0; z-index: 10; display: flex;
  justify-content: center; gap: 34px; padding: 9px 12px calc(9px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, .14); background: #002451;
}
.nav-item { display: flex; min-width: 58px; flex-direction: column; align-items: center; gap: 2px; padding: 2px 8px; border: 0; color: rgba(255, 255, 255, .72); background: transparent; font-family: inherit; font-size: 8px; cursor: pointer; }
.nav-item > .q-icon, .notification-icon > .q-icon { font-size: 19px; }
.nav-item--active { color: #fff; font-weight: 700; }
.notification-icon { position: relative; display: inline-flex; width: 22px; height: 20px; align-items: center; justify-content: center; }
.notification-icon i { position: absolute; top: -5px; right: -4px; display: grid; width: 14px; height: 14px; place-items: center; border: 2px solid #002451; border-radius: 50%; color: #fff; background: #ef3b35; font-size: 7px; font-style: normal; font-weight: 700; line-height: 1; }

@media (min-width: 700px) {
  .sso-page { padding-right: 24px; padding-left: 24px; }
}
</style>
