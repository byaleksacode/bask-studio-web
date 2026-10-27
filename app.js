/* BASK STUDIO · comportamiento común a todas las páginas */
(function () {
  'use strict';

  const raiz = document.documentElement;
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Lectura y escritura seguras: el navegador puede bloquear el almacenamiento */
  const guardado = {
    leer(area, clave) { try { return window[area].getItem(clave); } catch (e) { return null; } },
    poner(area, clave, valor) { try { window[area].setItem(clave, valor); } catch (e) { /* sin almacenamiento */ } }
  };

  /* ---------- Pantalla de entrada (solo en la portada, la primera vez) ---------- */
  const loader = document.getElementById('ld');
  const hayEntrada = raiz.classList.contains('intro');
  const listo = () => raiz.classList.add('listo');

  if (loader && !hayEntrada) {
    loader.remove();
  } else if (hayEntrada) {
    const sets = loader.querySelectorAll('.set');
    const capa = document.getElementById('capa');
    const contador = document.getElementById('pct');
    const duracion = 2600;
    const inicio = performance.now();
    const temporizadores = [];
    const en = (ms, fn) => temporizadores.push(setTimeout(fn, ms));

    const terminar = () => {
      temporizadores.forEach(clearTimeout);
      loader.classList.add('fuera');
      listo();
      setTimeout(() => loader.remove(), 1200);
      guardado.poner('sessionStorage', 'bask-intro', '1');
    };

    (function contar() {
      const p = Math.min(1, (performance.now() - inicio) / duracion);
      contador.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p < 1 && loader.isConnected) requestAnimationFrame(contar);
    })();

    requestAnimationFrame(() => requestAnimationFrame(() => sets[0].classList.add('on')));
    en(750, () => { sets[0].classList.add('off'); sets[1].classList.add('on'); });
    en(1450, () => { sets[1].classList.add('off'); capa.classList.add('on'); loader.classList.add('verde'); });
    en(1750, () => { sets[2].style.color = 'var(--blanco)'; sets[2].classList.add('on'); });
    en(2700, terminar);
    loader.addEventListener('click', terminar);
  }

  /* ---------- Vídeo de portada: vertical u horizontal según la pantalla ---------- */
  const videoV = document.getElementById('vv');
  const videoH = document.getElementById('vh');

  if (videoV && videoH && !reduce) {
    const apaisada = matchMedia('(min-aspect-ratio: 1/1)');
    const elegirVideo = () => {
      const on = apaisada.matches ? videoH : videoV;
      const off = apaisada.matches ? videoV : videoH;
      off.pause();
      on.preload = 'auto';
      const reproducir = () => on.play().then(() => on.classList.add('ok')).catch(() => {});
      if (on.readyState >= 3) reproducir();
      else on.addEventListener('canplay', reproducir, { once: true });
      if (on.readyState === 0) on.load();
    };
    elegirVideo();
    apaisada.addEventListener('change', elegirVideo);
  }

  /* ---------- Aviso de cookies ---------- */
  const cookies = document.getElementById('cookies');

  if (cookies) {
    if (guardado.leer('localStorage', 'bask-cookies-v2')) {
      cookies.remove();
    } else {
      setTimeout(() => cookies.classList.add('ver'), reduce ? 0 : (hayEntrada ? 3300 : 600));
      cookies.querySelectorAll('button').forEach((boton) => {
        boton.addEventListener('click', () => {
          guardado.poner('localStorage', 'bask-cookies-v2', boton.dataset.c);
          cookies.classList.add('adios');
          setTimeout(() => cookies.remove(), 900);
        });
      });
    }
  }

  /* ---------- Menú ---------- */
  const botonMenu = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');

  if (botonMenu && menu) {
    const alternar = (abrir) => {
      body.classList.toggle('menu-abierto', abrir);
      botonMenu.setAttribute('aria-expanded', abrir);
      botonMenu.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
      menu.setAttribute('aria-hidden', !abrir);
    };
    botonMenu.addEventListener('click', () => alternar(!body.classList.contains('menu-abierto')));
    document.getElementById('mvelo').addEventListener('click', () => alternar(false));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') alternar(false); });
  }

  /* ---------- Aparición de bloques al entrar en pantalla ---------- */
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('vista');
        observador.unobserve(e.target);
      }
    });
  }, { threshold: .15 });
  document.querySelectorAll('.rev').forEach((el) => observador.observe(el));
})();
