<template>
  <section class="settings-card">
    <button class="setting-item" type="button" @click="$emit('open', 'biaya-iuran')">
      <span class="setting-icon"><q-icon name="payments" /></span
      ><span class="setting-copy"
        ><strong>Setting biaya iuran</strong><small>Atur nominal iuran anggota.</small></span
      ><q-icon name="chevron_right" />
    </button>
    <button class="setting-item" type="button" @click="$emit('open', 'notifikasi')">
      <span class="setting-icon"><q-icon name="notifications_active" /></span
      ><span class="setting-copy"
        ><strong>Aktifkan notifikasi</strong
        ><small>Terima pemberitahuan penting dari ORADO.</small></span
      ><q-icon name="chevron_right" />
    </button>
  </section>
</template>
<script setup>
defineEmits(['open'])
</script>
<style scoped>
.settings-card {
  margin-top: 30px;
  overflow: hidden;
  border: 1px solid #ccdeec;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(10, 41, 80, 0.12);
}
.setting-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 16px 14px;
  border: 0;
  border-bottom: 1px solid #e6edf5;
  color: #537294;
  background: #fff;
  text-align: left;
  cursor: pointer;
}
.setting-item:last-child {
  border-bottom: 0;
}
.setting-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 12px;
  color: #0a5fbe;
  background: #e2efff;
}
.setting-icon :deep(.q-icon) {
  font-size: 23px;
}
.setting-copy {
  min-width: 0;
  flex: 1;
}
.setting-copy strong,
.setting-copy small {
  display: block;
}
.setting-copy strong {
  color: #12365f;
  font-size: 13px;
}
.setting-copy small {
  margin-top: 4px;
  color: #7186a0;
  font-size: 10px;
}
</style>
