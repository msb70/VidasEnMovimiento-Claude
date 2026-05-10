// ============================================================
// supabase-data.js — Vidas en Movimiento
// Carga de catálogos desde Supabase + CRUD genérico
// ============================================================

// ─── MAPEO TABLAS → CLAVES APPSTATE ──────────────────────────

const SB_CATALOG_MAP = {
  // clave en AppState.catalogos → tabla en Supabase + transformación
  paises:             { table: 'cat_paises',             transform: fromDB_pais,      toDB: toDB_pais      },
  ciudades:           { table: 'cat_ciudades',           transform: fromDB_ciudad,    toDB: toDB_ciudad    },
  nacionalidades:     { table: 'cat_nacionalidades',     transform: fromDB_simple,    toDB: toDB_simple    },
  generos:            { table: 'cat_generos',            transform: fromDB_simple,    toDB: toDB_simple    },
  idiomas:            { table: 'cat_idiomas',            transform: fromDB_simple,    toDB: toDB_simple    },
  nexos:              { table: 'cat_nexos',              transform: fromDB_simple,    toDB: toDB_simple    },
  razonesEmigracion:  { table: 'cat_razones_emigracion', transform: fromDB_simple,    toDB: toDB_simple    },
  tiposServicio:      { table: 'cat_tipos_servicio',     transform: fromDB_servicio,  toDB: toDB_servicio  },
  generacionIngresos: { table: 'cat_generacion_ingresos',transform: fromDB_simple,    toDB: toDB_simple    },
  nivelesEducacion:   { table: 'cat_niveles_educacion',  transform: fromDB_simple,    toDB: toDB_simple    },
  materialEducativo:  { table: 'cat_material_educativo', transform: fromDB_material,  toDB: toDB_material  },
  recomendaciones:    { table: 'cat_recomendaciones',    transform: fromDB_recomen,   toDB: toDB_recomen   },
};

// ─── TRANSFORMADORES DB ↔ APP ─────────────────────────────────

function fromDB_simple(row)      { return { id: row.id, label: row.label }; }
function toDB_simple(item)       { return { id: item.id, label: item.label }; }

const PAIS_COORDS_LOOKUP = {
  VE:[8.0,-66.0], CO:[4.57,-74.29], PA:[8.99,-79.51], CR:[9.74,-83.75],
  HN:[15.2,-86.2], GT:[15.78,-90.23], MX:[23.63,-102.55], US:[37.09,-95.71],
  HT:[18.97,-72.28], EC:[-1.83,-78.18], PE:[-9.19,-75.01], CU:[21.52,-77.78],
};
function fromDB_pais(row) {
  return { id: row.id, label: row.label, bandera: row.bandera || '', coords: PAIS_COORDS_LOOKUP[row.id] || null };
}
function toDB_pais(item)         { return { id: item.id, label: item.label, bandera: item.bandera || '' }; }

// Lookup de coordenadas por ID de ciudad (las ciudades en Supabase no guardan coords)
const CITY_COORDS_LOOKUP = {
  CCS: [10.48,  -66.87], MAR: [10.63,  -71.64], SCR: [7.77,   -72.22],
  CUC: [7.89,   -72.50], RIO: [11.54,  -72.91], CTG: [10.40,  -75.51],
  BAR: [10.96,  -74.80], SMA: [11.24,  -74.20], BOG: [4.71,   -74.07],
  MED: [6.25,   -75.56], CAL: [3.45,   -76.53], PTY: [8.99,   -79.51],
  DAV: [8.42,   -82.43], SJO: [9.93,   -84.08], GUA: [14.63,  -90.51],
  TAP: [14.89,  -92.26], CDM: [19.43,  -99.13], MTY: [25.67, -100.31],
  HOU: [29.76,  -95.36], MIA: [25.77,  -80.19], PAP: [18.54,  -72.33],
  GYE: [-2.17,  -79.92], LIM: [-12.04, -77.03], TGU: [14.10,  -87.22],
};

