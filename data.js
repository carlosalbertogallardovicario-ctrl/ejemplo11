/* =========================================================
   ElectroQuest SMR · Contenidos didácticos
   Profesor creador: Carlos Gallardo · Centro de FP EFA Oretana
   ========================================================= */
'use strict';

const APP_INFO = {
  name: 'ElectroQuest SMR',
  teacher: 'Carlos Gallardo',
  school: 'Centro de FP EFA Oretana',
  course: '1º CFGM Sistemas Microinformáticos y Redes'
};

/* ---------- Código de colores ---------- */
const COLORS = [
  { n: 'Negro', c: '#1a1a1a' }, { n: 'Marrón', c: '#8B4513' }, { n: 'Rojo', c: '#e53935' },
  { n: 'Naranja', c: '#fb8c00' }, { n: 'Amarillo', c: '#fdd835' }, { n: 'Verde', c: '#43a047' },
  { n: 'Azul', c: '#1e88e5' }, { n: 'Violeta', c: '#8e24aa' }, { n: 'Gris', c: '#9e9e9e' },
  { n: 'Blanco', c: '#f5f5f5' }
];
const GOLD = { n: 'Oro', c: '#d4af37' };
const SILVER = { n: 'Plata', c: '#c0c0c0' };
const MULT_TXT = ['×1', '×10', '×100', '×1 k', '×10 k', '×100 k', '×1 M', '×10 M', '—', '—'];

const COLOR_TABLE = `<div class="cc-table">${COLORS.map((x, i) =>
  `<div class="cc-row"><span class="cc-sw" style="background:${x.c}"></span><span>${x.n}</span><b>${i}</b><small>${MULT_TXT[i]}</small></div>`).join('')}
  <div class="cc-row"><span class="cc-sw" style="background:${GOLD.c}"></span><span>Oro</span><b>±5 %</b><small>×0,1</small></div>
  <div class="cc-row"><span class="cc-sw" style="background:${SILVER.c}"></span><span>Plata</span><b>±10 %</b><small>×0,01</small></div></div>`;

/* ---------- Símbolos electrónicos (SVG) ---------- */
const RES_BODY = '<path d="M0 30H25M75 30H100"/><rect x="25" y="20" width="50" height="20" rx="2"/>';
const DIODE_BODY = '<polygon class="fill" points="38,14 38,46 62,30"/>';
const SYM = {
  resistencia: `<svg viewBox="0 0 100 60" class="sym">${RES_BODY}</svg>`,
  potenciometro: `<svg viewBox="0 0 100 60" class="sym">${RES_BODY}<path d="M30 52L70 8"/><polygon class="fill" points="70,8 67.6,16.6 61.6,11.2"/></svg>`,
  ldr: `<svg viewBox="0 0 100 60" class="sym">${RES_BODY}<path d="M10 2L24 14M24 2L38 14"/><polygon class="fill" points="24,14 17.1,12.8 21.7,7.4"/><polygon class="fill" points="38,14 31.1,12.8 35.7,7.4"/></svg>`,
  condensador: '<svg viewBox="0 0 100 60" class="sym"><path d="M0 30H45M55 30H100M45 10V50M55 10V50"/></svg>',
  electrolitico: '<svg viewBox="0 0 100 60" class="sym"><path d="M0 30H45M56 30H100M45 10V50"/><path d="M61 10Q52 30 61 50"/><path d="M30 12h9M34.5 7.5v9"/></svg>',
  bobina: '<svg viewBox="0 0 100 60" class="sym"><path d="M0 34H20a7.5 7.5 0 0 1 15 0a7.5 7.5 0 0 1 15 0a7.5 7.5 0 0 1 15 0a7.5 7.5 0 0 1 15 0H100"/></svg>',
  diodo: `<svg viewBox="0 0 100 60" class="sym"><path d="M0 30H100M62 14V46"/>${DIODE_BODY}</svg>`,
  led: `<svg viewBox="0 0 100 60" class="sym"><path d="M0 30H100M62 14V46"/>${DIODE_BODY}<path d="M52 12L64 2M62 16L74 6"/><polygon class="fill" points="64,2 61.6,8.5 57.2,3.1"/><polygon class="fill" points="74,6 71.6,12.5 67.2,7.1"/></svg>`,
  zener: `<svg viewBox="0 0 100 60" class="sym"><path d="M0 30H38M62 30H100M56 10L62 14V46L68 50"/>${DIODE_BODY}</svg>`,
  npn: '<svg viewBox="0 0 100 100" class="sym"><circle cx="55" cy="50" r="32"/><path d="M5 50H42M42 28V72M42 40L70 22V0M42 60L70 78V100"/><polygon class="fill" points="70,78 58.9,76.8 64.3,68.4"/></svg>',
  pnp: '<svg viewBox="0 0 100 100" class="sym"><circle cx="55" cy="50" r="32"/><path d="M5 50H42M42 28V72M42 40L70 22V0M42 60L70 78V100"/><polygon class="fill" points="49,64.5 54.7,74.1 60.1,65.7"/></svg>'
};
const SYM_NAMES = {
  resistencia: 'Resistencia fija', potenciometro: 'Potenciómetro', ldr: 'LDR (fotorresistencia)',
  condensador: 'Condensador no polarizado', electrolitico: 'Condensador electrolítico',
  bobina: 'Bobina (inductor)', diodo: 'Diodo rectificador', led: 'Diodo LED', zener: 'Diodo Zener',
  npn: 'Transistor NPN', pnp: 'Transistor PNP'
};

/* ---------- Componentes: teoría + preguntas ----------
   Formato de pregunta: [enunciado, [correcta, distractor1, distractor2, distractor3], explicación]
   (la respuesta correcta siempre va primero; se barajan al jugar)                         */
