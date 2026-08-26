<template>
  <main class="login-page">
    <div class="login-shell">
      <section class="login-hero">
        <div class="hero-orbit hero-orbit--one" />
        <div class="hero-orbit hero-orbit--two" />
        <div class="domino domino--left"><span /><span /></div>
        <div class="domino domino--right"><span /><span /></div>

        <div class="brand-block">
          <img
            class="brand-logo"
            src="@/assets/orado/logo-white.svg"
            alt="Logo resmi ORADO"
          />
          <p class="brand-subtitle">Organisasi Olahraga Amatir</p>
          <p class="brand-subtitle brand-subtitle--country">Republik Indonesia</p>
          <p class="brand-location">Kota Probolinggo</p>
        </div>
      </section>

      <LoginForm />
    </div>
  </main>
</template>

<script setup>
import LoginForm from './comp/LoginForm.vue'
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: #eef2f8;
}

.login-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #fff;
}

.login-hero {
  position: relative;
  display: flex;
  min-height: 44vh;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 52px 28px 92px;
  background:
    radial-gradient(circle at 78% 14%, rgba(32, 109, 218, 0.42), transparent 30%),
    linear-gradient(150deg, #001634 0%, #002c66 58%, #06479b 100%);
}

.brand-block {
  position: relative;
  z-index: 2;
  text-align: center;
}

.brand-logo {
  display: block;
  width: min(170px, 46vw);
  max-height: 165px;
  margin: 0 auto;
  object-fit: contain;
  filter: drop-shadow(0 9px 18px rgba(0, 0, 0, 0.28));
}

.brand-subtitle {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.4px;
}

.brand-subtitle--country {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
}

.brand-location {
  margin: 7px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}

.hero-orbit {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.hero-orbit--one {
  width: 260px;
  height: 260px;
  top: -130px;
  left: -90px;
}

.hero-orbit--two {
  width: 320px;
  height: 320px;
  right: -160px;
  bottom: -175px;
}

.domino {
  position: absolute;
  width: 38px;
  height: 70px;
  opacity: 0.07;
  border: 2px solid #fff;
  border-radius: 8px;
  transform: rotate(-22deg);
}

.domino::after {
  position: absolute;
  top: 50%;
  right: 4px;
  left: 4px;
  height: 1px;
  content: '';
  background: #fff;
}

.domino span::before,
.domino span::after {
  position: absolute;
  width: 4px;
  height: 4px;
  content: '';
  border-radius: 50%;
  background: #fff;
}

.domino span:first-child::before { top: 10px; left: 8px; }
.domino span:first-child::after { top: 24px; right: 8px; }
.domino span:last-child::before { right: 8px; bottom: 10px; }
.domino span:last-child::after { bottom: 24px; left: 8px; }
.domino--left { top: 20%; left: 8%; }
.domino--right { right: 9%; bottom: 20%; transform: rotate(27deg) scale(0.8); }

@media (min-width: 600px) {
  .login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
  }

  .login-shell {
    width: 420px;
    min-height: min(820px, calc(100vh - 60px));
    border-radius: 28px;
    box-shadow: 0 24px 70px rgba(0, 29, 72, 0.2);
  }

  .login-hero { min-height: 355px; }
}
</style>
