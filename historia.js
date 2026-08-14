// ============================================================
// historia.js — Vidas en Movimiento
// Módulo "Historia de los Datos": narrativa scrollytelling
// construida en vivo a partir de los datos cargados desde
// Supabase en AppState (migrantes, rutas, organizaciones).
// ============================================================

/* global AppState, Chart, L, calcEdadDesde, escapeHtml, withLoader, navigate */

// ─── UTILIDADES DEL MÓDULO ───────────────────────────────────

const HD_REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const HD_PALETTE = ['#003B8F', '#1AA6B7', '#F47C00', '#7F56D9', '#17A65A', '#F04438', '#F79009', '#98A2B3'];

let _hdCharts = [];          // instancias Chart.js del módulo (se destruyen al re-entrar)
let _hdObserver = null;      // IntersectionObserver de secciones
let _hdMap = null;           // instancia Leaflet del capítulo geográfico
let _hdTimers = [];          // timers de animación pendientes

function hdCleanup() {
  _hdCharts.forEach(c => { try { c.destroy(); } catch (e) {} });
  _hdCharts = [];
  if (_hdObserver) { _hdObserver.disconnect(); _hdObserver = null; }
  if (_hdMap) { try { _hdMap.remove(); } catch (e) {} _hdMap = null; }
  _hdTimers.forEach(t => clearTimeout(t));
  _hdTimers = [];
}

function hdFmt(n) { return (n === null || n === undefined || isNaN(n)) ? '—' : Math.round(n).toLocaleString('es'); }
function hdPct(part, total, dec = 0) { return total > 0 ? ((part / total) * 100).toFixed(dec) : '0'; }