function fromDB_ciudad(row) {
  return {
    id:     row.id,
    label:  row.label,
    paisId: row.pais_id,
    coords: CITY_COORDS_LOOKUP[row.id] || null,
  };
}
function toDB_ciudad(item)       { return { id: item.id, label: item.label, pais_id: item.paisId || item.pais_id || '' }; }

function fromDB_servicio(row)    { return { id: row.id, label: row.label, icono: row.icono || '', color: row.color || '' }; }
function toDB_servicio(item)     { return { id: item.id, label: item.label, icono: item.icono || '', color: item.color || '' }; }

function fromDB_material(row)    { return { id: row.id, label: row.label, tipo: row.tipo || '', idioma: row.idioma || 'ES' }; }
function toDB_material(item)     { return { id: item.id, label: item.label, tipo: item.tipo || '', idioma: item.idioma || 'ES' }; }

function fromDB_recomen(row)     { return { id: row.id, label: row.label, tipo: row.tipo || '' }; }
function toDB_recomen(item)      { return { id: item.id, label: item.label, tipo: item.tipo || '' }; }

function fromDB_org(row) {
  return {
    id:               row.id,
    nombre:           row.nombre,
    paisId:           row.pais_id,
    ciudadId:         row.ciudad_id,
    ciudad:           row.ciudad_id, // compatibilidad con vistas existentes
    tipo:             row.tipo || '',
    contacto:         row.contacto || '',
    email:            row.email_org || '',
    telefono:         row.telefono || '',
    servicios:        row.servicios || [],
    totalAtendidos:   row.total_atendidos || 0,
    recomendaciones:  row.recomendaciones_count || 0,
    activa:           row.activa !== false,
    descripcion:      row.descripcion || '',
  };
}

function toDB_org(item) {
  return {
    id:                   item.id,
    nombre:               item.nombre,
    pais_id:              item.paisId || item.pais_id || '',
    ciudad_id:            item.ciudadId || item.ciudad_id || null,
    tipo:                 item.tipo || '',
    contacto:             item.contacto || '',
    email_org:            item.email || item.email_org || '',
    telefono:             item.telefono || '',
    servicios:            item.servicios || [],
    total_atendidos:      item.totalAtendidos || 0,
    recomendaciones_count: item.recomendaciones || 0,
    activa:               item.activa !== false,
    descripcion:          item.descripcion || '',
  };
}

// ─── TRANSFORMADOR: migrantes DB → AppState ───────────────────