const COMPONENTS = [
  /* ===================== RESISTENCIAS ===================== */
  {
    id: 'resistencias', name: 'Resistencias', color: '#ffb020', sym: 'resistencia',
    tagline: 'Controlan y limitan el paso de la corriente',
    badge: { id: 'm_resistencias', icon: '🟧', name: 'Señor de los Ohmios' },
    theory: [
      { icon: '🔌', t: '¿Qué es una resistencia?', h: `<p>Es un componente <b>pasivo</b> que se <b>opone al paso de la corriente eléctrica</b>, transformando parte de la energía en calor (efecto Joule).</p>
        <ul><li>Magnitud: resistencia (<b>R</b>)</li><li>Unidad: <b>ohmio (Ω)</b> · kΩ = 1.000 Ω · MΩ = 1.000.000 Ω</li><li><b>No tiene polaridad</b>: se puede conectar en cualquier sentido.</li><li>Se mide con el <b>polímetro (óhmetro)</b> y siempre <b>sin tensión</b>.</li></ul>` },
      { icon: '⚖️', t: 'Ley de Ohm', h: `<div class="formula">V = I · R</div>
        <p>La tensión (<b>V</b>, voltios) es igual a la intensidad (<b>I</b>, amperios) por la resistencia (<b>R</b>, ohmios).</p>
        <div class="formula small">I = V / R &nbsp;·&nbsp; R = V / I</div>
        <div class="tip">💡 Truco: dibuja el triángulo con V arriba e I·R abajo. Tapa la magnitud que buscas y verás la fórmula.</div>` },
      { icon: '🎨', t: 'Código de colores', h: `<p><b>4 bandas:</b> 1ª y 2ª = cifras · 3ª = multiplicador (nº de ceros) · 4ª = tolerancia.</p>
        <p><b>5 bandas:</b> 3 cifras + multiplicador + tolerancia (más precisas).</p>${COLOR_TABLE}
        <div class="tip">Ejemplo: <b>Marrón · Negro · Rojo · Oro</b> → 1 0 + 00 = <b>1.000 Ω = 1 kΩ ±5 %</b></div>` },
      { icon: '🔗', t: 'Asociación de resistencias', h: `<p><b>Serie</b> (una detrás de otra, misma corriente):</p><div class="formula">Rt = R1 + R2 + R3…</div>
        <p><b>Paralelo</b> (mismos extremos, misma tensión):</p><div class="formula">1/Rt = 1/R1 + 1/R2…</div>
        <ul><li>Dos iguales en paralelo: <b>R/2</b></li><li>Dos distintas: <b>(R1·R2)/(R1+R2)</b></li><li>En paralelo, Rt siempre es <b>menor</b> que la más pequeña.</li></ul>` },
      { icon: '🔥', t: 'Potencia y tipos', h: `<div class="formula">P = V · I = I² · R</div><p>Cada resistencia soporta una potencia máxima (¼ W, ½ W, 1 W…). Si se supera, se quema.</p>
        <ul><li><b>Fijas</b>: carbón, película metálica, SMD.</li><li><b>Variables</b>: potenciómetro, trimmer.</li><li><b>LDR</b>: más luz → menos resistencia.</li><li><b>NTC</b>: más temperatura → menos resistencia. <b>PTC</b>: más temperatura → más resistencia.</li><li><b>VDR</b> (varistor): depende de la tensión (protege contra sobretensiones).</li></ul>` },
      { icon: '💻', t: 'Resistencias en SMR', h: `<ul><li>Resistencias <b>limitadoras</b> para los LED del frontal de la caja.</li><li>Resistencias <b>pull‑up / pull‑down</b> en buses y placas base.</li><li><b>Termistores NTC</b> para medir la temperatura de CPU, discos y baterías.</li><li><b>Varistores</b> en regletas y SAI para proteger contra picos de tensión.</li><li>Resistencias de <b>terminación</b> en buses de comunicación.</li></ul>` }
    ],
    questions: {
      basico: [
        ['¿Cuál es la unidad de medida de la resistencia eléctrica?', ['Ohmio (Ω)', 'Faradio (F)', 'Henrio (H)', 'Voltio (V)'], 'La resistencia se mide en ohmios (Ω), en honor a Georg Simon Ohm.'],
        ['¿Qué expresa la Ley de Ohm?', ['V = I · R', 'P = V / I', 'R = V · I', 'I = V · R'], 'La tensión es igual a la intensidad por la resistencia: V = I · R.'],
        ['En el código de colores, ¿qué número representa el color ROJO?', ['2', '1', '3', '0'], 'Negro 0, Marrón 1, Rojo 2, Naranja 3, Amarillo 4…'],
        ['¿Cuál es la función principal de una resistencia?', ['Oponerse al paso de la corriente', 'Almacenar carga eléctrica', 'Amplificar señales', 'Convertir corriente alterna en continua'], 'La resistencia limita la corriente que circula por un circuito.'],
        ['¿Qué tolerancia indica una banda de color ORO?', ['±5 %', '±10 %', '±1 %', '±20 %'], 'Oro = ±5 %, Plata = ±10 %, Marrón = ±1 %, Rojo = ±2 %.'],
        ['¿Con qué aparato y en qué condiciones se mide una resistencia?', ['Polímetro en modo óhmetro, sin tensión', 'Amperímetro, con el circuito encendido', 'Osciloscopio, con el circuito encendido', 'Vatímetro conectado a la red'], 'Se mide con el óhmetro del polímetro y siempre con el circuito desconectado.']
      ],
      intermedio: [
        ['Una resistencia tiene las bandas Marrón · Negro · Rojo · Oro. ¿Cuál es su valor?', ['1 kΩ ±5 %', '100 Ω ±5 %', '10 kΩ ±5 %', '102 Ω ±10 %'], '1 y 0 son las cifras (10) y Rojo añade 2 ceros: 1.000 Ω = 1 kΩ. Oro = ±5 %.'],
        ['Dos resistencias de 100 Ω conectadas en SERIE equivalen a…', ['200 Ω', '50 Ω', '100 Ω', '10 kΩ'], 'En serie se suman: 100 + 100 = 200 Ω.'],
        ['Dos resistencias de 100 Ω conectadas en PARALELO equivalen a…', ['50 Ω', '200 Ω', '100 Ω', '25 Ω'], 'Dos resistencias iguales en paralelo equivalen a la mitad: 100/2 = 50 Ω.'],
        ['Un circuito de 12 V tiene una resistencia de 4 Ω. ¿Qué corriente circula?', ['3 A', '48 A', '0,33 A', '8 A'], 'I = V / R = 12 / 4 = 3 A.'],
        ['¿Qué resistencia varía su valor en función de la LUZ que recibe?', ['LDR', 'NTC', 'PTC', 'VDR'], 'LDR = Light Dependent Resistor. A más luz, menor resistencia.'],
        ['Bandas Amarillo · Violeta · Naranja · Oro. ¿Valor?', ['47 kΩ', '4,7 kΩ', '470 kΩ', '473 Ω'], 'Amarillo 4, Violeta 7, Naranja = 3 ceros → 47.000 Ω = 47 kΩ.']
      ],
      avanzado: [
        ['Por una resistencia de 100 Ω circulan 0,1 A. ¿Qué potencia disipa?', ['1 W', '10 W', '0,1 W', '100 W'], 'P = I² · R = 0,1² · 100 = 0,01 · 100 = 1 W.'],
        ['Tres resistencias de 30 Ω en paralelo equivalen a…', ['10 Ω', '90 Ω', '30 Ω', '15 Ω'], 'n resistencias iguales en paralelo: R/n = 30/3 = 10 Ω.'],
        ['R1 = 6 Ω y R2 = 3 Ω en paralelo. ¿Resistencia equivalente?', ['2 Ω', '9 Ω', '4,5 Ω', '18 Ω'], '(R1·R2)/(R1+R2) = 18/9 = 2 Ω.'],
        ['Resistencia de 5 bandas: Marrón · Negro · Negro · Rojo · Marrón. ¿Valor?', ['10 kΩ ±1 %', '1 kΩ ±1 %', '100 kΩ ±1 %', '10 kΩ ±2 %'], 'Cifras 1-0-0 (100) × Rojo (100) = 10.000 Ω. 5ª banda Marrón = ±1 %.'],
        ['En una NTC, al AUMENTAR la temperatura, su resistencia…', ['Disminuye', 'Aumenta', 'No cambia', 'Se vuelve infinita'], 'NTC = Coeficiente de Temperatura Negativo: más temperatura, menos resistencia.'],
        ['Divisor de tensión: 10 V aplicados a R1 = 1 kΩ y R2 = 1 kΩ en serie. ¿Tensión en R2?', ['5 V', '10 V', '2,5 V', '0 V'], 'Vout = Vin · R2/(R1+R2) = 10 · 1/2 = 5 V.']
      ]
    }
  },

  /* ===================== CONDENSADORES ===================== */
  {
    id: 'condensadores', name: 'Condensadores', color: '#00d4ff', sym: 'electrolitico',
    tagline: 'Almacenan carga eléctrica y filtran la tensión',
    badge: { id: 'm_condensadores', icon: '🔋', name: 'Guardián de la Carga' },
    theory: [
      { icon: '⚡', t: '¿Qué es un condensador?', h: `<p>Dos placas conductoras (<b>armaduras</b>) separadas por un material aislante llamado <b>dieléctrico</b>. Almacena energía en forma de <b>campo eléctrico</b> (carga).</p>
        <ul><li>Magnitud: capacidad (<b>C</b>)</li><li>Unidad: <b>faradio (F)</b>, aunque es enorme; se usan µF, nF y pF.</li><li><b>1 µF = 1.000 nF = 1.000.000 pF</b></li></ul>` },
      { icon: '🧩', t: 'Tipos de condensadores', h: `<ul><li><b>Cerámicos</b>: NO polarizados, valores pequeños (pF–nF), marcados con código de 3 cifras.</li>
        <li><b>Electrolíticos</b>: <b>POLARIZADOS</b>. Patilla larga = +, franja lateral = −. Valores grandes (µF). Indican tensión máxima.</li>
        <li><b>Tántalo</b>: polarizados, pequeños y estables.</li><li><b>Poliéster / film</b>: no polarizados, buena precisión.</li><li><b>Supercondensadores</b>: faradios de capacidad (mantienen relojes, memorias…).</li></ul>` },
      { icon: '🔢', t: 'Código de los cerámicos', h: `<p>3 cifras: las <b>dos primeras</b> son el valor y la <b>tercera</b> el número de ceros. El resultado está en <b>picofaradios (pF)</b>.</p>
        <div class="formula">104 → 10 + 0000 = 100.000 pF = 100 nF</div><div class="formula small">472 → 4.700 pF = 4,7 nF · 101 → 100 pF</div>
        <p>Letra de tolerancia: <b>J</b> ±5 % · <b>K</b> ±10 % · <b>M</b> ±20 %.</p>` },
      { icon: '⏳', t: 'Carga, descarga y comportamiento', h: `<div class="formula">τ = R · C</div><ul><li>En <b>1τ</b> se carga al ≈ <b>63 %</b>; en <b>5τ</b> se considera <b>cargado</b>.</li>
        <li>En <b>corriente continua</b>, una vez cargado se comporta como un <b>circuito abierto</b>.</li><li>En <b>corriente alterna</b> deja pasar la señal, mejor cuanto mayor sea la frecuencia: Xc = 1/(2π·f·C).</li><li>Energía almacenada: <b>E = ½ · C · V²</b></li></ul>` },
      { icon: '🔗', t: 'Asociación (¡al revés!)', h: `<p>Se asocian <b>al contrario que las resistencias</b>:</p><p><b>Paralelo</b>:</p><div class="formula">Ct = C1 + C2 + …</div><p><b>Serie</b>:</p><div class="formula">1/Ct = 1/C1 + 1/C2 + …</div><ul><li>Dos iguales en serie: <b>C/2</b>.</li></ul>` },
      { icon: '💻', t: 'Condensadores en SMR', h: `<ul><li><b>Filtran</b> la tensión en fuentes ATX y placas base.</li><li>Condensadores de <b>desacoplo</b> junto a los chips para eliminar ruido.</li><li>Placas modernas usan condensadores <b>sólidos (de polímero)</b>, más duraderos.</li><li>Avería típica: condensadores <b>hinchados o con fugas</b> → hay que sustituirlos.</li></ul>
        <div class="tip warn">⚠️ Los condensadores pueden conservar una <b>carga peligrosa</b> aunque el equipo esté desenchufado. ¡Nunca abras una fuente de alimentación!</div>` }
    ],
    questions: {
      basico: [
        ['¿Cuál es la unidad de medida de la capacidad?', ['Faradio (F)', 'Ohmio (Ω)', 'Henrio (H)', 'Amperio (A)'], 'La capacidad se mide en faradios, en honor a Michael Faraday.'],
        ['¿Qué almacena un condensador?', ['Carga eléctrica (energía en un campo eléctrico)', 'Energía en un campo magnético', 'Luz', 'Calor'], 'El condensador almacena carga eléctrica entre sus placas.'],
        ['¿Cómo se llama el material aislante situado entre las placas?', ['Dieléctrico', 'Semiconductor', 'Conductor', 'Ferrita'], 'El dieléctrico es el aislante que separa las armaduras.'],
        ['Un condensador electrolítico es…', ['Polarizado: tiene polo + y polo −', 'No polarizado', 'Un tipo de bobina', 'Un semiconductor'], 'Los electrolíticos son polarizados: conectarlos al revés puede hacerlos explotar.'],
        ['¿A cuánto equivale 1 µF?', ['1.000 nF', '100 nF', '1.000 pF', '1 mF'], '1 µF = 1.000 nF = 1.000.000 pF.'],
        ['En un electrolítico, la franja marcada en el lateral indica…', ['El terminal negativo', 'El terminal positivo', 'La tensión máxima', 'La tolerancia'], 'La franja (con signos −) señala el terminal negativo.']
      ],
      intermedio: [
        ['Un condensador cerámico está marcado con "104". ¿Cuál es su capacidad?', ['100 nF', '104 pF', '10 µF', '1 nF'], '10 + 4 ceros = 100.000 pF = 100 nF.'],
        ['Dos condensadores de 10 µF en PARALELO equivalen a…', ['20 µF', '5 µF', '10 µF', '100 µF'], 'En paralelo los condensadores se suman.'],
        ['Dos condensadores de 10 µF en SERIE equivalen a…', ['5 µF', '20 µF', '10 µF', '100 µF'], 'En serie, dos iguales equivalen a la mitad: C/2.'],
        ['En corriente continua, un condensador ya cargado se comporta como…', ['Un circuito abierto', 'Un cortocircuito', 'Una resistencia de 1 Ω', 'Un generador'], 'Una vez cargado no deja pasar la corriente continua.'],
        ['¿Por qué es peligroso abrir una fuente de alimentación recién desenchufada?', ['Sus condensadores pueden mantener carga', 'Las bobinas emiten radiación', 'Los diodos se calientan al aire', 'Los transistores almacenan tensión'], 'Los condensadores de la fuente pueden conservar tensiones peligrosas.'],
        ['Ves un condensador hinchado en una placa base. ¿Qué significa?', ['Está averiado y debe sustituirse', 'Es normal, está cargado', 'Es de mayor capacidad', 'Indica que la placa es nueva'], 'Un condensador abombado o con fugas está dañado (avería muy típica).']
      ],
      avanzado: [
        ['Constante de tiempo de un circuito con R = 10 kΩ y C = 100 µF:', ['1 s', '10 s', '0,1 s', '1.000 s'], 'τ = R·C = 10.000 · 0,0001 = 1 s.'],
        ['¿Cuánto tarda aproximadamente un condensador en cargarse por completo?', ['5τ', '1τ', '2τ', '10τ'], 'Se considera totalmente cargado tras 5 constantes de tiempo.'],
        ['Cerámico marcado "472". ¿Capacidad?', ['4,7 nF', '472 pF', '47 nF', '4,7 µF'], '47 + 2 ceros = 4.700 pF = 4,7 nF.'],
        ['Conectamos un electrolítico de 25 V en un circuito de 35 V. ¿Qué ocurre?', ['Puede dañarse o explotar', 'Funciona mejor', 'Aumenta su capacidad', 'No pasa nada'], 'Nunca se debe superar la tensión máxima indicada en el condensador.'],
        ['¿Qué fórmula da la energía almacenada en un condensador?', ['E = ½ · C · V²', 'E = C · V', 'E = ½ · L · I²', 'E = V · I · R'], 'E = ½·C·V² (la fórmula con L e I es la de la bobina).'],
        ['Tras 1τ, un condensador se ha cargado aproximadamente al…', ['63 %', '50 %', '37 %', '100 %'], 'En una constante de tiempo alcanza el 63 % de la tensión final.']
      ]
    }
  },

  /* ===================== INDUCTORES ===================== */
  {
    id: 'inductores', name: 'Inductores', color: '#a46bff', sym: 'bobina',
    tagline: 'Bobinas que almacenan energía magnética',
    badge: { id: 'm_inductores', icon: '🧲', name: 'Domador de Campos' },
    theory: [
      { icon: '🌀', t: '¿Qué es una bobina?', h: `<p>Es un hilo conductor (normalmente cobre esmaltado) <b>enrollado en espiras</b>, a veces sobre un <b>núcleo</b>. Almacena energía en forma de <b>campo magnético</b>.</p>
        <ul><li>Magnitud: inductancia (<b>L</b>)</li><li>Unidad: <b>henrio (H)</b>; se usan mH y µH.</li><li>Componente <b>pasivo</b> y sin polaridad.</li></ul>` },
      { icon: '🧲', t: 'Comportamiento', h: `<p>Se <b>opone a los cambios bruscos de corriente</b> (autoinducción · Ley de Lenz).</p>
        <ul><li>En <b>corriente continua</b> estable: se comporta como un <b>cable</b> (solo la resistencia del hilo).</li><li>En <b>corriente alterna</b>: se opone más cuanto <b>mayor es la frecuencia</b>.</li></ul><div class="formula">XL = 2π · f · L</div>
        <div class="tip">Bobina: deja pasar bajas frecuencias y frena las altas. Condensador: justo al revés.</div>` },
      { icon: '🔗', t: 'Asociación de bobinas', h: `<p>Sin acoplamiento magnético, se asocian <b>igual que las resistencias</b>:</p><p><b>Serie</b>:</p><div class="formula">Lt = L1 + L2 + …</div><p><b>Paralelo</b>:</p><div class="formula">1/Lt = 1/L1 + 1/L2 + …</div>` },
      { icon: '🧱', t: 'Núcleos y tipos', h: `<ul><li><b>Aire</b>: poca inductancia, alta frecuencia (radio).</li><li><b>Ferrita</b>: fuentes conmutadas, filtros, choques.</li><li><b>Hierro laminado</b>: transformadores de red (50 Hz).</li><li><b>Toroidales</b> y <b>SMD</b> en placas.</li></ul><p>Un núcleo de ferrita o hierro <b>aumenta mucho la inductancia</b>. Energía almacenada: <b>E = ½ · L · I²</b></p>` },
      { icon: '💻', t: 'Bobinas en SMR', h: `<ul><li><b>Transformadores</b> de fuentes ATX y cargadores (dos bobinas acopladas).</li><li><b>Chokes</b> del VRM junto al socket de la CPU: suavizan la corriente del procesador.</li><li><b>Anillos de ferrita</b> en cables de monitor o USB: filtran interferencias (EMI).</li><li>Relés, motores de ventiladores, altavoces, carga inalámbrica Qi y NFC.</li></ul>` },
      { icon: '⚠️', t: 'Precaución: picos de tensión', h: `<p>Al cortar bruscamente la corriente de una bobina (por ejemplo, un relé) aparece un <b>pico de tensión inversa</b> muy alto que puede destruir transistores.</p>
        <div class="tip">Solución: colocar un <b>diodo de protección (flyback)</b> en antiparalelo con la bobina.</div>` }
    ],
    questions: {
      basico: [
        ['¿Cuál es la unidad de medida de la inductancia?', ['Henrio (H)', 'Faradio (F)', 'Ohmio (Ω)', 'Tesla (T)'], 'La inductancia se mide en henrios, en honor a Joseph Henry.'],
        ['Un inductor está formado básicamente por…', ['Un hilo conductor enrollado', 'Dos placas separadas por un aislante', 'Una unión de semiconductores PN', 'Una barra de carbón'], 'Un inductor es una bobina: hilo conductor enrollado en espiras.'],
        ['Una bobina almacena energía en forma de…', ['Campo magnético', 'Campo eléctrico', 'Energía química', 'Energía luminosa'], 'La bobina crea un campo magnético al circular corriente por ella.'],
        ['¿Qué otro nombre recibe un inductor?', ['Bobina', 'Condensador', 'Varistor', 'Reóstato'], 'Inductor y bobina son sinónimos.'],
        ['¿Qué letra representa la inductancia en los esquemas y fórmulas?', ['L', 'I', 'C', 'H'], 'La inductancia se representa con L (H es su unidad).'],
        ['El cilindro que llevan algunos cables de monitor o USB cerca del conector es…', ['Un núcleo de ferrita que filtra interferencias', 'Una batería de respaldo', 'Un sensor de temperatura', 'Un condensador de carga'], 'Es un choque de ferrita: actúa como bobina que atenúa las interferencias de alta frecuencia.']
      ],
      intermedio: [
        ['Una bobina se opone principalmente a…', ['Los cambios bruscos de la corriente', 'El paso de la corriente continua estable', 'Los cambios de temperatura', 'La luz'], 'Por autoinducción, la bobina se opone a las variaciones de corriente.'],
        ['En corriente continua estable, una bobina ideal se comporta como…', ['Un cortocircuito (un cable)', 'Un circuito abierto', 'Un condensador', 'Un diodo'], 'Sin variaciones de corriente no hay oposición: solo queda la pequeña resistencia del hilo.'],
        ['Si aumenta la frecuencia, la reactancia inductiva (XL)…', ['Aumenta', 'Disminuye', 'No cambia', 'Se anula'], 'XL = 2π·f·L: es directamente proporcional a la frecuencia.'],
        ['Dos bobinas de 10 mH en serie (sin acoplamiento) equivalen a…', ['20 mH', '5 mH', '10 mH', '100 mH'], 'Las bobinas en serie se suman, como las resistencias.'],
        ['¿Qué componente está formado por dos bobinas acopladas magnéticamente?', ['Transformador', 'Puente de diodos', 'Potenciómetro', 'Transistor'], 'El transformador eleva o reduce tensiones alternas mediante dos bobinados.'],
        ['¿Qué núcleo aumenta MÁS la inductancia de una bobina?', ['Ferrita o hierro', 'Aire', 'Plástico', 'Madera'], 'Los materiales ferromagnéticos concentran el campo magnético.']
      ],
      avanzado: [
        ['¿Cuál es la fórmula de la reactancia inductiva?', ['XL = 2π · f · L', 'XL = 1 / (2π · f · L)', 'XL = L / f', 'XL = 2π · f · C'], 'XL = 2π·f·L (la inversa con C es la del condensador).'],
        ['Reactancia de una bobina de 0,1 H a 50 Hz (aprox.):', ['31,4 Ω', '5 Ω', '3,14 Ω', '314 Ω'], 'XL = 2 · 3,14 · 50 · 0,1 ≈ 31,4 Ω.'],
        ['Dos bobinas de 6 mH en paralelo (sin acoplamiento):', ['3 mH', '12 mH', '6 mH', '36 mH'], 'Dos iguales en paralelo equivalen a la mitad, como las resistencias.'],
        ['¿Qué ley dice que la corriente inducida se opone a la causa que la produce?', ['Ley de Lenz', 'Ley de Ohm', 'Ley de Moore', 'Ley de Kirchhoff'], 'La Ley de Lenz explica la oposición de la bobina a los cambios de corriente.'],
        ['En el VRM de una placa base, las bobinas (chokes) sirven para…', ['Filtrar y suavizar la corriente que alimenta la CPU', 'Almacenar la BIOS', 'Refrigerar el procesador', 'Amplificar el audio'], 'Junto con MOSFET y condensadores, forman la fuente conmutada que alimenta la CPU.'],
        ['¿Qué fórmula da la energía almacenada en una bobina?', ['E = ½ · L · I²', 'E = ½ · C · V²', 'E = L · V', 'E = I² · R'], 'E = ½·L·I²: depende de la inductancia y de la corriente.']
      ]
    }
  },

  /* ===================== DIODOS ===================== */
  {
    id: 'diodos', name: 'Diodos', color: '#ff4d6d', sym: 'led',
    tagline: 'La corriente en un solo sentido',
    badge: { id: 'm_diodos', icon: '💡', name: 'Maestro del Sentido Único' },
    theory: [
      { icon: '➡️', t: '¿Qué es un diodo?', h: `<p>Es un componente <b>semiconductor</b> (normalmente silicio) formado por una <b>unión PN</b>. Deja pasar la corriente <b>en un solo sentido</b>: de <b>ánodo (A, +)</b> a <b>cátodo (K, −)</b>.</p>
        <ul><li>La <b>franja</b> del encapsulado indica el <b>cátodo</b>.</li><li>En el símbolo, el triángulo apunta en el sentido de la corriente y la raya es el cátodo.</li></ul><div class="tip">Es como una válvula antirretorno para la electricidad.</div>` },
      { icon: '🔋', t: 'Polarización', h: `<p><b>Directa</b>: ánodo más positivo que el cátodo → <b>conduce</b> si se supera la tensión umbral:</p>
        <ul><li>Silicio ≈ <b>0,7 V</b> · Germanio ≈ 0,3 V · LED ≈ 1,8–3,3 V</li></ul><p><b>Inversa</b>: cátodo más positivo → <b>no conduce</b> (circuito abierto), salvo que se supere la tensión de ruptura.</p>` },
      { icon: '🧩', t: 'Tipos de diodos', h: `<ul><li><b>Rectificador</b> (1N4007): convierte alterna en continua.</li><li><b>Zener</b>: trabaja en inversa y <b>estabiliza la tensión</b>.</li><li><b>LED</b>: emite luz al conducir.</li><li><b>Schottky</b>: baja caída (0,2–0,4 V) y muy rápido.</li><li><b>Fotodiodo</b>: genera/varía corriente según la luz.</li><li><b>Puente rectificador</b>: 4 diodos en un encapsulado.</li></ul>` },
      { icon: '💡', t: 'El LED', h: `<p>Patilla <b>larga = ánodo (+)</b>; lado <b>plano</b> del encapsulado = <b>cátodo (−)</b>. Siempre necesita una <b>resistencia limitadora</b>:</p>
        <div class="formula">R = (Vcc − V<sub>LED</sub>) / I</div><div class="tip">Ejemplo: 5 V, LED rojo de 2 V a 20 mA → R = 3 / 0,02 = <b>150 Ω</b></div><p>Rojo ≈ 1,8–2 V · Verde ≈ 2,1 V · Azul/blanco ≈ 3–3,3 V</p>` },
      { icon: '〰️', t: 'Rectificación', h: `<p>Convertir corriente <b>alterna</b> en <b>continua</b>:</p><ul><li><b>Media onda</b>: 1 diodo, aprovecha solo medio ciclo.</li><li><b>Onda completa</b>: <b>puente de 4 diodos</b>, aprovecha los dos semiciclos.</li><li>Después, un <b>condensador</b> filtra y alisa la tensión.</li></ul><div class="tip">Es una de las etapas de la fuente de alimentación de cualquier PC.</div>` },
      { icon: '💻', t: 'Diodos en SMR', h: `<ul><li>LED de <b>power, HDD y red</b> en ordenadores, switches y routers.</li><li><b>Fibra óptica</b>: los emisores son LED/láser y los receptores, fotodiodos.</li><li>Protección contra <b>inversión de polaridad</b>.</li><li>Diodos <b>flyback</b> que protegen frente a picos de bobinas de relés y motores.</li><li>Puentes rectificadores en fuentes ATX.</li></ul>` }
    ],
    questions: {
      basico: [
        ['Un diodo permite el paso de la corriente…', ['En un solo sentido', 'En ambos sentidos', 'Solo en corriente alterna', 'Nunca'], 'El diodo conduce de ánodo a cátodo y bloquea en sentido contrario.'],
        ['¿Cómo se llaman los terminales de un diodo?', ['Ánodo y cátodo', 'Base y emisor', 'Fase y neutro', 'Puerta y drenador'], 'Ánodo (A, +) y cátodo (K, −).'],
        ['La franja pintada en el encapsulado de un diodo indica…', ['El cátodo', 'El ánodo', 'La tolerancia', 'La potencia'], 'La franja marca el cátodo (la raya del símbolo).'],
        ['¿Qué significan las siglas LED?', ['Light Emitting Diode', 'Low Energy Device', 'Light Electric Display', 'Linear Emitting Diode'], 'LED = Diodo Emisor de Luz.'],
        ['En un LED, la patilla más larga es…', ['El ánodo (+)', 'El cátodo (−)', 'Indiferente', 'La masa'], 'Patilla larga = ánodo; lado plano = cátodo.'],
        ['¿De qué tipo de material se fabrican los diodos?', ['Semiconductor (silicio)', 'Conductor (cobre)', 'Aislante (vidrio)', 'Magnético (ferrita)'], 'Los diodos se fabrican con semiconductores, principalmente silicio.']
      ],
      intermedio: [
        ['Tensión umbral típica de un diodo de silicio:', ['0,7 V', '0,3 V', '5 V', '12 V'], 'Silicio ≈ 0,7 V; germanio ≈ 0,3 V.'],
        ['Un diodo está polarizado en DIRECTA cuando…', ['El ánodo está a mayor tensión que el cátodo', 'El cátodo está a mayor tensión que el ánodo', 'Ambos tienen la misma tensión', 'No hay tensión aplicada'], 'En directa, el ánodo es más positivo que el cátodo.'],
        ['¿Qué diodo se usa para estabilizar una tensión trabajando en inversa?', ['Zener', 'LED', 'Fotodiodo', 'Schottky'], 'El Zener mantiene una tensión fija cuando trabaja en zona de ruptura.'],
        ['¿Cuántos diodos tiene un puente rectificador de onda completa?', ['4', '2', '1', '6'], 'El puente de Graetz tiene 4 diodos.'],
        ['¿Qué función cumplen los diodos en una fuente de alimentación?', ['Rectificar: convertir CA en CC', 'Amplificar la señal', 'Almacenar energía', 'Aumentar la frecuencia'], 'Los diodos rectificadores transforman la alterna en continua pulsante.'],
        ['¿Qué diodo destaca por su baja caída de tensión (≈0,3 V) y gran rapidez?', ['Schottky', 'Zener', 'LED', 'Rectificador 1N4007'], 'Los Schottky se usan en fuentes conmutadas por su rapidez y baja caída.']
      ],
      avanzado: [
        ['LED de 2 V y 20 mA alimentado a 5 V. ¿Resistencia limitadora?', ['150 Ω', '250 Ω', '100 Ω', '350 Ω'], 'R = (5 − 2) / 0,02 = 150 Ω.'],
        ['LED de 2 V y 10 mA alimentado a 12 V. ¿Resistencia limitadora?', ['1 kΩ', '1,2 kΩ', '100 Ω', '200 Ω'], 'R = (12 − 2) / 0,01 = 1.000 Ω = 1 kΩ.'],
        ['Diodo de silicio en directa en serie con una resistencia, todo a 5 V. ¿Tensión en la resistencia?', ['4,3 V', '5 V', '0,7 V', '5,7 V'], 'El diodo "se queda" 0,7 V: 5 − 0,7 = 4,3 V.'],
        ['Un rectificador de media onda con un solo diodo…', ['Aprovecha solo un semiciclo', 'Aprovecha los dos semiciclos', 'No deja pasar ningún semiciclo', 'Duplica la tensión'], 'Solo deja pasar los semiciclos en los que el diodo está en directa.'],
        ['Si se supera la tensión inversa máxima de un diodo rectificador…', ['Entra en ruptura y puede destruirse', 'Emite luz', 'Conduce mejor en directa', 'No pasa nada'], 'Superar la tensión de ruptura en un diodo normal suele destruirlo.'],
        ['¿Para qué sirve un diodo en antiparalelo con la bobina de un relé?', ['Proteger contra el pico de tensión al desconectar', 'Aumentar la corriente del relé', 'Encender un LED indicador', 'Rectificar la corriente del relé'], 'Es el diodo flyback: absorbe la tensión inversa que genera la bobina.']
      ]
    }
  },

  /* ===================== TRANSISTORES ===================== */
  {
    id: 'transistores', name: 'Transistores', color: '#31f59b', sym: 'npn',
    tagline: 'Amplifican y conmutan: el corazón de la informática',
    badge: { id: 'm_transistores', icon: '🧠', name: 'Rey del Silicio' },
    theory: [
      { icon: '🔬', t: '¿Qué es un transistor?', h: `<p>Componente <b>semiconductor de 3 terminales</b> que permite <b>controlar una corriente grande con otra pequeña</b>. Se inventó en 1947 en los Laboratorios Bell.</p>
        <ul><li>Funciona como <b>amplificador</b> o como <b>interruptor (conmutador)</b>.</li><li>Es la base de <b>toda la electrónica digital</b>: procesadores, memorias, SSD…</li></ul>` },
      { icon: '🔺', t: 'Transistor bipolar (BJT)', h: `<p>Tres capas de semiconductor: <b>NPN</b> o <b>PNP</b>. Terminales: <b>Base (B)</b> → control · <b>Colector (C)</b> · <b>Emisor (E)</b>.</p>
        <div class="sym-pair"><div>${SYM.npn}<span>NPN: flecha hacia fuera<br><i>"No Pincha"</i></span></div><div>${SYM.pnp}<span>PNP: flecha hacia dentro<br><i>"Pincha"</i></span></div></div>
        <div class="formula">Ic = β · Ib &nbsp;·&nbsp; Ie = Ic + Ib</div><p>β (o h<sub>FE</sub>) es la ganancia (típica 50–300). V<sub>BE</sub> ≈ 0,7 V.</p>` },
      { icon: '🎚️', t: 'Regiones de funcionamiento', h: `<ul><li><b>Corte</b>: Ib = 0, no conduce → <b>interruptor abierto</b> (0 lógico).</li><li><b>Activa</b>: Ic = β·Ib → <b>amplificador</b>.</li><li><b>Saturación</b>: conduce al máximo → <b>interruptor cerrado</b> (1 lógico).</li></ul><div class="tip">En electrónica digital los transistores trabajan entre corte y saturación: ¡así se representan los 0 y 1!</div>` },
      { icon: '🔀', t: 'Transistor como interruptor', h: `<p>Un microcontrolador (Arduino, por ejemplo) solo da unos pocos mA. Para encender un ventilador, motor o relé se usa un transistor:</p>
        <ul><li>Corriente de base necesaria: <b>Ib = Ic / β</b></li></ul><div class="formula">Rb = (Vin − 0,7) / Ib</div>` },
      { icon: '🧱', t: 'MOSFET y CMOS', h: `<p>Transistor de efecto de campo. Terminales: <b>Puerta (Gate)</b>, <b>Drenador (Drain)</b> y <b>Fuente (Source)</b>.</p>
        <ul><li>Se controla por <b>TENSIÓN</b> en la puerta (casi no consume corriente). El BJT se controla por <b>corriente</b> de base.</li><li>Canal N y canal P. Combinados forman la tecnología <b>CMOS</b> de procesadores y memorias.</li><li>Los MOSFET de potencia están en el <b>VRM</b> de la placa base.</li></ul>` },
      { icon: '💻', t: 'Transistores en SMR', h: `<ul><li>Una CPU moderna contiene <b>miles de millones</b> de transistores.</li><li><b>Ley de Moore</b>: el número de transistores de un chip se duplica aproximadamente cada 2 años.</li><li>El tamaño de fabricación se expresa en <b>nanómetros</b> (7 nm, 5 nm, 3 nm…).</li><li>Las celdas de memoria <b>flash</b> de los SSD y pendrives son transistores de puerta flotante.</li></ul>` }
    ],
    questions: {
      basico: [
        ['¿Cuáles son los terminales de un transistor bipolar (BJT)?', ['Base, colector y emisor', 'Ánodo, cátodo y puerta', 'Positivo, negativo y masa', 'Fase, neutro y tierra'], 'B, C y E. (Puerta, drenador y fuente son los del MOSFET).'],
        ['¿Cuáles son las dos funciones principales de un transistor?', ['Amplificar y conmutar', 'Almacenar carga y filtrar', 'Rectificar y estabilizar', 'Medir y calentar'], 'El transistor actúa como amplificador o como interruptor electrónico.'],
        ['¿Qué dos tipos de transistor bipolar existen?', ['NPN y PNP', 'NNP y PPN', 'Zener y LED', 'Cerámico y electrolítico'], 'Según el orden de las capas semiconductoras: NPN o PNP.'],
        ['¿De qué material se fabrican principalmente los transistores?', ['Silicio (semiconductor)', 'Cobre', 'Ferrita', 'Carbón'], 'El silicio es el semiconductor más utilizado.'],
        ['¿Cuántos transistores contiene aproximadamente una CPU moderna?', ['Miles de millones', 'Unos cien', 'Unos mil', 'Ninguno, solo resistencias'], 'Los procesadores actuales integran miles de millones de transistores.'],
        ['En un BJT, ¿qué terminal controla el funcionamiento del transistor?', ['La base', 'El colector', 'El emisor', 'El cátodo'], 'Una pequeña corriente de base controla la corriente colector-emisor.']
      ],
      intermedio: [
        ['En el símbolo de un transistor NPN, la flecha del emisor apunta…', ['Hacia fuera', 'Hacia dentro', 'Hacia la base', 'No tiene flecha'], 'NPN: "No Pincha" → flecha hacia fuera.'],
        ['Un transistor que actúa como interruptor ABIERTO está en la región de…', ['Corte', 'Saturación', 'Activa', 'Ruptura'], 'En corte no circula corriente de colector.'],
        ['Un transistor que actúa como interruptor CERRADO está en la región de…', ['Saturación', 'Corte', 'Activa', 'Inversa'], 'En saturación conduce al máximo.'],
        ['Para funcionar como AMPLIFICADOR, el transistor trabaja en la región…', ['Activa', 'De corte', 'De saturación', 'De ruptura'], 'En la región activa se cumple Ic = β·Ib.'],
        ['Si Ib = 0,1 mA y β = 100, ¿cuánto vale Ic?', ['10 mA', '1 mA', '100 mA', '0,001 mA'], 'Ic = β · Ib = 100 · 0,1 mA = 10 mA.'],
        ['¿Cuáles son los terminales de un MOSFET?', ['Puerta, drenador y fuente', 'Base, colector y emisor', 'Ánodo, cátodo y rejilla', 'Entrada, salida y masa'], 'Gate (G), Drain (D) y Source (S).']
      ],
      avanzado: [
        ['Si Ib = 0,2 mA e Ic = 19,8 mA, ¿cuánto vale Ie?', ['20 mA', '19,6 mA', '3,96 mA', '99 mA'], 'Ie = Ic + Ib = 19,8 + 0,2 = 20 mA.'],
        ['Necesitamos Ic = 50 mA con un transistor de β = 250. ¿Qué Ib hace falta?', ['0,2 mA', '12,5 mA', '5 mA', '2 mA'], 'Ib = Ic / β = 50 / 250 = 0,2 mA.'],
        ['¿Cuál es la principal diferencia entre un BJT y un MOSFET?', ['El BJT se controla por corriente y el MOSFET por tensión', 'El BJT se controla por tensión y el MOSFET por corriente', 'El MOSFET tiene 2 terminales', 'El BJT no puede conmutar'], 'El MOSFET apenas consume corriente en la puerta: se controla por tensión.'],
        ['¿Qué tecnología combina MOSFET de canal N y P para fabricar procesadores?', ['CMOS', 'TTL', 'LED', 'BIOS'], 'CMOS = Complementary Metal-Oxide-Semiconductor.'],
        ['¿Qué tensión base-emisor necesita aproximadamente un BJT de silicio para conducir?', ['0,7 V', '0,1 V', '5 V', '12 V'], 'La unión base-emisor es como un diodo: ≈ 0,7 V.'],
        ['Para que conduzca un transistor PNP, la base debe estar…', ['A menor tensión que el emisor', 'A mayor tensión que el emisor', 'A la misma tensión que el emisor', 'Desconectada'], 'En el PNP la corriente sale por la base: la base debe ser más negativa que el emisor.']
      ]
    }
  }
];

