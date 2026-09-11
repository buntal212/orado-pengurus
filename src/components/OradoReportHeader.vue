<template>
  <header class="letterhead">
    <img src="@/assets/orado/logo-white.svg" alt="Logo ORADO" />
    <div>
      <h1>ORADO KOTA PROBOLINGGO</h1>
      <h2>ORGANISASI OLAHRAGA DOMINO</h2>
      <p>Jl. Bengawan Solo No. 100, Jrebeng Kulon, Kedopok, Kota Probolinggo 67229</p>
    </div>
  </header>
</template>

<style scoped>
.letterhead {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88px;
  padding-bottom: 15px;
  border-bottom: 4px double #071f42;
  color: #071f42;
}
.letterhead > img {
  position: absolute;
  left: 0;
  width: 78px;
  height: 78px;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(20%) sepia(64%) saturate(1353%) hue-rotate(178deg)
    brightness(86%);
}
.letterhead div {
  display: grid;
  gap: 1px;
  text-align: center;
}
.letterhead h1,
.letterhead h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
}
.letterhead h1 {
  font-size: 23px;
  line-height: 1.05;
}
.letterhead h2 {
  font-size: 18px;
  line-height: 1.05;
}
.letterhead p {
  max-width: 480px;
  margin: 2px auto 0;
  color: #315b7c;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.35px;
  line-height: 1.2;
}
@media print {
  .letterhead {
    min-height: 68px;
    padding-bottom: 9px;
  }
  .letterhead > img {
    width: 62px;
    height: 62px;
  }
  .letterhead h1 {
    font-size: 17px;
  }
  .letterhead h2 {
    font-size: 13px;
  }
  .letterhead p {
    max-width: 390px;
    font-size: 7px;
  }
}
</style>