function fromDB_migrante(row, rutaRows = [], grupoRows = []) {
  return {
    id:               row.id,
    // Identidad del adulto acompañante (usado como identidad principal en listas)
    nombres:          row.adulto_nombres  || row.nino_nombres  || '',
    apellidos:        row.adulto_apellidos || row.nino_apellidos || '',
    // Datos del niño — dobles alias: clave usada en dashboard + clave usada en formulario edit
    ninoNombres:      row.nino_nombres    || '',
    ninoApellidos:    row.nino_apellidos  || '',
    fechaNacimiento:      row.nino_fecha_nacimiento || null,  // dashboard / age calc
    ninoFechaNacimiento:  row.nino_fecha_nacimiento || null,  // formulario edit
    ninoGeneroId:     row.nino_genero_id  || null,
    ninoIdiomaId:     row.nino_idioma_id  || null,
    ninoNivelEducacionId:  row.nino_nivel_educacion_id  || null,
    ninoPaisNacimientoId:  row.nino_pais_nacimiento_id  || null,
    ninoMunicipio:    row.nino_municipio  || '',
    ninoFechaUltimoNivel:  row.nino_fecha_ultimo_nivel  || null,
    ninoAsistenciaTrayectoria: row.nino_asistencia_trayectoria || '',
    ninoDiscapacidades: row.nino_discapacidades || '',
    ninoVacunas:      row.nino_vacunas    || '',
    ninoMedicacion:   row.nino_medicacion || '',
    // Datos del adulto
    adultoNombres:    row.adulto_nombres  || '',
    adultoApellidos:  row.adulto_apellidos || '',
    adultoDireccion:  row.adulto_direccion || '',
    adultoEmail:      row.adulto_email    || '',
    email:            row.adulto_email    || '',   // alias para listado
    adultoCiudadId:   row.adulto_ciudad_id || null,
    adultoPaisId:     row.adulto_pais_id  || null,
    adultoTelefono:   row.adulto_telefono || '',
    adultoResidencia: row.adulto_residencia || '',
    // Booleanos → 'si'/'no' para que los radio buttons funcionen al editar
    adultoPermisoResidencia: row.adulto_permiso_residencia === true ? 'si' : row.adulto_permiso_residencia === false ? 'no' : '',
    adultoCustodia:   row.adulto_custodia   === true ? 'si' : row.adulto_custodia   === false ? 'no' : '',
    adultoPermisoTrabajo: row.adulto_permiso_trabajo === true ? 'si' : row.adulto_permiso_trabajo === false ? 'no' : '',
    // Catálogos — dobles alias: clave corta (para dashboard) + clave completa (para formulario edit)
    generoId:            row.adulto_genero_id        || null,  // dashboard/stats
    adultoGeneroId:      row.adulto_genero_id        || null,  // formulario edit
    nacionalidadId:      row.adulto_nacionalidad_id  || null,  // dashboard/stats
    adultoNacionalidadId: row.adulto_nacionalidad_id || null,  // formulario edit
    nexoId:              row.adulto_nexo_id          || null,  // dashboard/stats
    adultoNexoId:        row.adulto_nexo_id          || null,  // formulario edit
    adultoRazonId:       row.adulto_razon_emigracion_id || null,
    // Ruta
    paisOrigenId:        row.procedencia_pais_id     || null,
    procedenciaPaisId:   row.procedencia_pais_id     || null,  // formulario edit
    destinoFinalPaisId:  row.destino_final_pais_id   || null,
    // Posición actual = última parada de la ruta, o país de entrevista
    paisActualId:     rutaRows.length > 0
                        ? rutaRows[rutaRows.length - 1].pais_id
                        : row.pais_entrevista_id || null,
    ciudadActualId:   rutaRows.length > 0
                        ? rutaRows[rutaRows.length - 1].ciudad_id
                        : row.ciudad_entrevista_id || null,
    orgActualId:      rutaRows.length > 0
                        ? rutaRows[rutaRows.length - 1].org_id
                        : row.org_id || null,
    // Entrevista
    orgId:            row.org_id          || null,
    paisEntrevistaId: row.pais_entrevista_id || null,
    ciudadEntrevistaId: row.ciudad_entrevista_id || null,
    municipioEntrevista: row.municipio_entrevista || '',
    // fechaEntrevista: timestamptz → solo la parte YYYY-MM-DD para el input date
    fechaEntrevista:  row.fecha_entrevista ? row.fecha_entrevista.substring(0, 10) : '',
    // consentimiento booleano → 'si'/'no'
    consentimiento:   row.consentimiento === true ? 'si' : row.consentimiento === false ? 'no' : '',
    // Económico — dobles alias
    ingresosId:            row.generacion_ingresos_id || null,  // dashboard/stats
    generacionIngresosId:  row.generacion_ingresos_id || null,  // formulario edit
    // Recomendaciones
    recUltimoCentro:  row.rec_ultimo_centro || '',
    recSiguientePuesto: row.rec_siguiente_puesto || '',
    recFamilia:       row.rec_familia || '',
    // Estado
    estado:           row.estado        || 'en_transito',
    vulnerabilidad:   row.vulnerabilidad || 'media',
    notas:            row.notas         || '',
    fechaRegistro:    row.fecha_registro || row.created_at?.substring(0,10) || null,
    // Ruta migratoria
    ruta: rutaRows.map(r => ({
      fecha:     r.fecha,
      paisId:    r.pais_id,
      ciudadId:  r.ciudad_id,
      orgId:     r.org_id,
      servicios: r.servicios || [],
      obs:       r.observaciones || '',
    })),
    // Grupo con que viaja
    grupoViaje: grupoRows.map(g => ({
      nombre:          g.acompanante_nombre || '',
      generoId:        g.genero_id          || '',
      nexoId:          g.nexo_id            || '',
      fechaNacimiento: g.fecha_nacimiento   || '',
      edad:            g.edad               || null,
    })),
  };
}

