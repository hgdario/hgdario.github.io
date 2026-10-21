// Darío Di Totaro — portfolio. Sin dependencias.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- datos reales del TFG (research/data/circuit_clusters.csv) ---------- */
  // [nombre, g lateral media, cambios de marcha por km, longitud km, familia, posición de la etiqueta]
  const circuits = [
    ['Abu Dabi', 1.259, 7.80, 5.211, 3, 'a'],
    ['Australia', 1.193, 7.08, 5.239, 2, 'l'],
    ['Austria', 1.037, 8.08, 4.292, 1, 'r'],
    ['Bakú', 0.839, 9.03, 5.934, 1, 'r'],
    ['Baréin', 0.968, 8.70, 5.357, 1, 'l'],
    ['Spa', 1.270, 5.82, 6.940, 2, 'r'],
    ['Silverstone', 1.344, 6.26, 5.820, 2, 'b'],
    ['Canadá', 0.870, 9.79, 4.316, 1, 'r'],
    ['China', 1.216, 8.25, 5.381, 3, 'l'],
    ['Zandvoort', 1.559, 7.83, 4.232, 3, 'a'],
    ['Imola', 1.047, 8.36, 4.869, 1, 'r'],
    ['Francia', 1.234, 7.34, 5.738, 2, 'l'],
    ['Hungría', 1.329, 8.87, 4.333, 3, 'r'],
    ['Monza', 0.913, 6.07, 5.746, 0, 'r'],
    ['Suzuka', 1.396, 6.56, 5.785, 2, 'l'],
    ['Las Vegas', 0.995, 6.71, 6.148, 0, 'r'],
    ['México', 0.968, 7.75, 4.243, 1, 'r'],
    ['Miami', 1.269, 6.78, 5.332, 2, 'r'],
    ['Mónaco', 1.204, 12.04, 3.282, 4, 'r'],
    ['Catar', 1.503, 6.48, 5.378, 2, 'b'],
    ['Yeda', 1.432, 6.63, 6.095, 2, 'r'],
    ['Singapur', 0.949, 10.21, 4.902, 1, 'r'],
    ['Barcelona', 1.411, 6.98, 4.621, 3, 'a'],
    ['Interlagos', 1.286, 7.86, 4.247, 3, 'b'],
    ['Austin', 1.306, 8.20, 5.438, 3, 'a'],
  ];
  const families = [
    { name: 'Low Drag', what: 'Rectas largas y pocas curvas: el coche va casi sin alerón.' },
    { name: 'Stop-and-Go', what: 'Curvas lentas tras rectas: mandan los frenos y la tracción.' },
    { name: 'Aero Efficiency', what: 'Curvas rápidas enlazadas: gana quien genera más carga.' },
    { name: 'Balanced Chassis', what: 'Un poco de todo: pide un coche equilibrado.' },
    { name: 'Urbano extremo', what: 'Mónaco va solo: nadie cambia tanto de marcha.' },
  ];
  const marks = [
    'M0-7a7 7 0 1 1 0 14a7 7 0 1 1 0-14z',          // círculo
    'M0-9L9 0L0 9L-9 0z',                             // rombo
    'M-6.5-6.5h13v13h-13z',                           // cuadrado
    'M0-8.5L8.5 6.5H-8.5z',                           // triángulo
    'M-2.5-9h5v6.5h6.5v5h-6.5V9h-5V2.5H-9v-5h6.5z',   // cruz
  ];
  const fmt = (n, d) => n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });

  const lab = document.querySelector('[data-lab]');
  if (lab) buildLab(lab);

  function buildLab(lab) {
    const W = 800, H = 500, L = 64, R = 24, T = 20, B = 64;
    const x = g => L + (g - 0.8) / (1.62 - 0.8) * (W - L - R);
    const y = s => T + (12.6 - s) / (12.6 - 5.4) * (H - T - B);
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, parent) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    };

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot', role: 'group', 'aria-label': 'Gráfico de dispersión de 25 circuitos' });
    el('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, class: 'axis-line' }, svg);
    el('line', { x1: L, y1: T, x2: L, y2: H - B, class: 'axis-line' }, svg);
    const xl = el('text', { x: W - R, y: H - 22, 'text-anchor': 'end', class: 'axis' }, svg);
    xl.textContent = 'Curvas más rápidas (g lateral media) →';
    const yl = el('text', { x: -T, y: 22, transform: 'rotate(-90)', 'text-anchor': 'end', class: 'axis' }, svg);
    yl.textContent = 'Más cambios de marcha por km →';

    const pts = circuits.map((c, i) => {
      const [name, g, s, len, k, pos] = c;
      const gEl = el('g', {
        class: 'pt', transform: `translate(${x(g).toFixed(1)} ${y(s).toFixed(1)})`,
        tabindex: 0, role: 'button', 'aria-label': `${name}, ${families[k].name}`,
      }, svg);
      el('circle', { r: 18, class: 'pt__hit' }, gEl);
      el('path', { d: marks[k], class: 'pt__mark' }, gEl);
      const off = { r: [14, 5, 'start'], l: [-14, 5, 'end'], a: [0, -15, 'middle'], b: [0, 25, 'middle'] }[pos];
      const t = el('text', { x: off[0], y: off[1], 'text-anchor': off[2], class: 'pt__label' }, gEl);
      t.textContent = name;
      gEl.addEventListener('click', () => pick(i));
      gEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); }
      });
      return gEl;
    });

    lab.querySelector('[data-plot]').appendChild(svg);
    lab.classList.add('is-live');

    const rName = lab.querySelector('[data-r-name]');
    const rFamily = lab.querySelector('[data-r-family]');
    const rNums = lab.querySelector('[data-r-nums]');
    const buttons = [...lab.querySelectorAll('.family')];

    function highlight(k, dim) {
      svg.classList.toggle('has-family', dim);
      pts.forEach((p, i) => p.classList.toggle('in-family', circuits[i][4] === k));
      buttons.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.k === k)));
    }
    function pick(i) {
      const [name, g, s, len, k] = circuits[i];
      pts.forEach((p, j) => p.classList.toggle('is-picked', j === i));
      highlight(k, false);
      rName.textContent = name;
      rFamily.textContent = `${families[k].name}. ${families[k].what}`;
      rNums.textContent = `${fmt(g, 2)} g lateral · ${fmt(s, 1)} cambios de marcha por km · ${fmt(len, 2)} km`;
    }
    function pickFamily(k) {
      const members = circuits.filter(c => c[4] === k).map(c => c[0]);
      pts.forEach(p => p.classList.remove('is-picked'));
      highlight(k, true);
      rName.textContent = families[k].name;
      rFamily.textContent = families[k].what;
      rNums.textContent = `${members.length} ${members.length === 1 ? 'circuito' : 'circuitos'}: ${members.join(', ')}.`;
    }
    buttons.forEach(b => b.addEventListener('click', () => pickFamily(+b.dataset.k)));
    pick(circuits.findIndex(c => c[0] === 'Mónaco'));
  }

  /* ---------- el pase: entrada y reacción al scroll ---------- */
  const hero = document.querySelector('.hero');
  const pass = document.querySelector('[data-hero]');
  const photo = document.querySelector('.hero__photo');
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));

  if (!reduce) {
    let ticking = false;
    const onScroll = () => {
      ticking = false;
      const p = Math.min(1, Math.max(0, scrollY / hero.offsetHeight));
      pass.style.translate = `0 ${(-p * 6).toFixed(2)}vh`;
      pass.style.scale = (1 - p * 0.1).toFixed(4);
      photo.style.translate = `0 ${(p * 12).toFixed(2)}%`;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }

  /* ---------- el talón: aparece al pararse, se aparta mientras bajas ---------- */
  const stub = document.querySelector('[data-stub]');
  const footer = document.querySelector('.back');
  if ('IntersectionObserver' in window && !reduce) {
    let heroGone = false, footerIn = false, moving = false, lastY = scrollY, idle;
    const sync = () => stub.classList.toggle('is-on', heroGone && !footerIn && !moving);
    new IntersectionObserver(([e]) => { heroGone = e.intersectionRatio < 0.2; sync(); }, { threshold: [0, 0.2, 1] }).observe(hero);
    new IntersectionObserver(([e]) => { footerIn = e.isIntersecting; sync(); }).observe(footer);
    addEventListener('scroll', () => {
      moving = scrollY > lastY;
      lastY = scrollY;
      sync();
      clearTimeout(idle);
      idle = setTimeout(() => { moving = false; sync(); }, 700);
    }, { passive: true });
  }

  /* ---------- entradas escalonadas por sección ---------- */
  const groups = document.querySelectorAll('[data-reveal]');
  groups.forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--n', i)));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    groups.forEach(g => io.observe(g));
    // un salto largo (ancla, tecla Fin) puede saltarse una sección: lo que ya quedó atrás se muestra igual
    addEventListener('scroll', () => groups.forEach(g => {
      if (!g.classList.contains('is-in') && g.getBoundingClientRect().top < innerHeight * 0.88) {
        g.classList.add('is-in'); io.unobserve(g);
      }
    }), { passive: true });
  } else {
    groups.forEach(g => g.classList.add('is-in'));
  }
})();