/* ---------- Escape Room: afirmaciones de la sala de bobinas ---------- */
const INDUCTOR_STATEMENTS = {
  verdaderas: [
    'Una bobina almacena energía en forma de campo magnético.',
    'La inductancia se mide en henrios (H).',
    'Una bobina se opone a los cambios bruscos de corriente.',
    'En corriente continua estable, una bobina ideal se comporta como un cable.',
    'La reactancia inductiva aumenta al aumentar la frecuencia.',
    'Un núcleo de ferrita aumenta la inductancia de una bobina.',
    'Dos bobinas en serie (sin acoplamiento) suman sus inductancias.',
    'Un transformador está formado por bobinas acopladas magnéticamente.',
    'Los anillos de ferrita de los cables ayudan a filtrar interferencias.'
  ],
  falsas: [
    'Una bobina almacena energía en un campo eléctrico entre dos placas.',
    'La inductancia se mide en faradios (F).',
    'Una bobina bloquea totalmente la corriente continua.',
    'La reactancia inductiva disminuye al aumentar la frecuencia.',
    'Dos bobinas en paralelo suman sus inductancias.',
    'Las bobinas son componentes semiconductores con unión PN.',
    'Un núcleo de aire proporciona más inductancia que uno de ferrita.',
    'El anillo de ferrita de un cable USB sirve para aumentar la velocidad de datos.',
    'Una bobina tiene polaridad y solo puede conectarse en un sentido.'
  ]
};