// ─── HELPER: FETCH PAGINADO (supera el límite de 1000 de PostgREST) ──

async function fetchAllRows(table, selectStr = '*', orderCol = null, ascending = true) {
  const PAGE = 1000;
  let all = [];
  let from = 0;
  while (true) {
    let q = supabaseClient.from(table).select(selectStr).range(from, from + PAGE - 1);
    if (orderCol) q = q.order(orderCol, { ascending });
    const { data, error } = await q;
    if (error) throw error;
    all = all.concat(data || []);
    if ((data || []).length < PAGE) break;  // última página
    from += PAGE;
  }
  return all;
}

// ─── CARGA DE MIGRANTES DESDE SUPABASE ────────────────────────

async function loadMigrantes() {
  try {
    // Cargar las tres tablas en paralelo, cada una con paginación completa
    const [migRows, rutaRows, grupoRows] = await Promise.all([
      fetchAllRows('migrantes',             '*', 'created_at', false),
      fetchAllRows('migrante_ruta',         '*', 'fecha',      true),
      fetchAllRows('migrante_grupo_viaje',  '*', null,         true),
    ]);

    const rutasByMigrante = {};
    rutaRows.forEach(r => {
      if (!rutasByMigrante[r.migrante_id]) rutasByMigrante[r.migrante_id] = [];
      rutasByMigrante[r.migrante_id].push(r);
    });

    const grupoByMigrante = {};
    grupoRows.forEach(g => {
      if (!grupoByMigrante[g.migrante_id]) grupoByMigrante[g.migrante_id] = [];
      grupoByMigrante[g.migrante_id].push(g);
    });

    const sbMigrantes = migRows.map(row =>
      fromDB_migrante(row, rutasByMigrante[row.id] || [], grupoByMigrante[row.id] || [])
    );

    if (sbMigrantes.length > 0) {
      // Los registros de Supabase reemplazan los mock con el mismo ID
      const sbIds = new Set(sbMigrantes.map(m => m.id));
      const mockFiltrado = (AppState.migrantes || []).filter(m => !sbIds.has(m.id));
      AppState.migrantes = [...sbMigrantes, ...mockFiltrado];
      console.log(`[SB] Migrantes cargados: ${sbMigrantes.length} de Supabase, ${mockFiltrado.length} mock`);
    } else {
      console.log('[SB] Sin migrantes en Supabase, usando datos de demostración');
    }
    return true;
  } catch (err) {
    console.error('[SB] Error cargando migrantes:', err);
    return false;
  }
}

// ─── CARGA DE ESTADÍSTICAS DEL DASHBOARD (LIVE desde RPC) ─────

async function loadDashboardStats() {
  try {
    // Llamar función RPC que calcula KPIs en tiempo real desde las tablas
    const { data, error } = await supabaseClient.rpc('compute_dashboard_stats');

    if (error) throw error;

    if (data) {
      // Mergear KPIs en vivo sobre los datos de mockStats
      // (las distribuciones de gráficas como historico, rangoEdad, nexos, etc.
      //  siguen viniendo de mockData.js ya que no hay columnas para calcularlas)
      AppState.mockStats = {
        ...AppState.mockStats,          // preserva historico, rangoEdad, nexos, etc.
        totalRegistros:     data.totalRegistros,
        ninos:              data.ninos,
        ninas:              data.ninas,
        familias:           data.familias,
        datosPendientes:    data.datosPendientes,
        nnaMultiplesPuntos: data.nnaMultiplesPuntos,
        nnaUnicoPunto:      data.nnaUnicoPunto,
        pctMultiplesPuntos: data.pctMultiplesPuntos,
      };
      console.log('[SB] KPIs en vivo desde RPC. Total registros:', data.totalRegistros);
    }
    return true;
  } catch (err) {
    console.warn('[SB] No se pudo ejecutar RPC compute_dashboard_stats, usando datos locales:', err.message);
    // Silently fallback — AppState.mockStats ya tiene los datos de mockData.js
    return false;
  }
}

