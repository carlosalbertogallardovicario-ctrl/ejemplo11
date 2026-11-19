/* =========================================================
   ElectroQuest SMR · Lógica de la aplicación
   Profesor creador: Carlos Gallardo · Centro de FP EFA Oretana
   ========================================================= */
'use strict';

/* ======================= UTILIDADES ======================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = (n, d = 2) => { const a = Math.abs(n); if (a !== 0 && a < 0.01) d = 5; return Number(n).toLocaleString('es-ES', { maximumFractionDigits: d }); };
const fmtTime = s => { s = Math.max(0, Math.ceil(s)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const fmtOhm = v => v >= 1e6 ? fmt(v / 1e6) + ' MΩ' : v >= 1e3 ? fmt(v / 1e3) + ' kΩ' : fmt(v) + ' Ω';
const fmtCap = pF => pF >= 1e6 ? fmt(pF / 1e6) + ' µF' : pF >= 1e3 ? fmt(pF / 1e3) + ' nF' : fmt(pF) + ' pF';
const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getComp = id => COMPONENTS.find(c => c.id === id);
const starStr = (n, total = 3) => Array.from({ length: total }, (_, i) => `<span class="star ${i < n ? 'on' : ''}">★</span>`).join('');
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

let timers = [];
const addTimer = id => (timers.push(id), id);
const clearTimers = () => { timers.forEach(t => { clearInterval(t); clearTimeout(t); }); timers = []; };

/* Genera opciones únicas y barajadas */
function makeOpts(correct, cands, n = 4) {
  const set = new Set([correct]);
  for (const c of shuffle(cands)) { if (set.size >= n) break; if (c && !set.has(c)) set.add(c); }
  const opts = shuffle([...set]);
  return { opts, ans: opts.indexOf(correct) };
}
const optionsHTML = (opts, cls = '') => `<div class="options ${cls}">${opts.map((o, i) =>
  `<button class="option" data-i="${i}"><span class="opt-letter">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}</div>`;

function bindOptions(el, ans, onOk, onBad, reveal = false, delay = 700) {
  const btns = $$('.option', el);
  btns.forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    btns.forEach(x => x.disabled = true);
    if (i === ans) { b.classList.add('correct'); beep('ok'); addTimer(setTimeout(onOk, delay)); }
    else { b.classList.add('wrong'); if (reveal && btns[ans]) btns[ans].classList.add('correct'); onBad(); }
  });
}

/* ======================= ESTADO ======================= */
const STORE_KEY = 'electroquest-smr-v1';
const AVATARS = ['🧑‍🔧', '👩‍🔧', '👨‍💻', '👩‍💻', '🤖', '🦾', '🧠', '🚀', '⚡', '🔋', '🦊', '🐉'];
const LEVELS = {
  basico: { name: 'Básico', icon: '🟢', time: 30, xp: 10, desc: 'Conceptos fundamentales: unidades, símbolos y funciones.' },
  intermedio: { name: 'Intermedio', icon: '🟡', time: 25, xp: 20, desc: 'Cálculos sencillos, códigos y aplicaciones.' },
  avanzado: { name: 'Avanzado', icon: '🔴', time: 20, xp: 35, desc: 'Problemas, fórmulas y casos reales de taller.' }
};
const LEVEL_KEYS = Object.keys(LEVELS);
const RANKS = [
  { xp: 0, name: 'Aprendiz de soldador', icon: '🔧' },
  { xp: 150, name: 'Técnico en prácticas', icon: '🪛' },
  { xp: 400, name: 'Técnico de laboratorio', icon: '🔬' },
  { xp: 800, name: 'Especialista en circuitos', icon: '🔌' },
  { xp: 1400, name: 'Ingeniero de hardware', icon: '🖥️' },
  { xp: 2200, name: 'Maestro de la electrónica', icon: '⚡' },
  { xp: 3500, name: 'Leyenda de EFA Oretana', icon: '👑' }
];
const BADGES = [
  { id: 'primer', icon: '⚡', name: 'Primer chispazo', desc: 'Responde tu primera pregunta.' },
  { id: 'racha5', icon: '🔥', name: 'Corriente continua', desc: 'Encadena 5 aciertos seguidos.' },
  { id: 'racha10', icon: '🌋', name: 'Superconductor', desc: 'Encadena 10 aciertos seguidos.' },
  { id: 'perfecto', icon: '💎', name: 'Circuito perfecto', desc: 'Completa un desafío sin ningún fallo (3★).' },
  { id: 'explorador', icon: '🧭', name: 'Explorador', desc: 'Visita la teoría de los 5 componentes.' },
  ...COMPONENTS.map(c => ({ id: c.badge.id, icon: c.badge.icon, name: c.badge.name, desc: `Consigue 3★ en el nivel Avanzado de ${c.name}.` })),
  { id: 'todo', icon: '🏅', name: 'Técnico completo', desc: 'Supera el nivel Avanzado de los 5 componentes.' },
  { id: 'escapista', icon: '🚪', name: 'Escapista', desc: 'Escapa del laboratorio en cualquier dificultad.' },
  { id: 'houdini', icon: '🎩', name: 'Houdini del silicio', desc: 'Escapa del laboratorio en modo Experto.' },
  { id: 'sinpistas', icon: '🧠', name: 'Mente brillante', desc: 'Escapa sin usar ninguna pista.' },
  { id: 'veloz', icon: '⏱️', name: 'Velocista', desc: 'Escapa en menos de 5 minutos.' },
  { id: 'ojo', icon: '👁️', name: 'Ojo de halcón', desc: 'Logra 10 puntos en «Código de colores».' },
  { id: 'ohm', icon: 'Ω', name: 'Discípulo de Ohm', desc: 'Logra 10 puntos en «Ley de Ohm Express».' },
  { id: 'simbolos', icon: '📐', name: 'Lector de esquemas', desc: 'Logra 10 puntos en «Cazasímbolos».' },
  { id: 'leyenda', icon: '👑', name: 'Leyenda de EFA Oretana', desc: 'Alcanza el rango máximo.' }
];

function defaultState() {
  return {
    name: '', avatar: '🧑‍🔧', xp: 0, sound: true,
    stats: { answered: 0, correct: 0, streak: 0, bestStreak: 0 },
    progress: {}, badges: {}, visited: {},
    lab: { colores: 0, ohm: 0, simbolos: 0 },
    escapes: []
  };
}
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!s) return defaultState();
    const d = defaultState();
    return { ...d, ...s, stats: { ...d.stats, ...s.stats }, lab: { ...d.lab, ...s.lab } };
  } catch { return defaultState(); }
}
let state = loadState();
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* sin almacenamiento */ } };

function rankInfo(xp) {
  let i = 0;
  while (i < RANKS.length - 1 && xp >= RANKS[i + 1].xp) i++;
  const cur = RANKS[i], next = RANKS[i + 1];
  return { i, cur, next, pct: next ? (xp - cur.xp) / (next.xp - cur.xp) * 100 : 100 };
}
function addXP(n) {
  if (n <= 0) return;
  const before = rankInfo(state.xp).i;
  state.xp += n; save(); updateChip();
  const after = rankInfo(state.xp).i;
  if (after > before) {
    addTimer(setTimeout(() => { toast(`${RANKS[after].icon} ¡Has subido de rango! Ahora eres <b>${RANKS[after].name}</b>`, 'level'); beep('level'); confetti(120); }, 600));
  }
  if (after === RANKS.length - 1) unlock('leyenda');
}
function unlock(id) {
  if (state.badges[id]) return;
  state.badges[id] = Date.now(); save();
  const b = BADGES.find(x => x.id === id);
  if (b) { toast(`<span class="t-icon">${b.icon}</span> Logro desbloqueado: <b>${b.name}</b>`, 'badge'); beep('badge'); }
}
const stars = (cid, lvl) => state.progress[cid]?.[lvl]?.stars || 0;
const compStars = cid => LEVEL_KEYS.reduce((a, l) => a + stars(cid, l), 0);
const isUnlocked = (cid, lvl) => { const i = LEVEL_KEYS.indexOf(lvl); return i === 0 || stars(cid, LEVEL_KEYS[i - 1]) > 0; };

/* ======================= EFECTOS: SONIDO, TOAST, CONFETI ======================= */
let actx = null;
function beep(type) {
  if (!state.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const S = {
      ok: [[660, .07], [990, .12]], bad: [[200, .14], [140, .22]], click: [[540, .035]],
      win: [[523, .09], [659, .09], [784, .09], [1047, .28]], badge: [[880, .08], [1175, .08], [1568, .2]],
      level: [[392, .1], [523, .1], [659, .1], [784, .1], [1047, .35]], tick: [[1200, .03]]
    }[type] || [];
    let t = actx.currentTime;
    S.forEach(([f, d]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type === 'bad' ? 'sawtooth' : 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(type === 'bad' ? .07 : .11, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + .02); t += d;
    });
  } catch { /* audio no disponible */ }
}
function toggleSound() { state.sound = !state.sound; save(); $('#soundBtn').textContent = state.sound ? '🔊' : '🔇'; beep('click'); }

function toast(html, type = '') {
  const t = document.createElement('div');
  t.className = `toast ${type}`; t.innerHTML = html;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 3400);
  setTimeout(() => t.remove(), 3900);
}
function flash(type = 'bad') {
  const f = $('#flash'); f.className = ''; void f.offsetWidth; f.className = 'flash-' + type;
}
function confetti(count = 160) {
  const c = $('#confetti'), ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const cols = ['#00e5ff', '#ff2bd6', '#b6ff3b', '#ffb020', '#ffffff', '#a46bff', '#31f59b'];
  const ps = Array.from({ length: count }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 240, y: innerHeight * .38,
    vx: (Math.random() - .5) * 18, vy: -Math.random() * 15 - 5, s: Math.random() * 8 + 5,
    r: Math.random() * 6, vr: (Math.random() - .5) * .35, col: pick(cols)
  }));
  let f = 0;
  (function step() {
    ctx.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => {
      p.vy += .38; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col;
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
    });
    if (++f < 190) requestAnimationFrame(step); else ctx.clearRect(0, 0, c.width, c.height);
  })();
}

/* Fondo animado de pistas de circuito impreso */
function initBackground() {
  const c = $('#bg'), ctx = c.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = ['0,229,255', '255,43,214', '182,255,59', '255,176,32', '164,107,255'];
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  let w, h, traces = [];
  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    traces = [];
    const G = 24, n = Math.round(w * h / 24000);
    for (let i = 0; i < n; i++) {
      let x = Math.round(Math.random() * w / G) * G, y = Math.round(Math.random() * h / G) * G;
      let dir = rnd(0, 3) * 2;
      const pts = [[x, y]], segL = [];
      for (let k = 0, segs = rnd(2, 5); k < segs; k++) {
        const len = rnd(2, 7) * G, d = DIRS[dir];
        const nx = x + d[0] * len, ny = y + d[1] * len;
        segL.push(Math.hypot(nx - x, ny - y)); pts.push([nx, ny]); x = nx; y = ny;
        dir = (dir + pick([-1, 0, 1]) + 8) % 8;
      }
      traces.push({ pts, segL, total: segL.reduce((a, b) => a + b, 0), t: Math.random(), speed: .0012 + Math.random() * .003, col: pick(COLS) });
    }
  }
  function pointAt(tr, t) {
    let d = t * tr.total;
    for (let i = 0; i < tr.segL.length; i++) {
      if (d <= tr.segL[i]) { const a = tr.pts[i], b = tr.pts[i + 1], f = d / tr.segL[i]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
      d -= tr.segL[i];
    }
    return tr.pts[tr.pts.length - 1];
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const tr of traces) {
      ctx.strokeStyle = `rgba(${tr.col},0.085)`; ctx.lineWidth = 1.3;
      ctx.beginPath(); tr.pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
      ctx.fillStyle = `rgba(${tr.col},0.22)`;
      [tr.pts[0], tr.pts[tr.pts.length - 1]].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0, 7); ctx.fill(); });
      const [px, py] = pointAt(tr, tr.t);
      const g = ctx.createRadialGradient(px, py, 0, px, py, 11);
      g.addColorStop(0, `rgba(${tr.col},0.95)`); g.addColorStop(1, `rgba(${tr.col},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 11, 0, 7); ctx.fill();
      tr.t += tr.speed; if (tr.t > 1) tr.t = 0;
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  build(); addEventListener('resize', debounce(() => { build(); if (reduce) frame(); }, 200)); frame();
}

