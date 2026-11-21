/* BASK 3D · comportamiento común a todas las páginas */
(function () {
  'use strict';

  const raiz = document.documentElement;
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Desplazamiento suave, como en GESTE (se desactiva con «Reducir movimiento») */
  const lenis = (window.Lenis && !reduce) ? new window.Lenis({ duration: 1.2 }) : null;
  if (lenis) {
    const latido = (t) => { lenis.raf(t); requestAnimationFrame(latido); };
    requestAnimationFrame(latido);
  }

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

  /* ---------- Enlaces a «Contacto»: bajan al pie sin añadir #contacto a la dirección ---------- */
  const pie = document.getElementById('contacto');

  if (pie) {
    document.querySelectorAll('a[href="#contacto"]').forEach((enlace) => {
      enlace.addEventListener('click', (e) => {
        e.preventDefault();
        if (lenis) lenis.scrollTo(pie, { offset: pie.offsetHeight - innerHeight });
        else pie.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' });
      });
    });
  }

  /* ---------- Tienda: vista cuadrícula o índice ---------- */
  const tienda = document.getElementById('tienda');

  if (tienda) {
    const botones = document.querySelectorAll('.ti-vista button');
    const grid = document.getElementById('ti-grid');

    /* La cuadrícula no tiene principio ni fin: se repite dos veces más y, al pasar de una
       copia a otra, el scroll salta sin que se note. */
    const copias = [grid.cloneNode(true), grid.cloneNode(true)];
    copias.forEach((copia) => {
      copia.removeAttribute('id');
      copia.setAttribute('aria-hidden', 'true');
      copia.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      copia.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
    });
    grid.before(copias[0]);
    grid.after(copias[1]);

    const alto = () => grid.offsetHeight;
    const enBucle = () => tienda.dataset.vista === 'cuadricula';
    let saltando = false;
    const irA = (y) => {
      saltando = true;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(y, { immediate: true, force: true });
      } else {
        scrollTo(0, y);
      }
      saltando = false;
    };
    const colocar = () => { if (enBucle()) irA(alto()); };
    const vigilar = (y) => {
      if (saltando || !enBucle()) return;
      const h = alto();
      if (y >= 2 * h) irA(y - h);
      else if (y < h * 0.25) irA(y + h);
    };
    if (lenis) lenis.on('scroll', ({ scroll }) => vigilar(scroll));
    else addEventListener('scroll', () => vigilar(scrollY), { passive: true });

    const ponerVista = (vista) => {
      tienda.dataset.vista = vista;
      botones.forEach((b) => b.setAttribute('aria-pressed', b.dataset.vista === vista));
      const url = new URL(location.href);
      url.searchParams.set('vista', vista);
      history.replaceState(null, '', url);
      if (vista === 'cuadricula') requestAnimationFrame(colocar);
      else irA(0);
    };
    const inicial = new URLSearchParams(location.search).get('vista');
    ponerVista(inicial === 'indice' ? 'indice' : 'cuadricula');
    addEventListener('load', colocar);
    botones.forEach((b) => b.addEventListener('click', () => ponerVista(b.dataset.vista)));
  }

  /* ---------- Cesta ----------
     De momento no hay pago en la web: «Hacer pedido» prepara un correo con la cesta. */
  const botonCesta = document.getElementById('cestaBtn');

  if (botonCesta) {
    const CLAVE = 'bask-cesta';
    const euros = (c) => (c / 100).toLocaleString('es-ES', { minimumFractionDigits: c % 100 ? 2 : 0 }) + ' €';
    const leerCesta = () => { try { return JSON.parse(guardado.leer('localStorage', CLAVE)) || []; } catch (e) { return []; } };
    let cesta = leerCesta();

    body.insertAdjacentHTML('beforeend', `
      <div class="cesta-velo" id="cestaVelo"></div>
      <aside class="cesta" id="cesta" aria-label="Cesta" aria-hidden="true">
        <ul class="cesta-lista" id="cestaLista"></ul>
        <div class="cesta-pie">
          <p class="cesta-nota">Envío en 2-3 días. Para pedidos grandes, escríbenos a info@bask3d.com</p>
          <button type="button" class="cesta-cerrar" id="cestaCerrar" aria-label="Cerrar cesta">×</button>
          <div class="cesta-total"><span>Total</span><a class="cesta-pedir" id="cestaPedir" href="#"><span id="cestaTotal">0 €</span><span>Hacer pedido</span></a></div>
        </div>
      </aside>`);

    const panel = document.getElementById('cesta');
    const lista = document.getElementById('cestaLista');
    const contador = document.getElementById('cestaN');
    const pedir = document.getElementById('cestaPedir');

    const abrirCesta = (abrir) => {
      raiz.style.setProperty('--cesta-alto', panel.offsetHeight + 'px');
      body.classList.toggle('cesta-abierta', abrir);
      botonCesta.setAttribute('aria-expanded', abrir);
      panel.setAttribute('aria-hidden', !abrir);
    };

    const pintar = () => {
      guardado.poner('localStorage', CLAVE, JSON.stringify(cesta));
      const unidades = cesta.reduce((n, p) => n + p.cant, 0);
      const total = cesta.reduce((n, p) => n + p.cant * p.precio, 0);
      contador.hidden = unidades === 0;
      contador.textContent = unidades;
      document.getElementById('cestaTotal').textContent = euros(total);
      pedir.setAttribute('aria-disabled', unidades === 0);

      lista.innerHTML = cesta.length ? cesta.map((p, i) => `
        <li class="cesta-item">
          <img src="${p.icono}" alt="">
          <div><h3>${p.nombre}</h3><p class="ci-var">${p.variante ? p.variante + '<br>' : ''}${euros(p.precio)}</p></div>
          <div class="ci-der">
            <button type="button" class="ci-quitar" data-i="${i}">Quitar</button>
            <div class="ci-cant"><span>Cant.:</span><button type="button" data-i="${i}" data-d="-1" aria-label="Quitar una">−</button><span>${p.cant}</span><button type="button" data-i="${i}" data-d="1" aria-label="Añadir una">+</button></div>
          </div>
        </li>`).join('') : '<li class="cesta-vacia">Tu cesta está vacía.</li>';

      const lineas = cesta.map((p) => `${p.cant} × ${p.nombre}${p.variante ? ' (' + p.variante + ')' : ''}: ${euros(p.cant * p.precio)}`);
      const texto = `Hola, quiero hacer este pedido:\n\n${lineas.join('\n')}\n\nTotal: ${euros(total)}\n\nNombre:\nDirección de envío:\nTeléfono:`;
      pedir.href = 'mailto:info@bask3d.com?subject=' + encodeURIComponent('Pedido de la tienda') + '&body=' + encodeURIComponent(texto);
    };

    lista.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const i = Number(b.dataset.i);
      if (b.classList.contains('ci-quitar')) cesta.splice(i, 1);
      else {
        cesta[i].cant += Number(b.dataset.d);
        if (cesta[i].cant < 1) cesta.splice(i, 1);
      }
      pintar();
    });

    botonCesta.addEventListener('click', () => abrirCesta(!body.classList.contains('cesta-abierta')));
    document.getElementById('cestaCerrar').addEventListener('click', () => abrirCesta(false));
    document.getElementById('cestaVelo').addEventListener('click', () => abrirCesta(false));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirCesta(false); });
    addEventListener('storage', (e) => { if (e.key === CLAVE) { cesta = leerCesta(); pintar(); } });

    /* Ficha de producto: elegir color y añadir a la cesta */
    const barra = document.querySelector('.pr-barra');
    if (barra) {
      const colores = barra.querySelectorAll('.pr-color');
      const nombreVariante = document.getElementById('prVar');
      let variante = colores.length ? colores[0].dataset.variante : '';

      colores.forEach((c) => c.addEventListener('click', () => {
        variante = c.dataset.variante;
        colores.forEach((o) => o.setAttribute('aria-pressed', o === c));
        nombreVariante.textContent = ' — ' + variante;
      }));

      const anadir = document.getElementById('prAnadir');
      anadir.addEventListener('click', () => {
        const { id, nombre, precio, icono } = barra.dataset;
        const existente = cesta.find((p) => p.id === id && p.variante === variante);
        if (existente) existente.cant += 1;
        else cesta.push({ id, nombre, variante, precio: Number(precio), icono, cant: 1 });
        pintar();
        abrirCesta(true);
      });
    }

    pintar();
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