// ─── RECARGA DE KPIs (llamar tras guardar un migrante nuevo) ──

async function refreshDashboardStats() {
  const ok = await loadDashboardStats();
  if (ok) {
    // Si el dashboard está visible, refrescar los KPI cards sin recargar toda la vista
    const kpiContainer = document.getElementById('kpi-container');
    if (kpiContainer && typeof renderKPICards === 'function') {
      renderKPICards();
    }
  }
}

// ─── CARGA DE PERFILES / USUARIOS ────────────────────────────

// Transforma la fila que devuelve get_all_profiles() al formato de AppState.usuarios
function fromDB_profile(row) {
  const nombreCompleto = row.nombre_completo || '';
  const partes = nombreCompleto.trim().split(' ');
  return {
    id:              row.id,
    nombres:         partes[0]          || '',
    apellidos:       partes.slice(1).join(' ') || '',
    email:           row.email          || '',
    rol:             row.rol            || 'Operador',
    orgId:           row.organizacion_id || null,
    orgNombre:       row.org_nombre     || '',
    esGlobal:        row.es_global      || false,
    orgIds:          row.orgs_adicionales || [],
    permisos:        row.permisos        || [],
    activo:          row.activo !== false,
    fechaInvitacion: row.invited_at     ? row.invited_at.substring(0, 10) : null,
    ultimoAcceso:    row.last_sign_in_at ? row.last_sign_in_at.substring(0, 10) : null,
  };
}

async function loadProfiles() {
  try {
    const { data, error } = await supabaseClient.rpc('get_all_profiles');
    if (error) throw error;
    if (data && data.length > 0) {
      AppState.usuarios = data.map(fromDB_profile);
      console.log('[SB] Perfiles cargados desde DB:', AppState.usuarios.length);
    } else {
      console.log('[SB] Sin perfiles en DB, usando datos mock de usuarios');
    }
    return true;
  } catch (err) {
    console.warn('[SB] No se pudo cargar profiles (puede que la tabla no exista aún):', err.message);
    return false;
  }
}

// ─── CARGA INICIAL ────────────────────────────────────────────

async function loadAllData() {
  try {
    // Cargar todos los catálogos en paralelo
    const catalogPromises = Object.entries(SB_CATALOG_MAP).map(async ([clave, cfg]) => {
      const { data, error } = await supabaseClient
        .from(cfg.table)
        .select('*')
        .order('id');
      if (error) throw new Error(`Error cargando ${cfg.table}: ${error.message}`);
      AppState.catalogos[clave] = (data || []).map(cfg.transform);
    });

    // Cargar organizaciones
    const orgPromise = (async () => {
      const { data, error } = await supabaseClient
        .from('organizations')
        .select('*')
        .order('id');
      if (error) throw new Error(`Error cargando organizations: ${error.message}`);
      AppState.organizaciones = (data || []).map(fromDB_org);
    })();

    // Cargar dashboard stats y perfiles en paralelo con catálogos
    const statsPromise  = loadDashboardStats();
    const profilePromise = loadProfiles();

    await Promise.all([...catalogPromises, orgPromise, statsPromise, profilePromise]);

    // Cargar migrantes reales (no bloquea si falla)
    await loadMigrantes();

    console.log('[SB] Catálogos cargados:', Object.keys(SB_CATALOG_MAP).join(', '));
    console.log('[SB] Organizaciones:', AppState.organizaciones.length);
    console.log('[SB] Usuarios/Perfiles:', AppState.usuarios?.length);
    console.log('[SB] Migrantes totales:', AppState.migrantes?.length);
    console.log('[SB] mockStats.totalRegistros:', AppState.mockStats?.totalRegistros);
    return true;
  } catch (err) {
    console.error('[SB] Error en loadAllData:', err);
    showToast('Error cargando datos. Usando datos de demostración.', 'warning');
    return false;
  }
}