/* ======================= DIBUJOS SVG ======================= */
function resistorSVG(bands) {
  const xs = bands.length === 5 ? [88, 120, 140, 160, 204] : [92, 124, 150, 204];
  const body = 'M70 26Q70 16 84 16H100Q108 16 113 24H187Q192 16 200 16H216Q230 16 230 26V74Q230 84 216 84H200Q192 84 187 76H113Q108 84 100 84H84Q70 84 70 74Z';
  return `<svg viewBox="0 0 300 100" class="resistor-svg" role="img" aria-label="Resistencia con bandas ${bands.map(b => b.n).join(', ')}">
    <defs><linearGradient id="rbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e7c6"/><stop offset=".5" stop-color="#e2c690"/><stop offset="1" stop-color="#a98a5c"/></linearGradient>
    <linearGradient id="rshine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <line x1="4" y1="50" x2="296" y2="50" stroke="#c3ccd6" stroke-width="5" stroke-linecap="round"/>
    <path d="${body}" fill="url(#rbody)" stroke="#7d6646" stroke-width="1.5"/>
    ${bands.map((b, i) => { const bulge = xs[i] < 112 || xs[i] > 188; return `<rect x="${xs[i]}" y="${bulge ? 16 : 24}" width="13" height="${bulge ? 68 : 52}" fill="${b.c}"><title>${b.n}</title></rect>`; }).join('')}
    <path d="${body}" fill="url(#rshine)"/></svg>`;
}
const bandLabels = bands => `<div class="band-labels">${bands.map(b => `<span><i style="background:${b.c}"></i>${b.n}</span>`).join('')}</div>`;

function ceramicSVG(code) {
  return `<svg viewBox="0 0 200 200" class="cap-svg"><defs><radialGradient id="cgrad" cx=".35" cy=".3"><stop offset="0" stop-color="#ffbe6b"/><stop offset="1" stop-color="#b85400"/></radialGradient></defs>
    <path d="M80 120V196M120 120V196" stroke="#c3ccd6" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="100" cy="78" rx="72" ry="62" fill="url(#cgrad)" stroke="#7a3800" stroke-width="2"/>
    <text x="100" y="94" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="42" font-weight="700" fill="#3a1a00">${code}</text></svg>`;
}
function capComboSVG(c1, c2, series) {
  const cap = (x, y, l) => `<path d="M${x - 6} ${y - 18}V${y + 18}M${x + 6} ${y - 18}V${y + 18}"/><text x="${x}" y="${y - 26}" class="lbl">${l}</text>`;
  const term = (x, y, l) => `<circle cx="${x}" cy="${y}" r="5" class="term"/><text x="${x}" y="${y + 24}" class="lbl">${l}</text>`;
  if (series) return `<svg viewBox="0 0 320 100" class="circ-svg"><path d="M20 60H124M136 60H184M196 60H300"/>${cap(130, 60, c1)}${cap(190, 60, c2)}${term(20, 60, 'A')}${term(300, 60, 'B')}</svg>`;
  return `<svg viewBox="0 0 320 160" class="circ-svg"><path d="M20 85H90M90 45V125M230 45V125M230 85H300M90 45H154M166 45H230M90 125H154M166 125H230"/>${cap(160, 45, c1)}${cap(160, 125, c2)}${term(20, 85, 'A')}${term(300, 85, 'B')}</svg>`;
}
function rcSVG(R, C) {
  return `<svg viewBox="0 0 340 170" class="circ-svg"><path d="M40 40H120M180 40H244M256 40H300V140H40V102M40 78V40"/>
    <path d="M24 78H56"/><path d="M32 102H48" class="thick"/><text x="66" y="84" class="lbl">+</text>
    <rect x="120" y="28" width="60" height="24" rx="3" class="body"/><text x="150" y="20" class="lbl">R = ${R} kΩ</text>
    <path d="M244 18V62M256 18V62"/><text x="250" y="84" class="lbl">C = ${C} µF</text></svg>`;
}
function diodeShape(x, y, down, led, color) {
  const tri = down ? `${x - 14},${y - 12} ${x + 14},${y - 12} ${x},${y + 12}` : `${x - 14},${y + 12} ${x + 14},${y + 12} ${x},${y - 12}`;
  const by = down ? y + 12 : y - 12;
  let s = `<polygon points="${tri}" class="d-bg"/><polygon points="${tri}" class="${led ? 'led-tri' : 'd-tri'}" style="--led:${color || '#cfd8ff'}"/><path d="M${x - 15} ${by}H${x + 15}" class="d-bar"/>`;
  if (led) s += `<g class="led-arrows" style="--led:${color}"><path d="M${x + 18} ${y - 2}L${x + 30} ${y - 12}M${x + 18} ${y + 8}L${x + 30} ${y - 2}"/>
    <polygon points="${x + 30},${y - 12} ${x + 27.6},${y - 5.5} ${x + 23.2},${y - 10.9}"/><polygon points="${x + 30},${y - 2} ${x + 27.6},${y + 4.5} ${x + 23.2},${y - 0.9}"/></g>`;
  return s;
}
function ledCircuitSVG(branches, sel, lit) {
  const n = branches.length, W = 150 + n * 110, x0 = 50, xEnd = 140 + (n - 1) * 110;
  let s = `<svg viewBox="0 0 ${W} 292" class="led-circuit"><path class="wire" d="M${x0} 40H${xEnd}M${x0} 250H${xEnd}M${x0} 40V128M${x0} 146V250"/>
    <path class="wire" d="M${x0 - 22} 128H${x0 + 22}"/><path class="wire thick" d="M${x0 - 11} 146H${x0 + 11}"/>
    <text x="${x0 + 30}" y="126" class="lbl plus">+</text><text x="${x0 + 30}" y="160" class="lbl">−</text><text x="${x0}" y="186" class="lbl">9 V</text>`;
  branches.forEach((b, i) => {
    const x = 140 + i * 110, ys = b.els.length === 1 ? [165] : [140, 202];
    s += `<g class="branch ${sel.has(i) ? 'sel' : ''} ${lit && lit[i] ? 'lit' : ''}" data-i="${i}"><rect class="hl" x="${x - 44}" y="26" width="88" height="238" rx="14"/>
      <path class="wire" d="M${x} 40V250"/><rect class="res" x="${x - 8}" y="58" width="16" height="36" rx="2"/>
      ${b.els.map((e, k) => diodeShape(x, ys[k], e.down, e.led, e.color)).join('')}<text x="${x}" y="284" class="lbl">L${i + 1}</text></g>`;
  });
  return s + '</svg>';
}
function transistorSVG(L) {
  const t = (x, y, txt, cls = '') => txt ? `<text x="${x}" y="${y}" class="lbl ${cls} ${txt.includes('?') ? 'ask' : ''}">${txt}</text>` : '';
  return `<svg viewBox="0 0 340 270" class="circ-svg trans-svg">
    <path d="M230 26V52M230 88V112M230 178V236M200 145H160M100 145H40"/>
    <circle cx="230" cy="70" r="18" class="body"/><text x="230" y="76" class="lbl">M</text>
    <circle cx="212" cy="145" r="30"/><path d="M200 125V165M200 135L230 112M200 155L230 178"/>
    <polygon class="fill" points="230,178 219.05,175.85 225.15,167.95"/>
    <rect x="100" y="135" width="60" height="20" rx="3" class="body"/><circle cx="34" cy="145" r="5" class="term"/>
    <path d="M214 236H246M219 243H241M225 250H235"/>
    ${t(230, 18, '+Vcc')}${t(290, 74, 'Ventilador', 'muted')}${t(52, 128, L.vin)}${t(130, 126, L.rb)}${t(176, 182, L.ib)}
    ${t(285, 112, L.ic)}${t(286, 150, L.beta)}${t(110, 210, L.vbe || '')}</svg>`;
}
function ohmTriangle(unknown) {
  return `<svg viewBox="0 0 160 140" class="ohm-tri"><polygon points="80,8 152,132 8,132"/><line x1="34" y1="88" x2="126" y2="88"/><line x1="80" y1="88" x2="80" y2="132"/>
    <text x="80" y="72" class="${unknown === 'V' ? 'hl' : ''}">V</text><text x="54" y="122" class="${unknown === 'I' ? 'hl' : ''}">I</text><text x="106" y="122" class="${unknown === 'R' ? 'hl' : ''}">R</text></svg>`;
}

