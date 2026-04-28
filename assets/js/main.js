/* ── Splash: escalar EDITORIAL para llenar el ancho ─────── */
function scaleEditorial() {
  const el = document.querySelector('.editorial-scale');
  const col = document.querySelector('.splash-columna');
  if (!el || !col) return;
  el.style.transform = 'none';
  const ratio = col.offsetWidth / el.offsetWidth;
  if (ratio && ratio !== 1) el.style.transform = `scaleX(${ratio})`;
}
window.addEventListener('load', scaleEditorial);
window.addEventListener('resize', scaleEditorial);

/* ── Splash ──────────────────────────────────────────────── */
(function () {
  const splash = document.getElementById('splash');
  if (!splash) return;

  if (document.cookie.split(';').some(c => c.trim().startsWith('rr_splash=1'))) {
    splash.remove();
    return;
  }

  const cabeza = splash.querySelector('.splash-cabeza');
  const rayo   = splash.querySelector('.splash-rayo-img');
  const flash  = splash.querySelector('.splash-flash');

  // Etapa 2: cabeza + textos entran por CSS (0.3s / 0.6s)

  // Etapa 3a: rayo cae
  setTimeout(() => rayo && rayo.classList.add('rayo-cae'), 2600);

  // Etapa 3b: flash rojo al impacto
  setTimeout(() => flash && flash.classList.add('flash-on'), 2900);

  // Etapa 3c: rayo queda visible (ya está en su posición por la animación)

  // Etapa 4: ocultar splash
  setTimeout(() => {
    splash.classList.add('splash-oculto');
    const exp = new Date(Date.now() + 8 * 3600 * 1000).toUTCString();
    document.cookie = `rr_splash=1; expires=${exp}; path=/`;
    setTimeout(() => splash.remove(), 750);
  }, 4000);
})();

/* ── Descripciones colapsadas ────────────────────────────── */
document.querySelectorAll('.btn-leer-mas').forEach(btn => {
  btn.addEventListener('click', function () {
    const desc = this.previousElementSibling;
    if (!desc) return;
    desc.classList.remove('descripcion-colapsada');
    this.remove();
  });
});

/* ── Nav mobile ──────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navMobile = document.getElementById('nav-mobile');
const navClose  = document.querySelector('.nav-mobile-close');

if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => navMobile.classList.add('open'));
}
if (navClose && navMobile) {
  navClose.addEventListener('click', () => navMobile.classList.remove('open'));
}
if (navMobile) {
  navMobile.addEventListener('click', e => {
    if (e.target === navMobile) navMobile.classList.remove('open');
  });
}

/* ── Tapas strip — drag to scroll ───────────────────────── */
document.querySelectorAll('.tapas-strip').forEach(strip => {
  let isDown = false, startX, scrollLeft;
  strip.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
  });
  strip.addEventListener('mouseleave', () => isDown = false);
  strip.addEventListener('mouseup', () => isDown = false);
  strip.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - strip.offsetLeft;
    strip.scrollLeft = scrollLeft - (x - startX);
  });
});