// ─── CRUD GENÉRICO CATÁLOGOS ──────────────────────────────────

async function catalogCreate(clave, item) {
  const cfg = SB_CATALOG_MAP[clave];
  if (!cfg) throw new Error(`Catálogo desconocido: ${clave}`);
  const { data, error } = await supabaseClient
    .from(cfg.table)
    .insert(cfg.toDB(item))
    .select()
    .single();
  if (error) throw error;
  const newItem = cfg.transform(data);
  AppState.catalogos[clave].push(newItem);
  return newItem;
}

async function catalogUpdate(clave, id, changes) {
  const cfg = SB_CATALOG_MAP[clave];
  if (!cfg) throw new Error(`Catálogo desconocido: ${clave}`);
  const existing = AppState.catalogos[clave].find(x => x.id === id) || {};
  const merged = { ...existing, ...changes, id };
  const { data, error } = await supabaseClient
    .from(cfg.table)
    .update(cfg.toDB(merged))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  const updated = cfg.transform(data);
  const idx = AppState.catalogos[clave].findIndex(x => x.id === id);
  if (idx !== -1) AppState.catalogos[clave][idx] = updated;
  return updated;
}

async function catalogDelete(clave, id) {
  const cfg = SB_CATALOG_MAP[clave];
  if (!cfg) throw new Error(`Catálogo desconocido: ${clave}`);
  const { error } = await supabaseClient
    .from(cfg.table)
    .delete()
    .eq('id', id);
  if (error) throw error;
  AppState.catalogos[clave] = AppState.catalogos[clave].filter(x => x.id !== id);
}

// ─── CRUD ORGANIZACIONES ──────────────────────────────────────

async function orgCreate(item) {
  const { data, error } = await supabaseClient
    .from('organizations')
    .insert(toDB_org(item))
    .select()
    .single();
  if (error) throw error;
  const newOrg = fromDB_org(data);
  AppState.organizaciones.push(newOrg);
  return newOrg;
}

async function orgUpdate(id, changes) {
  const existing = AppState.organizaciones.find(x => x.id === id) || {};
  const merged = { ...existing, ...changes, id };
  const { data, error } = await supabaseClient
    .from('organizations')
    .update(toDB_org(merged))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  const updated = fromDB_org(data);
  const idx = AppState.organizaciones.findIndex(x => x.id === id);
  if (idx !== -1) AppState.organizaciones[idx] = updated;
  return updated;
}

async function orgDelete(id) {
  const { error } = await supabaseClient
    .from('organizations')
    .delete()
    .eq('id', id);
  if (error) throw error;
  AppState.organizaciones = AppState.organizaciones.filter(x => x.id !== id);
}

// ─── HELPERS MODAL CRUD ───────────────────────────────────────