/* ---------- Escape Room: salas ---------- */
const ESCAPE_ROOMS = [
  { id: 'resistencias', name: 'Sala Ohm', area: 'r1', story: 'La cerradura de esta sala la controla una resistencia. OHM‑9000 solo libera el fragmento de código si identificas su valor exacto.' },
  { id: 'condensadores', name: 'Cámara de Carga', area: 'r2', story: 'Una batería de condensadores alimenta la siguiente compuerta. Resuelve el cálculo para cargarla… sin que nada explote.' },
  { id: 'inductores', name: 'Reactor Magnético', area: 'r3', story: 'El reactor magnético está fuera de control. Coloca cada interruptor en ON si la afirmación es VERDADERA y en OFF si es FALSA.' },
  { id: 'diodos', name: 'Túnel de Diodos', area: 'r4', story: 'Un panel de LED bloquea el paso. Al cerrar el circuito, ¿qué ramas se iluminarán? ¡Cuidado con la polarización!' },
  { id: 'transistores', name: 'Núcleo de Silicio', area: 'r5', story: 'El motor de la puerta lo gobierna un transistor NPN. Calcula el valor que falta para que el motor pueda arrancar.' }
];

const ESCAPE_DIFFS = {
  facil: { name: 'Fácil', icon: '🟢', time: 20 * 60, hints: 5, penalty: 15, base: 1000, mult: 1, desc: '20 minutos · 5 pistas · −15 s por error. Retos guiados con ayudas visuales.' },
  normal: { name: 'Normal', icon: '🟡', time: 15 * 60, hints: 3, penalty: 30, base: 2000, mult: 2, desc: '15 minutos · 3 pistas · −30 s por error. Retos con cálculos.' },
  experto: { name: 'Experto', icon: '🔴', time: 10 * 60, hints: 1, penalty: 45, base: 3000, mult: 3, desc: '10 minutos · 1 pista · −45 s por error. Resistencias de 5 bandas, diseño de circuitos…' }
};