// Contador animado con easing (respeta prefers-reduced-motion)
function hdAnimateCounter(el) {
  const target = parseFloat(el.dataset.target || '0');
  const suffix = el.dataset.suffix || '';
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  if (HD_REDUCED) { el.textContent = target.toLocaleString('es', { maximumFractionDigits: decimals }) + suffix; return; }
  const dur = 1400;
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    const val = target * eased;
    el.textContent = val.toLocaleString('es', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ─── CÁLCULO DE ESTADÍSTICAS EN VIVO ─────────────────────────

function hdComputeStats() {
  const migs = AppState.migrantes || [];
  const orgs = (AppState.organizaciones || []).filter(o => o.activa !== false);
  const cat = AppState.catalogos;
  const total = migs.length;

  const label = (lista, id) => (cat[lista].find(x => x.id === id) || {}).label || 'Sin dato';

  // Conteo genérico por campo-catálogo
  function distBy(field, lista) {
    const counts = {};
    migs.forEach(m => {
      const l = label(lista, m[field]);
      counts[l] = (counts[l] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }

  // Rutas: paradas totales, por ciudad, por país, fechas y duración
  let atenciones = 0;
  const porCiudad = {}, porPaisParada = {};
  let fechaMin = null, fechaMax = null;
  let duracionSum = 0, duracionN = 0, multiPunto = 0;
  migs.forEach(m => {
    const ruta = m.ruta || [];
    atenciones += ruta.length;
    if (ruta.length > 1) {
      multiPunto++;
      const fs = ruta.map(p => p.fecha).filter(Boolean).sort();
      if (fs.length > 1) {
        const d = (new Date(fs[fs.length - 1]) - new Date(fs[0])) / 86400000;
        if (d >= 0) { duracionSum += d; duracionN++; }
      }
    }
    ruta.forEach(p => {
      if (p.fecha) {
        if (!fechaMin || p.fecha < fechaMin) fechaMin = p.fecha;
        if (!fechaMax || p.fecha > fechaMax) fechaMax = p.fecha;
      }
      if (p.ciudadId) porCiudad[p.ciudadId] = (porCiudad[p.ciudadId] || 0) + 1;
      if (p.paisId) porPaisParada[p.paisId] = (porPaisParada[p.paisId] || 0) + 1;
    });
  });

  const ciudadesTop = Object.entries(porCiudad)
    .map(([id, n]) => {
      const c = cat.ciudades.find(x => x.id === id) || {};
      const p = cat.paises.find(x => x.id === c.paisId) || {};
      return { id, label: c.label || id, pais: p.label || '', bandera: p.bandera || '', coords: c.coords, n };
    })
    .sort((a, b) => b.n - a.n);

  // Edades de los niños
  const edades = migs.map(m => calcEdadDesde(m.fechaNacimiento)).filter(e => e !== null);
  const edadProm = edades.length ? edades.reduce((a, b) => a + b, 0) / edades.length : 0;
  const rangos = [['0-2', 0, 2], ['3-5', 3, 5], ['6-8', 6, 8], ['9-11', 9, 11], ['12-14', 12, 14], ['15-17', 15, 17]];
  const edadDist = rangos.map(([lbl, lo, hi]) => [lbl, edades.filter(e => e >= lo && e <= hi).length]);
  const rangoTop = edadDist.slice().sort((a, b) => b[1] - a[1])[0] || ['—', 0];

  // Grupo de viaje
  let conGrupo = 0, acomp = 0, acompMenores = 0;
  const nexoCounts = {};
  migs.forEach(m => {
    const g = m.grupoViaje || [];
    if (g.length > 0) conGrupo++;
    acomp += g.length;
    g.forEach(x => {
      const e = x.edad !== null && x.edad !== undefined ? x.edad : calcEdadDesde(x.fechaNacimiento);
      if (e !== null && e < 18) acompMenores++;
      const nl = label('nexos', x.nexoId);
      if (x.nexoId) nexoCounts[nl] = (nexoCounts[nl] || 0) + 1;
    });
  });

  // Servicios ofrecidos por la red de organizaciones
  const svcCounts = {};
  orgs.forEach(o => (o.servicios || []).forEach(s => { svcCounts[s] = (svcCounts[s] || 0) + 1; }));
  const servicios = Object.entries(svcCounts).map(([id, n]) => {
    const s = cat.tiposServicio.find(x => x.id === id) || {};
    return { id, label: s.label || id, icono: s.icono || '•', n };
  }).sort((a, b) => b.n - a.n);

  const orgPaises = {};
  orgs.forEach(o => {
    const p = cat.paises.find(x => x.id === o.paisId) || {};
    const k = p.label || o.paisId || 'Sin dato';
    orgPaises[k] = (orgPaises[k] || 0) + 1;
  });

  // Estados
  const estados = {};
  migs.forEach(m => { estados[m.estado || 'sin_dato'] = (estados[m.estado || 'sin_dato'] || 0) + 1; });

  // Registros por mes (serie temporal de paradas de ruta)
  const porMes = {};
  migs.forEach(m => (m.ruta || []).forEach(p => {
    if (p.fecha) { const k = String(p.fecha).substring(0, 7); porMes[k] = (porMes[k] || 0) + 1; }
  }));
  const serieMeses = Object.entries(porMes).sort((a, b) => a[0] < b[0] ? -1 : 1);

  // Destino final EE.UU.
  const destinoUS = migs.filter(m => m.destinoFinalPaisId === 'US').length;
  const paisesConParadas = Object.keys(porPaisParada).length;
  const paisesConOrgs = Object.keys(orgPaises).length;

  return {
    total, atenciones, orgs: orgs.length, orgPaises, paisesConOrgs, paisesConParadas,
    nacionalidades: distBy('nacionalidadId', 'nacionalidades'),
    razones: distBy('adultoRazonId', 'razonesEmigracion'),
    ingresos: distBy('ingresosId', 'generacionIngresos'),
    educacion: distBy('ninoNivelEducacionId', 'nivelesEducacion'),
    idiomas: distBy('ninoIdiomaId', 'idiomas'),
    generosNino: distBy('ninoGeneroId', 'generos'),
    ciudadesTop, edades, edadProm, edadDist, rangoTop,
    conGrupo, acomp, acompMenores,
    nexos: Object.entries(nexoCounts).sort((a, b) => b[1] - a[1]),
    servicios, estados, serieMeses,
    duracionProm: duracionN ? duracionSum / duracionN : 0,
    multiPunto, destinoUS, fechaMin, fechaMax,
  };
}

// ─── COMPONENTES DE MARCADO ──────────────────────────────────

function hdBigNumber(value, opts = {}) {
  const { suffix = '', decimals = 0, size = '' } = opts;
  return `<span class="hd-counter ${size}" data-target="${value}" data-suffix="${suffix}" data-decimals="${decimals}">0${suffix}</span>`;
}

function hdSection(id, kicker, title, bodyHtml, opts = {}) {
  const theme = opts.theme || '';
  return `
    <section class="hd-section ${theme}" id="hd-${id}" data-chapter="${id}">
      <div class="hd-section-inner">
        <div class="hd-kicker hd-reveal">${kicker}</div>
        <h2 class="hd-title hd-reveal">${title}</h2>
        ${bodyHtml}
      </div>
    </section>`;
}

// Barras horizontales animadas (se llenan al entrar en viewport)
function hdBars(data, opts = {}) {
  const max = Math.max(...data.map(d => d[1]), 1);
  const total = data.reduce((a, d) => a + d[1], 0);
  return `<div class="hd-bars">${data.map(([lbl, n], i) => `
    <div class="hd-bar-row hd-reveal" style="transition-delay:${i * 60}ms">
      <div class="hd-bar-label" title="${escapeHtml(lbl)}">${escapeHtml(lbl)}</div>
      <div class="hd-bar-track">
        <div class="hd-bar-fill" data-w="${(n / max * 100).toFixed(1)}" style="background:${opts.color || HD_PALETTE[i % HD_PALETTE.length]}"></div>
      </div>
      <div class="hd-bar-value">${hdFmt(n)}<span class="hd-bar-pct">${hdPct(n, total)}%</span></div>
    </div>`).join('')}</div>`;
}

// Waffle de 100 puntos (1 punto = 1% de la población)
function hdWaffle(data) {
  const total = data.reduce((a, d) => a + d[1], 0);
  const cells = [];
  let acc = 0;
  data.forEach(([lbl, n], idx) => {
    const units = Math.round((acc + n) / total * 100) - Math.round(acc / total * 100);
    for (let i = 0; i < units && cells.length < 100; i++) cells.push(idx);
    acc += n;
  });
  while (cells.length < 100) cells.push(data.length - 1);
  return `
    <div class="hd-waffle-wrap hd-reveal">
      <div class="hd-waffle">${cells.map((idx, i) =>
        `<span class="hd-waffle-dot" style="background:${HD_PALETTE[idx % HD_PALETTE.length]};transition-delay:${i * 12}ms"></span>`).join('')}
      </div>
      <div class="hd-waffle-legend">${data.map(([lbl, n], idx) => `
        <div class="hd-legend-item">
          <span class="hd-legend-dot" style="background:${HD_PALETTE[idx % HD_PALETTE.length]}"></span>
          <span>${escapeHtml(lbl)}</span>
          <strong>${hdPct(n, total)}%</strong>
        </div>`).join('')}
      </div>
    </div>`;
}

// "1 de cada N" con pictogramas de personas
function hdPictoRatio(highlight, total, colorOn = '#F47C00', colorOff = '#CBD5E1') {
  const icons = [];
  for (let i = 0; i < total; i++) {
    icons.push(`<svg viewBox="0 0 24 24" class="hd-picto ${i < highlight ? 'on' : ''}" style="fill:${i < highlight ? colorOn : colorOff};transition-delay:${i * 120}ms">
      <circle cx="12" cy="6" r="4"/><path d="M12 12c-4.4 0-8 2.7-8 6v4h16v-4c0-3.3-3.6-6-8-6z"/>
    </svg>`);
  }
  return `<div class="hd-picto-row hd-reveal">${icons.join('')}</div>`;
}

// ─── VISTA PRINCIPAL ─────────────────────────────────────────

function viewHistoriaDatos(container) {
  hdCleanup();
  withLoader(container, () => {
    const S = hdComputeStats();
    if (S.total === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><h3>Sin datos disponibles</h3><p>No hay registros cargados para construir la historia.</p></div>`;
      return;
    }

    const nacVzla = S.nacionalidades.find(d => d[0] === 'Venezolana');
    const pctVzla = nacVzla ? hdPct(nacVzla[1], S.total) : '0';
    const noVzla = S.total - (nacVzla ? nacVzla[1] : 0);
    const unoDeCadaNac = noVzla > 0 ? Math.max(2, Math.round(S.total / noVzla)) : 0;
    const cucuta = S.ciudadesTop[0] || { label: '—', n: 0 };
    const sinEsc = S.educacion.find(d => d[0] === 'Sin escolarización');
    const primInc = S.educacion.find(d => d[0] === 'Primario incompleto');
    const perdidos = S.estados['perdido_seguimiento'] || 0;
    const unoDeCadaPerd = perdidos > 0 ? Math.round(S.total / perdidos) : 0;
    const razonTop = S.razones[0] || ['—', 0];
    const sinIngresos = S.ingresos.find(d => d[0] === 'Sin ingresos');
    const espanol = S.idiomas.find(d => d[0] === 'Español');
    const otrosIdiomas = S.total - (espanol ? espanol[1] : 0);
    const periodo = S.fechaMin && S.fechaMax
      ? `${S.fechaMin.substring(0, 7)} → ${S.fechaMax.substring(0, 7)}` : '—';

    // Periodo en formato largo, para la narrativa
    const HD_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mesAnio = (f) => {
      if (!f) return '—';
      const [a, m] = String(f).split('-');
      return `${HD_MESES[parseInt(m, 10) - 1]} de ${a}`;
    };
    const periodoLargo = S.fechaMin && S.fechaMax ? `${mesAnio(S.fechaMin)} y ${mesAnio(S.fechaMax)}` : '—';
    const mesAnioMax = mesAnio(S.fechaMax);

    // Educación: nivel más frecuente y trayectorias escolares interrumpidas
    const nivelTop = S.educacion[0] || ['—', 0];
    const interrumpidos = ['Sin escolarización', 'Primario incompleto', 'Secundario incompleto']
      .reduce((acc, l) => acc + ((S.educacion.find(d => d[0] === l) || [null, 0])[1]), 0);
    const deCadaDiezEdu = Math.round(10 * interrumpidos / S.total);

    container.innerHTML = `
    <div id="hd-root">

      <!-- Barra de progreso de lectura -->
      <div class="hd-progress"><div class="hd-progress-fill" id="hd-progress-fill"></div></div>

      <!-- Navegación por capítulos -->
      <nav class="hd-chapter-nav" id="hd-chapter-nav" aria-label="Capítulos">
        ${['hero', 'origen', 'geografia', 'ninos', 'educacion', 'compania', 'razones', 'sustento', 'red', 'cierre']
          .map((c, i) => `<button class="hd-dot" data-goto="hd-${c}" title="Capítulo ${i + 1}"></button>`).join('')}
      </nav>

      <!-- ── CAP. 0: HERO ─────────────────────────────────── -->
      <section class="hd-section hd-hero" id="hd-hero" data-chapter="hero">
        <svg class="hd-hero-path" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
          <path id="hd-route-path" d="M60,360 C240,330 320,250 430,235 S650,190 760,150 S1020,80 1150,45"
                fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2.5" stroke-dasharray="6 8"/>
          <circle class="hd-route-dot d1" r="5"/><circle class="hd-route-dot d2" r="4"/><circle class="hd-route-dot d3" r="3.5"/>
        </svg>
        <div class="hd-section-inner">
          <div class="hd-kicker hd-reveal" style="color:#9FD8DF;">Vidas en Movimiento · Historia de los Datos</div>
          <h1 class="hd-hero-title hd-reveal">Cada registro es<br/>una vida en movimiento</h1>
          <p class="hd-lead hd-reveal">
            Detrás de cada fila de esta base de datos hay un niño, una niña o un adolescente
            que dejó su casa. Esto es lo que ${hdFmt(S.total)} historias registradas entre
            ${periodoLargo} nos cuentan sobre la ruta migratoria.
          </p>
          <div class="hd-hero-badge hd-reveal">Datos actualizados hasta ${mesAnioMax}</div>
          <div class="hd-hero-kpis">
            <div class="hd-hero-kpi hd-reveal">${hdBigNumber(S.total)}<span>niños, niñas y adolescentes</span></div>
            <div class="hd-hero-kpi hd-reveal">${hdBigNumber(S.atenciones)}<span>atenciones registradas</span></div>
            <div class="hd-hero-kpi hd-reveal">${hdBigNumber(S.orgs)}<span>organizaciones</span></div>
            <div class="hd-hero-kpi hd-reveal">${hdBigNumber(S.paisesConOrgs)}<span>países en la red</span></div>
          </div>
          <div class="hd-scroll-hint hd-reveal">Desliza para leer la historia ↓</div>
        </div>
      </section>

      <!-- ── CAP. 1: ORIGEN Y NACIONALIDAD ────────────────── -->
      ${hdSection('origen', 'Capítulo 1 · Origen',
        'Todos parten del mismo punto, pero no todos nacieron allí', `
        <p class="hd-body hd-reveal">
          El <strong>100% de los registros</strong> inicia su ruta en Venezuela. Sin embargo, el país
          de partida no siempre coincide con el pasaporte: junto a la mayoría venezolana
          (${pctVzla}%) viajan ${S.nacionalidades.length - 1} nacionalidades más — colombianos
          retornados, ecuatorianos, haitianos, peruanos — que comparten la misma carretera hacia el norte.
        </p>
        <div class="hd-callout hd-reveal">
          <div class="hd-callout-num">1 de cada ${unoDeCadaNac}</div>
          <div class="hd-callout-txt">registrados en la ruta <strong>no tiene nacionalidad venezolana</strong>. La ruta es venezolana; la población, cada vez más regional.</div>
        </div>
        <p class="hd-viz-caption hd-reveal">Cada punto representa el 1% de la población registrada, según nacionalidad:</p>
        ${hdWaffle(S.nacionalidades)}
      `)}

      <!-- ── CAP. 2: GEOGRAFÍA ────────────────────────────── -->
      ${hdSection('geografia', 'Capítulo 2 · Ciudades',
        `La ruta se estrecha en ${escapeHtml(cucuta.label)}`, `
        <p class="hd-body hd-reveal">
          Las ${hdFmt(S.atenciones)} atenciones no se reparten de manera uniforme:
          se concentran en un puñado de ciudades que funcionan como embudos del corredor migratorio.
          <strong>${escapeHtml(cucuta.label)}</strong>${cucuta.id === 'CUC' ? ', en la frontera colombo-venezolana,' : ''}
          encabeza la lista con ${hdFmt(cucuta.n)} atenciones${cucuta.id === 'CUC' ? ' — la puerta de entrada de la ruta terrestre' : ''}.
        </p>
        <div class="hd-map-card hd-reveal">
          <div id="hd-map" role="img" aria-label="Mapa de concentración de atenciones por ciudad"></div>
        </div>
        <div class="hd-split">
          <div class="hd-split-viz">
            <p class="hd-viz-caption hd-reveal">Atenciones registradas por ciudad:</p>
            ${hdBars(S.ciudadesTop.slice(0, 8).map(c => [`${c.bandera} ${c.label}`, c.n]), { color: '#1AA6B7' })}
          </div>
          <div class="hd-split-note hd-reveal">
            <div class="hd-mini-num">${hdBigNumber(S.paisesConParadas)}</div>
            <p>países concentran hoy <strong>toda la trazabilidad registrada</strong>, aunque la red de organizaciones ya está desplegada en ${S.paisesConOrgs}. El capítulo final explica por qué esa diferencia importa.</p>
          </div>
        </div>
      `, { theme: 'hd-alt' })}

      <!-- ── CAP. 3: LOS NIÑOS ────────────────────────────── -->
      ${hdSection('ninos', 'Capítulo 3 · Edades',
        `El viaje tiene ${Math.round(S.edadProm)} años`, `
        <p class="hd-body hd-reveal">
          La edad promedio de los niños y niñas registrados es de <strong>${Math.round(S.edadProm)} años</strong>.
          El grupo más numeroso es el de <strong>${S.rangoTop[0]} años</strong> (${hdFmt(S.rangoTop[1])} registros)${S.rangoTop[0] === '3-5' ? ': edad de jardín de infancia, vivida en carretera' : ''}. ${hdFmt(otrosIdiomas)} de ellos
          (${hdPct(otrosIdiomas, S.total)}%) ni siquiera tienen el español como idioma principal.
        </p>
        <div class="hd-chart-grid">
          <div class="hd-chart-card hd-reveal">
            <div class="hd-chart-title">Distribución por edad (años)</div>
            <div class="hd-chart-box"><canvas id="hd-chart-edad"></canvas></div>
          </div>
          <div class="hd-chart-card hd-reveal">
            <div class="hd-chart-title">Idioma principal del niño/a</div>
            ${hdBars(S.idiomas.slice(0, 5), { color: '#7F56D9' })}
          </div>
        </div>
      `)}

      <!-- ── CAP. 4: EDUCACIÓN ────────────────────────────── -->
      ${hdSection('educacion', 'Capítulo 4 · Educación',
        'La escuela quedó a medias', `
        <p class="hd-body hd-reveal">
          Migrar interrumpe trayectorias escolares. El nivel más frecuente es
          <strong>${escapeHtml(nivelTop[0])}</strong>, con ${hdFmt(nivelTop[1])} registros
          (${hdPct(nivelTop[1], S.total)}%): adolescentes que dejaron el aula a mitad de camino.
          ${sinEsc ? `A ellos se suman ${hdFmt(sinEsc[1])} niños y niñas sin ninguna escolarización` : ''}
          ${primInc ? ` y ${hdFmt(primInc[1])} que abandonaron la primaria sin terminarla` : ''}.
          Cada punto de atención en la ruta es también una oportunidad de reconectarlos con el aula.
        </p>
        <div class="hd-callout hd-reveal">
          <div class="hd-callout-num">${deCadaDiezEdu} de cada 10</div>
          <div class="hd-callout-txt">llegan a la ruta con la <strong>trayectoria escolar cortada</strong>: sin escolarización, primaria incompleta o secundaria incompleta (${hdFmt(interrumpidos)} registros, ${hdPct(interrumpidos, S.total)}%).</div>
        </div>
        <p class="hd-viz-caption hd-reveal">Último nivel educativo registrado:</p>
        ${hdBars(S.educacion.slice(0, 10), { color: '#F47C00' })}
      `, { theme: 'hd-alt' })}

      <!-- ── CAP. 5: COMPAÑÍA ─────────────────────────────── -->
      ${hdSection('compania', 'Capítulo 5 · Compañía',
        '¿Quién camina a su lado?', `
        <p class="hd-body hd-reveal">
          <strong>${hdFmt(S.conGrupo)} registros (${hdPct(S.conGrupo, S.total)}%) declaran un grupo de viaje</strong>,
          con ${hdFmt(S.acomp)} acompañantes en total. Y un dato que cambia la lectura:
          ${hdPct(S.acompMenores, S.acomp)}% de esos acompañantes son también menores de edad —
          niños cuidando niños a lo largo de la ruta.
        </p>
        <div class="hd-callout hd-reveal">
          <div class="hd-callout-num">${hdPct(S.acompMenores, S.acomp)}%</div>
          <div class="hd-callout-txt">de los acompañantes registrados <strong>tiene menos de 18 años</strong>.</div>
        </div>
        <p class="hd-viz-caption hd-reveal">Vínculo del acompañante con el niño/a:</p>
        ${hdBars(S.nexos, { color: '#17A65A' })}
      `)}

      <!-- ── CAP. 6: RAZONES ──────────────────────────────── -->
      ${hdSection('razones', 'Capítulo 6 · Motivos',
        '¿Por qué se van?', `
        <p class="hd-body hd-reveal">
          No hay una sola migración: hay ${S.razones.length} razones documentadas para partir.
          <strong>${escapeHtml(razonTop[0])}</strong> encabeza la lista (${hdPct(razonTop[1], S.total)}% de los casos),
          pero uno de cada cinco viajes es en realidad un reencuentro: familias que migran para
          volver a estar juntas.
        </p>
        <div class="hd-chart-card hd-reveal hd-chart-solo">
          <div class="hd-chart-title">Razón principal de emigración</div>
          <div class="hd-chart-box hd-chart-box-lg"><canvas id="hd-chart-razones"></canvas></div>
        </div>
      `, { theme: 'hd-alt' })}

      <!-- ── CAP. 7: SUSTENTO ─────────────────────────────── -->
      ${hdSection('sustento', 'Capítulo 7 · Sustento',
        'Trabajar mientras se camina', `
        <p class="hd-body hd-reveal">
          La ruta también se financia. La mayoría de las familias declara alguna fuente de ingresos
          — formal, temporal o informal — que sostiene el viaje.
          ${sinIngresos ? `En el otro extremo, <strong>${hdFmt(sinIngresos[1])} familias (${hdPct(sinIngresos[1], S.total)}%)
          viajan sin ningún ingreso</strong>: el grupo de mayor riesgo en cada parada.` : ''}
        </p>
        <div class="hd-chart-grid">
          <div class="hd-chart-card hd-reveal">
            <div class="hd-chart-title">Generación de ingresos declarada</div>
            <div class="hd-chart-box"><canvas id="hd-chart-ingresos"></canvas></div>
          </div>
          <div class="hd-split-note hd-reveal">
            <div class="hd-mini-num">${sinIngresos ? hdBigNumber(sinIngresos[1]) : '—'}</div>
            <p>familias declaran <strong>cero ingresos</strong>. Para las organizaciones de la red, este indicador funciona como alerta temprana de vulnerabilidad extrema.</p>
          </div>
        </div>
      `)}

      <!-- ── CAP. 8: LA RED ───────────────────────────────── -->
      ${hdSection('red', 'Capítulo 8 · La red',
        `${hdFmt(S.orgs)} organizaciones sostienen la ruta`, `
        <p class="hd-body hd-reveal">
          Ninguna organización ve la ruta completa; la red sí. ${hdFmt(S.orgs)} organizaciones en
          ${S.paisesConOrgs} países registran y comparten información en esta plataforma, ofreciendo
          ${S.servicios.length} tipos de servicio a lo largo del corredor.
        </p>
        <div class="hd-svc-grid">
          ${S.servicios.map((s, i) => `
            <div class="hd-svc-card hd-reveal" style="transition-delay:${i * 70}ms">
              <div class="hd-svc-icon">${s.icono}</div>
              <div class="hd-svc-n">${s.n}<span>/${S.orgs}</span></div>
              <div class="hd-svc-label">${escapeHtml(s.label)}</div>
              <div class="hd-svc-track"><div class="hd-bar-fill" data-w="${(s.n / S.orgs * 100).toFixed(0)}" style="background:#003B8F"></div></div>
            </div>`).join('')}
        </div>
        <p class="hd-viz-caption hd-reveal" style="margin-top:26px;">Organizaciones por país:</p>
        ${hdBars(Object.entries(S.orgPaises).sort((a, b) => b[1] - a[1]), { color: '#003B8F' })}
      `, { theme: 'hd-alt' })}

      <!-- ── CAP. 9: CIERRE / TRAZABILIDAD ────────────────── -->
      <section class="hd-section hd-final" id="hd-cierre" data-chapter="cierre">
        <div class="hd-section-inner">
          <div class="hd-kicker hd-reveal" style="color:#9FD8DF;">Capítulo 9 · El dato que falta</div>
          <h2 class="hd-title hd-reveal" style="color:#fff;">La historia que aún no podemos contar</h2>
          <p class="hd-body hd-reveal" style="color:#D7E3F4;">
            El ${hdPct(S.destinoUS, S.total)}% declara Estados Unidos como destino final, pero la
            trazabilidad registrada llega hoy hasta Colombia. Y de quienes sí registramos,
            <strong style="color:#fff;">${hdFmt(perdidos)} (${hdPct(perdidos, S.total)}%) perdieron seguimiento</strong>:
            su historia se corta a mitad de la ruta.
          </p>
          ${unoDeCadaPerd > 0 ? `
          ${hdPictoRatio(1, Math.min(unoDeCadaPerd, 10))}
          <div class="hd-callout hd-final-callout hd-reveal">
            <div class="hd-callout-num" style="color:#F47C00;">1 de cada ${unoDeCadaPerd}</div>
            <div class="hd-callout-txt" style="color:#D7E3F4;">niños registrados <strong style="color:#fff;">desaparece de los datos</strong> antes de completar su ruta. Ampliar la red hacia el norte es la manera de que esa historia no se pierda.</div>
          </div>` : ''}
          <div class="hd-chart-card hd-reveal" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14);">
            <div class="hd-chart-title" style="color:#9FD8DF;">Atenciones registradas por mes (${periodo})</div>
            <div class="hd-chart-box"><canvas id="hd-chart-meses"></canvas></div>
          </div>
          <div class="hd-cta-row hd-reveal">
            <button class="btn btn-primary" onclick="navigate('/migrantes/dashboard')">Explorar el dashboard</button>
            <button class="btn btn-secondary" style="background:#fff;" onclick="navigate('/migrantes/mapa')">Ver el mapa de rutas</button>
            <button class="btn btn-secondary" style="background:#fff;" onclick="navigate('/migrantes/listado')">Ir al listado</button>
          </div>
          <p class="hd-footnote hd-reveal">
            Todas las cifras se calculan en tiempo real sobre los ${hdFmt(S.total)} registros de la base de datos
            de la plataforma · Periodo ${periodo} (datos actualizados hasta ${mesAnioMax}) · ${hdFmt(S.orgs)} organizaciones aportantes.
          </p>
        </div>
      </section>

    </div>`;

    hdInitInteractions(S);
  });
}

// ─── INTERACCIONES / ANIMACIONES ─────────────────────────────

function hdInitInteractions(S) {
  const root = document.getElementById('hd-root');
  if (!root) return;

  // 1) Barra de progreso + capítulo activo
  const fill = document.getElementById('hd-progress-fill');
  const dots = Array.from(document.querySelectorAll('.hd-dot'));
  function onScroll() {
    const rect = root.getBoundingClientRect();
    const totalH = root.offsetHeight - window.innerHeight;
    const p = totalH > 0 ? Math.min(1, Math.max(0, -rect.top / totalH)) : 0;
    if (fill) fill.style.width = (p * 100).toFixed(1) + '%';
    // capítulo activo = sección más cercana al centro del viewport
    let best = null, bestDist = Infinity;
    document.querySelectorAll('.hd-section').forEach(sec => {
      const r = sec.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - window.innerHeight / 2);
      if (d < bestDist) { bestDist = d; best = sec.id; }
    });
    dots.forEach(d => d.classList.toggle('active', d.dataset.goto === best));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  dots.forEach(d => d.addEventListener('click', () => {
    const el = document.getElementById(d.dataset.goto);
    if (el) el.scrollIntoView({ behavior: HD_REDUCED ? 'auto' : 'smooth', block: 'start' });
  }));

  // 2) Observer: revelar elementos, animar contadores/barras, montar gráficas al entrar
  const chartInit = { edad: false, razones: false, ingresos: false, meses: false, map: false };
  _hdObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('hd-visible');

      el.querySelectorAll('.hd-counter').forEach(c => { if (!c.dataset.done) { c.dataset.done = '1'; hdAnimateCounter(c); } });
      if (el.classList.contains('hd-counter') && !el.dataset.done) { el.dataset.done = '1'; hdAnimateCounter(el); }
      el.querySelectorAll('.hd-bar-fill').forEach(b => { b.style.width = b.dataset.w + '%'; });

      const ch = el.closest('.hd-section')?.dataset.chapter;
      if (ch === 'ninos' && !chartInit.edad) { chartInit.edad = true; hdChartEdad(S); }
      if (ch === 'razones' && !chartInit.razones) { chartInit.razones = true; hdChartRazones(S); }
      if (ch === 'sustento' && !chartInit.ingresos) { chartInit.ingresos = true; hdChartIngresos(S); }
      if (ch === 'cierre' && !chartInit.meses) { chartInit.meses = true; hdChartMeses(S); }
      if (ch === 'geografia' && !chartInit.map) { chartInit.map = true; _hdTimers.push(setTimeout(() => hdInitMap(S), 150)); }

      _hdObserver.unobserve(el);
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('.hd-reveal, .hd-hero-kpi, .hd-svc-card').forEach(el => _hdObserver.observe(el));

  // limpiar listener de scroll al navegar fuera (navigate vacía el contenedor)
  const mo = new MutationObserver(() => {
    if (!document.getElementById('hd-root')) {
      window.removeEventListener('scroll', onScroll);
      hdCleanup();
      mo.disconnect();
    }
  });
  mo.observe(document.getElementById('main-content'), { childList: true });
}

// ─── GRÁFICAS ────────────────────────────────────────────────

function hdBaseOpts(extra = {}) {
  return Object.assign({
    responsive: true, maintainAspectRatio: false,
    animation: HD_REDUCED ? false : { duration: 1100, easing: 'easeOutQuart' },
    plugins: { legend: { display: false } },
  }, extra);
}

function hdChartEdad(S) {
  const el = document.getElementById('hd-chart-edad');
  if (!el) return;
  _hdCharts.push(new Chart(el, {
    type: 'bar',
    data: {
      labels: S.edadDist.map(d => d[0]),
      datasets: [{ data: S.edadDist.map(d => d[1]), backgroundColor: S.edadDist.map(d => d[0] === S.rangoTop[0] ? '#F47C00' : '#1AA6B7'), borderRadius: 8 }],
    },
    options: hdBaseOpts({ scales: { y: { beginAtZero: true, grid: { color: '#F2F4F7' } }, x: { grid: { display: false } } } }),
  }));
}

function hdChartRazones(S) {
  const el = document.getElementById('hd-chart-razones');
  if (!el) return;
  _hdCharts.push(new Chart(el, {
    type: 'bar',
    data: {
      labels: S.razones.map(d => d[0]),
      datasets: [{ data: S.razones.map(d => d[1]), backgroundColor: S.razones.map((d, i) => i === 0 ? '#F47C00' : '#003B8F'), borderRadius: 8 }],
    },
    options: hdBaseOpts({
      indexAxis: 'y',
      scales: { x: { beginAtZero: true, grid: { color: '#F2F4F7' } }, y: { grid: { display: false } } },
    }),
  }));
}

function hdChartIngresos(S) {
  const el = document.getElementById('hd-chart-ingresos');
  if (!el) return;
  _hdCharts.push(new Chart(el, {
    type: 'doughnut',
    data: {
      labels: S.ingresos.map(d => d[0]),
      datasets: [{ data: S.ingresos.map(d => d[1]), backgroundColor: HD_PALETTE, borderWidth: 2, borderColor: '#fff' }],
    },
    options: hdBaseOpts({ cutout: '62%', plugins: { legend: { display: true, position: 'right', labels: { boxWidth: 10, font: { size: 11 } } } } }),
  }));
}

function hdChartMeses(S) {
  const el = document.getElementById('hd-chart-meses');
  if (!el) return;
  _hdCharts.push(new Chart(el, {
    type: 'line',
    data: {
      labels: S.serieMeses.map(d => d[0]),
      datasets: [{
        data: S.serieMeses.map(d => d[1]),
        fill: true, tension: 0.35, borderColor: '#1AA6B7', borderWidth: 2.5,
        backgroundColor: 'rgba(26,166,183,.18)', pointRadius: 0, pointHitRadius: 12,
      }],
    },
    options: hdBaseOpts({
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.08)' }, ticks: { color: '#9FB4D4' } },
        x: { grid: { display: false }, ticks: { color: '#9FB4D4', maxTicksLimit: 10 } },
      },
    }),
  }));
}

// ─── MAPA DEL CAPÍTULO GEOGRÁFICO ────────────────────────────

function hdInitMap(S) {
  const el = document.getElementById('hd-map');
  if (!el || typeof L === 'undefined') return;
  const conCoords = S.ciudadesTop.filter(c => c.coords);
  if (!conCoords.length) { el.innerHTML = '<div style="padding:40px;text-align:center;color:#98A2B3;">Sin coordenadas disponibles</div>'; return; }

  _hdMap = L.map('hd-map', { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap', maxZoom: 10,
  }).addTo(_hdMap);

  const maxN = conCoords[0].n;
  const bounds = [];
  conCoords.forEach((c, i) => {
    bounds.push(c.coords);
    const r = 10 + Math.sqrt(c.n / maxN) * 26;
    const circle = L.circleMarker(c.coords, {
      radius: HD_REDUCED ? r : 2,
      color: i === 0 ? '#F47C00' : '#1AA6B7',
      fillColor: i === 0 ? '#F47C00' : '#1AA6B7',
      fillOpacity: 0.55, weight: 2,
    }).addTo(_hdMap);
    circle.bindTooltip(`<strong>${escapeHtml(c.label)}</strong><br/>${hdFmt(c.n)} atenciones`, { direction: 'top' });
    // crecimiento animado de la burbuja
    if (!HD_REDUCED) {
      const t0 = performance.now(), dur = 900, delay = i * 110;
      _hdTimers.push(setTimeout(() => {
        (function grow(now) {
          const p = Math.min(1, (now - t0 - delay) / dur);
          circle.setRadius(2 + (r - 2) * (1 - Math.pow(1 - Math.max(0, p), 3)));
          if (p < 1) requestAnimationFrame(grow);
        })(performance.now());
      }, delay));
    }
  });

  // Flujo animado: conectar las ciudades en secuencia sur→norte (por latitud)
  const orden = conCoords.slice().sort((a, b) => a.coords[0] - b.coords[0] || b.coords[1] - a.coords[1]);
  const linea = L.polyline(orden.map(c => c.coords), {
    color: '#003B8F', weight: 2.5, opacity: 0.7, dashArray: '7 9',
  }).addTo(_hdMap);
  if (!HD_REDUCED && linea._path) {
    linea._path.classList.add('hd-flow-line'); // animación CSS de dashoffset
  }

  _hdMap.fitBounds(bounds, { padding: [34, 34] });
}