// Mapa de campos editables por catálogo
const CATALOG_FIELDS = {
  paises:             [{ key:'id', label:'Código (2 letras)', type:'text', required:true }, { key:'label', label:'Nombre', type:'text', required:true }, { key:'bandera', label:'Emoji bandera', type:'text' }],
  ciudades:           [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Nombre', type:'text', required:true }, { key:'paisId', label:'País ID', type:'text', required:true }],
  nacionalidades:     [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Nombre', type:'text', required:true }],
  generos:            [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Nombre', type:'text', required:true }],
  idiomas:            [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Nombre', type:'text', required:true }],
  nexos:              [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Nombre', type:'text', required:true }],
  razonesEmigracion:  [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Descripción', type:'text', required:true }],
  tiposServicio:      [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Nombre', type:'text', required:true }, { key:'icono', label:'Emoji icono', type:'text' }, { key:'color', label:'Color HEX', type:'text' }],
  generacionIngresos: [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Nombre', type:'text', required:true }],
  nivelesEducacion:   [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Nombre', type:'text', required:true }],
  materialEducativo:  [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Descripción', type:'text', required:true }, { key:'tipo', label:'Tipo (PDF/Video/Mapa)', type:'text' }, { key:'idioma', label:'Idioma (ES/EN/HT…)', type:'text' }],
  recomendaciones:    [{ key:'id', label:'Código', type:'text', required:true }, { key:'label', label:'Descripción', type:'text', required:true }, { key:'tipo', label:'Tipo', type:'text' }],
};

function showCatalogModal(clave, titulo, item = null) {
  const fields = CATALOG_FIELDS[clave] || [];
  const isEdit = item !== null;
  const modalId = 'catalog-modal-' + Date.now();

  const fieldsHTML = fields.map(f => `
    <div class="form-group" style="margin-bottom:14px;">
      <label style="display:block;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">${f.label}${f.required ? ' *' : ''}</label>
      <input type="${f.type || 'text'}" id="${modalId}-${f.key}" value="${item ? (item[f.key] || '') : ''}"
        ${isEdit && f.key === 'id' ? 'readonly style="background:#F8FAFC;color:#94A3B8;"' : ''}
        style="width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;font-family:inherit;outline:none;"
        onfocus="this.style.borderColor='#2563EB'" onblur="this.style.borderColor='#E2E8F0'"/>
    </div>`).join('');

  const modalHTML = `
    <div id="${modalId}" style="position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.4);backdrop-filter:blur(4px);">
      <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:480px;box-shadow:0 24px 80px rgba(0,0,0,.2);max-height:90vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
          <h3 style="font-size:16px;font-weight:800;color:#1A2B4B;margin:0;">${isEdit ? 'Editar' : 'Nuevo'} — ${titulo}</h3>
          <button onclick="document.getElementById('${modalId}').remove()" style="background:none;border:none;cursor:pointer;font-size:20px;color:#94A3B8;line-height:1;">×</button>
        </div>
        ${fieldsHTML}
        <div style="display:flex;gap:10px;margin-top:24px;">
          <button onclick="document.getElementById('${modalId}').remove()" style="flex:1;padding:11px;border:1.5px solid #E2E8F0;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;font-size:13px;color:#475569;">Cancelar</button>
          <button id="${modalId}-save" onclick="saveCatalogModal('${modalId}','${clave}','${isEdit ? item.id : ''}')" style="flex:2;padding:11px;border:none;border-radius:8px;background:#2563EB;color:#fff;cursor:pointer;font-weight:700;font-size:13px;">${isEdit ? 'Guardar cambios' : 'Crear registro'}</button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById(`${modalId}-${fields[isEdit ? 1 : 0]?.key}`)?.focus();
}

async function saveCatalogModal(modalId, clave, existingId) {
  const fields = CATALOG_FIELDS[clave] || [];
  const btn = document.getElementById(`${modalId}-save`);
  const item = {};
  for (const f of fields) {
    const el = document.getElementById(`${modalId}-${f.key}`);
    item[f.key] = el ? el.value.trim() : '';
  }

  // Validación básica
  const missing = fields.filter(f => f.required && !item[f.key]);
  if (missing.length) {
    showToast(`Completa los campos obligatorios: ${missing.map(f=>f.label).join(', ')}`, 'warning');
    return;
  }

  btn.textContent = 'Guardando…';
  btn.disabled = true;

  try {
    if (existingId) {
      await catalogUpdate(clave, existingId, item);
      showToast('Registro actualizado correctamente', 'success');
    } else {
      await catalogCreate(clave, item);
      showToast('Registro creado correctamente', 'success');
    }
    document.getElementById(modalId).remove();
    navigate(currentRoute); // refrescar la vista
  } catch (err) {
    console.error(err);
    showToast('Error al guardar: ' + (err.message || err), 'error');
    btn.textContent = existingId ? 'Guardar cambios' : 'Crear registro';
    btn.disabled = false;
  }
}

async function deleteCatalogItem(clave, id, titulo) {
  if (!confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) return;
  try {
    await catalogDelete(clave, id);
    showToast('Registro eliminado', 'success');
    navigate(currentRoute);
  } catch (err) {
    console.error(err);
    showToast('Error al eliminar: ' + (err.message || err), 'error');
  }
}