/* Generadores de resistencias */
const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
function randomResistor(nb, easy) {
  let digits, m;
  if (nb === 5) { digits = [rnd(1, 9), rnd(0, 9), rnd(0, 9)]; m = rnd(0, 3); }
  else if (easy) { const b = pick(E12); digits = [Math.floor(b / 10), b % 10]; m = rnd(0, 4); }
  else { digits = [rnd(1, 9), rnd(0, 9)]; m = rnd(0, 5); }
  const sig = +digits.join(''), value = sig * 10 ** m;
  const tol = nb === 5 ? COLORS[1] : (Math.random() < .75 ? GOLD : SILVER);
  return { digits, m, sig, value, bands: [...digits.map(d => COLORS[d]), COLORS[m], tol] };
}
function resistorDistractors(r) {
  const rev = +[...r.digits].reverse().join('');
  return [r.value * 10, r.value / 10, r.value * 100, r.value / 100, rev * 10 ** r.m, +(r.digits.join('') + r.m), r.sig * 10 ** (r.m + 3)]
    .filter(v => v >= 1 && Number.isFinite(v)).map(fmtOhm);
}

/* ======================= NAVEGACIÓN ======================= */
const VIEWS = {};
let current = { view: 'home', param: null };
let moduleTab = 'teoria';

