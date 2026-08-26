<template><q-layout view="lHh Lpr lFf" class="app-shell"><q-header class="app-header"><q-toolbar class="sso-toolbar"><q-avatar size="30px" class="header-logo"><img src="@/assets/orado/logo-white.svg" alt="ORADO" /></q-avatar><q-toolbar-title>ORADO Kota Probolinggo</q-toolbar-title><q-btn flat round dense icon="notifications_none" aria-label="Notifikasi"><q-badge floating rounded color="red" label="3" /></q-btn></q-toolbar></q-header><q-page-container><router-view /></q-page-container></q-layout></template>
<style lang="scss" scoped>
.app-shell { width: 100%; min-height: 100vh; background: #f7f9fc; }
.app-header { color: #fff; background: #002451; }
.sso-toolbar { width: 100%; max-width: 1030px; min-height: 58px; margin: 0 auto; padding: 0 10px; }
.q-toolbar-title { padding-left: 6px; font-size: 14px; font-weight: 700; letter-spacing: .2px; }
.header-logo { display: grid; place-items: center; background: rgba(255,255,255,.1); }.header-logo img { width: 25px; height: 25px; object-fit: contain; }
</style>
