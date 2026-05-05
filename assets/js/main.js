/* ── Splash: escalar palabras para llenar el ancho ────────── */
function scaleSplashWords() {
  const col = document.querySelector('.splash-columna');
  if (!col) return;
  const containerW = col.offsetWidth;
  col.querySelectorAll('.word-scale, .editorial-scale').forEach(el => {
    el.style.transform = 'none';
    const naturalW = el.scrollWidth;
    if (naturalW > 0) {
      el.style.transform = `scaleX(${containerW / naturalW})`;
    }
  });
}
document.fonts.ready.then(scaleSplashWords);
window.addEventListener('resize', scaleSplashWords);


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
  setTimeout(() => rayo && rayo.classList.add('rayo-cae'), 3800);

  // Etapa 3b: flash rojo al impacto
  setTimeout(() => flash && flash.classList.add('flash-on'), 4100);

  // Etapa 3c: rayo queda visible (ya está en su posición por la animación)

  // Etapa 4: ocultar splash
  setTimeout(() => {
    splash.classList.add('splash-oculto');
    const exp = new Date(Date.now() + 8 * 3600 * 1000).toUTCString();
    document.cookie = `rr_splash=1; expires=${exp}; path=/`;
    setTimeout(() => splash.remove(), 750);
  }, 5800);
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

/* ── Lightbox fotos interiores ────────────────────────────── */
(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('.lb-img');
  const thumbs = Array.from(document.querySelectorAll('.foto-thumb'));
  let current = 0;

  function open(idx) {
    current = idx;
    lbImg.src = thumbs[idx].dataset.full;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    thumbs.forEach((t, i) => t.classList.toggle('active', i === idx));
  }
  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
  }

  thumbs.forEach((t, i) => t.addEventListener('click', () => open(i)));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => open((current - 1 + thumbs.length) % thumbs.length));
  lb.querySelector('.lb-next').addEventListener('click', () => open((current + 1) % thumbs.length));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open((current - 1 + thumbs.length) % thumbs.length);
    if (e.key === 'ArrowRight') open((current + 1) % thumbs.length);
  });
  if (thumbs.length <= 1) {
    lb.querySelector('.lb-prev').style.display = 'none';
    lb.querySelector('.lb-next').style.display = 'none';
  }
})();