function go(view, param) {
  if (esc && esc.running && view !== 'escapeGame') {
    if (!confirm('Si sales ahora perderás tu partida del Escape Room. ¿Seguro que quieres salir?')) return;
    stopEscape(); esc = null;
  }
  clearTimers(); closeModal();
  current = { view, param };
  const app = $('#app');
  app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter');
  app.innerHTML = '';
  (VIEWS[view] || VIEWS.home)(app, param);
  updateNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateNav() {
  const map = { module: 'home', quiz: 'home', labGame: 'lab', calc: 'lab', escapeGame: 'escape' };
  const v = map[current.view] || current.view;
  $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
}
function updateChip() {
  const r = rankInfo(state.xp);
  $('#playerChip').innerHTML = `<span class="chip-avatar">${state.avatar}</span><span class="chip-info"><b>${escHtml(state.name || 'Jugador/a')}</b><small>${r.cur.icon} Nv.${r.i + 1} · ${state.xp} XP</small></span>
    <span class="chip-bar"><i style="width:${r.pct}%"></i></span>`;
  $('#soundBtn').textContent = state.sound ? '🔊' : '🔇';
}

/* ======================= PERFIL (MODAL) ======================= */
function openProfile(first) {
  let av = state.avatar;
  $('#modal').innerHTML = `<div class="modal-back"><div class="modal glass">
    <div class="modal-logo">⚡</div>
    <h2>${first ? '¡Bienvenid@ a ElectroQuest!' : 'Tu perfil'}</h2>
    <p class="muted">${first ? 'Repasa los componentes electrónicos de 1º SMR, gana XP, desbloquea logros y supera el Escape Room. ¿Cómo te llamas?' : 'Cambia tu nombre o tu avatar.'}</p>
    <input id="pname" class="input" maxlength="18" placeholder="Tu nombre o alias" value="${escHtml(state.name)}" autocomplete="off">
    <div class="avatars">${AVATARS.map(a => `<button class="avatar ${a === av ? 'sel' : ''}" data-a="${a}">${a}</button>`).join('')}</div>
    <button class="btn btn-primary wide" id="psave">${first ? '🚀 ¡Empezar la aventura!' : 'Guardar'}</button>
    ${first ? '' : '<button class="btn btn-ghost wide" onclick="closeModal()">Cancelar</button>'}
    <p class="modal-credit">Aplicación creada por el profesor <b>Carlos Gallardo</b><br>Centro de FP <b>EFA Oretana</b></p></div></div>`;
  $$('.avatar').forEach(b => b.onclick = () => { av = b.dataset.a; $$('.avatar').forEach(x => x.classList.toggle('sel', x === b)); beep('click'); });
  const doSave = () => {
    const n = $('#pname').value.trim();
    if (!n) { $('#pname').classList.add('shake'); setTimeout(() => $('#pname')?.classList.remove('shake'), 500); return; }
    state.name = n; state.avatar = av; save(); updateChip(); closeModal(); beep('win');
    if (first) toast(`👋 ¡Hola, <b>${escHtml(n)}</b>! Empieza por la teoría o lánzate a los desafíos.`);
    if (current.view === 'home' || current.view === 'badges') go(current.view);
  };
  $('#psave').onclick = doSave;
  $('#pname').onkeydown = e => { if (e.key === 'Enter') doSave(); };
  setTimeout(() => $('#pname')?.focus(), 100);
}
function closeModal() { $('#modal').innerHTML = ''; }

/* ======================= INICIO ======================= */
VIEWS.home = app => {
  const r = rankInfo(state.xp);
  const totalStars = COMPONENTS.reduce((s, c) => s + compStars(c.id), 0);
  const nb = Object.keys(state.badges).length;
  const acc = state.stats.answered ? Math.round(state.stats.correct / state.stats.answered * 100) : 0;
  app.innerHTML = `
  <section class="hero">
    <div class="hero-text">
      <span class="pill">⚡ ${APP_INFO.course}</span>
      <h1 class="title-glow">Electro<span>Quest</span></h1>
      <p class="lead">Domina los <b>componentes electrónicos</b>: resistencias, condensadores, inductores, diodos y transistores. Estudia la teoría, supera desafíos por niveles, gana XP y… ¿serás capaz de <b>escapar del laboratorio</b>?</p>
      <div class="hero-actions">
        <button class="btn btn-primary" onclick="go('escape')">🚪 Escape Room</button>
        <button class="btn btn-ghost" onclick="go('lab')">🧪 Minijuegos</button>
      </div>
      <div class="credit-card"><span class="credit-icon">👨‍🏫</span><div><small>Profesor creador</small><b>${APP_INFO.teacher}</b><span>${APP_INFO.school}</span></div></div>
    </div>
    <div class="player-card glass">
      <div class="pc-top"><div class="pc-avatar">${state.avatar}</div><div><h3>${escHtml(state.name || 'Jugador/a')}</h3><span class="rank">${r.cur.icon} ${r.cur.name}</span></div></div>
      <div class="xp-row"><span>Nivel ${r.i + 1}</span><span>${state.xp} XP ${r.next ? `/ ${r.next.xp}` : '· MÁX'}</span></div>
      <div class="xp-bar"><i style="width:${r.pct}%"></i></div>
      ${r.next ? `<small class="muted">Siguiente rango: ${r.next.icon} ${r.next.name}</small>` : '<small class="muted">¡Has alcanzado el rango máximo!</small>'}
      <div class="pc-stats">
        <div><b>${totalStars}<small>/45</small></b><span>⭐ Estrellas</span></div>
        <div><b>${nb}<small>/${BADGES.length}</small></b><span>🏆 Logros</span></div>
        <div><b>${acc}%</b><span>🎯 Precisión</span></div>
        <div><b>${state.stats.bestStreak}</b><span>🔥 Mejor racha</span></div>
      </div>
    </div>
  </section>

  <div class="section-head"><h2>🔩 Componentes</h2><p class="muted">Elige un componente: repasa su teoría y supera los niveles Básico, Intermedio y Avanzado.</p></div>
  <div class="comp-grid">${COMPONENTS.map((c, i) => {
    const st = compStars(c.id);
    return `<button class="comp-card" style="--c:${c.color};animation-delay:${i * 70}ms" onclick="moduleTab='teoria';go('module','${c.id}')">
      <div class="comp-icon">${SYM[c.sym]}</div><h3>${c.name}</h3><p>${c.tagline}</p>
      <div class="lvl-dots">${LEVEL_KEYS.map(l => `<span class="lvl-dot ${stars(c.id, l) ? 'done' : ''} ${isUnlocked(c.id, l) ? '' : 'locked'}" title="${LEVELS[l].name}">${starStr(stars(c.id, l))}</span>`).join('')}</div>
      <div class="mini-bar"><i style="width:${st / 9 * 100}%"></i></div>
      ${state.badges[c.badge.id] ? `<span class="comp-badge" title="${c.badge.name}">${c.badge.icon}</span>` : ''}</button>`;
  }).join('')}</div>

  <section class="promo glass">
    <div class="promo-art">🔒⚡🚪</div>
    <div><h2>Escape Room: <span class="grad">El laboratorio bloqueado</span></h2>
    <p>Un apagón ha activado el sistema de seguridad <b>OHM‑9000</b> del laboratorio de EFA Oretana. Supera los retos de las 5 salas, consigue los fragmentos del código y abre la puerta antes de que se agote la batería de emergencia.</p>
    <button class="btn btn-primary" onclick="go('escape')">Aceptar el reto →</button></div>
  </section>

  <div class="how-grid">
    <div class="how glass"><span>📘</span><h4>1 · Aprende</h4><p>Fichas de teoría claras con fórmulas, trucos y aplicaciones en informática.</p></div>
    <div class="how glass"><span>🎯</span><h4>2 · Supera desafíos</h4><p>3 niveles por componente, con tiempo, vidas, combos y estrellas.</p></div>
    <div class="how glass"><span>🧪</span><h4>3 · Practica</h4><p>Minijuegos contrarreloj: código de colores, Ley de Ohm y símbolos.</p></div>
    <div class="how glass"><span>🏆</span><h4>4 · Escapa</h4><p>Pon a prueba todo lo aprendido en el Escape Room y entra en el ranking.</p></div>
  </div>`;
};

/* ======================= MÓDULO (TEORÍA + NIVELES) ======================= */
VIEWS.module = (app, id) => {
  const c = getComp(id); if (!c) return go('home');
  state.visited[id] = true; save();
  if (COMPONENTS.every(x => state.visited[x.id])) unlock('explorador');
  app.innerHTML = `
  <button class="back" onclick="go('home')">← Volver</button>
  <header class="module-head" style="--c:${c.color}">
    <div class="module-icon">${SYM[c.sym]}</div>
    <div><span class="pill">Componente</span><h1>${c.name}</h1><p>${c.tagline}</p></div>
    <div class="module-stars">${starStr(compStars(id), 9)}</div>
  </header>
  <div class="tabs" style="--c:${c.color}">
    <button class="tab" data-tab="teoria">📘 Teoría</button>
    <button class="tab" data-tab="retos">🎯 Desafíos</button>
  </div>
  <div id="tab-teoria" class="theory-grid">${c.theory.map((t, i) => `<article class="theory-card glass" style="--c:${c.color};animation-delay:${i * 60}ms"><h3><span class="t-ico">${t.icon}</span>${t.t}</h3>${t.h}</article>`).join('')}
    ${id === 'resistencias' ? `<article class="theory-card glass cta-card" style="--c:${c.color}"><h3><span class="t-ico">🧮</span>Calculadora de colores</h3><p>Practica el código de colores con la calculadora interactiva.</p><button class="btn btn-ghost" onclick="go('calc')">Abrir calculadora</button></article>` : ''}
    <div class="theory-cta"><button class="btn btn-primary" onclick="switchTab('retos')">🎯 ¡Ponte a prueba!</button></div>
  </div>
  <div id="tab-retos" class="levels">${LEVEL_KEYS.map((l, i) => {
    const L = LEVELS[l], st = stars(id, l), lock = !isUnlocked(id, l), best = state.progress[id]?.[l]?.best || 0;
    return `<div class="level-card glass ${lock ? 'locked' : ''}" style="--c:${c.color};animation-delay:${i * 90}ms">
      <div class="level-top"><span class="level-icon">${lock ? '🔒' : L.icon}</span><div class="stars big">${starStr(st)}</div></div>
      <h3>Nivel ${L.name}</h3><p>${L.desc}</p>
      <ul class="level-meta"><li>⏱️ ${L.time} s por pregunta</li><li>❤️ 3 vidas</li><li>✨ ${L.xp} XP por acierto</li>${best ? `<li>🏅 Récord: ${best} pts</li>` : ''}</ul>
      <button class="btn ${lock ? 'btn-ghost' : 'btn-primary'} wide" ${lock ? 'disabled' : ''} onclick="startQuiz('${id}','${l}')">${lock ? 'Bloqueado' : st ? '🔁 Repetir' : '▶ Empezar'}</button>
      ${lock ? '<small class="muted">Consigue al menos 1★ en el nivel anterior para desbloquearlo.</small>' : ''}</div>`;
  }).join('')}
  <div class="stars-legend glass">⭐ <b>Estrellas:</b> ★★★ sin fallos · ★★ con 1 fallo · ★ con 2 fallos · Si pierdes las 3 vidas, ¡cortocircuito!</div></div>`;
  $$('.tab').forEach(b => b.onclick = () => switchTab(b.dataset.tab));
  switchTab(moduleTab, true);
};
function switchTab(tab, silent) {
  moduleTab = tab;
  $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('#tab-teoria')?.classList.toggle('hidden', tab !== 'teoria');
  $('#tab-retos')?.classList.toggle('hidden', tab !== 'retos');
  if (!silent) { beep('click'); $('.tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

/* ======================= DESAFÍOS (QUIZ) ======================= */
let quiz = null;
function startQuiz(cid, level) {
  const comp = getComp(cid);
  const qs = shuffle(comp.questions[level]).map(([q, opts, e]) => ({ q, e, opts: shuffle(opts.map((o, i) => ({ o, ok: i === 0 }))) }));
  quiz = { comp, level, qs, i: 0, lives: 3, score: 0, combo: 0, maxCombo: 0, correct: 0, wrong: 0, xp: 0, answered: false, t: 0 };
  go('quiz');
}
VIEWS.quiz = app => { if (!quiz) return go('home'); renderQuestion(); };
function renderQuestion() {
  const app = $('#app'), q = quiz.qs[quiz.i], L = LEVELS[quiz.level];
  quiz.answered = false; quiz.t = L.time;
  app.innerHTML = `<div class="quiz-wrap" style="--c:${quiz.comp.color}">
    <div class="quiz-hud glass">
      <button class="icon-btn" onclick="quitQuiz()" aria-label="Salir">✕</button>
      <div class="hud-item hide-sm">${quiz.comp.name} · <b>${L.name}</b></div>
      <div class="hearts">${'<span class="heart">❤️</span>'.repeat(quiz.lives)}${'<span class="heart lost">🖤</span>'.repeat(3 - quiz.lives)}</div>
      <div class="hud-item">⭐ <b id="qscore">${quiz.score}</b></div>
      <div class="combo ${quiz.combo >= 2 ? 'on' : ''}">🔥 x${quiz.combo}</div>
    </div>
    <div class="quiz-progress">${quiz.qs.map((_, i) => `<span class="${i < quiz.i ? 'done' : i === quiz.i ? 'cur' : ''}"></span>`).join('')}</div>
    <div class="question-card glass" id="qcard">
      <div class="q-top"><span class="q-num">Pregunta ${quiz.i + 1} de ${quiz.qs.length}</span>
        <div class="timer-ring" id="tring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" class="track"/><circle cx="22" cy="22" r="19" class="bar" id="tbar"/></svg><span id="tnum">${L.time}</span></div></div>
      <h2 class="q-text">${q.q}</h2>
      ${optionsHTML(q.opts.map(o => o.o))}
      <div id="feedback"></div>
    </div></div>`;
  $$('.option').forEach(b => b.onclick = () => answerQuiz(+b.dataset.i));
  const circ = 2 * Math.PI * 19, bar = $('#tbar'), start = Date.now();
  bar.style.strokeDasharray = circ;
  let lastSec = L.time;
  addTimer(setInterval(() => {
    const left = Math.max(0, L.time - (Date.now() - start) / 1000);
    quiz.t = left;
    const sec = Math.ceil(left);
    $('#tnum').textContent = sec;
    bar.style.strokeDashoffset = circ * (1 - left / L.time);
    if (left <= 5) { $('#tring').classList.add('danger'); if (sec !== lastSec) beep('tick'); }
    lastSec = sec;
    if (left <= 0) answerQuiz(-1);
  }, 100));
}
function answerQuiz(i) {
  if (!quiz || quiz.answered) return;
  quiz.answered = true; clearTimers();
  const q = quiz.qs[quiz.i], ok = i >= 0 && q.opts[i].ok;
  $$('.option').forEach((b, j) => { b.disabled = true; if (q.opts[j].ok) b.classList.add('correct'); else if (j === i) b.classList.add('wrong'); });
  state.stats.answered++; unlock('primer');
  let ptsTxt = '';
  if (ok) {
    quiz.correct++; quiz.combo++; quiz.maxCombo = Math.max(quiz.maxCombo, quiz.combo);
    const mult = 1 + Math.min(quiz.combo - 1, 5) * 0.2;
    const pts = Math.round((100 + quiz.t * 10) * mult);
    quiz.score += pts; quiz.xp += LEVELS[quiz.level].xp + (quiz.combo >= 3 ? 5 : 0);
    state.stats.correct++; state.stats.streak++;
    state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.streak);
    if (state.stats.streak >= 5) unlock('racha5');
    if (state.stats.streak >= 10) unlock('racha10');
    beep('ok'); ptsTxt = `<span class="pts">+${pts} pts${mult > 1 ? ` (x${fmt(mult, 1)})` : ''}</span>`;
    $('#qscore').textContent = quiz.score;
  } else {
    quiz.wrong++; quiz.lives--; quiz.combo = 0; state.stats.streak = 0;
    beep('bad'); flash('bad'); $('#qcard').classList.add('shake');
    const hearts = $$('.heart:not(.lost)'); if (hearts.length) { const h = hearts[hearts.length - 1]; h.classList.add('lost', 'pop'); h.textContent = '🖤'; }
  }
  save();
  const last = quiz.i >= quiz.qs.length - 1 || quiz.lives <= 0;
  $('#feedback').innerHTML = `<div class="feedback ${ok ? 'ok' : 'bad'}">
    <div class="fb-title">${ok ? pick(['✅ ¡Correcto!', '✅ ¡Genial!', '✅ ¡Circuito cerrado!', '✅ ¡Bien hecho!']) : i < 0 ? '⏰ ¡Se acabó el tiempo!' : '❌ Incorrecto'} ${ptsTxt}</div>
    <p>💡 ${q.e}</p>
    <button class="btn btn-primary" id="nextQ">${last ? 'Ver resultados' : 'Siguiente →'}</button></div>`;
  $('#nextQ').onclick = nextQuestion; $('#nextQ').focus({ preventScroll: true });
}
function nextQuestion() {
  quiz.i++;
  if (quiz.lives <= 0 || quiz.i >= quiz.qs.length) finishQuiz(); else renderQuestion();
}
function quitQuiz() { if (confirm('¿Abandonar el desafío? Perderás el progreso de esta partida.')) { clearTimers(); moduleTab = 'retos'; go('module', quiz.comp.id); } }
function finishQuiz() {
  const { comp, level } = quiz, failed = quiz.lives <= 0;
  const st = failed ? 0 : quiz.wrong === 0 ? 3 : quiz.wrong === 1 ? 2 : 1;
  const prog = state.progress[comp.id] = state.progress[comp.id] || {};
  const prev = prog[level] || { stars: 0, best: 0 };
  prog[level] = { stars: Math.max(prev.stars, st), best: Math.max(prev.best, quiz.score) };
  const record = quiz.score > prev.best && prev.best > 0;
  const bonus = st * LEVELS[level].xp;
  const total = failed ? Math.round(quiz.xp / 2) : quiz.xp + bonus;
  save();
  if (st === 3) unlock('perfecto');
  if (level === 'avanzado' && st === 3) unlock(comp.badge.id);
  if (COMPONENTS.every(c => stars(c.id, 'avanzado') > 0)) unlock('todo');
  const li = LEVEL_KEYS.indexOf(level), nextL = LEVEL_KEYS[li + 1];
  const newlyUnlocked = nextL && prev.stars === 0 && st > 0;
  const msgs = failed ? ['¡Cortocircuito!', '¡Se fundieron los fusibles!'] : st === 3 ? ['¡Perfecto!', '¡Brillante!', '¡Nivel dominado!'] : st === 2 ? ['¡Muy bien!', '¡Buen trabajo!'] : ['¡Superado!', '¡Lo conseguiste!'];
  $('#app').innerHTML = `<div class="results glass" style="--c:${comp.color}">
    <div class="res-icon">${failed ? '💥' : st === 3 ? '🏆' : '🎉'}</div>
    <h1>${pick(msgs)}</h1>
    <p class="muted">${comp.name} · Nivel ${LEVELS[level].name}${failed ? ' · Te quedaste sin vidas' : ''}</p>
    <div class="res-stars">${[0, 1, 2].map(i => `<span class="star ${i < st ? 'on' : ''}" style="animation-delay:${300 + i * 250}ms">★</span>`).join('')}</div>
    <div class="res-grid">
      <div><b>${quiz.correct}/${quiz.qs.length}</b><span>Aciertos</span></div>
      <div><b>${quiz.score}</b><span>Puntos${record ? ' 🏅' : ''}</span></div>
      <div><b>x${quiz.maxCombo}</b><span>Combo máx.</span></div>
      <div><b class="xp-gain">+${total}</b><span>XP ganada</span></div>
    </div>
    ${record ? '<p class="record">🏅 ¡Nuevo récord personal!</p>' : ''}
    ${newlyUnlocked ? `<p class="unlocked">🔓 ¡Has desbloqueado el nivel <b>${LEVELS[nextL].name}</b>!</p>` : ''}
    ${failed ? '<p class="muted">Consejo: repasa la teoría del componente y vuelve a intentarlo. ¡Cada intento suma XP!</p>' : ''}
    <div class="res-actions">
      <button class="btn btn-ghost" onclick="startQuiz('${comp.id}','${level}')">🔁 Reintentar</button>
      ${nextL && isUnlocked(comp.id, nextL) ? `<button class="btn btn-primary" onclick="startQuiz('${comp.id}','${nextL}')">Nivel ${LEVELS[nextL].name} →</button>` : ''}
      <button class="btn btn-ghost" onclick="moduleTab='${failed ? 'teoria' : 'retos'}';go('module','${comp.id}')">${failed ? '📘 Repasar teoría' : '↩ Volver al componente'}</button>
    </div></div>`;
  if (st > 0) { beep('win'); confetti(st * 60); } else beep('bad');
  addXP(total);
  quiz = null;
}

/* ======================= LABORATORIO (MINIJUEGOS) ======================= */
const LAB_GAMES = {
  colores: {
    name: 'Código de colores', icon: '🎨', color: '#ffb020', badge: 'ojo', desc: 'Lee el valor de cada resistencia lo más rápido que puedas.',
    gen() {
      const r = randomResistor(4, false);
      const { opts, ans } = makeOpts(fmtOhm(r.value), resistorDistractors(r));
      return { visual: `<div class="resistor-box">${resistorSVG(r.bands)}</div>`, q: '¿Qué valor tiene esta resistencia?', opts, ans };
    }
  },
  ohm: {
    name: 'Ley de Ohm Express', icon: 'Ω', color: '#00d4ff', badge: 'ohm', desc: 'Calcula tensión, intensidad o resistencia contrarreloj.',
    gen() {
      const R = pick([2, 4, 5, 10, 20, 50, 100, 220]), I = pick([0.1, 0.2, 0.5, 1, 2, 3]), V = +(R * I).toFixed(3), t = rnd(0, 2);
      let q, correct, cands, u;
      if (t === 0) { u = 'V'; q = `I = ${fmt(I)} A · R = ${R} Ω<br>¿Cuánto vale la <b>tensión V</b>?`; correct = `${fmt(V)} V`; cands = [R / I, I / R, R + I, V * 10, V / 10].map(v => `${fmt(v)} V`); }
      else if (t === 1) { u = 'I'; q = `V = ${fmt(V)} V · R = ${R} Ω<br>¿Cuánto vale la <b>intensidad I</b>?`; correct = `${fmt(I)} A`; cands = [V * R, R / V, I * 10, I / 10].map(v => `${fmt(v)} A`); }
      else { u = 'R'; q = `V = ${fmt(V)} V · I = ${fmt(I)} A<br>¿Cuánto vale la <b>resistencia R</b>?`; correct = `${fmt(R)} Ω`; cands = [V * I, I / V, R * 10, R / 10].map(v => `${fmt(v)} Ω`); }
      const { opts, ans } = makeOpts(correct, cands);
      return { visual: ohmTriangle(u), q, opts, ans };
    }
  },
  simbolos: {
    name: 'Cazasímbolos', icon: '📐', color: '#31f59b', badge: 'simbolos', desc: 'Identifica cada componente a partir de su símbolo electrónico.',
    gen() {
      const keys = Object.keys(SYM), k = pick(keys);
      const { opts, ans } = makeOpts(SYM_NAMES[k], keys.filter(x => x !== k).map(x => SYM_NAMES[x]));
      return { visual: `<div class="sym-show">${SYM[k]}</div>`, q: '¿Qué componente representa este símbolo?', opts, ans };
    }
  }
};
VIEWS.lab = app => {
  app.innerHTML = `<div class="section-head center"><span class="pill">🧪 Laboratorio</span><h1 class="page-title">Minijuegos contrarreloj</h1>
    <p class="muted">60 segundos para acertar todo lo que puedas. Cada acierto suma XP. ¡Logra 10 puntos para desbloquear su logro!</p></div>
    <div class="lab-grid">${Object.entries(LAB_GAMES).map(([k, g], i) => `<div class="lab-card glass" style="--c:${g.color};animation-delay:${i * 80}ms">
      <div class="lab-icon">${g.icon}</div><h3>${g.name}</h3><p>${g.desc}</p>
      <div class="lab-best">🏅 Récord: <b>${state.lab[k]}</b> ${state.badges[g.badge] ? '· ✅ Logro' : ''}</div>
      <button class="btn btn-primary wide" onclick="startLab('${k}')">▶ Jugar</button></div>`).join('')}
      <div class="lab-card glass" style="--c:#ff2bd6;animation-delay:240ms"><div class="lab-icon">🧮</div><h3>Calculadora de colores</h3><p>Herramienta interactiva: elige los colores de las bandas y descubre el valor de la resistencia.</p><div class="lab-best">Modo práctica · sin tiempo</div><button class="btn btn-ghost wide" onclick="go('calc')">Abrir</button></div>
    </div>`;
};
let lab = null;
function startLab(type) { lab = { type, score: 0, wrong: 0, streak: 0, done: false }; go('labGame', type); }
VIEWS.labGame = (app, type) => {
  const G = LAB_GAMES[type]; if (!G) return go('lab');
  if (!lab || lab.type !== type) lab = { type, score: 0, wrong: 0, streak: 0, done: false };
  app.innerHTML = `<div class="quiz-wrap" style="--c:${G.color}">
    <div class="quiz-hud glass"><button class="icon-btn" onclick="go('lab')" aria-label="Salir">✕</button>
      <div class="hud-item hide-sm">${G.icon} ${G.name}</div><div class="hud-item">✅ <b id="lscore">0</b></div>
      <div class="hud-item">🔥 <b id="lstreak">0</b></div><div class="hud-item mono">⏱️ <b id="ltime">60</b></div></div>
    <div class="time-bar"><i id="ltbar"></i></div>
    <div class="question-card glass" id="lq"></div></div>`;
  const end = Date.now() + 60000;
  addTimer(setInterval(() => {
    const left = Math.max(0, (end - Date.now()) / 1000);
    const lt = $('#ltime'); if (!lt) return;
    lt.textContent = Math.ceil(left); $('#ltbar').style.width = left / 60 * 100 + '%';
    if (left <= 0) finishLab();
  }, 100));
  nextLab();
};
function nextLab() {
  if (!lab || lab.done || !$('#lq')) return;
  const q = LAB_GAMES[lab.type].gen();
  $('#lq').innerHTML = `${q.visual}<h2 class="q-text center">${q.q}</h2>${optionsHTML(q.opts, 'grid2')}`;
  const upd = () => { $('#lscore').textContent = lab.score; $('#lstreak').textContent = lab.streak; };
  bindOptions($('#lq'), q.ans,
    () => { lab.score++; lab.streak++; upd(); nextLab(); },
    () => { lab.wrong++; lab.streak = 0; upd(); beep('bad'); $('#lq').classList.remove('shake'); void $('#lq').offsetWidth; $('#lq').classList.add('shake'); addTimer(setTimeout(nextLab, 1100)); },
    true, 380);
}
function finishLab() {
  if (!lab || lab.done) return;
  lab.done = true; clearTimers();
  const G = LAB_GAMES[lab.type], prev = state.lab[lab.type], record = lab.score > prev;
  if (record) state.lab[lab.type] = lab.score;
  save();
  const xp = lab.score * 3;
  if (lab.score >= 10) unlock(G.badge);
  const acc = lab.score + lab.wrong ? Math.round(lab.score / (lab.score + lab.wrong) * 100) : 0;
  $('#app').innerHTML = `<div class="results glass" style="--c:${G.color}"><div class="res-icon">${G.icon}</div><h1>¡Tiempo!</h1><p class="muted">${G.name}</p>
    <div class="res-grid"><div><b>${lab.score}</b><span>Aciertos</span></div><div><b>${lab.wrong}</b><span>Fallos</span></div><div><b>${acc}%</b><span>Precisión</span></div><div><b class="xp-gain">+${xp}</b><span>XP ganada</span></div></div>
    ${record ? '<p class="record">🏅 ¡Nuevo récord personal!</p>' : `<p class="muted">Tu récord: ${prev}</p>`}
    <div class="res-actions"><button class="btn btn-primary" onclick="startLab('${lab.type}')">🔁 Otra vez</button><button class="btn btn-ghost" onclick="go('lab')">↩ Laboratorio</button></div></div>`;
  if (record && lab.score > 0) { confetti(100); beep('win'); }
  addXP(xp);
}

/* Calculadora de código de colores */
const MULTS = [...COLORS.slice(0, 8).map((c, i) => ({ c, v: 10 ** i, t: MULT_TXT[i] })), { c: GOLD, v: 0.1, t: '×0,1' }, { c: SILVER, v: 0.01, t: '×0,01' }];
const TOLS = [{ c: COLORS[1], t: '±1 %' }, { c: COLORS[2], t: '±2 %' }, { c: COLORS[5], t: '±0,5 %' }, { c: COLORS[6], t: '±0,25 %' }, { c: COLORS[7], t: '±0,1 %' }, { c: GOLD, t: '±5 %' }, { c: SILVER, t: '±10 %' }];
const calc = { nb: 4, d: [4, 7, 0], m: 3, tol: 5 };
VIEWS.calc = app => {
  app.innerHTML = `<button class="back" onclick="go('lab')">← Laboratorio</button>
    <div class="section-head center"><span class="pill">🧮 Herramienta</span><h1 class="page-title">Calculadora de código de colores</h1></div>
    <div class="calc glass" id="calcBox"></div>`;
  renderCalc();
};
function renderCalc() {
  const nd = calc.nb - 2, digits = calc.d.slice(0, nd), sig = +digits.join(''), val = sig * MULTS[calc.m].v;
  const bands = [...digits.map(d => COLORS[d]), MULTS[calc.m].c, TOLS[calc.tol].c];
  const row = (label, items, active, key) => `<div class="calc-row"><span class="calc-label">${label}</span><div class="swatches">${items.map((it, i) => it ? `<button class="sw ${i === active ? 'on' : ''}" data-k="${key}" data-i="${i}" style="--sw:${it.c.c}" title="${it.c.n} ${it.t}"><span>${it.t}</span></button>` : '').join('')}</div></div>`;
  $('#calcBox').innerHTML = `<div class="calc-toggle"><button class="${calc.nb === 4 ? 'on' : ''}" data-nb="4">4 bandas</button><button class="${calc.nb === 5 ? 'on' : ''}" data-nb="5">5 bandas</button></div>
    <div class="resistor-box big">${resistorSVG(bands)}</div>${bandLabels(bands)}
    <div class="calc-value">${fmtOhm(val)} <small>${TOLS[calc.tol].t}</small></div>
    ${digits.map((d, i) => row(`${i + 1}ª cifra`, COLORS.map((c, j) => (i === 0 && j === 0) ? null : { c, t: String(j) }), d, 'd' + i)).join('')}
    ${row('Multiplicador', MULTS, calc.m, 'm')}${row('Tolerancia', TOLS, calc.tol, 't')}`;
  $$('.calc-toggle button').forEach(b => b.onclick = () => { calc.nb = +b.dataset.nb; beep('click'); renderCalc(); });
  $$('.sw').forEach(b => b.onclick = () => {
    const k = b.dataset.k, i = +b.dataset.i;
    if (k === 'm') calc.m = i; else if (k === 't') calc.tol = i; else calc.d[+k.slice(1)] = i;
    beep('click'); renderCalc();
  });
}

/* ======================= ESCAPE ROOM ======================= */
let esc = null;
VIEWS.escape = app => {
  const rank = state.escapes;
  app.innerHTML = `<section class="esc-intro">
    <div class="esc-story glass">
      <div class="esc-alarm">🚨 ALERTA · SISTEMA OHM‑9000 ACTIVADO</div>
      <h1 class="page-title">El laboratorio <span class="grad">bloqueado</span></h1>
      <p>Son las 21:00 en el <b>Centro de FP EFA Oretana</b>. Te has quedado terminando una práctica en el laboratorio de electrónica cuando, de repente, un apagón activa el sistema de seguridad <b>OHM‑9000</b>. Las puertas se bloquean.</p>
      <p>Para salir debes superar los retos de las <b>5 salas</b> del laboratorio, recuperar los <b>5 fragmentos del código</b> y teclear la combinación correcta en la <b>puerta principal</b>… antes de que se agote la <b>batería de emergencia</b>. Cada error drena batería. ¡Usa las pistas con cabeza!</p>
      <div class="esc-steps"><span>🔓 5 salas</span><span>🧩 5 fragmentos</span><span>🚪 1 código final</span><span>🔋 Contrarreloj</span></div>
    </div>
    <h2 class="section-title">Elige la dificultad</h2>
    <div class="diff-grid">${Object.entries(ESCAPE_DIFFS).map(([k, d], i) => `<div class="diff-card glass diff-${k}" style="animation-delay:${i * 90}ms"><div class="diff-icon">${d.icon}</div><h3>${d.name}</h3><p>${d.desc}</p><button class="btn btn-primary wide" onclick="startEscape('${k}')">Entrar al laboratorio</button></div>`).join('')}</div>
    <div class="ranking glass"><h3>🏆 Ranking de escapistas <small class="muted">(este dispositivo)</small></h3>
      ${rank.length ? `<table><thead><tr><th>#</th><th>Jugador/a</th><th>Dificultad</th><th>Tiempo</th><th>Puntos</th></tr></thead><tbody>${rank.map((r, i) => `<tr><td>${['🥇', '🥈', '🥉'][i] || i + 1}</td><td>${r.avatar || ''} ${escHtml(r.name)}</td><td>${ESCAPE_DIFFS[r.diff].icon} ${ESCAPE_DIFFS[r.diff].name}</td><td class="mono">${fmtTime(r.time)}</td><td><b>${r.score}</b></td></tr>`).join('')}</tbody></table>` : '<p class="muted">Todavía nadie ha conseguido escapar… ¿serás el primero?</p>'}
    </div></section>`;
};
function startEscape(diff) {
  const D = ESCAPE_DIFFS[diff];
  esc = { diff, D, time: D.time, hints: D.hints, hintsUsed: 0, errors: 0, solved: {}, digits: {}, order: shuffle(ESCAPE_ROOMS.map(r => r.id)), running: true, last: Date.now(), room: null, hintText: '', hintShown: false, entry: '' };
  ESCAPE_ROOMS.forEach(r => esc.digits[r.id] = rnd(0, 9));
  go('escapeGame');
  esc.timer = setInterval(tickEscape, 250);
  toast('🚨 OHM‑9000: «Laboratorio bloqueado. Batería de emergencia activada.»', 'bad');
}
function tickEscape() {
  if (!esc || !esc.running) return;
  const now = Date.now(); esc.time -= (now - esc.last) / 1000; esc.last = now;
  if (esc.time <= 0) { esc.time = 0; updateEscHud(); loseEscape(); return; }
  updateEscHud();
}
function stopEscape() { if (esc) { clearInterval(esc.timer); esc.running = false; } }
function abandonEscape() { if (confirm('¿Abandonar el Escape Room? Perderás la partida.')) { stopEscape(); esc = null; go('escape'); } }
const allSolved = () => ESCAPE_ROOMS.every(r => esc.solved[r.id]);
function penalize() {
  if (!esc || !esc.running) return;
  esc.time -= esc.D.penalty; esc.errors++;
  flash('bad'); beep('bad'); toast(`⚡ ¡Error! −${esc.D.penalty} s de batería`, 'bad');
  if (esc.time <= 0) { esc.time = 0; updateEscHud(); loseEscape(); } else updateEscHud();
}
VIEWS.escapeGame = app => {
  if (!esc) return go('escape');
  app.innerHTML = `<div class="esc-game">
    <div class="esc-hud glass">
      <div class="bat-wrap"><span class="bat-label">🔋</span><div class="battery"><i id="batFill"></i></div><b id="escTime" class="mono">--:--</b></div>
      <div class="code-slots" id="codeSlots"></div>
      <div class="hud-right"><span class="hud-item">💡 <b id="escHints">${esc.hints}</b></span><span class="hud-item hide-sm">${esc.D.icon} ${esc.D.name}</span><button class="btn btn-ghost sm" onclick="abandonEscape()">Abandonar</button></div>
    </div>
    <p class="esc-tip muted">Pulsa sobre una sala para enfrentarte a su reto. Puedes resolverlas en el orden que quieras.</p>
    <div class="esc-map" id="escMap"></div>
    <div id="roomLayer"></div></div>`;
  renderEscMap(); updateEscHud();
};
function renderEscMap() {
  const n = Object.keys(esc.solved).length;
  $('#escMap').innerHTML = ESCAPE_ROOMS.map((r, i) => {
    const c = getComp(r.id), done = esc.solved[r.id];
    return `<button class="room-card ${done ? 'done' : ''}" style="--c:${c.color};grid-area:${r.area}" onclick="openRoom('${r.id}')">
      <span class="room-num">Sala ${i + 1}</span><div class="room-sym">${SYM[c.sym]}</div><h3>${r.name}</h3><small>${c.name}</small>
      <span class="room-state">${done ? `✅ Fragmento <b>${esc.digits[r.id]}</b>` : '🔒 Bloqueada'}</span></button>`;
  }).join('') + `<button class="door-card ${n === 5 ? 'ready' : ''}" style="grid-area:door" onclick="openDoor()">
      <div class="door-icon">🚪</div><h3>Puerta principal</h3><div class="door-leds">${ESCAPE_ROOMS.map(r => `<i class="${esc.solved[r.id] ? 'on' : ''}"></i>`).join('')}</div>
      <small>${n === 5 ? '¡Introduce el código!' : `Fragmentos: ${n}/5`}</small></button>`;
}
function updateEscHud() {
  if (!esc || !$('#escTime')) return;
  const pct = esc.time / esc.D.time * 100;
  $('#escTime').textContent = fmtTime(esc.time);
  const bf = $('#batFill'); bf.style.width = pct + '%'; bf.className = pct < 20 ? 'low' : pct < 50 ? 'mid' : '';
  $('#escHints').textContent = esc.hints;
  $('#codeSlots').innerHTML = ESCAPE_ROOMS.map(r => { const c = getComp(r.id), d = esc.solved[r.id]; return `<span class="slot ${d ? 'on' : ''}" style="--c:${c.color}" title="${r.name}">${SYM[c.sym]}<b>${d ? esc.digits[r.id] : '?'}</b></span>`; }).join('');
}
function openRoom(id) {
  if (!esc) return;
  if (esc.solved[id]) { toast('✅ Ya has superado esta sala.'); return; }
  beep('click');
  const r = ESCAPE_ROOMS.find(x => x.id === id), c = getComp(id), idx = ESCAPE_ROOMS.indexOf(r);
  esc.room = id; esc.hintText = ''; esc.hintShown = false;
  $('#roomLayer').innerHTML = `<div class="overlay"><div class="room-panel glass" style="--c:${c.color}">
    <button class="close-btn" onclick="closeRoom()" aria-label="Cerrar">✕</button>
    <div class="room-head"><div class="room-sym big">${SYM[c.sym]}</div><div><span class="pill">Sala ${idx + 1} · ${c.name}</span><h2>${r.name}</h2></div></div>
    <p class="room-story">${r.story}</p>
    <div id="puzzle" class="puzzle"></div>
    <div class="room-foot" id="roomFoot"><button class="btn btn-ghost sm" id="hintBtn" onclick="useHint()">💡 Usar pista (${esc.hints} disponibles)</button><div id="hintBox"></div></div>
  </div></div>`;
  const api = { solve: () => roomSolved(id), fail: penalize, hint: t => { esc.hintText = t; } };
  PUZZLES[id]($('#puzzle'), esc.diff, api);
}
function closeRoom() { if ($('#roomLayer')) $('#roomLayer').innerHTML = ''; if (esc) esc.room = null; }
function useHint() {
  if (!esc || esc.hintShown) return;
  if (esc.hints <= 0) { toast('😬 No te quedan pistas.', 'bad'); beep('bad'); return; }
  esc.hints--; esc.hintsUsed++; esc.hintShown = true;
  $('#hintBox').innerHTML = `<div class="hint">💡 ${esc.hintText}</div>`;
  $('#hintBtn').disabled = true; beep('click'); updateEscHud();
}
function roomSolved(id) {
  if (!esc || !esc.running) return;
  esc.solved[id] = true;
  beep('win'); confetti(70);
  $('#puzzle').innerHTML = `<div class="fragment-reveal"><p>🔓 ¡Sala superada! Has obtenido un fragmento del código:</p>
    <div class="fragment" style="--c:${getComp(id).color}">${SYM[getComp(id).sym]}<b>${esc.digits[id]}</b></div>
    <p class="muted">Memoriza a qué componente corresponde: lo necesitarás en la puerta principal.</p>
    <button class="btn btn-primary" onclick="closeRoom()">Volver al plano</button></div>`;
  $('#roomFoot')?.remove();
  renderEscMap(); updateEscHud();
  if (allSolved()) toast('🚪 ¡Tienes los 5 fragmentos! Ve a la puerta principal.', 'level');
}
function openDoor() {
  if (!esc) return;
  if (!allSolved()) { toast(`🔒 Necesitas los 5 fragmentos (${Object.keys(esc.solved).length}/5).`, 'bad'); beep('bad'); return; }
  esc.entry = ''; beep('click');
  $('#roomLayer').innerHTML = `<div class="overlay"><div class="room-panel glass door-panel" style="--c:#ffd54a">
    <button class="close-btn" onclick="closeRoom()" aria-label="Cerrar">✕</button>
    <div class="room-head"><div class="room-sym big door-emoji">🚪</div><div><span class="pill">Reto final</span><h2>Puerta principal</h2></div></div>
    <p class="room-story">La pantalla de la puerta muestra una secuencia de componentes. Introduce tus fragmentos de código <b>en ese mismo orden</b>.</p>
    <div class="seq">${esc.order.map((id, i) => { const c = getComp(id); return `<div class="seq-item" style="--c:${c.color}"><span>${i + 1}</span>${SYM[c.sym]}</div>`; }).join('')}</div>
    <div class="inventory"><span class="muted">Tus fragmentos:</span>${ESCAPE_ROOMS.map(r => { const c = getComp(r.id); return `<span class="inv" style="--c:${c.color}">${SYM[c.sym]}<b>${esc.digits[r.id]}</b></span>`; }).join('')}</div>
    <div class="code-display" id="codeDisplay"></div>
    <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✔'].map(k => `<button class="key ${k === '✔' ? 'ok' : k === '⌫' ? 'del' : ''}" data-k="${k}">${k}</button>`).join('')}</div>
  </div></div>`;
  renderCode();
  $$('.key').forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    if (k === '⌫') esc.entry = esc.entry.slice(0, -1);
    else if (k === '✔') return checkDoor();
    else if (esc.entry.length < 5) esc.entry += k;
    beep('click'); renderCode();
  });
}
function renderCode() { $('#codeDisplay').innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="${esc.entry[i] !== undefined ? 'f' : ''}">${esc.entry[i] ?? '_'}</span>`).join(''); }
function checkDoor() {
  const code = esc.order.map(id => esc.digits[id]).join('');
  if (esc.entry.length < 5) { toast('Introduce los 5 dígitos.'); return; }
  if (esc.entry === code) { $('#codeDisplay').classList.add('good'); beep('ok'); setTimeout(winEscape, 700); }
  else { esc.entry = ''; renderCode(); const d = $('#codeDisplay'); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); penalize(); }
}
function winEscape() {
  if (!esc) return;
  stopEscape();
  const used = esc.D.time - esc.time;
  const score = Math.max(100, Math.round(esc.D.base + esc.time * esc.D.mult - esc.hintsUsed * 100 - esc.errors * 50));
  const xp = Math.round(score / 10);
  state.escapes.push({ name: state.name || 'Anónimo', avatar: state.avatar, diff: esc.diff, score, time: Math.round(used), date: Date.now() });
  state.escapes.sort((a, b) => b.score - a.score); state.escapes = state.escapes.slice(0, 10); save();
  const pos = state.escapes.findIndex(e => e.score === score && Math.abs(e.time - Math.round(used)) < 1) + 1;
  const e = esc; esc = null;
  unlock('escapista'); if (e.diff === 'experto') unlock('houdini'); if (e.hintsUsed === 0) unlock('sinpistas'); if (used < 300) unlock('veloz');
  $('#app').innerHTML = `<div class="results glass escape-win" style="--c:#31f59b">
    <div class="res-icon door-open">🚪✨</div><h1>¡Has escapado del laboratorio!</h1>
    <p class="muted">OHM‑9000: «Acceso concedido. Enhorabuena, técnico/a de EFA Oretana.»</p>
    <div class="res-grid"><div><b class="mono">${fmtTime(used)}</b><span>Tiempo</span></div><div><b>${e.errors}</b><span>Errores</span></div><div><b>${e.hintsUsed}</b><span>Pistas</span></div><div><b>${score}</b><span>Puntos</span></div></div>
    <p class="record">${pos > 0 ? `🏆 Posición ${pos} en el ranking · ` : ''}<span class="xp-gain">+${xp} XP</span></p>
    <div class="res-actions"><button class="btn btn-primary" onclick="go('escape')">🏆 Ver ranking</button><button class="btn btn-ghost" onclick="go('home')">🏠 Inicio</button></div></div>`;
  beep('level'); confetti(220); setTimeout(() => confetti(150), 900);
  addXP(xp);
}
function loseEscape() {
  if (!esc) return;
  stopEscape();
  const n = Object.keys(esc.solved).length, diff = esc.diff; esc = null;
  $('#app').innerHTML = `<div class="results glass escape-lose" style="--c:#ff4d6d"><div class="res-icon">🪫</div><h1>Batería agotada</h1>
    <p class="muted">OHM‑9000: «Laboratorio sellado hasta mañana a las 8:00»… ¡Pero no te rindas!</p>
    <div class="res-grid"><div><b>${n}/5</b><span>Salas superadas</span></div><div><b class="xp-gain">+${n * 10}</b><span>XP de consolación</span></div></div>
    <div class="res-actions"><button class="btn btn-primary" onclick="startEscape('${diff}')">🔁 Reintentar</button><button class="btn btn-ghost" onclick="go('escape')">Cambiar dificultad</button><button class="btn btn-ghost" onclick="go('home')">📘 Repasar teoría</button></div></div>`;
  beep('bad'); flash('bad');
  addXP(n * 10);
}

/* --------- Retos de cada sala --------- */
const PUZZLES = {
  resistencias(el, diff, api) {
    api.hint(diff === 'experto'
      ? 'Con 5 bandas: las 3 primeras son cifras, la 4ª es el multiplicador (nº de ceros) y la 5ª la tolerancia.'
      : 'Las dos primeras bandas son cifras y la tercera indica cuántos ceros añadir. Negro 0 · Marrón 1 · Rojo 2 · Naranja 3 · Amarillo 4 · Verde 5 · Azul 6 · Violeta 7 · Gris 8 · Blanco 9.');
    const gen = () => {
      if (!esc || !esc.running) return;
      const r = randomResistor(diff === 'experto' ? 5 : 4, diff === 'facil');
      const { opts, ans } = makeOpts(fmtOhm(r.value), resistorDistractors(r));
      el.innerHTML = `<p class="room-q">¿Cuál es el valor de esta resistencia${diff === 'experto' ? ' de 5 bandas' : ''}?</p>
        <div class="resistor-box">${resistorSVG(r.bands)}</div>${diff === 'facil' ? bandLabels(r.bands) : ''}
        ${diff === 'facil' ? `<details class="legend"><summary>🎨 Ver tabla de colores</summary>${COLOR_TABLE}</details>` : ''}
        ${optionsHTML(opts, 'grid2')}`;
      bindOptions(el, ans, api.solve, () => { api.fail(); setTimeout(gen, 1000); });
    };
    gen();
  },

  condensadores(el, diff, api) {
    api.hint({
      facil: 'Código de 3 cifras: las dos primeras son el valor y la tercera el número de ceros. El resultado está en picofaradios (pF). 1 nF = 1.000 pF y 1 µF = 1.000 nF.',
      normal: 'Los condensadores se asocian AL REVÉS que las resistencias: en PARALELO se suman; en SERIE, Ct = (C1·C2)/(C1+C2).',
      experto: 'τ = R · C. Con R en kΩ y C en µF, el resultado sale en milisegundos (1 kΩ · 1 µF = 1 ms). La carga completa se alcanza en 5τ.'
    }[diff]);
    const gen = () => {
      if (!esc || !esc.running) return;
      let visual, q, correct, cands;
      if (diff === 'facil') {
        const d1 = rnd(1, 9), d2 = rnd(0, 9), m = rnd(0, 5), code = `${d1}${d2}${m}`, pF = (d1 * 10 + d2) * 10 ** m;
        visual = ceramicSVG(code); q = `Este condensador cerámico está marcado con el código <b>${code}</b>. ¿Cuál es su capacidad?`;
        correct = fmtCap(pF); cands = [fmtCap(pF * 10), fmtCap(pF / 10), `${code} pF`, fmtCap(pF * 1000), fmtCap(pF * 100)];
      } else if (diff === 'normal') {
        const series = Math.random() < .5;
        if (series) {
          const [a, b, r] = pick([[6, 3, 2], [12, 6, 4], [10, 10, 5], [20, 30, 12], [10, 40, 8], [60, 30, 20], [22, 22, 11], [100, 100, 50], [47, 47, 23.5]]);
          visual = capComboSVG(`${fmt(a)} µF`, `${fmt(b)} µF`, true); correct = `${fmt(r)} µF`;
          cands = [a + b, Math.abs(a - b) || a * 2, a * b, (a + b) / 2].map(v => `${fmt(v)} µF`);
        } else {
          const V = [1, 2.2, 4.7, 10, 22, 47, 100], a = pick(V), b = pick(V);
          visual = capComboSVG(`${fmt(a)} µF`, `${fmt(b)} µF`, false); correct = `${fmt(a + b)} µF`;
          cands = [a * b / (a + b), Math.abs(a - b) || a / 2, a * b, (a + b) * 2].map(v => `${fmt(v)} µF`);
        }
        q = `¿Cuál es la capacidad equivalente entre los puntos <b>A</b> y <b>B</b>?`;
      } else {
        const R = pick([1, 2, 5, 10, 20]), C = pick([100, 220, 470, 1000]), tau = R * C / 1000;
        visual = rcSVG(R, C);
        q = `Al cerrar el circuito, el condensador de <b>${C} µF</b> se carga a través de la resistencia de <b>${R} kΩ</b>. ¿Cuánto tarda, aproximadamente, en cargarse por completo?`;
        correct = `${fmt(5 * tau, 3)} s`; cands = [tau, 10 * tau, 50 * tau, tau / 2, 0.5 * tau * 5 / 10].map(v => `${fmt(v, 3)} s`);
      }
      const { opts, ans } = makeOpts(correct, cands);
      el.innerHTML = `<div class="circ-box">${visual}</div><p class="room-q">${q}</p>${optionsHTML(opts, 'grid2')}`;
      bindOptions(el, ans, api.solve, () => { api.fail(); setTimeout(gen, 1000); });
    };
    gen();
  },

  inductores(el, diff, api) {
    const n = { facil: 3, normal: 4, experto: 5 }[diff];
    api.hint('La bobina almacena energía MAGNÉTICA, se mide en HENRIOS, se opone a los CAMBIOS de corriente, su reactancia AUMENTA con la frecuencia y en continua estable es como un cable. Se asocia igual que las resistencias.');
    const nt = rnd(1, n - 1);
    const items = shuffle([
      ...shuffle(INDUCTOR_STATEMENTS.verdaderas).slice(0, nt).map(t => ({ t, v: true })),
      ...shuffle(INDUCTOR_STATEMENTS.falsas).slice(0, n - nt).map(t => ({ t, v: false }))
    ]);
    const st = items.map(() => false);
    el.innerHTML = `<div class="switches">${items.map((it, i) => `<div class="switch-row"><p>${it.t}</p>
        <button class="switch" data-i="${i}" aria-pressed="false" aria-label="Interruptor ${i + 1}"><span class="knob"></span><em class="on">ON</em><em class="off">OFF</em></button></div>`).join('')}</div>
      <div class="reactor" id="reactor"><div class="ring r1"></div><div class="ring r2"></div><div class="core"></div></div>
      <button class="btn btn-primary wide" id="react">⚡ Activar reactor</button><p class="small center muted" id="rmsg">ON = verdadera · OFF = falsa</p>`;
    $$('.switch', el).forEach(b => b.onclick = () => { const i = +b.dataset.i; st[i] = !st[i]; b.classList.toggle('on', st[i]); b.setAttribute('aria-pressed', st[i]); beep('click'); });
    $('#react', el).onclick = () => {
      const good = items.filter((it, i) => it.v === st[i]).length;
      if (good === n) { $('#reactor', el).classList.add('stable'); $('#react', el).disabled = true; $('#rmsg', el).textContent = '✅ Reactor estabilizado'; beep('ok'); setTimeout(api.solve, 1300); }
      else { $('#reactor', el).classList.remove('shake'); void el.offsetWidth; $('#reactor', el).classList.add('shake'); $('#rmsg', el).textContent = diff === 'experto' ? '❌ El reactor no responde… revisa los interruptores.' : `❌ Solo ${good} de ${n} interruptores son correctos.`; api.fail(); }
    };
  },

  diodos(el, diff, api) {
    api.hint('La corriente sale del + (arriba) y va al − (abajo). Un diodo o LED solo conduce si su triángulo apunta hacia abajo (ánodo arriba, raya del cátodo abajo). Si hay dos en serie, ambos deben estar en directa.');
    const n = diff === 'facil' ? 3 : 4, dbl = diff === 'experto';
    const LEDC = ['#ff3b5c', '#3bff8a', '#3bb8ff', '#ffd23b', '#ff8a3b'];
    const gen = () => {
      if (!esc || !esc.running) return;
      let br, lit;
      do {
        br = Array.from({ length: n }, (_, i) => ({ els: [{ led: true, down: Math.random() < .5, color: LEDC[i] }, ...(dbl ? [{ led: false, down: Math.random() < .55 }] : [])] }));
        lit = br.map(b => b.els.every(e => e.down));
      } while (lit.every(x => x) || lit.every(x => !x));
      const sel = new Set();
      el.innerHTML = `<p class="room-q">Toca las ramas cuyos LED se <b>encenderán</b> al cerrar el circuito y pulsa <b>Comprobar</b>.${dbl ? ' Algunas ramas tienen un diodo rectificador en serie.' : ''}</p>
        <div class="circ-box" id="circ"></div><button class="btn btn-primary wide" id="chk">🔦 Comprobar</button>`;
      const draw = showLit => {
        $('#circ', el).innerHTML = ledCircuitSVG(br, sel, showLit ? lit : null);
        if (!showLit) $$('.branch', el).forEach(g => g.onclick = () => { const i = +g.dataset.i; sel.has(i) ? sel.delete(i) : sel.add(i); beep('click'); draw(false); });
      };
      draw(false);
      $('#chk', el).onclick = () => {
        const ok = lit.every((v, i) => v === sel.has(i));
        if (ok) { sel.clear(); draw(true); $('#chk', el).disabled = true; beep('ok'); setTimeout(api.solve, 1500); }
        else { $('#circ', el).classList.add('shake'); api.fail(); setTimeout(gen, 1000); }
      };
    };
    gen();
  },

  transistores(el, diff, api) {
    let p;
    if (diff === 'facil') {
      const beta = pick([50, 100, 150, 200]), ib = pick([0.1, 0.2, 0.5]);
      p = { L: { beta: `β = ${beta}`, ib: `Ib = ${fmt(ib)} mA`, ic: 'Ic = ?', vin: 'Vin', rb: 'Rb' }, q: 'El transistor trabaja en zona activa. Calcula la corriente de colector <b>Ic</b> que circula por el ventilador.', ans: beta * ib, unit: 'mA', hint: 'En la zona activa: Ic = β · Ib.' };
    } else if (diff === 'normal') {
      const beta = pick([50, 100, 200]), ic = pick([10, 20, 40, 50, 100]);
      p = { L: { beta: `β = ${beta}`, ic: `Ic = ${ic} mA`, ib: 'Ib = ?', vin: 'Vin', rb: 'Rb' }, q: 'El ventilador necesita la corriente Ic indicada. Calcula la corriente de base <b>Ib</b> necesaria, en <b>microamperios</b>.', ans: ic * 1000 / beta, unit: 'µA', hint: 'Ib = Ic / β. Recuerda: 1 mA = 1.000 µA.' };
    } else {
      const vin = pick([5, 12]), ic = pick([50, 100, 200]), beta = pick([100, 200]), ib = ic / beta;
      p = { L: { beta: `β = ${beta}`, ic: `Ic = ${ic} mA`, ib: 'Ib', vin: `Vin = ${vin} V`, rb: 'Rb = ?', vbe: 'VBE = 0,7 V' }, q: 'Diseña el circuito: calcula la resistencia de base <b>Rb</b> (en <b>kΩ</b>) para que circule la corriente Ic indicada.', ans: (vin - 0.7) / ib, unit: 'kΩ', hint: 'Primero Ib = Ic / β. Después Rb = (Vin − 0,7 V) / Ib. Si Ib está en mA, el resultado sale en kΩ.' };
    }
    api.hint(p.hint);
    el.innerHTML = `<div class="circ-box">${transistorSVG(p.L)}</div><p class="room-q">${p.q}</p>
      <div class="num-input"><input id="tans" class="input" type="text" inputmode="decimal" placeholder="Tu respuesta" autocomplete="off"><span class="unit">${p.unit}</span><button class="btn btn-primary" id="tgo">Enviar</button></div>
      <p class="small center muted">Puedes usar coma o punto decimal. Se admite un pequeño margen de redondeo.</p>`;
    const check = () => {
      const inp = $('#tans', el), v = parseFloat(inp.value.replace(',', '.'));
      if (isNaN(v)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); return; }
      if (Math.abs(v - p.ans) <= Math.max(0.03 * p.ans, 0.01)) { inp.classList.add('good'); inp.disabled = true; beep('ok'); $('.trans-svg', el)?.classList.add('running'); setTimeout(api.solve, 1100); }
      else { inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); inp.select(); api.fail(); }
    };
    $('#tgo', el).onclick = check;
    $('#tans', el).onkeydown = e => { if (e.key === 'Enter') check(); };
    setTimeout(() => $('#tans', el)?.focus(), 200);
  }
};

/* ======================= LOGROS Y PERFIL ======================= */
VIEWS.badges = app => {
  const r = rankInfo(state.xp), got = Object.keys(state.badges).length;
  const acc = state.stats.answered ? Math.round(state.stats.correct / state.stats.answered * 100) : 0;
  app.innerHTML = `<div class="section-head center"><span class="pill">🏆 Logros</span><h1 class="page-title">Sala de trofeos</h1><p class="muted">${got} de ${BADGES.length} logros desbloqueados</p>
    <div class="xp-bar wide-bar"><i style="width:${got / BADGES.length * 100}%"></i></div></div>
    <div class="badge-grid">${BADGES.map((b, i) => { const on = state.badges[b.id]; return `<div class="badge glass ${on ? 'on' : ''}" style="animation-delay:${i * 35}ms"><div class="badge-icon">${on ? b.icon : '🔒'}</div><h4>${b.name}</h4><p>${b.desc}</p>${on ? `<small>${new Date(on).toLocaleDateString('es-ES')}</small>` : ''}</div>`; }).join('')}</div>
    <h2 class="section-title">🎖️ Rangos</h2>
    <div class="ranks">${RANKS.map((k, i) => `<div class="rank-item ${i <= r.i ? 'on' : ''} ${i === r.i ? 'cur' : ''}"><span>${k.icon}</span><b>${k.name}</b><small>${k.xp} XP</small></div>`).join('')}</div>
    <h2 class="section-title">📊 Estadísticas</h2>
    <div class="stats-grid">
      <div class="glass"><b>${state.xp}</b><span>XP total</span></div><div class="glass"><b>${state.stats.answered}</b><span>Preguntas respondidas</span></div>
      <div class="glass"><b>${acc}%</b><span>Precisión</span></div><div class="glass"><b>${state.stats.bestStreak}</b><span>Mejor racha</span></div>
      <div class="glass"><b>${state.escapes.length ? Math.max(...state.escapes.map(e => e.score)) : 0}</b><span>Mejor Escape Room</span></div>
      <div class="glass"><b>${COMPONENTS.reduce((s, c) => s + compStars(c.id), 0)}/45</b><span>Estrellas</span></div>
    </div>
    <div class="center danger-zone"><button class="btn btn-ghost sm" onclick="resetAll()">🗑️ Reiniciar todo el progreso</button></div>`;
};
function resetAll() {
  if (!confirm('¿Seguro que quieres borrar todo tu progreso, logros y ranking? Esta acción no se puede deshacer.')) return;
  state = defaultState(); save(); updateChip(); go('home'); openProfile(true);
}

/* ======================= INICIO DE LA APP ======================= */
document.addEventListener('keydown', e => {
  if (current.view === 'quiz' && quiz && !quiz.answered && /^[1-4a-dA-D]$/.test(e.key)) {
    const i = /\d/.test(e.key) ? +e.key - 1 : 'abcd'.indexOf(e.key.toLowerCase());
    if (quiz.qs[quiz.i].opts[i]) answerQuiz(i);
  } else if (current.view === 'quiz' && quiz && quiz.answered && e.key === 'Enter' && $('#nextQ') && document.activeElement !== $('#nextQ')) {
    nextQuestion();
  }
});
initBackground();
updateChip();
go('home');
if (!state.name) openProfile(true);
