// ============================================================
// app.js — Vidas en Movimiento
// Router, controles de UI shell, y stub de vistas
// ============================================================

// ─── CONFIGURACIÓN DEL ROUTER ────────────────────────────────

const ROUTE_LABELS = {
  '/migrante/nuevo':             ['Migrantes', 'Registrar Migrante'],
  '/migrantes/dashboard':        ['Migrantes', 'Dashboard'],
  '/migrantes/listado':          ['Migrantes', 'Listado'],
  '/migrantes/mapa':             ['Migrantes', 'Mapa de Rutas'],
  '/datos/paises':               ['Parámetros', 'Países'],
  '/datos/ciudades':             ['Parámetros', 'Ciudades'],
  '/datos/nacionalidades':       ['Parámetros', 'Nacionalidad'],
  '/datos/generos':              ['Parámetros', 'Género'],
  '/datos/nexos':                ['Parámetros', 'Nexo'],
  '/datos/idiomas':              ['Parámetros', 'Idiomas'],
  '/datos/ingresos':             ['Parámetros', 'Ingresos'],
  '/datos/servicios':            ['Parámetros', 'Servicios'],
  '/datos/niveles-educacion':    ['Parámetros', 'Niveles de Educación'],
  '/datos/recomendaciones':      ['Parámetros', 'Recomendaciones'],
  '/datos/organizaciones':       ['Parámetros', 'Organizaciones'],
  '/datos/razones':              ['Parámetros', 'Razones para Emigrar'],
  '/datos/material':             ['Parámetros', 'Material Educativo'],
  '/migrante/exportar':          ['Migrantes', 'Exportación'],
  '/seguridad/niveles':               ['Seguridad', 'Niveles de Acceso'],
  '/seguridad/claves':                ['Seguridad', 'Gestión de Claves'],
  '/migrante/detalle':                ['Migrantes', 'Detalle del Migrante'],
  '/configuracion/usuarios':          ['Configuración', 'Gestión de Usuarios'],
  '/configuracion/usuario/nuevo':     ['Configuración', 'Nuevo Usuario'],
  '/configuracion/mi-perfil':         ['Configuración', 'Mi Perfil'],
};

// ─── PERMISOS POR SECCIÓN ────────────────────────────────────

// Permisos por defecto según rol (cuando profiles.permisos está vacío)
const PERMISOS_DEFAULT_ROL = {
  'Administrador':  ['migrantes', 'parametros', 'seguridad', 'configuracion'],
  'Administradora': ['migrantes', 'parametros', 'seguridad', 'configuracion'],
  'Director':       ['migrantes', 'parametros', 'seguridad', 'configuracion'],
  'Directora':      ['migrantes', 'parametros', 'seguridad', 'configuracion'],
  'Coordinador':    ['migrantes', 'parametros'],
  'Coordinadora':   ['migrantes', 'parametros'],
  'Operador':       ['migrantes'],
  'Operadora':      ['migrantes'],
};

// Mapeo ruta → sección (null = siempre permitida)
function rutaASeccion(route) {
  if (route === '/configuracion/mi-perfil') return null;
  if (route.startsWith('/migrante') || route.startsWith('/migrantes') || route.startsWith('/consulta')) return 'migrantes';
  if (route.startsWith('/datos')) return 'parametros';
  if (route.startsWith('/seguridad')) return 'seguridad';
  if (route.startsWith('/configuracion')) return 'configuracion';
  return null;
}

function getPermisosUsuario(cu) {
  if (!cu) return [];
  if (cu.esGlobal) return ['migrantes', 'parametros', 'seguridad', 'configuracion'];
  const explícitos = cu.permisos || [];
  return explícitos.length > 0 ? explícitos : (PERMISOS_DEFAULT_ROL[cu.rol] || ['migrantes']);
}

function puedeVerSeccion(seccion) {
  const cu = AppState.currentUser;
  if (!cu) return false;
  return getPermisosUsuario(cu).includes(seccion);
}

// Muestra/oculta grupos del sidebar según permisos del usuario activo
function applyPermissionsToSidebar() {
  const cu = AppState.currentUser;
  if (!cu) return;
  const permisos = getPermisosUsuario(cu);
  const grupos = ['migrantes', 'parametros', 'seguridad', 'configuracion'];
  grupos.forEach(grupo => {
    const header = document.querySelector(`.nav-group-header[data-group="${grupo}"]`);
    const items  = document.getElementById(`group-${grupo}`);
    const groupEl = header?.closest('.nav-group');
    if (groupEl) groupEl.style.display = permisos.includes(grupo) ? '' : 'none';
  });
}

// Ruta actual
let currentRoute = '/migrantes/dashboard';
let currentMapInstance = null; // para destruir mapas Leaflet antes de remontar

// ─── ROUTER PRINCIPAL ────────────────────────────────────────

function navigate(route, params = {}) {
  currentRoute = route;

  // Destruir mapa anterior si existe
  if (currentMapInstance) {
    currentMapInstance.remove();
    currentMapInstance = null;
  }

  updateSidebarActive(route);
  updateBreadcrumb(route);
  closeMobileSidebar();

  const content = document.getElementById('main-content');
  content.innerHTML = '';

  // ── Verificar permisos ──────────────────────────────────────
  const seccion = rutaASeccion(route);
  if (seccion && !puedeVerSeccion(seccion)) {
    content.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:40px;">
        <div style="font-size:56px;margin-bottom:20px;">🔒</div>
        <h2 style="font-size:22px;font-weight:800;color:#1A2B4B;margin:0 0 10px;">Acceso restringido</h2>
        <p style="font-size:14px;color:#64748B;max-width:380px;margin:0 0 24px;">
          No tienes permiso para acceder a esta sección. Contacta al administrador para solicitar acceso.
        </p>
        <button class="btn btn-primary btn-sm" onclick="navigate('/migrantes/dashboard')">← Ir al Dashboard</button>
      </div>`;
    return;
  }

  // Dispatch a vista
  if (route === '/migrante/nuevo')          return viewMigranteNuevo(content, params);
  if (route === '/migrante/listado')        return viewMigranteListado(content, params);
  if (route.startsWith('/migrante/detalle')) return viewMigranteDetalle(content, params);
  if (route === '/migrante/exportar')       return viewExportacion(content, params);

  if (route === '/migrantes/dashboard')     return viewDashboard(content);
  if (route === '/migrantes/listado')       return viewMigranteListado(content, params);
  if (route === '/migrantes/mapa')          return viewMapaMigrantes(content);

  if (route.startsWith('/datos/'))          return viewCatalogo(content, route, params);

  if (route === '/seguridad/niveles')       return viewSeguridad(content, 'niveles');
  if (route === '/seguridad/claves')        return viewSeguridad(content, 'claves');

  if (route === '/configuracion/usuarios')        return viewUsuarios(content);
  if (route === '/configuracion/usuario/nuevo')   return viewUsuarioForm(content, params);
  if (route === '/configuracion/mi-perfil')       return viewMiPerfil(content);

  if (route === '/consulta/dashboard')          return viewDashboard(content);
  if (route === '/consulta/mapa')               return viewMapaRutas(content);
  if (route === '/consulta/mapa-migrantes')     return viewMapaMigrantes(content);
  if (route === '/consulta/organizaciones')     return viewConsultaOrgs(content);
  if (route === '/consulta/orgs-recomendaciones') return viewOrgsRecomendaciones(content);
  if (route === '/consulta/orgs-ciudades')      return viewOrgsCiudades(content);
  if (route === '/consulta/origen-detallado')   return viewOrigenDetallado(content);
  if (route === '/consulta/origen-org')         return viewOrigenXOrg(content);
  if (route === '/consulta/estadisticas')       return viewEstadisticas(content);

  // Fallback
  content.innerHTML = `<div class="empty-state"><div class="empty-icon">🚧</div><h3>Vista en construcción</h3><p>Esta sección estará disponible próximamente.</p></div>`;
}

// ─── CONTROLES DEL SHELL ─────────────────────────────────────

function updateSidebarActive(route) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route);
  });
}

function updateBreadcrumb(route) {
  const labels = ROUTE_LABELS[route] || ['', route];
  const el = document.getElementById('breadcrumb');
  el.innerHTML = `
    <span>${labels[0] || 'Inicio'}</span>
    <span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-current">${labels[1]}</span>
  `;
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ─── TOAST ───────────────────────────────────────────────────

function showToast(msg, tipo = 'success', duracion = 3200) {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.innerHTML = `<span class="toast-icon">${icons[tipo]}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('exiting');
    setTimeout(() => t.remove(), 260);
  }, duracion);
}

// ─── MODAL ───────────────────────────────────────────────────

function showModal({ titulo, body, acciones = [], size = '' }) {
  const existing = document.getElementById('app-modal');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = `modal-backdrop open`;
  backdrop.id = 'app-modal';
  backdrop.innerHTML = `
    <div class="modal ${size}" role="dialog" aria-modal="true">
      <div class="modal-header">
        <span class="modal-title">${titulo}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">${body}</div>
      ${acciones.length ? `<div class="modal-footer">${acciones.join('')}</div>` : ''}
    </div>
  `;
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.body.appendChild(backdrop);
}

function closeModal() {
  const m = document.getElementById('app-modal');
  if (m) {
    m.classList.remove('open');
    setTimeout(() => m.remove(), 200);
  }
}

// ─── SKELETON LOADER ─────────────────────────────────────────

function showLoader(container) {
  container.innerHTML = `
    <div style="display:grid;gap:16px;margin-top:8px;">
      ${Array(3).fill(0).map(() => `
        <div class="skeleton-card">
          <div class="skeleton skeleton-title" style="width:45%"></div>
          <div class="skeleton skeleton-text" style="width:80%"></div>
          <div class="skeleton skeleton-text" style="width:60%"></div>
        </div>
      `).join('')}
    </div>
  `;
}

function withLoader(container, fn, delay = 500) {
  showLoader(container);
  setTimeout(() => fn(), delay);
}

// ─── HELPERS UI ──────────────────────────────────────────────

function estadoBadge(estado) {
  return `<span class="badge badge-${estado}">${Helpers.estadoLabel(estado)}</span>`;
}

function serviciosBadges(ids) {
  return (ids || []).map(id => {
    const s = AppState.catalogos.tiposServicio.find(x => x.id === id);
    return s ? `<span class="badge badge-gray" style="font-size:10px;">${s.icono} ${s.label}</span>` : '';
  }).join('');
}

function avatarIniciales(nombre) {
  return nombre.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
}

function avatarColor(id) {
  const colors = ['accent','blue','green','purple'];
  const idx = id ? parseInt(id.replace(/\D/g,''), 10) % colors.length : 0;
  return colors[idx];
}

// ─── LOGIN / LOGOUT ──────────────────────────────────────────

function setLoginLoading(loading) {
  const btn = document.getElementById('login-btn');
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Verificando...' : 'Ingresar al sistema';
}

function applyUserToUI(nombres, apellidos, rol, orgNombre) {
  const iniciales = ((nombres[0] || '') + (apellidos[0] || '')).toUpperCase() || '?';
  document.getElementById('sidebar-avatar').textContent = iniciales;
  document.getElementById('sidebar-nombre').textContent = (nombres + ' ' + apellidos).trim();
  document.getElementById('sidebar-org').textContent = rol + ' · ' + orgNombre;
  document.getElementById('header-avatar').textContent = iniciales;
  document.getElementById('header-nombre').textContent = (nombres + ' ' + apellidos).trim();
  document.getElementById('header-rol').textContent = rol;
}

async function doLogin() {
  const email    = document.getElementById('login-usuario').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl  = document.getElementById('login-error');

  if (!email || !password) {
    errorEl.textContent = 'Ingresa tu correo y contraseña.';
    errorEl.classList.add('visible');
    return;
  }

  setLoginLoading(true);
  errorEl.classList.remove('visible');

  try {
    // 1. Autenticar con Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (authError) {
      errorEl.textContent = 'Correo o contraseña incorrectos. Verifica tus credenciales.';
      errorEl.classList.add('visible');
      setLoginLoading(false);
      return;
    }

    // 2. Obtener perfil + organización
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('nombre_completo, rol, organizacion_id, es_global, orgs_adicionales, permisos, organizations(nombre)')
      .eq('id', authData.user.id)
      .single();

    // 3. Construir objeto de usuario
    const nombreCompleto = profile?.nombre_completo || authData.user.email;
    const partes   = nombreCompleto.split(' ');
    const nombres  = partes[0] || '';
    const apellidos = partes.slice(1).join(' ') || '';
    const rol      = profile?.rol || 'Operador';
    const orgNombre = profile?.organizations?.nombre || '';

    AppState.currentUser = {
      id:       authData.user.id,
      email:    authData.user.email,
      nombres,
      apellidos,
      rol,
      orgId:    profile?.organizacion_id || null,
      orgNombre,
      esGlobal: profile?.es_global || false,
      orgIds:   profile?.orgs_adicionales || [],
      permisos: profile?.permisos || [],
    };

    applyUserToUI(nombres, apellidos, rol, orgNombre);
    applyPermissionsToSidebar();
    document.getElementById('login-screen').classList.add('hidden');

    // Cargar catálogos desde Supabase antes de mostrar la app
    showToast('Cargando datos…', 'info');
    await loadAllData();
    navigate('/migrantes/dashboard');

  } catch (err) {
    errorEl.textContent = 'Error de conexión. Intenta de nuevo.';
    errorEl.classList.add('visible');
    setLoginLoading(false);
  }
}

async function doGoogleLogin() {
  const btn = document.getElementById('login-btn-google');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Redirigiendo a Google…'; }

  // redirectTo debe coincidir exactamente con lo configurado en Supabase Auth → Redirect URLs
  const redirectTo = (window.location.origin && window.location.origin !== 'null')
    ? window.location.origin + window.location.pathname
    : 'http://localhost:8080';

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
      errorEl.textContent = 'Error al iniciar con Google: ' + error.message;
      errorEl.classList.add('visible');
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg> Continuar con Google`;
    }
  }
  // Si no hay error, Supabase redirige al navegador a Google automáticamente
}

async function doLogout() {
  await supabaseClient.auth.signOut();
  AppState.currentUser = null;
  document.getElementById('login-usuario').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-screen').classList.remove('hidden');
}

// Restaurar sesión activa al cargar la página
async function checkSession() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('nombre_completo, rol, organizacion_id, es_global, orgs_adicionales, permisos, organizations(nombre)')
      .eq('id', session.user.id)
      .single();

    const nombreCompleto = profile?.nombre_completo || session.user.email;
    const partes   = nombreCompleto.split(' ');
    const nombres  = partes[0] || '';
    const apellidos = partes.slice(1).join(' ') || '';
    const rol      = profile?.rol || 'Operador';
    const orgNombre = profile?.organizations?.nombre || '';

    AppState.currentUser = {
      id:       session.user.id,
      email:    session.user.email,
      nombres,
      apellidos,
      rol,
      orgId:    profile?.organizacion_id || null,
      orgNombre,
      esGlobal: profile?.es_global || false,
      orgIds:   profile?.orgs_adicionales || [],
      permisos: profile?.permisos || [],
    };

    applyUserToUI(nombres, apellidos, rol, orgNombre);
    applyPermissionsToSidebar();
    document.getElementById('login-screen').classList.add('hidden');
    await loadAllData();
    navigate('/migrantes/dashboard');
  } catch (_) {
    // Sin sesión activa, mostrar pantalla de login
  }
}

// ─── VISTA: DASHBOARD GENERAL ────────────────────────────────

function viewDashboard(container) {
  withLoader(container, () => {
    const ms = AppState.mockStats;
    // Escalar KPIs según migrantes visibles para este usuario
    const _visRatio = AppState.migrantes.length > 0 ? getVisibleMigrantes().length / AppState.migrantes.length : 1;
    const totalReg      = Math.round(ms.totalRegistros    * _visRatio);
    const ninos         = Math.round(ms.ninos             * _visRatio);
    const ninas         = Math.round(ms.ninas             * _visRatio);
    const familias      = Math.round(ms.familias          * _visRatio);
    const datosPend     = Math.round(ms.datosPendientes   * _visRatio);
    const pctDuplicados = ms.pctDuplicados;
    const pctNinos      = totalReg > 0 ? ((ninos / totalReg) * 100).toFixed(1) : '0.0';
    const pctNinas      = totalReg > 0 ? ((ninas / totalReg) * 100).toFixed(1) : '0.0';

    function barRow(label, pct, color) {
      return `<div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
          <span style="color:#374151;font-weight:500;">${label}</span>
          <span style="font-weight:700;color:#1A2B4B;">${pct}%</span>
        </div>
        <div style="background:#F1F5F9;border-radius:20px;height:7px;overflow:hidden;">
          <div style="background:${color};height:100%;width:${pct}%;border-radius:20px;transition:width .5s;"></div>
        </div>
      </div>`;
    }

    function siNoCard(titulo, si, no) {
      return `<div class="card" style="text-align:center;">
        <div style="font-size:12px;font-weight:700;color:#475569;margin-bottom:10px;text-transform:uppercase;letter-spacing:.4px;">${titulo}</div>
        <div style="display:flex;gap:8px;">
          <div style="flex:1;background:#F0FDF4;border-radius:10px;padding:10px 6px;">
            <div style="font-size:22px;font-weight:800;color:#16A34A;">${si}%</div>
            <div style="font-size:11px;color:#64748B;font-weight:600;">SÍ</div>
          </div>
          <div style="flex:1;background:#FEF2F2;border-radius:10px;padding:10px 6px;">
            <div style="font-size:22px;font-weight:800;color:#DC2626;">${no}%</div>
            <div style="font-size:11px;color:#64748B;font-weight:600;">NO</div>
          </div>
        </div>
      </div>`;
    }

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard General</h1>
          <p class="page-subtitle">Corte: Abril 2026 — Plataforma actualizada</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" onclick="showToast('Reporte exportado','success')">⬇ Exportar</button>
          <button class="btn btn-primary btn-sm" onclick="navigate('/migrante/nuevo')">+ Registrar</button>
        </div>
      </div>

      <!-- FILTROS -->
      <div class="card" style="margin-bottom:20px;padding:14px 20px;">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <span style="font-size:13px;font-weight:600;color:#475569;">Filtros:</span>
          <select id="db-f-pais" class="form-control" style="width:auto;min-width:150px;" onchange="const sc=document.getElementById('db-f-ciudad');if(sc)sc.value='';actualizarDashboard()">
            <option value="">Todos los países</option>
            ${AppState.catalogos.paises.map(p=>`<option value="${p.id}">${p.bandera} ${p.label}</option>`).join('')}
          </select>
          <select id="db-f-ciudad" class="form-control" style="width:auto;min-width:160px;" onchange="actualizarDashboard()">
            <option value="">Todas las ciudades</option>
            ${AppState.catalogos.ciudades.map(c=>`<option value="${c.id}">${c.label}</option>`).join('')}
          </select>
          <select id="db-f-ong" class="form-control" style="width:auto;min-width:210px;" onchange="actualizarDashboard()">
            <option value="">Todas las ONGs</option>
            ${AppState.organizaciones.map(o=>`<option value="${o.id}">${o.nombre}</option>`).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" onclick="limpiarFiltrosDashboard()">✕ Limpiar</button>
          <span id="db-filtro-tag" style="display:none;background:#EFF6FF;color:#2563EB;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px solid #BFDBFE;"></span>
        </div>
      </div>

      <!-- KPIs: 6 tarjetas (IDs para actualización dinámica) -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:20px;" id="db-kpi-grid">
        <div class="kpi-card">
          <div class="kpi-body">
            <div class="kpi-label">Total Registros</div>
            <div class="kpi-value" id="kpi-total">${totalReg.toLocaleString('es')}</div>
            <div class="kpi-sub" id="kpi-total-sub"><span class="kpi-delta-up">↑ +2.4%</span> vs mes anterior</div>
          </div>
          <div class="kpi-icon orange">👥</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-body">
            <div class="kpi-label">Niños (M)</div>
            <div class="kpi-value" id="kpi-ninos">${ninos.toLocaleString('es')}</div>
            <div class="kpi-sub" id="kpi-ninos-pct"><span style="background:#DBEAFE;color:#1D4ED8;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">${pctNinos}%</span></div>
          </div>
          <div class="kpi-icon blue">♂</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-body">
            <div class="kpi-label">Niñas (F)</div>
            <div class="kpi-value" id="kpi-ninas">${ninas.toLocaleString('es')}</div>
            <div class="kpi-sub" id="kpi-ninas-pct"><span style="background:#FCE7F3;color:#BE185D;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">${pctNinas}%</span></div>
          </div>
          <div class="kpi-icon purple">♀</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-body">
            <div class="kpi-label"># Familias</div>
            <div class="kpi-value" id="kpi-familias">${familias.toLocaleString('es')}</div>
            <div class="kpi-sub" id="kpi-familias-sub">${Math.round(familias/totalReg*100)}% del total</div>
          </div>
          <div class="kpi-icon green">🏠</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-body">
            <div class="kpi-label">Datos Pendientes</div>
            <div class="kpi-value" id="kpi-pendientes">${datosPend}</div>
            <div class="kpi-sub">Requieren completar</div>
          </div>
          <div class="kpi-icon yellow">⚠️</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-body">
            <div class="kpi-label">Trazabilidad</div>
            <div class="kpi-value" id="kpi-trazabilidad">${ms.pctMultiplesPuntos}%</div>
            <div class="kpi-sub">+ de un punto de atención</div>
          </div>
          <div class="kpi-icon green" style="background:#F0FDF4;color:#16A34A;">↺</div>
        </div>
      </div>

      <!-- BANNER TRAZABILIDAD -->
      <div id="trazabilidad-banner" style="background:linear-gradient(135deg,#0D1B36 0%,#1e3a8a 100%);border-radius:14px;padding:20px 24px;margin-bottom:20px;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#93C5FD;margin-bottom:6px;">Impacto de red — Trazabilidad de trayectorias</div>
          <div id="trazabilidad-banner-texto" style="font-size:15px;font-weight:600;color:#fff;line-height:1.4;">
            <span style="color:#FCD34D;font-weight:800;">${(ms.nnaMultiplesPuntos||2917).toLocaleString('es')} NNA</span> acompañados en más de un punto de atención &nbsp;·&nbsp;
            <span style="color:#86EFAC;font-weight:800;">${(ms.nnaUnicoPunto||1945).toLocaleString('es')} NNA</span> en un solo punto
          </div>
          <div style="font-size:12px;color:#94A3B8;margin-top:5px;">
            <span style="color:#C4B5FD;font-weight:700;">${(ms.atencionesCumuladas||7779).toLocaleString('es')} atenciones acumuladas</span>
            &nbsp;·&nbsp;
            <span style="color:#A5F3FC;font-weight:700;">${ms.femVsOtras?.fem||85}% atendidos por FEM</span>
            &nbsp;·&nbsp;
            <span style="font-style:italic;">"Vidas en Movimiento acompaña trayectorias, no solo registra casos"</span>
          </div>
        </div>
        <div style="display:flex;gap:16px;flex-shrink:0;">
          <div style="text-align:center;">
            <div id="trazabilidad-pct-multi" style="font-size:30px;font-weight:800;color:#FCD34D;line-height:1;">${ms.pctMultiplesPuntos||60}%</div>
            <div style="font-size:10px;color:#93C5FD;font-weight:600;margin-top:2px;">Múltiples<br>puntos</div>
          </div>
          <div style="width:1px;background:rgba(255,255,255,.15);"></div>
          <div style="text-align:center;">
            <div style="font-size:30px;font-weight:800;color:#C4B5FD;line-height:1;">${(ms.atencionesCumuladas||7779).toLocaleString('es')}</div>
            <div style="font-size:10px;color:#93C5FD;font-weight:600;margin-top:2px;">Atenciones<br>acum.</div>
          </div>
          <div style="width:1px;background:rgba(255,255,255,.15);"></div>
          <div style="text-align:center;">
            <div style="font-size:30px;font-weight:800;color:#A5F3FC;line-height:1;">${ms.femVsOtras?.fem||85}%</div>
            <div style="font-size:10px;color:#93C5FD;font-weight:600;margin-top:2px;">Red<br>FEM</div>
          </div>
        </div>
      </div>

      <!-- GRÁFICO CRECIMIENTO + VARIACIÓN -->
      <div class="card" style="margin-bottom:20px;">
        <div class="card-header">
          <div>
            <div class="card-title">Crecimiento y Variación de Registros</div>
            <div class="card-subtitle">Comparación por período — Corte: Abril 2026</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="btn-mensual" class="btn btn-sm" style="background:#EFF6FF;color:#2563EB;border:1.5px solid #BFDBFE;font-weight:700;" onclick="cambiarPeriodoCrecimiento('mensual')">Mensual</button>
            <button id="btn-semestral" class="btn btn-sm btn-secondary" onclick="cambiarPeriodoCrecimiento('semestral')">Semestral</button>
            <button id="btn-anual" class="btn btn-sm btn-secondary" onclick="cambiarPeriodoCrecimiento('anual')">Anual</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 200px;gap:20px;align-items:center;padding:4px 0 8px;">
          <div style="height:200px;"><canvas id="chart-crecimiento"></canvas></div>
          <div id="variacion-card" style="text-align:center;background:#F0FDF4;border-radius:12px;padding:20px 16px;border:1.5px solid #BBF7D0;">
            <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">vs Marzo 2026</div>
            <div style="font-size:38px;font-weight:800;color:#16A34A;line-height:1.1;margin:6px 0;">+1.4%</div>
            <div style="font-size:13px;color:#374151;font-weight:600;">4,862 <span style="color:#94A3B8;font-size:11px;">vs</span> 4,796</div>
            <div style="font-size:11px;color:#94A3B8;margin-top:3px;">+66 registros</div>
          </div>
        </div>
      </div>

      <!-- GRILLA 2 COL: Rango edad niños / adultos + nexos / nivel edu -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div class="card">
          <div class="card-header"><div class="card-title">Rango de Edad — Menores</div></div>
          ${ms.rangoEdadNinos.map(r=>{const t=ms.rangoEdadNinos.reduce((a,x)=>a+x.total,0);return barRow(r.label+' &nbsp;<span style="font-size:11px;color:#94A3B8;">'+r.total.toLocaleString('es')+'</span>',Math.round(r.total/t*100),'linear-gradient(90deg,#3B82F6,#60A5FA)');}).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Rango de Edad — Adultos</div></div>
          ${ms.rangoEdadAdultos.map(r=>{const t=ms.rangoEdadAdultos.reduce((a,x)=>a+x.total,0);return barRow(r.label+' &nbsp;<span style="font-size:11px;color:#94A3B8;">'+r.total.toLocaleString('es')+'</span>',Math.round(r.total/t*100),'linear-gradient(90deg,#8B5CF6,#A78BFA)');}).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Nexos de Llegada</div></div>
          ${ms.nexos.map(n=>barRow(n.label,n.pct,'#F59E0B')).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Nivel Educativo</div></div>
          ${ms.nivelEducativo.map(n=>barRow(n.label,n.pct,'#10B981')).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Razones de Migración</div></div>
          ${ms.razonesTop.map(r=>barRow(r.label,r.pct,'#2563EB')).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Tipo de Ingresos</div></div>
          ${ms.tipoIngresos.map(t=>barRow(t.label,t.pct,'#14B8A6')).join('')}
        </div>
      </div>

      <!-- SERVICIOS + RECOMENDACIONES (2 col) -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Servicios Prestados</div>
            <button class="btn btn-secondary btn-sm" onclick="navigate('/datos/servicios')">Ver catálogo →</button>
          </div>
          ${ms.serviciosTop.map(s=>`
            <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #F1F5F9;">
              <span style="font-size:18px;width:24px;text-align:center;flex-shrink:0;">${s.icono}</span>
              <div style="flex:1;min-width:0;">
                <div style="font-size:12px;font-weight:600;color:#1A2B4B;margin-bottom:3px;">${s.label}</div>
                <div style="background:#F1F5F9;border-radius:20px;height:5px;overflow:hidden;">
                  <div style="background:#2563EB;height:100%;width:${s.pct}%;border-radius:20px;transition:width .4s;"></div>
                </div>
              </div>
              <div style="text-align:right;flex-shrink:0;min-width:64px;">
                <div style="font-size:12px;font-weight:700;color:#2563EB;">${s.pct}%</div>
                <div style="font-size:10px;color:#94A3B8;">${s.total.toLocaleString('es')}</div>
              </div>
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">Recomendaciones Frecuentes</div>
            <button class="btn btn-secondary btn-sm" onclick="navigate('/datos/recomendaciones')">Ver catálogo →</button>
          </div>
          ${(()=>{
            const TIPO_COLOR = {
              'Operativa':'#6366F1','Salud':'#EF4444','Legal':'#F59E0B',
              'Protección':'#8B5CF6','Humanitaria':'#14B8A6','Alojamiento':'#3B82F6',
              'Salud Mental':'#EC4899','Educación':'#10B981','Familia':'#F97316','Laboral':'#0EA5E9'
            };
            const maxTotal = ms.recomendacionesTop[0]?.total || 1;
            return ms.recomendacionesTop.map(r=>{
              const color = TIPO_COLOR[r.tipo] || '#64748B';
              const pct   = Math.round(r.total / maxTotal * 100);
              return `<div style="display:flex;align-items:flex-start;gap:10px;padding:7px 0;border-bottom:1px solid #F1F5F9;">
                <span style="display:inline-block;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700;color:#fff;background:${color};flex-shrink:0;margin-top:2px;">${r.tipo}</span>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:12px;font-weight:600;color:#1A2B4B;margin-bottom:3px;line-height:1.3;">${r.label}</div>
                  <div style="background:#F1F5F9;border-radius:20px;height:5px;overflow:hidden;">
                    <div style="background:${color};height:100%;width:${pct}%;border-radius:20px;transition:width .4s;"></div>
                  </div>
                </div>
                <div style="text-align:right;flex-shrink:0;min-width:52px;">
                  <div style="font-size:12px;font-weight:700;color:${color};">${r.total.toLocaleString('es')}</div>
                  <div style="font-size:10px;color:#94A3B8;">aplicadas</div>
                </div>
              </div>`;
            }).join('');
          })()}
        </div>
      </div>

      <!-- INDICADORES SÍ/NO (4 col) -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px;">
        ${siNoCard('Permiso Trabajo',ms.permisosTrabajo.si,ms.permisosTrabajo.no)}
        ${siNoCard('Permanencia',ms.permanencia.si,ms.permanencia.no)}
        ${siNoCard('Intención Reunif.',ms.intencionReuniSI,100-ms.intencionReuniSI)}
        ${siNoCard('Sistema Escolar',ms.sistEscolarSI,100-ms.sistEscolarSI)}
      </div>

      <!-- GRILLA 2 COL: País destino / residencia + plataformas / ONGs -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div class="card">
          <div class="card-header"><div class="card-title">País Destino</div></div>
          ${ms.paisDestino.map(p=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #F1F5F9;">
            <span style="font-size:13px;">${p.bandera} ${p.label}</span>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="background:#F1F5F9;border-radius:20px;height:6px;width:72px;overflow:hidden;">
                <div style="background:#2563EB;height:100%;width:${p.pct}%;border-radius:20px;"></div>
              </div>
              <span style="font-size:12px;font-weight:700;color:#1A2B4B;min-width:30px;text-align:right;">${p.pct}%</span>
            </div>
          </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">País Residencia Actual</div></div>
          ${ms.paisResidencia.map(p=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #F1F5F9;">
            <span style="font-size:13px;">${p.bandera} ${p.label}</span>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="background:#F1F5F9;border-radius:20px;height:6px;width:72px;overflow:hidden;">
                <div style="background:#8B5CF6;height:100%;width:${p.pct}%;border-radius:20px;"></div>
              </div>
              <span style="font-size:12px;font-weight:700;color:#1A2B4B;min-width:30px;text-align:right;">${p.pct}%</span>
            </div>
          </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Plataformas Digitales</div></div>
          ${ms.plataformasDigitales.map(p=>barRow(p.label,p.pct,'#F59E0B')).join('')}
        </div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">ONGs — Recomendaciones</div>
            <button class="btn btn-secondary btn-sm" onclick="navigate('/datos/organizaciones')">Ver todas →</button>
          </div>
          ${AppState.organizaciones.sort((a,b)=>b.recomendaciones-a.recomendaciones).slice(0,5).map((o,i)=>{
            const p=Helpers.paisById(o.paisId);
            return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #F1F5F9;">
              <div style="width:20px;height:20px;background:#EFF6FF;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#2563EB;flex-shrink:0;">${i+1}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:12px;font-weight:600;color:#1A2B4B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${o.nombre}</div>
                <div style="font-size:11px;color:#94A3B8;">${p?.bandera||''} ${p?.label||''}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div style="font-size:13px;font-weight:700;color:#F59E0B;">★ ${o.recomendaciones}</div>
                <div style="font-size:10px;color:#94A3B8;">${o.totalAtendidos.toLocaleString()} atend.</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;

    // ── Gráfico crecimiento (line chart, período mensual por defecto)
    if (window._chartCrec) { window._chartCrec.destroy(); window._chartCrec = null; }
    const hist = ms.historico.slice(-3); // default: mensual (3 meses)
    const ctx = document.getElementById('chart-crecimiento');
    if (ctx) {
      window._chartCrec = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
          labels: hist.map(h=>h.label),
          datasets: [{
            label: 'Registros',
            data: hist.map(h=>h.total),
            borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.08)',
            fill: true, tension: 0.4,
            pointBackgroundColor: hist.map((_,i)=>i===hist.length-1?'#2563EB':'#fff'),
            pointBorderColor: '#2563EB', pointRadius: hist.map((_,i)=>i===hist.length-1?7:4), pointBorderWidth: 2,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { min: 4300, max: 4950, grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, callback: v=>v.toLocaleString('es') } }
          }
        }
      });
    }
  });
}

function cambiarPeriodoCrecimiento(periodo) {
  const ms = AppState.mockStats;
  const comp = ms.comparacion[periodo];
  ['mensual','semestral','anual'].forEach(p => {
    const btn = document.getElementById('btn-'+p);
    if (!btn) return;
    if (p === periodo) {
      btn.style.cssText = 'background:#EFF6FF;color:#2563EB;border:1.5px solid #BFDBFE;font-weight:700;';
      btn.className = 'btn btn-sm';
    } else {
      btn.style.cssText = '';
      btn.className = 'btn btn-sm btn-secondary';
    }
  });
  const vc = document.getElementById('variacion-card');
  if (vc && comp) {
    const diff = ms.totalRegistros - comp.valor;
    vc.innerHTML = `
      <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">vs ${comp.label}</div>
      <div style="font-size:38px;font-weight:800;color:#16A34A;line-height:1.1;margin:6px 0;">+${comp.pct}%</div>
      <div style="font-size:13px;color:#374151;font-weight:600;">${ms.totalRegistros.toLocaleString('es')} <span style="color:#94A3B8;font-size:11px;">vs</span> ${comp.valor.toLocaleString('es')}</div>
      <div style="font-size:11px;color:#94A3B8;margin-top:3px;">+${diff.toLocaleString('es')} registros</div>`;
  }
  // Update chart data based on period
  if (window._chartCrec) {
    const hist = periodo==='mensual' ? ms.historico.slice(-3) : periodo==='semestral' ? ms.historico.slice(-7) : ms.historico;
    window._chartCrec.data.labels = hist.map(h=>h.label);
    window._chartCrec.data.datasets[0].data = hist.map(h=>h.total);
    window._chartCrec.update('active');
  }
}

function actualizarDashboard() {
  const paisId   = document.getElementById('db-f-pais')?.value   || '';
  const ciudadId = document.getElementById('db-f-ciudad')?.value || '';
  const orgId    = document.getElementById('db-f-ong')?.value    || '';
  const ms = AppState.mockStats;

  // Base según permisos del usuario — respeta org-scoping
  const base = getVisibleMigrantes();

  // Filtrar migrantes reales
  let filtrados = base;
  if (paisId)   filtrados = filtrados.filter(m => m.paisActualId   === paisId);
  if (ciudadId) filtrados = filtrados.filter(m => m.ciudadActualId === ciudadId);
  if (orgId)    filtrados = filtrados.filter(m => m.orgActualId    === orgId);

  const isFiltered = !!(paisId || ciudadId || orgId);
  const ratio = base.length > 0 ? filtrados.length / base.length : 1;
  // Ratio global para escalar mockStats desde el total visible
  const baseRatio = AppState.migrantes.length > 0 ? base.length / AppState.migrantes.length : 1;

  // Escalar MOCK_STATS según ratio (siempre escala desde base visible)
  const effectiveRatio = isFiltered ? ratio * baseRatio : baseRatio;
  const t    = Math.round(ms.totalRegistros     * effectiveRatio);
  const ni   = Math.round(ms.ninos              * effectiveRatio);
  const na   = Math.round(ms.ninas              * effectiveRatio);
  const fa   = Math.round(ms.familias           * effectiveRatio);
  const pe   = Math.round(ms.datosPendientes    * effectiveRatio);
  const mult = Math.round(ms.nnaMultiplesPuntos * effectiveRatio);
  const unico= Math.round(ms.nnaUnicoPunto      * effectiveRatio);
  const pctT = ms.pctMultiplesPuntos; // porcentaje fijo 60%

  const pctNi = t > 0 ? ((ni / t) * 100).toFixed(1) : '0.0';
  const pctNa = t > 0 ? ((na / t) * 100).toFixed(1) : '0.0';

  // Actualizar KPIs numéricos
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('kpi-total',        t.toLocaleString('es'));
  set('kpi-ninos',        ni.toLocaleString('es'));
  set('kpi-ninas',        na.toLocaleString('es'));
  set('kpi-familias',     fa.toLocaleString('es'));
  set('kpi-pendientes',   pe.toString());
  set('kpi-trazabilidad', pctT + '%');

  // Actualizar banner de trazabilidad
  const bannerTexto = document.getElementById('trazabilidad-banner-texto');
  if (bannerTexto) {
    bannerTexto.innerHTML = `
      <span style="color:#FCD34D;font-weight:800;">${mult.toLocaleString('es')} NNA</span> acompañados en más de un punto de atención &nbsp;·&nbsp;
      <span style="color:#86EFAC;font-weight:800;">${unico.toLocaleString('es')} NNA</span> en un solo punto`;
  }
  const pctMultiEl = document.getElementById('trazabilidad-pct-multi');
  if (pctMultiEl) pctMultiEl.textContent = pctT + '%';

  // Actualizar badges de porcentaje
  const badgeNi = document.getElementById('kpi-ninos-pct');
  if (badgeNi) badgeNi.innerHTML = `<span style="background:#DBEAFE;color:#1D4ED8;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">${pctNi}%</span>`;
  const badgeNa = document.getElementById('kpi-ninas-pct');
  if (badgeNa) badgeNa.innerHTML = `<span style="background:#FCE7F3;color:#BE185D;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">${pctNa}%</span>`;

  // Tag de filtro activo
  const tag = document.getElementById('db-filtro-tag');
  if (tag) {
    tag.style.display = isFiltered ? 'inline-flex' : 'none';
    if (isFiltered) {
      const parts = [];
      if (paisId)   { const p = AppState.catalogos.paises.find(x => x.id === paisId);    if (p) parts.push(p.label); }
      if (ciudadId) { const c = AppState.catalogos.ciudades.find(x => x.id === ciudadId); if (c) parts.push(c.label); }
      if (orgId)    { const o = AppState.organizaciones.find(x => x.id === orgId);        if (o) parts.push(o.nombre); }
      tag.textContent = parts.join(' · ') + ` — ${t.toLocaleString('es')} registros`;
    }
  }

  // Al cambiar país, filtrar ciudades del selector
  const selCiudad = document.getElementById('db-f-ciudad');
  if (selCiudad) {
    const ciudadesSource = paisId
      ? AppState.catalogos.ciudades.filter(c => c.paisId === paisId)
      : AppState.catalogos.ciudades;
    const currentCity = selCiudad.value;
    selCiudad.innerHTML = `<option value="">Todas las ciudades</option>` +
      ciudadesSource.map(c => `<option value="${c.id}"${c.id === currentCity ? ' selected' : ''}>${c.label}</option>`).join('');
  }
}

function limpiarFiltrosDashboard() {
  ['db-f-pais', 'db-f-ciudad', 'db-f-ong'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  // Restaurar selector de ciudades completo
  const selCiudad = document.getElementById('db-f-ciudad');
  if (selCiudad) {
    selCiudad.innerHTML = `<option value="">Todas las ciudades</option>` +
      AppState.catalogos.ciudades.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
  }
  actualizarDashboard();
}

// ─── VISTA: LISTADO DE MIGRANTES ─────────────────────────────

function viewMigranteListado(container, params = {}) {
  withLoader(container, () => {
    const paises = AppState.catalogos.paises;
    const orgs   = AppState.organizaciones;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Listado de Migrantes</h1>
          <p class="page-subtitle" id="listado-count">Cargando...</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" onclick="showModal({titulo:'Agrupación',body:'<p>Agrupa los registros por País, Ciudad u Organización para análisis agrupado.</p><p style=\\'margin-top:8px;font-size:12px;color:#64748B;\\'>Esta función estará disponible en la versión final.</p>',acciones:['<button class=\\'btn btn-secondary\\' onclick=\\'closeModal()\\'>Cerrar</button>']})">≡ Agrupación</button>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Exportando listado...','success')">⬇ Exportar</button>
          <button class="btn btn-secondary btn-sm" onclick="showModal({titulo:'Tipo de Consulta',body:'<p><strong>Básica:</strong> Campos principales del registro.</p><p><strong>Detallada:</strong> Incluye ruta completa y servicios recibidos.</p><p><strong>Estadística:</strong> Resumen agrupado por indicadores.</p>',acciones:['<button class=\\'btn btn-primary\\' onclick=\\'closeModal()\\'>Aplicar</button>']})">🔍 Tipo Consulta</button>
          <button class="btn btn-secondary btn-sm" onclick="showModal({titulo:'Opciones avanzadas',body:'<p>Columnas visibles, densidad, paginación y otras opciones de visualización.</p>',acciones:['<button class=\\'btn btn-secondary\\' onclick=\\'closeModal()\\'>Cerrar</button>']})">⚙ Opciones</button>
          <button class="btn btn-primary btn-sm" onclick="navigate('/migrante/nuevo')">+ Registrar</button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filter-bar">
        <div class="search-bar" style="flex:1;min-width:200px;max-width:340px;">
          <span class="search-icon">🔍</span>
          <input type="text" id="search-q" placeholder="Buscar por nombre o email..." oninput="aplicarFiltroListado()"/>
        </div>
        <select class="filter-select" id="filter-pais-listado" onchange="aplicarFiltroListado()">
          <option value="">Todos los países</option>
          ${paises.map(p => `<option value="${p.id}">${p.bandera} ${p.label}</option>`).join('')}
        </select>
        <select class="filter-select" id="filter-ciudad-listado" onchange="aplicarFiltroListado()">
          <option value="">Todas las ciudades</option>
        </select>
        <select class="filter-select" id="filter-ong-listado" onchange="aplicarFiltroListado()">
          <option value="">Todas las ONGs</option>
          ${orgs.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('')}
        </select>
        <button class="btn btn-secondary btn-sm" onclick="limpiarFiltrosListado()" style="margin-left:auto;">Limpiar</button>
      </div>

      <!-- Tabla -->
      <div class="table-wrapper" id="listado-tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>#ID</th>
              <th>Email</th>
              <th>Nombre</th>
              <th>Nacionalidad</th>
              <th>País</th>
              <th>Estado</th>
              <th>Vulnerabilidad</th>
              <th>Fecha Registro</th>
              <th style="text-align:right;">Acciones</th>
            </tr>
          </thead>
          <tbody id="listado-tbody"></tbody>
        </table>
        <div id="listado-pagination"></div>
      </div>
    `;

    aplicarFiltroListado();
    // Banner de filtro org activo
    setTimeout(() => renderBannerFiltroOrg(), 50);
  });
}

let _listadoPage = 1;
const POR_PAGINA = 10;

function aplicarFiltroListado() {
  _listadoPage = 1;
  renderListado();
}

function limpiarFiltrosListado() {
  document.getElementById('search-q').value = '';
  document.getElementById('filter-pais-listado').value = '';
  document.getElementById('filter-ciudad-listado').value = '';
  document.getElementById('filter-ong-listado').value = '';
  renderListado();
}

function renderListado() {
  const q      = document.getElementById('search-q')?.value || '';
  const pais   = document.getElementById('filter-pais-listado')?.value || '';
  const ciudad = document.getElementById('filter-ciudad-listado')?.value || '';
  const ong    = document.getElementById('filter-ong-listado')?.value || '';

  const filtros = {};
  if (q)      filtros.q = q;
  if (pais)   filtros.paisActualId = pais;
  if (ciudad) filtros.ciudad = ciudad;
  if (ong)    filtros.orgActualId = ong;

  // Aplicar filtro de org del usuario activo
  const visibles  = getVisibleMigrantes();
  const tempState = AppState.migrantes;
  AppState.migrantes = visibles;
  const todos = DB.migrantes.list(filtros);
  AppState.migrantes = tempState;
  const total = todos.length;
  const inicio = (_listadoPage - 1) * POR_PAGINA;
  const pagina = todos.slice(inicio, inicio + POR_PAGINA);

  const countEl = document.getElementById('listado-count');
  if (countEl) countEl.textContent = `${total} migrante${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;

  const tbody = document.getElementById('listado-tbody');
  if (!tbody) return;

  if (pagina.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🔍</div><h3>Sin resultados</h3><p>Ajusta los filtros para encontrar migrantes.</p></div></td></tr>`;
  } else {
    tbody.innerHTML = pagina.map(m => {
      const pais  = Helpers.paisById(m.paisActualId);
      const nac   = AppState.catalogos.nacionalidades.find(n => n.id === m.nacionalidadId);
      const org   = Helpers.orgById(m.orgActualId);
      const color = avatarColor(m.id);
      const fechaReg = Helpers.formatFecha(m.fechaRegistro);
      return `<tr style="cursor:pointer;" onclick="navigate('/migrante/detalle/${m.id}')">
        <td onclick="event.stopPropagation()"><code style="font-size:11px;color:#64748B;background:#F1F5F9;padding:2px 6px;border-radius:4px;">${m.id}</code></td>
        <td style="font-size:12px;color:#2563EB;">${m.email || '<span style="color:#CBD5E1;">—</span>'}</td>
        <td>
          <div class="flex gap-8" style="align-items:center;">
            <div class="avatar avatar-sm avatar-${color}">${avatarIniciales(Helpers.nombreCompleto(m))}</div>
            <div>
              <div style="font-size:13px;font-weight:600;">${Helpers.nombreCompleto(m)}</div>
              <div style="font-size:11px;color:#94A3B8;">${Helpers.edad(m.fechaNacimiento)} años</div>
            </div>
          </div>
        </td>
        <td style="font-size:12px;">${nac?.label || '—'}</td>
        <td style="font-size:12px;">${pais?.bandera || ''} ${pais?.label || '—'}</td>
        <td>${estadoBadge(m.estado)}</td>
        <td><span class="badge ${Helpers.vulnerabilidadBadge(m.vulnerabilidad)}">${Helpers.vulnerabilidadLabel(m.vulnerabilidad)}</span></td>
        <td style="font-size:12px;color:#64748B;">${fechaReg}</td>
        <td onclick="event.stopPropagation()">
          <div style="display:flex;gap:4px;justify-content:flex-end;">
            <button class="btn btn-sm btn-secondary" onclick="navigate('/migrante/detalle/${m.id}')">Ver</button>
            <button class="btn btn-sm" style="background:#EFF6FF;color:#2563EB;" onclick="navigate('/migrante/nuevo',{editId:'${m.id}'})">Editar</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // Paginador
  const totalPags = Math.ceil(total / POR_PAGINA);
  const paginEl = document.getElementById('listado-pagination');
  if (paginEl && totalPags > 1) {
    const pags = [];
    for (let i = 1; i <= totalPags; i++) pags.push(i);
    paginEl.innerHTML = `
      <div class="pagination">
        <span>Mostrando ${inicio+1}–${Math.min(inicio+POR_PAGINA, total)} de ${total}</span>
        <div class="pagination-pages">
          <button class="page-btn" onclick="_listadoPage=Math.max(1,_listadoPage-1);renderListado()" ${_listadoPage===1?'disabled':''}>‹</button>
          ${pags.slice(Math.max(0,_listadoPage-3), _listadoPage+2).map(p =>
            `<button class="page-btn ${p===_listadoPage?'active':''}" onclick="_listadoPage=${p};renderListado()">${p}</button>`
          ).join('')}
          <button class="page-btn" onclick="_listadoPage=Math.min(${totalPags},_listadoPage+1);renderListado()" ${_listadoPage===totalPags?'disabled':''}>›</button>
        </div>
      </div>
    `;
  } else if (paginEl) { paginEl.innerHTML = ''; }
}

function confirmarArchivar(id) {
  const m = DB.migrantes.get(id);
  if (!m) return;
  showModal({
    titulo: 'Archivar migrante',
    body: `<p>¿Confirmas archivar a <strong>${Helpers.nombreCompleto(m)}</strong>?<br>El registro se moverá al archivo histórico.</p>`,
    acciones: [
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>`,
      `<button class="btn btn-danger" onclick="DB.migrantes.update('${id}',{estado:'archivado'});closeModal();applyListadoFilters();showToast('Migrante archivado','warning')">Archivar</button>`,
    ]
  });
}

function abrirEdicionRapida(id) {
  navigate('/migrante/detalle', { id });
}

// ─── VISTA: DETALLE MIGRANTE ──────────────────────────────────

function viewMigranteDetalle(container, params = {}) {
  const id = params.id;
  if (!id) { navigate('/migrante/listado'); return; }

  withLoader(container, () => {
    const m = DB.migrantes.get(id);
    if (!m) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">❓</div><h3>Migrante no encontrado</h3></div>`;
      return;
    }

    // ── Resolución de campos: soporte para ambos schemas (mock + Supabase)
    const ninoNombres   = m.nino_nombres   || m.nombres   || '—';
    const ninoApellidos = m.nino_apellidos || m.apellidos || '—';
    const ninoNombreCompleto = [ninoNombres, ninoApellidos].filter(x=>x&&x!=='—').join(' ');
    const ninoFechaNac  = m.nino_fecha_nacimiento || m.fechaNacimiento;
    const ninoGeneroId  = m.nino_genero_id || m.generoId;
    const ninoIdiomaId  = m.nino_idioma_id || (m.idiomas||[])[0];
    const ninoNivelId   = m.nino_nivel_educacion_id || null;
    const ninoMunicipio = m.nino_municipio || m.ciudadOrigenId || null;
    const ninoPaisNacId = m.nino_pais_nacimiento_id || m.paisOrigenId;
    const ninoVacunas   = m.nino_vacunas || '—';
    const ninoMedicacion= m.nino_medicacion || '—';
    const ninoDiscap    = m.nino_discapacidades || '—';
    const ninoAsistencia= m.nino_asistencia_trayectoria || '—';

    const adultoNombres   = m.adulto_nombres   || m.nombres   || '—';
    const adultoApellidos = m.adulto_apellidos || m.apellidos || '—';
    const adultoEmail     = m.adulto_email     || m.email     || '—';
    const adultoTel       = m.adulto_telefono  || m.telefono  || '—';
    const adultoDirec     = m.adulto_direccion || '—';
    const adultoResid     = m.adulto_residencia;
    const adultoNexoId    = m.adulto_nexo_id   || m.nexoId;
    const adultoRazonId   = m.adulto_razon_emigracion_id;
    const adultoNacId     = m.adulto_nacionalidad_id || m.nacionalidadId;
    const adultoGeneroId  = m.adulto_genero_id || m.generoId;
    const adultoPaisId    = m.adulto_pais_id   || m.paisActualId;
    const adultoPerm      = m.adulto_permiso_residencia;
    const adultoCustodia  = m.adulto_custodia;
    const adultoTrabajo   = m.adulto_permiso_trabajo;

    const orgId           = m.org_id       || m.orgActualId;
    const procedenciaId   = m.procedencia_pais_id  || m.paisOrigenId;
    const destinoId       = m.destino_final_pais_id;
    const ingresosId      = m.generacion_ingresos_id || m.ingresosId;
    const paisEntrevistaId= m.pais_entrevista_id || m.paisActualId;
    const ciudadEntrevId  = m.ciudad_entrevista_id || m.ciudadActualId;
    const fechaEntrevista = m.fecha_entrevista || m.fechaRegistro;
    const municipioEntrev = m.municipio_entrevista || '—';
    const consentimiento  = m.consentimiento;

    const recUltimoCentro = m.rec_ultimo_centro    || '—';
    const recSiguiente    = m.rec_siguiente_puesto || '—';
    const recFamilia      = m.rec_familia          || '—';

    // Catálogos
    const ninoGenero   = AppState.catalogos.generos.find(g => g.id === ninoGeneroId);
    const adultoGenero = AppState.catalogos.generos.find(g => g.id === adultoGeneroId);
    const adultoNac    = AppState.catalogos.nacionalidades.find(n => n.id === adultoNacId);
    const adultoNexo   = AppState.catalogos.nexos.find(x => x.id === adultoNexoId);
    const adultoRazon  = AppState.catalogos.razonesEmigracion.find(r => r.id === adultoRazonId);
    const idioma       = AppState.catalogos.idiomas.find(i => i.id === ninoIdiomaId);
    const nivelEd      = AppState.catalogos.nivelesEducacion.find(n => n.id === ninoNivelId);
    const ingresos     = AppState.catalogos.generacionIngresos.find(x => x.id === ingresosId);
    const org          = Helpers.orgById(orgId);
    const paisProcedencia = Helpers.paisById(procedenciaId);
    const paisDestino     = Helpers.paisById(destinoId);
    const paisEntrevista  = Helpers.paisById(paisEntrevistaId);
    const ciudadEntrevista= Helpers.ciudadById(ciudadEntrevId);
    const paisNacNino     = Helpers.paisById(ninoPaisNacId);

    const edad         = Helpers.edad(ninoFechaNac);
    const statusColor  = Helpers.estadoColor(m.estado);
    const color        = avatarColor(m.id);
    const ruta         = m.ruta || [];

    // Helper para badge sí/no/null
    const boolBadge = val => val === true || val === 'si'
      ? `<span class="badge" style="background:#DCFCE7;color:#16A34A;">Sí</span>`
      : val === false || val === 'no'
      ? `<span class="badge" style="background:#FEE2E2;color:#DC2626;">No</span>`
      : `<span class="text-muted" style="font-size:12px;">—</span>`;

    container.innerHTML = `
      <!-- ── HEADER ──────────────────────────────────── -->
      <div class="page-header">
        <div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('/migrante/listado')" style="margin-bottom:8px;">← Volver al listado</button>
          <h1 class="page-title">${ninoNombreCompleto}</h1>
          <p class="page-subtitle">${m.id} · Registrado el ${Helpers.formatFecha(m.fechaRegistro || m.fecha_registro)}</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" onclick="showToast('Ficha exportada en PDF','success')">⬇ Exportar ficha</button>
          <button class="btn btn-primary btn-sm" onclick="abrirFormEdicion('${m.id}')">✏️ Editar</button>
        </div>
      </div>

      <!-- ── LAYOUT PRINCIPAL ────────────────────────── -->
      <div class="grid-1-2" style="align-items:start;gap:20px;">

        <!-- ╔═══ COLUMNA IZQUIERDA ═══╗ -->
        <div style="display:flex;flex-direction:column;gap:16px;">

          <!-- ① PERFIL DEL NIÑO/A -->
          <div class="card" style="padding:0;overflow:hidden;">
            <div class="profile-header">
              <div class="profile-avatar-wrap">
                <div class="avatar avatar-xl avatar-${color}">${avatarIniciales(ninoNombreCompleto)}</div>
                <div class="profile-status-dot" style="background:${statusColor};"></div>
              </div>
              <div class="profile-info">
                <h2>${ninoNombreCompleto}</h2>
                <div class="profile-id">${m.id} · ${edad ? edad + ' años' : 'Edad no registrada'}</div>
                <div class="profile-tags">
                  ${estadoBadge(m.estado)}
                  ${ninoGenero ? `<span class="profile-tag">${ninoGenero.label}</span>` : ''}
                  ${paisNacNino ? `<span class="profile-tag">${paisNacNino.bandera||''} ${paisNacNino.label}</span>` : ''}
                </div>
              </div>
            </div>
            <div style="padding:16px;">
              <div class="seccion-label" style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">Datos del Niño/a</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                ${datoFicha('📅 Fecha nacimiento', Helpers.formatFecha(ninoFechaNac))}
                ${datoFicha('🌍 País nacimiento', `${paisNacNino?.bandera||''} ${paisNacNino?.label||'—'}`)}
                ${datoFicha('🏘 Municipio', ninoMunicipio || '—')}
                ${datoFicha('🗣 Idioma', idioma?.label || '—')}
                ${datoFicha('📚 Nivel educación', nivelEd?.label || '—')}
                ${datoFicha('💊 Medicación', ninoMedicacion)}
              </div>
              ${ninoVacunas && ninoVacunas !== '—' ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--color-border);">
                ${datoFicha('💉 Vacunas', ninoVacunas)}
              </div>` : ''}
              ${ninoDiscap && ninoDiscap !== '—' ? `<div style="margin-top:10px;">
                ${datoFicha('♿ Discapacidades', ninoDiscap)}
              </div>` : ''}
              ${ninoAsistencia && ninoAsistencia !== '—' ? `<div style="margin-top:10px;">
                <div style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Asistencia en trayectoria</div>
                <p style="font-size:12px;color:var(--color-text-muted);line-height:1.6;margin:0;">${ninoAsistencia}</p>
              </div>` : ''}
            </div>
          </div>

          <!-- ② DATOS DE LA ENTREVISTA -->
          <div class="card">
            <div class="card-title" style="margin-bottom:14px;">📋 Datos de la Entrevista</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              ${datoFicha('📅 Fecha', Helpers.formatFecha(fechaEntrevista))}
              ${datoFicha('🏢 Organización', org?.nombre || '—')}
              ${datoFicha('🌍 País entrevista', `${paisEntrevista?.bandera||''} ${paisEntrevista?.label||'—'}`)}
              ${datoFicha('🏙 Ciudad', ciudadEntrevista?.label || '—')}
              ${datoFicha('🏘 Municipio', municipioEntrev)}
              ${datoFicha('✅ Consentimiento', consentimiento === true || consentimiento === 'si' ? '<span class="badge" style="background:#DCFCE7;color:#16A34A;">Otorgado</span>' : consentimiento === false || consentimiento === 'no' ? '<span class="badge" style="background:#FEE2E2;color:#DC2626;">No otorgado</span>' : '—')}
            </div>
          </div>

          <!-- ③ RECOMENDACIONES -->
          <div class="card">
            <div class="card-title" style="margin-bottom:14px;">📝 Recomendaciones</div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              <div>
                <div style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Último centro de atención</div>
                <p style="font-size:13px;color:var(--color-text);line-height:1.6;margin:0;${recUltimoCentro==='—'?'color:var(--color-text-muted);font-style:italic;':''}">${recUltimoCentro}</p>
              </div>
              <div style="border-top:1px solid var(--color-border-subtle);padding-top:12px;">
                <div style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Siguiente puesto de atención</div>
                <p style="font-size:13px;color:var(--color-text);line-height:1.6;margin:0;${recSiguiente==='—'?'color:var(--color-text-muted);font-style:italic;':''}">${recSiguiente}</p>
              </div>
              <div style="border-top:1px solid var(--color-border-subtle);padding-top:12px;">
                <div style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Familia de referencia</div>
                <p style="font-size:13px;color:var(--color-text);line-height:1.6;margin:0;${recFamilia==='—'?'color:var(--color-text-muted);font-style:italic;':''}">${recFamilia}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- ╔═══ COLUMNA DERECHA ═══╗ -->
        <div style="display:flex;flex-direction:column;gap:16px;">

          <!-- ④ DATOS DEL ADULTO ACOMPAÑANTE -->
          <div class="card">
            <div class="card-header" style="padding-bottom:14px;border-bottom:1px solid var(--color-border-subtle);margin-bottom:16px;">
              <div>
                <div class="card-title">👤 Adulto Acompañante</div>
                <div class="card-subtitle">${[adultoNombres, adultoApellidos].filter(x=>x&&x!=='—').join(' ')}</div>
              </div>
              ${adultoNac ? `<span class="badge badge-blue">${adultoNac.label}</span>` : ''}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              ${datoFicha('👤 Nombre', adultoNombres)}
              ${datoFicha('👤 Apellido', adultoApellidos)}
              ${datoFicha('✉️ Email', adultoEmail)}
              ${datoFicha('📞 Teléfono', adultoTel)}
              ${datoFicha('🧭 Género', adultoGenero?.label || '—')}
              ${datoFicha('🔗 Nexo con niño/a', adultoNexo?.label || '—')}
              ${datoFicha('🌍 País', `${Helpers.paisById(adultoPaisId)?.bandera||''} ${Helpers.paisById(adultoPaisId)?.label||'—'}`)}
              ${datoFicha('🏠 Residencia', adultoResid === 'tiene' ? 'Tiene' : adultoResid === 'no_tiene' ? 'No tiene' : adultoResid === 'en_tramite' ? 'En trámite' : '—')}
            </div>
            ${(adultoPerm !== undefined || adultoCustodia !== undefined || adultoTrabajo !== undefined) ? `
            <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--color-border-subtle);">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                <div><div style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;">Perm. Residencia</div>${boolBadge(adultoPerm)}</div>
                <div><div style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;">Custodia</div>${boolBadge(adultoCustodia)}</div>
                <div><div style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;">Perm. Trabajo</div>${boolBadge(adultoTrabajo)}</div>
              </div>
            </div>` : ''}
            ${adultoDirec !== '—' ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--color-border-subtle);">
              ${datoFicha('📍 Dirección', adultoDirec)}
            </div>` : ''}
            ${adultoRazon ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--color-border-subtle);">
              <div style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Razón para emigrar</div>
              <span class="badge badge-yellow">${adultoRazon.label}</span>
            </div>` : ''}
          </div>

          <!-- ⑤ GRUPO CON QUE VIAJA + RUTA -->
          <div class="card">
            <div class="card-header" style="padding-bottom:12px;border-bottom:1px solid var(--color-border-subtle);margin-bottom:14px;">
              <div>
                <div class="card-title">👨‍👩‍👧 Grupo de viaje</div>
                <div class="card-subtitle">Procedencia · Destino · Ingresos</div>
              </div>
            </div>
            <!-- Procedencia / Destino / Ingresos -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
              ${datoFicha('🛫 Procedencia', `${paisProcedencia?.bandera||''} ${paisProcedencia?.label||'—'}`)}
              ${datoFicha('🛬 Destino final', `${paisDestino?.bandera||''} ${paisDestino?.label||'—'}`)}
              ${datoFicha('💼 Ingresos', ingresos?.label || '—')}
            </div>
            <!-- Tabla grupo de viaje -->
            ${(m.grupoViaje||[]).length > 0 ? `
            <div style="margin-top:4px;">
              <div style="font-size:10px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">Acompañantes registrados</div>
              <div class="table-wrapper" style="margin:0;">
                <table>
                  <thead><tr>
                    <th>Nombre</th><th>Género</th><th>Nexo</th><th>Fecha nac.</th><th>Edad</th>
                  </tr></thead>
                  <tbody>
                    ${(m.grupoViaje||[]).map(gv => {
                      const gvGenero = AppState.catalogos.generos.find(g=>g.id===gv.generoId||g.id===gv.genero_id);
                      const gvNexo   = AppState.catalogos.nexos.find(n=>n.id===gv.nexoId||n.id===gv.nexo_id);
                      return `<tr>
                        <td>${gv.nombre||gv.acompanante_nombre||'—'}</td>
                        <td>${gvGenero?.label||'—'}</td>
                        <td>${gvNexo?.label||'—'}</td>
                        <td>${Helpers.formatFecha(gv.fechaNacimiento||gv.fecha_nacimiento)||'—'}</td>
                        <td>${gv.edad||'—'}</td>
                      </tr>`;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>` : `<div style="text-align:center;padding:12px 0;color:var(--color-text-muted);font-size:12px;font-style:italic;">Sin acompañantes registrados</div>`}
          </div>

          <!-- ⑥ RUTA MIGRATORIA (timeline) -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">🗺 Ruta migratoria</div>
                <div class="card-subtitle">${ruta.length} evento${ruta.length !== 1 ? 's' : ''} registrado${ruta.length !== 1 ? 's' : ''}</div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="abrirNuevoEvento('${m.id}')">+ Agregar</button>
            </div>
            <div class="timeline">
              ${ruta.length === 0
                ? `<div class="empty-state" style="padding:28px 16px;"><div class="empty-icon">📍</div><p>Sin eventos registrados aún.</p></div>`
                : ruta.map((ev, i) => {
                    const pEv  = Helpers.paisById(ev.paisId);
                    const cEv  = Helpers.ciudadById(ev.ciudadId);
                    const oEv  = Helpers.orgById(ev.orgId);
                    const esFin= i === ruta.length - 1;
                    return `
                    <div class="timeline-item">
                      <div class="timeline-left">
                        <div class="timeline-dot" style="${esFin?'background:var(--color-success-soft);border-color:var(--color-success)':''}">
                          ${pEv?.bandera||'📍'}
                        </div>
                        ${i < ruta.length-1 ? '<div class="timeline-line"></div>' : ''}
                      </div>
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <div class="timeline-title">${pEv?.label||ev.paisId}${cEv?' · '+cEv.label:''}</div>
                          <div class="timeline-date">${Helpers.formatFecha(ev.fecha)}</div>
                        </div>
                        ${oEv?`<div class="timeline-org">🏢 ${oEv.nombre}</div>`:'<div class="timeline-org text-light">Sin organización</div>'}
                        ${ev.obs?`<div class="timeline-obs">${ev.obs}</div>`:''}
                        ${(ev.servicios||[]).length?`<div class="timeline-servicios">${serviciosBadges(ev.servicios)}</div>`:''}
                      </div>
                    </div>`;
                  }).join('')
              }
            </div>
          </div>

        </div>
      </div>
    `;
  });
}

function datoFicha(label, value) {
  return `<div style="min-width:0;">
    <div style="font-size:10px;font-weight:600;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px;">${label}</div>
    <div style="font-size:12px;font-weight:500;color:var(--color-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${value}</div>
  </div>`;
}

function abrirNuevoEvento(migranteId) {
  const paises = AppState.catalogos.paises;
  const ciudades = AppState.catalogos.ciudades;
  const orgs = AppState.organizaciones;
  const servicios = AppState.catalogos.tiposServicio;

  showModal({
    titulo: 'Agregar evento de tránsito',
    size: 'modal-lg',
    body: `
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">País <span class="required">*</span></label>
          <select class="form-select" id="ev-pais" onchange="filtrarCiudades()">
            <option value="">Seleccionar...</option>
            ${paises.map(p => `<option value="${p.id}">${p.bandera} ${p.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Ciudad</label>
          <select class="form-select" id="ev-ciudad">
            <option value="">Seleccionar país primero</option>
          </select>
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Organización</label>
          <select class="form-select" id="ev-org">
            <option value="">Sin organización</option>
            ${orgs.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha del evento <span class="required">*</span></label>
          <input type="date" class="form-input" id="ev-fecha" value="${Helpers.today()}"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Servicios recibidos</label>
        <div class="multi-check-grid" id="ev-servicios">
          ${servicios.map(s => `
            <label class="multi-check-item" data-id="${s.id}">
              <input type="checkbox" value="${s.id}" onchange="toggleMultiCheck(this)"/>
              ${s.icono} ${s.label}
            </label>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Observación</label>
        <textarea class="form-textarea" id="ev-obs" placeholder="Notas sobre este evento de tránsito..."></textarea>
      </div>
    `,
    acciones: [
      `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>`,
      `<button class="btn btn-primary" onclick="guardarEvento('${migranteId}')">Guardar evento</button>`,
    ]
  });
}

function filtrarCiudades() {
  const paisId = document.getElementById('ev-pais')?.value;
  const sel = document.getElementById('ev-ciudad');
  if (!sel) return;
  const ciudades = AppState.catalogos.ciudades.filter(c => c.paisId === paisId);
  sel.innerHTML = `<option value="">Seleccionar ciudad...</option>` +
    ciudades.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
}

function toggleMultiCheck(el) {
  el.closest('.multi-check-item').classList.toggle('selected', el.checked);
}

function guardarEvento(migranteId) {
  const paisId   = document.getElementById('ev-pais')?.value;
  const ciudadId = document.getElementById('ev-ciudad')?.value || null;
  const orgId    = document.getElementById('ev-org')?.value || null;
  const fecha    = document.getElementById('ev-fecha')?.value;
  const obs      = document.getElementById('ev-obs')?.value;
  const servicios= Array.from(document.querySelectorAll('#ev-servicios input:checked')).map(el=>el.value);

  if (!paisId || !fecha) { showToast('País y fecha son obligatorios', 'error'); return; }

  DB.migrantes.addEvento(migranteId, { paisId, ciudadId, orgId, fecha, obs, servicios });
  closeModal();
  showToast('Evento de tránsito registrado', 'success');
  navigate('/migrante/detalle', { id: migranteId });
}

// ─── VISTA: REGISTRAR MIGRANTE ────────────────────────────────

// Estado temporal del grupo de viaje (rows dinámicas)
let _grupoViaje = [];

function viewMigranteNuevo(container, params = {}) {
  const editId = params.editId || null;
  const m      = editId ? AppState.migrantes?.find(x => x.id === editId) : null;
  const titulo = m ? 'Editar Migrante' : 'Registrar Migrante';
  _grupoViaje  = m?.grupoViaje || [];

  withLoader(container, () => {
    const { paises, ciudades, nacionalidades, generos, idiomas, nexos,
            razonesEmigracion, tiposServicio, generacionIngresos, nivelesEducacion } = AppState.catalogos;
    const orgs = AppState.organizaciones;

    const selPaises   = `<option value="">-Seleccionar-</option>${paises.map(p=>`<option value="${p.id}">${p.bandera} ${p.label}</option>`).join('')}`;
    const selCiudades = `<option value="">-Seleccionar-</option>${ciudades.map(c=>`<option value="${c.id}">${c.label}</option>`).join('')}`;
    const selGeneros  = `<option value="">-Seleccionar-</option>${generos.map(g=>`<option value="${g.id}">${g.label}</option>`).join('')}`;
    const selNac      = `<option value="">-Seleccionar-</option>${nacionalidades.map(n=>`<option value="${n.id}">${n.label}</option>`).join('')}`;
    const selNexos    = `<option value="">-Seleccionar-</option>${nexos.map(n=>`<option value="${n.id}">${n.label}</option>`).join('')}`;
    const selIdiomas  = `<option value="">-Seleccionar-</option>${idiomas.map(i=>`<option value="${i.id}">${i.label}</option>`).join('')}`;
    const selNivEd    = `<option value="">-Seleccionar-</option>${nivelesEducacion.map(n=>`<option value="${n.id}">${n.label}</option>`).join('')}`;
    const selRazones  = `<option value="">-Seleccionar-</option>${razonesEmigracion.map(r=>`<option value="${r.id}">${r.label}</option>`).join('')}`;
    const selIngresos = `<option value="">-Seleccionar-</option>${generacionIngresos.map(g=>`<option value="${g.id}">${g.label}</option>`).join('')}`;
    const selOrgs     = `<option value="">-Seleccionar-</option>${orgs.map(o=>`<option value="${o.id}">${o.nombre}</option>`).join('')}`;

    const v = (id) => m?.[id] || '';
    const sel = (id, opts) => opts.replace(`value="${v(id)}"`, `value="${v(id)}" selected`);

    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">${titulo}</h1>
        <p class="page-subtitle">Registro completo del caso migratorio</p></div>
      </div>

      <div class="card card-lg" style="padding:32px;">

        <!-- ── CONSENTIMIENTO ─────────────────────────────── -->
        <div class="form-section">
          <div class="form-section-title fst-migrante">Migrante</div>
          <div class="form-row form-row-2" style="align-items:flex-end;">
            <div class="form-group">
              <label class="form-label">Consentimiento Informado Entrevistado <span class="required">*</span></label>
              <div style="display:flex;gap:24px;margin-top:8px;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;">
                  <input type="radio" name="consentimiento" value="si" ${v('consentimiento')==='si'?'checked':''} id="f-consent-si"/> Si Acepto</label>
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;">
                  <input type="radio" name="consentimiento" value="no" ${v('consentimiento')==='no'?'checked':''} id="f-consent-no"/> No Acepto</label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Organización de Acogida</label>
              <select class="form-select" id="f-org">${sel('orgId', selOrgs)}</select>
            </div>
          </div>
        </div>

        <!-- ── DATOS DE LA ENTREVISTA ─────────────────────── -->
        <div class="form-section">
          <div class="form-section-title fst-entrevista">Datos de la Entrevista</div>
          <div class="form-row form-row-4">
            <div class="form-group">
              <label class="form-label">Fecha Entrevista</label>
              <input type="date" class="form-input" id="f-fecha-entrevista" value="${v('fechaEntrevista')||new Date().toISOString().split('T')[0]}"/>
            </div>
            <div class="form-group">
              <label class="form-label">País</label>
              <select class="form-select" id="f-pais-entrevista">${sel('paisEntrevistaId', selPaises)}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Municipio</label>
              <input type="text" class="form-input" id="f-municipio-entrevista" placeholder="Municipio" value="${v('municipioEntrevista')}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Ciudad</label>
              <select class="form-select" id="f-ciudad-entrevista">${sel('ciudadEntrevistaId', selCiudades)}</select>
            </div>
          </div>
        </div>

        <!-- ── DATOS DEL ADULTO ACOMPAÑANTE ──────────────── -->
        <div class="form-section">
          <div class="form-section-title fst-adulto">Datos del Adulto Acompañante</div>

          <div class="form-row form-row-3">
            <div class="form-group" style="grid-column:span 2;">
              <label class="form-label">Adulto Acompañante</label>
              <div class="form-row form-row-2" style="margin-top:0;">
                <input type="text" class="form-input" id="f-adulto-nombres"   placeholder="Nombre"   value="${v('adultoNombres')}"/>
                <input type="text" class="form-input" id="f-adulto-apellidos" placeholder="Apellido" value="${v('adultoApellidos')}"/>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Dirección</label>
              <input type="text" class="form-input" id="f-adulto-direccion" placeholder="Dirección" value="${v('adultoDireccion')}"/>
            </div>
          </div>

          <div class="form-row form-row-3">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" id="f-adulto-email" placeholder="correo@ejemplo.com" value="${v('adultoEmail')}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Ciudad</label>
              <select class="form-select" id="f-adulto-ciudad">${sel('adultoCiudadId', selCiudades)}</select>
            </div>
            <div class="form-group">
              <label class="form-label">País</label>
              <select class="form-select" id="f-adulto-pais">${sel('adultoPaisId', selPaises)}</select>
            </div>
          </div>

          <div class="form-row form-row-3">
            <div class="form-group">
              <label class="form-label">Nacionalidad</label>
              <select class="form-select" id="f-adulto-nac">${sel('adultoNacionalidadId', selNac)}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Género</label>
              <select class="form-select" id="f-adulto-genero">${sel('adultoGeneroId', selGeneros)}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input type="tel" class="form-input" id="f-adulto-tel" placeholder="+58 412 0000000" value="${v('adultoTelefono')}"/>
            </div>
          </div>

          <div class="form-row form-row-3">
            <div class="form-group">
              <label class="form-label">Residencia</label>
              <select class="form-select" id="f-adulto-residencia">
                <option value="">-Seleccionar-</option>
                <option value="tiene"    ${v('adultoResidencia')==='tiene'?'selected':''}>Tiene residencia</option>
                <option value="no_tiene" ${v('adultoResidencia')==='no_tiene'?'selected':''}>No tiene residencia</option>
                <option value="en_tramite" ${v('adultoResidencia')==='en_tramite'?'selected':''}>En trámite</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nexo con el niño/a</label>
              <select class="form-select" id="f-adulto-nexo">${sel('adultoNexoId', selNexos)}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Razones porque Emigró</label>
              <select class="form-select" id="f-adulto-razon">${sel('adultoRazonId', selRazones)}</select>
            </div>
          </div>

          <div class="form-row" style="grid-template-columns:1fr 1fr 1fr 1fr;gap:20px;display:grid;">
            <div class="form-group">
              <label class="form-label">Permisos de Residencia</label>
              <div style="display:flex;gap:20px;margin-top:8px;">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="radio" name="perm-res" value="si" id="f-perm-res-si" ${v('adultoPermisoResidencia')==='si'?'checked':''}/> Sí</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="radio" name="perm-res" value="no" id="f-perm-res-no" ${v('adultoPermisoResidencia')==='no'?'checked':''}/> No</label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Custodia del niño/a</label>
              <div style="display:flex;gap:20px;margin-top:8px;">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="radio" name="custodia" value="si" id="f-custodia-si" ${v('adultoCustodia')==='si'?'checked':''}/> Sí</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="radio" name="custodia" value="no" id="f-custodia-no" ${v('adultoCustodia')==='no'?'checked':''}/> No</label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Permisos de Trabajo</label>
              <div style="display:flex;gap:20px;margin-top:8px;">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="radio" name="perm-trab" value="si" id="f-perm-trab-si" ${v('adultoPermisoTrabajo')==='si'?'checked':''}/> Sí</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="radio" name="perm-trab" value="no" id="f-perm-trab-no" ${v('adultoPermisoTrabajo')==='no'?'checked':''}/> No</label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Documento Permiso de Residencia</label>
              <div class="form-input" style="cursor:pointer;color:#94A3B8;font-size:12px;display:flex;align-items:center;gap:8px;">
                📎 Seleccionar imagen
              </div>
            </div>
          </div>
        </div>

        <!-- ── GRUPO CON QUE VIAJA ────────────────────────── -->
        <div class="form-section">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <div class="form-section-title" style="margin-bottom:0;">Grupo con que viaja</div>
          </div>
          <div class="table-wrapper" style="margin-bottom:12px;">
            <table id="grupo-viaje-table">
              <thead>
                <tr>
                  <th>Acompañante</th>
                  <th>Género</th>
                  <th>Nexo</th>
                  <th>Fecha Nacimiento</th>
                  <th>Edad</th>
                  <th style="width:48px;"></th>
                </tr>
              </thead>
              <tbody id="grupo-viaje-body">
                ${_grupoViaje.map((g,i) => grupoViajeFila(g, i, generos, nexos)).join('')}
              </tbody>
            </table>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="agregarFilaGrupo()" style="color:#2563EB;">
            + Agregar nuevo
          </button>
        </div>

        <!-- ── PROCEDENCIA / DESTINO / INGRESOS ──────────── -->
        <div class="form-section">
          <div class="form-row form-row-3">
            <div class="form-group">
              <label class="form-label">Procedencia</label>
              <select class="form-select" id="f-procedencia">${sel('procedenciaPaisId', selPaises)}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Destino Final</label>
              <select class="form-select" id="f-destino">${sel('destinoFinalPaisId', selPaises)}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Generación de Ingresos</label>
              <select class="form-select" id="f-ingresos">${sel('generacionIngresosId', selIngresos)}</select>
            </div>
          </div>
        </div>

        <!-- ── DATOS DEL NIÑO ─────────────────────────────── -->
        <div class="form-section">
          <div class="form-section-title fst-nino">Datos del Niño</div>

          <div class="form-row form-row-2">
            <div class="form-group">
              <label class="form-label">Niño <span class="required">*</span></label>
              <div class="form-row form-row-2" style="margin-top:0;">
                <input type="text" class="form-input" id="f-nino-nombres"   placeholder="Nombre"   value="${v('ninoNombres')}"/>
                <input type="text" class="form-input" id="f-nino-apellidos" placeholder="Apellido" value="${v('ninoApellidos')}"/>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Género Niño</label>
              <select class="form-select" id="f-nino-genero">${sel('ninoGeneroId', selGeneros)}</select>
            </div>
          </div>

          <div class="form-row form-row-4">
            <div class="form-group">
              <label class="form-label">Fecha de Nacimiento <span class="required">*</span></label>
              <input type="date" class="form-input" id="f-nino-fecha-nac" value="${v('ninoFechaNacimiento')}"/>
            </div>
            <div class="form-group">
              <label class="form-label">País de Nacimiento</label>
              <select class="form-select" id="f-nino-pais-nac">${sel('ninoPaisNacimientoId', selPaises)}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Municipio</label>
              <input type="text" class="form-input" id="f-nino-municipio" placeholder="Municipio" value="${v('ninoMunicipio')}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Lenguaje</label>
              <select class="form-select" id="f-nino-idioma">${sel('ninoIdiomaId', selIdiomas)}</select>
            </div>
          </div>

          <div class="form-row form-row-3">
            <div class="form-group">
              <label class="form-label">Último Nivel de Escolaridad</label>
              <select class="form-select" id="f-nino-nivel-ed">${sel('ninoNivelEducacionId', selNivEd)}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Fecha Último Nivel Alcanzado</label>
              <input type="date" class="form-input" id="f-nino-fecha-nivel" value="${v('ninoFechaUltimoNivel')}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Medicación</label>
              <input type="text" class="form-input" id="f-nino-medicacion" placeholder="Medicación actual" value="${v('ninoMedicacion')}"/>
            </div>
          </div>

          <div class="form-row form-row-2">
            <div class="form-group">
              <label class="form-label">Asistencia recibida durante la trayectoria</label>
              <textarea class="form-textarea" id="f-nino-asistencia" rows="3" placeholder="Describe los servicios y asistencia recibida...">${v('ninoAsistenciaTrayectoria')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Discapacidades</label>
              <textarea class="form-textarea" id="f-nino-discapacidades" rows="3" placeholder="Indica si tiene alguna discapacidad...">${v('ninoDiscapacidades')}</textarea>
            </div>
          </div>

          <div class="form-row form-row-2">
            <div class="form-group">
              <label class="form-label">Vacunas</label>
              <input type="text" class="form-input" id="f-nino-vacunas" placeholder="Esquema de vacunación" value="${v('ninoVacunas')}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Foto Vacunas</label>
              <div class="form-input" style="cursor:pointer;color:#94A3B8;font-size:12px;display:flex;align-items:center;gap:8px;">
                📎 Seleccionar imagen
              </div>
            </div>
          </div>
        </div>

        <!-- ── RECOMENDACIONES ────────────────────────────── -->
        <div class="form-section">
          <div class="form-section-title fst-rec">Recomendaciones</div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Recomendaciones del último centro de acogida en su trayectoria de migración</label>
            <textarea class="form-textarea" id="f-rec-ultimo" rows="3" placeholder="Recomendaciones del centro anterior...">${v('recUltimoCentro')}</textarea>
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Recomendaciones para el siguiente puesto de acogida</label>
            <textarea class="form-textarea" id="f-rec-siguiente" rows="3" placeholder="Instrucciones para el siguiente centro...">${v('recSiguientePuesto')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Recomendaciones a la familia</label>
            <textarea class="form-textarea" id="f-rec-familia" rows="3" placeholder="Orientaciones para la familia...">${v('recFamilia')}</textarea>
          </div>
        </div>

        <!-- ── ACCIONES ───────────────────────────────────── -->
        <div style="display:flex;justify-content:flex-end;gap:12px;padding-top:8px;border-top:1px solid var(--color-border);">
          <button class="btn btn-secondary" onclick="navigate('/migrantes/listado')">Cancelar</button>
          <button class="btn btn-primary btn-lg" id="btn-guardar-migrante"
            onclick="guardarMigrante('${editId||''}')">
            ✓ ${m ? 'Guardar cambios' : 'Grabar'}
          </button>
        </div>

      </div><!-- /card -->
    `;
  });
}

function grupoViajeFila(g = {}, idx = null, generos = [], nexos = []) {
  const i = idx !== null ? idx : Date.now();
  const selG = `<option value="">—</option>${generos.map(x=>`<option value="${x.id}" ${g.generoId===x.id?'selected':''}>${x.label}</option>`).join('')}`;
  const selN = `<option value="">—</option>${nexos.map(x=>`<option value="${x.id}" ${g.nexoId===x.id?'selected':''}>${x.label}</option>`).join('')}`;
  return `<tr id="gv-row-${i}">
    <td><input type="text" class="form-input form-input-sm" placeholder="Nombre completo" value="${g.nombre||''}" id="gv-nombre-${i}"/></td>
    <td><select class="form-select form-select-sm" id="gv-genero-${i}">${selG}</select></td>
    <td><select class="form-select form-select-sm" id="gv-nexo-${i}">${selN}</select></td>
    <td><input type="date" class="form-input form-input-sm" value="${g.fechaNacimiento||''}" id="gv-fecha-${i}" onchange="calcEdadGrupo('${i}')"/></td>
    <td><input type="number" class="form-input form-input-sm" placeholder="Auto" value="${g.edad||''}" id="gv-edad-${i}" min="0" max="120" style="width:60px;" readonly title="Calculado automáticamente"/></td>
    <td><button class="btn btn-ghost btn-icon btn-sm" onclick="eliminarFilaGrupo('${i}')" title="Eliminar">✕</button></td>
  </tr>`;
}

function agregarFilaGrupo() {
  const generos = AppState.catalogos.generos || [];
  const nexos   = AppState.catalogos.nexos   || [];
  const idx = Date.now();
  const tbody = document.getElementById('grupo-viaje-body');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.id = `gv-row-${idx}`;
  tr.innerHTML = grupoViajeFila({}, idx, generos, nexos).replace(/<tr[^>]*>|<\/tr>/g,'');
  tbody.appendChild(tr);
}

function eliminarFilaGrupo(idx) {
  document.getElementById(`gv-row-${idx}`)?.remove();
}

function calcEdadGrupo(idx) {
  const fechaEl = document.getElementById(`gv-fecha-${idx}`);
  const edadEl  = document.getElementById(`gv-edad-${idx}`);
  if (!fechaEl || !edadEl || !fechaEl.value) return;
  const hoy = new Date();
  const nac = new Date(fechaEl.value + 'T00:00:00');
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  edadEl.value = (edad >= 0 && edad <= 120) ? edad : '';
}

function leerGrupoViaje() {
  const rows = document.querySelectorAll('#grupo-viaje-body tr');
  return Array.from(rows).map(row => {
    const id = row.id.replace('gv-row-','');
    return {
      nombre:         document.getElementById(`gv-nombre-${id}`)?.value?.trim()  || '',
      generoId:       document.getElementById(`gv-genero-${id}`)?.value          || '',
      nexoId:         document.getElementById(`gv-nexo-${id}`)?.value            || '',
      fechaNacimiento:document.getElementById(`gv-fecha-${id}`)?.value           || null,
      edad:           parseInt(document.getElementById(`gv-edad-${id}`)?.value)  || null,
    };
  }).filter(r => r.nombre);
}

async function guardarMigrante(editId) {
  const g = id => document.getElementById(id);
  const v = id => g(id)?.value?.trim() || '';
  const r = name => document.querySelector(`input[name="${name}"]:checked`)?.value || null;

  const data = {
    consentimiento:          r('consentimiento'),
    orgId:                   v('f-org'),
    // Entrevista
    fechaEntrevista:         v('f-fecha-entrevista') || null,
    paisEntrevistaId:        v('f-pais-entrevista'),
    municipioEntrevista:     v('f-municipio-entrevista'),
    ciudadEntrevistaId:      v('f-ciudad-entrevista'),
    // Adulto acompañante
    adultoNombres:           v('f-adulto-nombres'),
    adultoApellidos:         v('f-adulto-apellidos'),
    adultoDireccion:         v('f-adulto-direccion'),
    adultoEmail:             v('f-adulto-email'),
    adultoCiudadId:          v('f-adulto-ciudad'),
    adultoPaisId:            v('f-adulto-pais'),
    adultoNacionalidadId:    v('f-adulto-nac'),
    adultoGeneroId:          v('f-adulto-genero'),
    adultoTelefono:          v('f-adulto-tel'),
    adultoResidencia:        v('f-adulto-residencia'),
    adultoNexoId:            v('f-adulto-nexo'),
    adultoPermisoResidencia: r('perm-res'),
    adultoCustodia:          r('custodia'),
    adultoPermisoTrabajo:    r('perm-trab'),
    adultoRazonId:           v('f-adulto-razon'),
    // Ruta
    procedenciaPaisId:       v('f-procedencia'),
    destinoFinalPaisId:      v('f-destino'),
    generacionIngresosId:    v('f-ingresos'),
    // Niño
    ninoNombres:             v('f-nino-nombres'),
    ninoApellidos:           v('f-nino-apellidos'),
    ninoGeneroId:            v('f-nino-genero'),
    ninoFechaNacimiento:     v('f-nino-fecha-nac') || null,
    ninoPaisNacimientoId:    v('f-nino-pais-nac'),
    ninoMunicipio:           v('f-nino-municipio'),
    ninoIdiomaId:            v('f-nino-idioma'),
    ninoNivelEducacionId:    v('f-nino-nivel-ed'),
    ninoFechaUltimoNivel:    v('f-nino-fecha-nivel') || null,
    ninoAsistenciaTrayectoria: g('f-nino-asistencia')?.value?.trim() || '',
    ninoDiscapacidades:      g('f-nino-discapacidades')?.value?.trim() || '',
    ninoVacunas:             v('f-nino-vacunas'),
    ninoMedicacion:          v('f-nino-medicacion'),
    // Recomendaciones
    recUltimoCentro:         g('f-rec-ultimo')?.value?.trim() || '',
    recSiguientePuesto:      g('f-rec-siguiente')?.value?.trim() || '',
    recFamilia:              g('f-rec-familia')?.value?.trim() || '',
    // Grupo de viaje
    grupoViaje:              leerGrupoViaje(),
    // Estado del caso (heredado)
    estado:                  'en_transito',
  };

  const faltantes = [];
  if (!data.ninoNombres)        faltantes.push('Nombre del niño/a');
  if (!data.ninoApellidos)      faltantes.push('Apellido del niño/a');
  if (!data.ninoFechaNacimiento) faltantes.push('Fecha de nacimiento del niño/a');
  if (faltantes.length) {
    showToast('Campos obligatorios: ' + faltantes.join(', '), 'error');
    return;
  }

  const btn = document.getElementById('btn-guardar-migrante');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  try {
    // Guardar en Supabase si hay sesión activa
    const payload = {
      consentimiento:           data.consentimiento === 'si',
      org_id:                   data.orgId || null,
      fecha_entrevista:         data.fechaEntrevista ? data.fechaEntrevista + 'T00:00:00Z' : null,
      pais_entrevista_id:       data.paisEntrevistaId || null,
      municipio_entrevista:     data.municipioEntrevista || null,
      ciudad_entrevista_id:     data.ciudadEntrevistaId || null,
      adulto_nombres:           data.adultoNombres || null,
      adulto_apellidos:         data.adultoApellidos || null,
      adulto_direccion:         data.adultoDireccion || null,
      adulto_email:             data.adultoEmail || null,
      adulto_ciudad_id:         data.adultoCiudadId || null,
      adulto_pais_id:           data.adultoPaisId || null,
      adulto_nacionalidad_id:   data.adultoNacionalidadId || null,
      adulto_genero_id:         data.adultoGeneroId || null,
      adulto_telefono:          data.adultoTelefono || null,
      adulto_residencia:        data.adultoResidencia || null,
      adulto_nexo_id:           data.adultoNexoId || null,
      adulto_permiso_residencia: data.adultoPermisoResidencia === 'si',
      adulto_custodia:          data.adultoCustodia === 'si',
      adulto_permiso_trabajo:   data.adultoPermisoTrabajo === 'si',
      adulto_razon_emigracion_id: data.adultoRazonId || null,
      procedencia_pais_id:      data.procedenciaPaisId || null,
      destino_final_pais_id:    data.destinoFinalPaisId || null,
      generacion_ingresos_id:   data.generacionIngresosId || null,
      nino_nombres:             data.ninoNombres,
      nino_apellidos:           data.ninoApellidos,
      nino_genero_id:           data.ninoGeneroId || null,
      nino_fecha_nacimiento:    data.ninoFechaNacimiento,
      nino_pais_nacimiento_id:  data.ninoPaisNacimientoId || null,
      nino_municipio:           data.ninoMunicipio || null,
      nino_idioma_id:           data.ninoIdiomaId || null,
      nino_nivel_educacion_id:  data.ninoNivelEducacionId || null,
      nino_fecha_ultimo_nivel:  data.ninoFechaUltimoNivel || null,
      nino_asistencia_trayectoria: data.ninoAsistenciaTrayectoria || null,
      nino_discapacidades:      data.ninoDiscapacidades || null,
      nino_vacunas:             data.ninoVacunas || null,
      nino_medicacion:          data.ninoMedicacion || null,
      rec_ultimo_centro:        data.recUltimoCentro || null,
      rec_siguiente_puesto:     data.recSiguientePuesto || null,
      rec_familia:              data.recFamilia || null,
      estado:                   'en_transito',
    };

    let savedId = editId;

    if (editId) {
      const { error } = await supabaseClient.from('migrantes').update(payload).eq('id', editId);
      if (error) throw error;
    } else {
      const { data: row, error } = await supabaseClient.from('migrantes').insert(payload).select('id').single();
      if (error) throw error;
      savedId = row.id;
    }

    // Guardar grupo de viaje
    if (savedId && data.grupoViaje.length > 0) {
      await supabaseClient.from('migrante_grupo_viaje').delete().eq('migrante_id', savedId);
      const gvRows = data.grupoViaje.map(g => ({
        migrante_id:      savedId,
        acompanante_nombre: g.nombre,
        genero_id:        g.generoId || null,
        nexo_id:          g.nexoId  || null,
        fecha_nacimiento: g.fechaNacimiento || null,
        edad:             g.edad    || null,
      }));
      await supabaseClient.from('migrante_grupo_viaje').insert(gvRows);
    }

    showToast(`${editId ? 'Cambios guardados' : 'Migrante registrado'} correctamente`, 'success');
    // Recargar migrantes y KPIs desde Supabase para reflejar el nuevo registro
    await loadMigrantes();
    if (typeof refreshDashboardStats === 'function') refreshDashboardStats();
    navigate('/migrantes/listado');

  } catch (err) {
    console.error('guardarMigrante error:', err);
    // Si las tablas no existen aún en Supabase, simular guardado en local
    if (err?.code === 'PGRST205' || err?.message?.includes('migrantes')) {
      showToast('⚠ Tablas pendientes de migración. Ejecuta migration_migrantes.sql en Supabase.', 'warning');
    } else {
      showToast('Error al guardar: ' + (err.message || err), 'error');
    }
    if (btn) { btn.disabled = false; btn.textContent = editId ? 'Guardar cambios' : 'Grabar'; }
  }
}

function abrirFormEdicion(id) {
  navigate('/migrante/nuevo', { editId: id });
}

// ─── VISTA: EXPORTACIÓN ──────────────────────────────────────

function viewExportacion(container) {
  withLoader(container, () => {
    const total = AppState.migrantes.length;
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Archivo de Exportación</h1>
          <p class="page-subtitle">Genera archivos de datos para reportes externos</p>
        </div>
      </div>
      <div class="grid-2" style="align-items:start;">
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div class="card-header">
              <div><div class="card-title">📋 Exportar migrantes</div></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              ${[
                ['CSV completo','Todos los campos de los '+total+' migrantes','⬇ Exportar CSV','success'],
                ['Excel con filtros','Datos con formato y filtros aplicados','⬇ Exportar XLSX','success'],
                ['Fichas individuales PDF','Una ficha por migrante (demo simulada)','⬇ Exportar PDF','info'],
              ].map(([titulo,desc,btn,tipo]) => `
                <div class="flex-between" style="padding:14px;background:var(--color-bg);border-radius:var(--radius-md);">
                  <div><div style="font-size:13px;font-weight:600;">${titulo}</div>
                  <div class="text-muted text-sm">${desc}</div></div>
                  <button class="btn btn-secondary btn-sm" style="flex-shrink:0;margin-left:12px;"
                    onclick="simularDescarga('${titulo}','${tipo}')">${btn}</button>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <div><div class="card-title">🏢 Exportar organizaciones</div></div>
            </div>
            <div class="flex-between" style="padding:14px;background:var(--color-bg);border-radius:var(--radius-md);">
              <div><div style="font-size:13px;font-weight:600;">Reporte de organizaciones</div>
              <div class="text-muted text-sm">${AppState.organizaciones.length} orgs con métricas</div></div>
              <button class="btn btn-secondary btn-sm" onclick="simularDescarga('Organizaciones','success')">⬇ Exportar</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:16px;">Vista previa de datos</div>
          <div style="overflow-x:auto;">
            <table style="font-size:11px;">
              <thead>
                <tr><th>ID</th><th>Nombre</th><th>Nacionalidad</th><th>País actual</th><th>Estado</th></tr>
              </thead>
              <tbody>
                ${AppState.migrantes.slice(0,8).map(m=>{
                  const nac = AppState.catalogos.nacionalidades.find(n=>n.id===m.nacionalidadId);
                  const p   = Helpers.paisById(m.paisActualId);
                  return `<tr>
                    <td style="font-family:monospace;color:var(--color-text-muted);">${m.id}</td>
                    <td style="font-weight:600;">${Helpers.nombreCompleto(m)}</td>
                    <td>${nac?.label||m.nacionalidadId}</td>
                    <td>${p?.bandera||''} ${p?.label||m.paisActualId}</td>
                    <td>${estadoBadge(m.estado)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="text-muted text-sm" style="margin-top:12px;text-align:center;">Mostrando 8 de ${total} registros</div>
        </div>
      </div>
    `;
  });
}

function simularDescarga(nombre, tipo) {
  showToast(`Generando "${nombre}"...`, 'info', 1500);
  setTimeout(() => showToast(`"${nombre}" listo para descarga ✓`, tipo === 'info' ? 'success' : tipo), 1600);
}

// ─── VISTA: CATÁLOGOS (genérico) ─────────────────────────────

const CATALOGO_CONFIG = {
  '/datos/organizaciones':    { titulo: 'Organización de Acogida',   clave: null },
  '/datos/paises':            { titulo: 'Países',                    clave: 'paises',             campos: ['bandera','label','id'] },
  '/datos/ciudades':          { titulo: 'Ciudades',                  clave: 'ciudades',           campos: ['label','paisId','id'] },
  '/datos/nacionalidades':    { titulo: 'Nacionalidades',            clave: 'nacionalidades',     campos: ['label','id'] },
  '/datos/nexos':             { titulo: 'Nexos',                     clave: 'nexos',              campos: ['label','id'] },
  '/datos/generos':           { titulo: 'Géneros',                   clave: 'generos',            campos: ['label','id'] },
  '/datos/ingresos':          { titulo: 'Generación de Ingresos',    clave: 'generacionIngresos', campos: ['label','id'] },
  '/datos/idiomas':           { titulo: 'Idiomas',                   clave: 'idiomas',            campos: ['label','id'] },
  '/datos/servicios':         { titulo: 'Tipos de Servicio',         clave: 'tiposServicio',      campos: ['icono','label','color','id'] },
  '/datos/material':          { titulo: 'Material Educativo',        clave: 'materialEducativo',  campos: ['label','tipo','idioma'] },
  '/datos/razones':           { titulo: 'Razones para Emigrar',      clave: 'razonesEmigracion',  campos: ['label','id'] },
  '/datos/niveles-educacion': { titulo: 'Niveles de Educación',      clave: 'nivelesEducacion',   campos: ['label','id'] },
  '/datos/recomendaciones':   { titulo: 'Recomendaciones',           clave: 'recomendaciones',    campos: ['label','tipo','id'] },
};

function viewCatalogo(container, route, params) {
  const cfg = CATALOGO_CONFIG[route];
  if (!cfg) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">🚧</div><h3>Vista en construcción</h3></div>`; return; }

  if (route === '/datos/organizaciones') { viewDatosOrganizaciones(container); return; }

  withLoader(container, () => {
    const items = AppState.catalogos[cfg.clave] || [];

    // Etiquetas legibles para encabezados de columna
    const HEADER_LABELS = {
      label: 'Nombre', id: 'Código', paisId: 'País', bandera: 'Flag',
      tipo: 'Tipo', descripcion: 'Descripción', icono: '', color: 'Color',
      idioma: 'Idioma'
    };

    // Campos que se omiten como columna independiente (se mezclan en label)
    const CAMPOS_OCULTOS = ['bandera'];

    // Resolver valor de celda
    function resolverCelda(item, campo) {
      const val = item[campo];
      if (campo === 'paisId') {
        const p = AppState.catalogos.paises.find(x => x.id === val);
        return p ? `${p.bandera} ${p.label}` : (val || '—');
      }
      if (campo === 'label' && item.bandera) return `${item.bandera} ${val || ''}`;
      if (campo === 'label' && item.icono)   return `${item.icono} ${val || ''}`;
      if (campo === 'color' && val) return `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${val};margin-right:6px;vertical-align:middle;"></span>${val}`;
      return val || '—';
    }

    const columnas = cfg.campos.filter(c => !CAMPOS_OCULTOS.includes(c) && HEADER_LABELS[c] !== '');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${cfg.titulo}</h1>
          <p class="page-subtitle">${items.length} registro${items.length!==1?'s':''} en el catálogo</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="showCatalogModal('${cfg.clave}','${cfg.titulo}')">+ Nuevo</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              ${columnas.map(c => `<th>${HEADER_LABELS[c] || c}</th>`).join('')}
              <th style="text-align:right;width:90px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `<tr>
              ${columnas.map(c => `<td>${resolverCelda(item, c)}</td>`).join('')}
              <td>
                <div class="td-actions" style="justify-content:flex-end;">
                  <button class="btn btn-ghost btn-icon btn-sm" title="Editar"
                    onclick="showCatalogModal('${cfg.clave}','${cfg.titulo}',AppState.catalogos['${cfg.clave}'].find(x=>x.id==='${item.id}'))">✏️</button>
                  <button class="btn btn-ghost btn-icon btn-sm" title="Eliminar"
                    onclick="deleteCatalogItem('${cfg.clave}','${item.id}','${(item.label||'').replace(/'/g,"\\'")}')">🗑</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  });
}

function viewDatosOrganizaciones(container) {
  withLoader(container, () => {
    const orgs = AppState.organizaciones;
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Organizaciones de Acogida</h1>
          <p class="page-subtitle">${orgs.length} organizaciones registradas en ${new Set(orgs.map(o=>o.paisId)).size} países</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="showOrgModal()">+ Nueva organización</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${orgs.map(org => {
          const pais = Helpers.paisById(org.paisId);
          const ciudad = AppState.catalogos.ciudades?.find(c=>c.id===org.ciudadId);
          const color = avatarColor(org.id);
          const migsActuales = AppState.migrantes.filter(m => m.orgActualId === org.id).length;
          return `
            <div class="card" style="padding:0;overflow:hidden;">
              <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;">
                <div class="avatar avatar-md avatar-${color}">${avatarIniciales(org.nombre)}</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:700;font-size:14px;">${org.nombre}</div>
                  <div class="text-muted text-sm">${pais?.bandera||''} ${pais?.label||org.paisId} · ${ciudad?.label||org.ciudadId||''} · <em>${org.tipo}</em></div>
                </div>
                <div style="display:flex;gap:24px;flex-shrink:0;">
                  <div style="text-align:center;">
                    <div style="font-size:18px;font-weight:800;color:var(--color-accent);">${(org.totalAtendidos||0).toLocaleString()}</div>
                    <div class="text-xs text-muted">Atendidos</div>
                  </div>
                  <div style="text-align:center;">
                    <div style="font-size:18px;font-weight:800;color:var(--color-info);">${migsActuales}</div>
                    <div class="text-xs text-muted">Actuales</div>
                  </div>
                  <div style="text-align:center;">
                    <div style="font-size:18px;font-weight:800;color:var(--color-warning);">★ ${org.recomendaciones||0}</div>
                    <div class="text-xs text-muted">Recs.</div>
                  </div>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0;">
                  <button class="btn btn-ghost btn-icon btn-sm" title="Editar" onclick="showOrgModal('${org.id}')">✏️</button>
                  <button class="btn btn-ghost btn-icon btn-sm" title="Eliminar" onclick="deleteOrgConfirm('${org.id}','${(org.nombre||'').replace(/'/g,"\\'")}')">🗑</button>
                </div>
              </div>
              <div style="padding:12px 20px;border-top:1px solid var(--color-border);background:var(--color-bg);display:flex;gap:20px;flex-wrap:wrap;">
                <div class="text-sm"><span class="fw-600">👤 Contacto:</span> ${org.contacto||'—'}</div>
                <div class="text-sm"><span class="fw-600">📧</span> ${org.email||'—'}</div>
                <div class="text-sm"><span class="fw-600">📞</span> ${org.telefono||'—'}</div>
                <div style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;">
                  ${(org.servicios||[]).map(sid => {
                    const sv = AppState.catalogos.tiposServicio?.find(x=>x.id===sid);
                    return sv ? `<span class="badge badge-gray" style="font-size:10px;">${sv.icono} ${sv.label}</span>` : '';
                  }).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  });
}

function showOrgModal(orgId = null) {
  const org = orgId ? AppState.organizaciones.find(o=>o.id===orgId) : null;
  const isEdit = org !== null;
  const modalId = 'org-modal-' + Date.now();
  const paisOptions = AppState.catalogos.paises.map(p => `<option value="${p.id}" ${org?.paisId===p.id?'selected':''}>${p.bandera} ${p.label}</option>`).join('');
  const ciudadOptions = AppState.catalogos.ciudades.map(c => `<option value="${c.id}" ${org?.ciudadId===c.id?'selected':''}>${c.label} (${c.paisId})</option>`).join('');
  const tipoOptions = ['ONG local','ONG regional','Internacional','Religiosa','Cruz Roja','Fundación privada','Gubernamental','Otro'].map(t=>`<option value="${t}" ${org?.tipo===t?'selected':''}>${t}</option>`).join('');

  const fieldStyle = 'width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;font-family:inherit;outline:none;';
  const labelStyle = 'display:block;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;';

  const row = (fields) => `<div style="display:grid;grid-template-columns:${fields.length===2?'1fr 1fr':'1fr'};gap:12px;margin-bottom:14px;">${fields.join('')}</div>`;
  const field = (id, label, inputHTML) => `<div><label style="${labelStyle}">${label}</label>${inputHTML}</div>`;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="${modalId}" style="position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.4);backdrop-filter:blur(4px);">
      <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:560px;box-shadow:0 24px 80px rgba(0,0,0,.2);max-height:90vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
          <h3 style="font-size:16px;font-weight:800;color:#1A2B4B;margin:0;">${isEdit?'Editar':'Nueva'} Organización</h3>
          <button onclick="document.getElementById('${modalId}').remove()" style="background:none;border:none;cursor:pointer;font-size:20px;color:#94A3B8;">×</button>
        </div>
        ${row([
          field('id', 'Código ID', `<input id="${modalId}-id" value="${org?.id||''}" ${isEdit?'readonly style="'+fieldStyle+'background:#F8FAFC;color:#94A3B8;"':'style="'+fieldStyle+'"'}/>`),
          field('nombre', 'Nombre de la organización', `<input id="${modalId}-nombre" value="${org?.nombre||''}" style="${fieldStyle}"/>`)
        ])}
        ${row([
          field('tipo', 'Tipo', `<select id="${modalId}-tipo" style="${fieldStyle}"><option value="">Seleccionar…</option>${tipoOptions}</select>`),
          field('contacto', 'Persona de contacto', `<input id="${modalId}-contacto" value="${org?.contacto||''}" style="${fieldStyle}"/>`)
        ])}
        ${row([
          field('pais_id', 'País', `<select id="${modalId}-pais_id" style="${fieldStyle}"><option value="">Seleccionar…</option>${paisOptions}</select>`),
          field('ciudad_id', 'Ciudad', `<select id="${modalId}-ciudad_id" style="${fieldStyle}"><option value="">Seleccionar…</option>${ciudadOptions}</select>`)
        ])}
        ${row([
          field('email', 'Email', `<input id="${modalId}-email" type="email" value="${org?.email||''}" style="${fieldStyle}"/>`),
          field('telefono', 'Teléfono', `<input id="${modalId}-telefono" value="${org?.telefono||''}" style="${fieldStyle}"/>`)
        ])}
        <div style="margin-bottom:14px;">${field('descripcion', 'Descripción', `<textarea id="${modalId}-descripcion" rows="2" style="${fieldStyle}height:auto;">${org?.descripcion||''}</textarea>`)}</div>
        <div style="display:flex;gap:10px;margin-top:24px;">
          <button onclick="document.getElementById('${modalId}').remove()" style="flex:1;padding:11px;border:1.5px solid #E2E8F0;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;font-size:13px;color:#475569;">Cancelar</button>
          <button id="${modalId}-save" onclick="saveOrgModal('${modalId}','${orgId||''}')" style="flex:2;padding:11px;border:none;border-radius:8px;background:#2563EB;color:#fff;cursor:pointer;font-weight:700;font-size:13px;">${isEdit?'Guardar cambios':'Crear organización'}</button>
        </div>
      </div>
    </div>`);
}

async function saveOrgModal(modalId, existingId) {
  const get = id => document.getElementById(`${modalId}-${id}`)?.value?.trim() || '';
  const item = { id: get('id'), nombre: get('nombre'), tipo: get('tipo'), contacto: get('contacto'), paisId: get('pais_id'), ciudadId: get('ciudad_id'), email: get('email'), telefono: get('telefono'), descripcion: get('descripcion'), servicios: [], activa: true };

  if (!item.id || !item.nombre) { showToast('Código e ID son obligatorios', 'warning'); return; }

  const btn = document.getElementById(`${modalId}-save`);
  btn.textContent = 'Guardando…'; btn.disabled = true;

  try {
    if (existingId) { await orgUpdate(existingId, item); showToast('Organización actualizada', 'success'); }
    else            { await orgCreate(item);             showToast('Organización creada', 'success'); }
    document.getElementById(modalId).remove();
    navigate(currentRoute);
  } catch (err) {
    showToast('Error: ' + (err.message||err), 'error');
    btn.textContent = existingId ? 'Guardar cambios' : 'Crear organización';
    btn.disabled = false;
  }
}

async function deleteOrgConfirm(id, nombre) {
  if (!confirm(`¿Eliminar la organización "${nombre}"? Esta acción no se puede deshacer.`)) return;
  try {
    await orgDelete(id);
    showToast('Organización eliminada', 'success');
    navigate(currentRoute);
  } catch (err) {
    showToast('Error al eliminar: ' + (err.message||err), 'error');
  }
}

// ─── VISTAS DE CONSULTA ───────────────────────────────────────

function viewConsultaOrgs(container) {
  withLoader(container, () => {
    const porOrg = Helpers.migrantesPorOrg();
    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">Consulta — Organizaciones</h1>
        <p class="page-subtitle">Actividad registrada por organización</p></div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Organización</th><th>País</th><th>Migrantes actuales</th><th>Total eventos</th><th>Servicios frecuentes</th><th>Recomendaciones</th></tr>
          </thead>
          <tbody>
            ${porOrg.sort((a,b)=>b.totalEventos-a.totalEventos).map(({org, totalActuales, totalEventos, servicios}) => {
              const pais = Helpers.paisById(org.paisId);
              const topSv = Object.entries(servicios).sort(([,a],[,b])=>b-a).slice(0,3)
                .map(([sid]) => AppState.catalogos.tiposServicio.find(x=>x.id===sid))
                .filter(Boolean);
              return `<tr>
                <td>
                  <div class="flex gap-8" style="align-items:center;">
                    <div class="avatar avatar-sm avatar-${avatarColor(org.id)}">${avatarIniciales(org.nombre)}</div>
                    <div><div class="td-name">${org.nombre}</div><div class="td-muted">${org.ciudad}</div></div>
                  </div>
                </td>
                <td>${pais?.bandera||''} ${pais?.label||org.paisId}</td>
                <td><strong>${totalActuales}</strong></td>
                <td><strong>${totalEventos}</strong></td>
                <td>${topSv.map(sv=>`<span style="font-size:16px;" title="${sv.label}">${sv.icono}</span>`).join(' ')}</td>
                <td><span style="color:#F59E0B;">★</span> <strong>${org.recomendaciones}</strong></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  });
}

function viewOrgsRecomendaciones(container) {
  withLoader(container, () => {
    const orgs = [...AppState.organizaciones].sort((a,b)=>b.recomendaciones-a.recomendaciones);
    const max = orgs[0]?.recomendaciones || 1;
    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">Organizaciones × Recomendaciones</h1>
        <p class="page-subtitle">Ranking de organizaciones por puntaje de recomendación</p></div>
      </div>
      <div class="card">
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${orgs.map((org,i) => {
            const pais = Helpers.paisById(org.paisId);
            const pct = Math.round((org.recomendaciones/max)*100);
            const colors = ['#E8612A','#3B82F6','#10B981','#8B5CF6','#F59E0B'];
            const color = colors[i % colors.length];
            return `
              <div style="display:flex;align-items:center;gap:16px;">
                <div style="width:24px;text-align:center;font-size:12px;font-weight:700;color:var(--color-text-muted);">${i+1}</div>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <span style="font-weight:600;font-size:13px;">${org.nombre}</span>
                    <span style="font-size:12px;color:var(--color-text-muted);">${pais?.bandera||''} ${pais?.label||''} · ${org.ciudad}</span>
                  </div>
                  <div class="progress-bar-wrap">
                    <div class="progress-bar-fill" style="width:${pct}%;background:${color};"></div>
                  </div>
                </div>
                <div style="width:48px;text-align:right;font-size:15px;font-weight:800;">
                  <span style="color:#F59E0B;">★</span> ${org.recomendaciones}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });
}

function viewOrgsCiudades(container) {
  withLoader(container, () => {
    // Agrupar orgs por ciudad
    const byCiudad = {};
    AppState.organizaciones.forEach(org => {
      const key = `${org.ciudad} (${Helpers.paisById(org.paisId)?.label || org.paisId})`;
      if (!byCiudad[key]) byCiudad[key] = [];
      byCiudad[key].push(org);
    });

    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">Organizaciones × Ciudades</h1>
        <p class="page-subtitle">${AppState.organizaciones.length} organizaciones en ${Object.keys(byCiudad).length} ciudades</p></div>
      </div>
      <div class="grid-2" style="align-items:start;">
        <div class="chart-container">
          <div class="card-title" style="margin-bottom:12px;">Distribución por país</div>
          <div class="chart-wrapper"><canvas id="chart-orgs-pais"></canvas></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${Object.entries(byCiudad).map(([ciudad, orgs]) => `
            <div class="card card-sm">
              <div style="font-weight:700;font-size:13px;margin-bottom:8px;">📍 ${ciudad}</div>
              ${orgs.map(o => `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                <div class="avatar avatar-sm avatar-${avatarColor(o.id)}" style="width:24px;height:24px;font-size:10px;">${avatarIniciales(o.nombre)}</div>
                <div>
                  <div style="font-size:12px;font-weight:600;">${o.nombre}</div>
                  <div class="text-xs text-muted">${o.tipo}</div>
                </div>
              </div>`).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Gráfica país
    const porPais = {};
    AppState.organizaciones.forEach(o => {
      const pl = Helpers.paisById(o.paisId)?.label || o.paisId;
      porPais[pl] = (porPais[pl]||0) + 1;
    });
    new Chart(document.getElementById('chart-orgs-pais'), {
      type: 'pie',
      data: {
        labels: Object.keys(porPais),
        datasets: [{ data: Object.values(porPais),
          backgroundColor:['#E8612A','#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444'],
          borderWidth:3, borderColor:'#fff' }]
      },
      options: { responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'bottom', labels:{ font:{size:11}, padding:10, usePointStyle:true }}}}
    });
  });
}

function viewOrigenDetallado(container) {
  withLoader(container, () => {
    const s = Helpers.stats();
    const data = Object.entries(s.porPaisOrigen).sort(([,a],[,b])=>b-a);

    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">Migración × País de Origen</h1>
        <p class="page-subtitle">Desglose detallado por país de procedencia</p></div>
      </div>
      <div class="grid-2-1" style="align-items:start;">
        <div class="chart-container">
          <div class="card-title" style="margin-bottom:16px;">Migrantes por país de origen</div>
          <div class="chart-wrapper chart-wrapper-lg"><canvas id="chart-origen-det"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:16px;">Detalle por país</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${data.map(([paisId, count]) => {
              const pais = Helpers.paisById(paisId);
              const pct = Math.round((count/s.total)*100);
              return `<div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:12px;font-weight:600;">${pais?.bandera||''} ${pais?.label||paisId}</span>
                  <span style="font-size:12px;color:var(--color-text-muted);">${count} — ${pct}%</span>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar-fill" style="width:${pct}%;"></div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="table-wrapper" style="margin-top:20px;">
        <table>
          <thead>
            <tr><th>País de Origen</th><th>Total</th><th>En tránsito</th><th>Atendidos</th><th>Ubicados</th><th>%</th></tr>
          </thead>
          <tbody>
            ${data.map(([paisId, count]) => {
              const pais = Helpers.paisById(paisId);
              const migs = AppState.migrantes.filter(m=>m.paisOrigenId===paisId);
              return `<tr>
                <td style="font-weight:600;">${pais?.bandera||''} ${pais?.label||paisId}</td>
                <td><strong>${count}</strong></td>
                <td>${migs.filter(m=>m.estado==='en_transito').length}</td>
                <td>${migs.filter(m=>m.estado==='atendido').length}</td>
                <td>${migs.filter(m=>m.estado==='ubicado').length}</td>
                <td>${Math.round((count/s.total)*100)}%</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    new Chart(document.getElementById('chart-origen-det'), {
      type: 'bar',
      data: {
        labels: data.map(([pid]) => { const p=Helpers.paisById(pid); return `${p?.bandera||''} ${p?.label||pid}`; }),
        datasets: [{
          label: 'Migrantes',
          data: data.map(([,v])=>v),
          backgroundColor: data.map((_,i)=>['#E8612A','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#14B8A6'][i%7]),
          borderRadius: 8, borderSkipped: false,
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }},
        scales:{ x:{grid:{display:false}}, y:{grid:{color:'#F1F5F9'}, ticks:{stepSize:1}}}
      }
    });
  });
}

function viewOrigenXOrg(container) {
  withLoader(container, () => {
    // Matriz: organización × país de origen
    const paises = [...new Set(AppState.migrantes.map(m=>m.paisOrigenId))];
    const orgs   = AppState.organizaciones.filter(o => {
      return AppState.migrantes.some(m => m.orgActualId === o.id);
    });

    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">Migraciones × País × Organización</h1>
        <p class="page-subtitle">Cruce entre país de origen y organización atendiente</p></div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Organización</th>
              ${paises.map(pid => { const p=Helpers.paisById(pid); return `<th title="${p?.label||pid}">${p?.bandera||pid}</th>`; }).join('')}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orgs.map(org => {
              const migs = AppState.migrantes.filter(m=>m.orgActualId===org.id);
              const pCounts = paises.map(pid => migs.filter(m=>m.paisOrigenId===pid).length);
              return `<tr>
                <td style="font-weight:600;white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis;">${org.nombre}</td>
                ${pCounts.map(c => `<td style="text-align:center;">${c>0?`<span class="badge badge-blue" style="min-width:24px;justify-content:center;">${c}</span>`:'<span style="color:var(--color-text-light);">—</span>'}</td>`).join('')}
                <td><strong>${migs.length}</strong></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  });
}

function viewEstadisticas(container) {
  withLoader(container, () => {
    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">Estadísticas</h1>
        <p class="page-subtitle">Análisis cuantitativo de la plataforma</p></div>
      </div>
      <div class="tab-bar">
        <div class="tab-item active" onclick="switchTab(this,'tab-genero')">Por género</div>
        <div class="tab-item" onclick="switchTab(this,'tab-edad')">Por edad</div>
        <div class="tab-item" onclick="switchTab(this,'tab-servicios')">Por servicios</div>
        <div class="tab-item" onclick="switchTab(this,'tab-ingresos')">Por ingresos</div>
      </div>

      <div id="tab-genero" class="tab-panel active">
        <div class="grid-2">
          <div class="chart-container"><div class="card-title" style="margin-bottom:12px;">Distribución por género</div>
          <div class="chart-wrapper"><canvas id="chart-genero"></canvas></div></div>
          <div class="card">
            <div class="card-title" style="margin-bottom:16px;">Género × Estado</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${AppState.catalogos.generos.map(g => {
                const migs = AppState.migrantes.filter(m=>m.generoId===g.id);
                if (!migs.length) return '';
                return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--color-border);">
                  <div style="width:100px;font-size:12px;font-weight:600;">${g.label}</div>
                  <div style="flex:1;">
                    <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;gap:1px;">
                      ${['en_transito','atendido','derivado','ubicado'].map(est => {
                        const c = migs.filter(m=>m.estado===est).length;
                        const pct = Math.round((c/migs.length)*100);
                        const col = {en_transito:'#F59E0B',atendido:'#3B82F6',derivado:'#8B5CF6',ubicado:'#10B981'}[est];
                        return pct>0?`<div style="width:${pct}%;background:${col};border-radius:2px;"></div>`:'';
                      }).join('')}
                    </div>
                  </div>
                  <div style="font-size:13px;font-weight:700;width:28px;text-align:right;">${migs.length}</div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <div id="tab-edad" class="tab-panel">
        <div class="grid-2">
          <div class="chart-container"><div class="card-title" style="margin-bottom:12px;">Distribución por rango de edad</div>
          <div class="chart-wrapper"><canvas id="chart-edad"></canvas></div></div>
          <div class="card">
            <div class="card-title" style="margin-bottom:12px;">Estadísticas de edad</div>
            ${(() => {
              const edades = AppState.migrantes.map(m => Helpers.edad(m.fechaNacimiento));
              const promedio = Math.round(edades.reduce((a,b)=>a+b,0)/edades.length);
              const menores = edades.filter(e=>e<18).length;
              const adultos = edades.filter(e=>e>=18&&e<=45).length;
              const mayores = edades.filter(e=>e>45).length;
              return `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  ${[
                    ['Edad promedio', promedio+' años', 'orange'],
                    ['Menores de 18', menores, 'purple'],
                    ['18–45 años', adultos, 'blue'],
                    ['Mayores de 45', mayores, 'green'],
                  ].map(([lbl,val,col]) => `
                    <div style="padding:14px;background:var(--color-bg);border-radius:var(--radius-md);text-align:center;">
                      <div class="kpi-value" style="font-size:22px;color:var(--color-${col});">${val}</div>
                      <div class="text-xs text-muted">${lbl}</div>
                    </div>`).join('')}
                </div>`;
            })()}
          </div>
        </div>
      </div>

      <div id="tab-servicios" class="tab-panel">
        <div class="chart-container">
          <div class="card-title" style="margin-bottom:16px;">Demanda de servicios</div>
          <div class="chart-wrapper chart-wrapper-lg"><canvas id="chart-svs-stats"></canvas></div>
        </div>
      </div>

      <div id="tab-ingresos" class="tab-panel">
        <div class="chart-container">
          <div class="card-title" style="margin-bottom:12px;">Generación de ingresos</div>
          <div class="chart-wrapper"><canvas id="chart-ingresos"></canvas></div>
        </div>
      </div>
    `;

    // Gráfica género
    const gData = AppState.catalogos.generos.map(g=>({
      label:g.label, value: AppState.migrantes.filter(m=>m.generoId===g.id).length
    })).filter(x=>x.value>0);
    new Chart(document.getElementById('chart-genero'),{
      type:'doughnut',
      data:{ labels:gData.map(x=>x.label),
        datasets:[{ data:gData.map(x=>x.value),
          backgroundColor:['#E8612A','#3B82F6','#8B5CF6','#6B7280'],
          borderWidth:3,borderColor:'#fff' }]},
      options:{ responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11},padding:12,usePointStyle:true}}},cutout:'60%' }
    });

    // Gráfica edad (se inicializa cuando el tab es visible)
    setTimeout(() => {
      const el = document.getElementById('chart-edad');
      if (el) {
        const rangos = [['< 12',0,12],['12–17',12,18],['18–25',18,26],['26–35',26,36],['36–45',36,46],['46–60',46,61],['>60',61,120]];
        const vals = rangos.map(([,mn,mx]) => AppState.migrantes.filter(m=>{const e=Helpers.edad(m.fechaNacimiento);return e>=mn&&e<mx;}).length);
        new Chart(el,{
          type:'bar',
          data:{labels:rangos.map(r=>r[0]),datasets:[{label:'Migrantes',data:vals,backgroundColor:'#3B82F6',borderRadius:6,borderSkipped:false}]},
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#F1F5F9'},ticks:{stepSize:1}}}}
        });
      }

      const elSvs = document.getElementById('chart-svs-stats');
      if (elSvs) {
        const s = Helpers.stats();
        const sv = Object.entries(s.servicioCount).sort(([,a],[,b])=>b-a);
        new Chart(elSvs,{
          type:'bar',
          data:{
            labels:sv.map(([sid])=>{ const x=AppState.catalogos.tiposServicio.find(t=>t.id===sid); return x?`${x.icono} ${x.label}`:sid;}),
            datasets:[{data:sv.map(([,v])=>v),backgroundColor:['#E8612A','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#14B8A6','#6B7280'],borderRadius:6,borderSkipped:false}]
          },
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#F1F5F9'},ticks:{stepSize:1}}}}
        });
      }

      const elIng = document.getElementById('chart-ingresos');
      if (elIng) {
        const ingr = AppState.catalogos.generacionIngresos.map(gi=>({
          label:gi.label, value:AppState.migrantes.filter(m=>m.ingresosId===gi.id).length
        })).filter(x=>x.value>0);
        new Chart(elIng,{
          type:'doughnut',
          data:{labels:ingr.map(x=>x.label),datasets:[{data:ingr.map(x=>x.value),backgroundColor:['#E8612A','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#14B8A6'],borderWidth:3,borderColor:'#fff'}]},
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11},padding:10,usePointStyle:true}}},cutout:'55%'}
        });
      }
    }, 100);
  });
}

function switchTab(el, tabId) {
  el.closest('.tab-bar').querySelectorAll('.tab-item').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  el.closest('#main-content').querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  const panel = document.getElementById(tabId);
  if (panel) panel.classList.add('active');
}

// ─── VISTAS: MAPAS ───────────────────────────────────────────

// Calcula estadísticas de ruta usando los datos reales de AppState.migrantes
function computeRealRouteStats() {
  const migrantes = AppState.migrantes || [];
  const total     = migrantes.length || AppState.mockStats?.totalRegistros || 0;

  // Agrupar por país actual
  const byPais = {};
  migrantes.forEach(m => {
    const p = m.paisActualId || m.paisEntrevistaId || 'VE';
    byPais[p] = (byPais[p] || 0) + 1;
  });

  // Si no hay migrantes cargados, caer de vuelta a los datos mock
  if (migrantes.length === 0) return { byPais: {}, total, colombiaRuta: AppState.mockStats?.colombiaRuta };

  const enCO = byPais['CO'] || 0;

  // Distribución Colombia usando % fijos (no hay datos de ciudad en el seed sintético)
  const cucutaTotal    = Math.round(enCO * 0.60);
  const riohachaTotal  = enCO - cucutaTotal;
  const interiorTotal  = Math.round(enCO * 0.70);
  const costaTotal     = enCO - interiorTotal;

  return {
    byPais,
    total,
    colombiaRuta: {
      totalPorColombia: enCO,
      entradaCucuta:  { total: cucutaTotal },
      entradaRiohacha:{ total: riohachaTotal },
      rutaInterior: {
        total: interiorTotal,
        ciudades: [
          { label: 'Bogotá',    total: Math.round(interiorTotal * 0.50), pct: 50 },
          { label: 'Medellín',  total: Math.round(interiorTotal * 0.30), pct: 30 },
          { label: 'Cali',      total: Math.round(interiorTotal * 0.20), pct: 20 },
        ],
      },
      rutaCosta: {
        total: costaTotal,
        ciudades: [
          { label: 'Barranquilla', total: Math.round(costaTotal * 0.40), pct: 40 },
          { label: 'Cartagena',    total: Math.round(costaTotal * 0.35), pct: 35 },
          { label: 'Santa Marta',  total: Math.round(costaTotal * 0.25), pct: 25 },
        ],
      },
    },
  };
}

function viewMapaRutas(container) {
  withLoader(container, () => {
    // Usar stats reales de AppState.migrantes si están disponibles, si no usar mock
    const realStats = computeRealRouteStats();
    const cr        = realStats.colombiaRuta;
    const ms        = AppState.mockStats;
    const totalReal = realStats.total || ms.totalRegistros;

    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">Mapa de Rutas Migratorias</h1>
        <p class="page-subtitle">Ruta Venezuela–Colombia–Centroamérica–México–USA · ${totalReal.toLocaleString('es')} NNA registrados</p></div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" onclick="navigate('/migrantes/mapa')" title="Ver puntos de migrantes">📍 Ver migrantes</button>
          <button class="btn btn-secondary btn-sm" id="btn-vista-paises" onclick="toggleMapaVista('paises')" style="background:#EFF6FF;color:#2563EB;border:1.5px solid #BFDBFE;font-weight:700;">Vista países</button>
          <button class="btn btn-secondary btn-sm" id="btn-vista-colombia" onclick="toggleMapaVista('colombia')">Detalle Colombia</button>
        </div>
      </div>

      <!-- STAT BAR -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px;">
        <div class="card card-sm" style="text-align:center;border-left:3px solid #E8612A;">
          <div style="font-size:22px;font-weight:800;color:#1A2B4B;">${cr.totalPorColombia.toLocaleString('es')}</div>
          <div style="font-size:11px;color:#64748B;font-weight:600;">NNA por Colombia</div>
        </div>
        <div class="card card-sm" style="text-align:center;border-left:3px solid #3B82F6;">
          <div style="font-size:22px;font-weight:800;color:#1A2B4B;">60%</div>
          <div style="font-size:11px;color:#64748B;font-weight:600;">Entrada Cúcuta</div>
          <div style="font-size:10px;color:#94A3B8;">${cr.entradaCucuta.total.toLocaleString('es')} NNA</div>
        </div>
        <div class="card card-sm" style="text-align:center;border-left:3px solid #8B5CF6;">
          <div style="font-size:22px;font-weight:800;color:#1A2B4B;">40%</div>
          <div style="font-size:11px;color:#64748B;font-weight:600;">Entrada Riohacha</div>
          <div style="font-size:10px;color:#94A3B8;">${cr.entradaRiohacha.total.toLocaleString('es')} NNA</div>
        </div>
        <div class="card card-sm" style="text-align:center;border-left:3px solid #10B981;">
          <div style="font-size:22px;font-weight:800;color:#1A2B4B;">70%</div>
          <div style="font-size:11px;color:#64748B;font-weight:600;">Ruta interior</div>
          <div style="font-size:10px;color:#94A3B8;">Bogotá·Medellín·Cali</div>
        </div>
        <div class="card card-sm" style="text-align:center;border-left:3px solid #F59E0B;">
          <div style="font-size:22px;font-weight:800;color:#1A2B4B;">30%</div>
          <div style="font-size:11px;color:#64748B;font-weight:600;">Ruta costera</div>
          <div style="font-size:10px;color:#94A3B8;">Barranquilla·Cartagena·S.Marta</div>
        </div>
      </div>

      <div class="card" style="padding:0;overflow:hidden;">
        <div id="map-rutas" style="height:560px;"></div>
      </div>

      <!-- LEYENDA COLOMBIA -->
      <div class="card" style="margin-top:16px;padding:16px 20px;" id="leyenda-colombia">
        <div class="card-title" style="margin-bottom:12px;">Distribución en Colombia</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748B;letter-spacing:.4px;margin-bottom:8px;">Ruta Interior (70% — ${cr.rutaInterior.total.toLocaleString('es')} NNA)</div>
            ${cr.rutaInterior.ciudades.map(c=>`
              <div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid #F1F5F9;">
                <div style="width:10px;height:10px;border-radius:50%;background:#10B981;flex-shrink:0;"></div>
                <span style="font-size:13px;font-weight:500;flex:1;">${c.label}</span>
                <span style="font-size:12px;font-weight:700;color:#10B981;">${c.pct}%</span>
                <span style="font-size:11px;color:#94A3B8;">${c.total.toLocaleString('es')} NNA</span>
              </div>`).join('')}
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748B;letter-spacing:.4px;margin-bottom:8px;">Ruta Costera (30% — ${cr.rutaCosta.total.toLocaleString('es')} NNA)</div>
            ${cr.rutaCosta.ciudades.map(c=>`
              <div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid #F1F5F9;">
                <div style="width:10px;height:10px;border-radius:50%;background:#F59E0B;flex-shrink:0;"></div>
                <span style="font-size:13px;font-weight:500;flex:1;">${c.label}</span>
                <span style="font-size:12px;font-weight:700;color:#F59E0B;">${c.pct}%</span>
                <span style="font-size:11px;color:#94A3B8;">${c.total.toLocaleString('es')} NNA</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    `;

    window._mapaVistaActual = 'paises';

    setTimeout(() => {
      const map = L.map('map-rutas', { zoomControl: true, scrollWheelZoom: false })
        .setView([10, -76], 5);
      currentMapInstance = map;
      window._mapRutasInstance = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap', maxZoom: 18
      }).addTo(map);

      // ── Capa global (vista países) ──────────────────────────
      window._layerPaises = L.layerGroup().addTo(map);
      window._layerColombia = L.layerGroup(); // no añadir aún

      // Ruta principal sur-norte
      const rutaCoords = ['VE','CO','PA','CR','MX','US']
        .map(id => AppState.catalogos.paises.find(p=>p.id===id))
        .filter(Boolean).map(p => p.coords);
      L.polyline(rutaCoords, { color:'#E8612A', weight:3.5, opacity:0.75, dashArray:'8,5' })
        .addTo(window._layerPaises);

      // Marcadores de países — con totales reales
      const byPaisReal = realStats.byPais || {};
      AppState.catalogos.paises.forEach(p => {
        if (!['VE','CO','PA','CR','MX','US'].includes(p.id)) return;
        if (!p.coords) return;
        const orgsEnPais = AppState.organizaciones.filter(o=>o.paisId===p.id).length;
        const migsEnPais = byPaisReal[p.id] || 0;
        // Tamaño del marcador proporcional al volumen
        const sz = migsEnPais > 1000 ? 48 : migsEnPais > 500 ? 42 : 36;
        const icon = L.divIcon({
          className: '',
          html: '<div style="background:#1A2B4B;color:white;border-radius:50%;width:' + sz + 'px;height:' + sz + 'px;'
            + 'display:flex;align-items:center;justify-content:center;font-size:' + Math.round(sz*0.46) + 'px;'
            + 'border:3px solid #E8612A;box-shadow:0 2px 8px rgba(0,0,0,0.3);">' + p.bandera + '</div>',
          iconSize: [sz, sz], iconAnchor: [sz/2, sz/2]
        });
        L.marker(p.coords, { icon })
          .addTo(window._layerPaises)
          .bindPopup('<div style="font-family:Inter,sans-serif;min-width:180px;">'
            + '<div style="font-weight:700;font-size:14px;margin-bottom:6px;">' + p.bandera + ' ' + p.label + '</div>'
            + '<div style="font-size:20px;font-weight:800;color:#1A2B4B;margin-bottom:4px;">' + migsEnPais.toLocaleString('es') + ' NNA</div>'
            + '<div style="font-size:11px;color:#64748B;">' + orgsEnPais + ' organización' + (orgsEnPais!==1?'es':'') + ' activa' + (orgsEnPais!==1?'s':'') + '</div>'
            + '</div>', { closeButton: false });
      });

      // ── Capa Colombia detallada ──────────────────────────────

      // Marcadores de ciudad con círculos proporcionales
      const ciudadesCO = [
        { id:'CUC', label:'Cúcuta',       total: cr.entradaCucuta.total,  pct: 60, color:'#3B82F6', tipo:'Entrada (60%)' },
        { id:'RIO', label:'Riohacha',     total: cr.entradaRiohacha.total,pct: 40, color:'#8B5CF6', tipo:'Entrada (40%)' },
        { id:'BOG', label:'Bogotá',       total: cr.rutaInterior.ciudades[0].total, pct: cr.rutaInterior.ciudades[0].pct, color:'#10B981', tipo:'Interior 50%' },
        { id:'MED', label:'Medellín',     total: cr.rutaInterior.ciudades[1].total, pct: cr.rutaInterior.ciudades[1].pct, color:'#10B981', tipo:'Interior 30%' },
        { id:'CAL', label:'Cali',         total: cr.rutaInterior.ciudades[2].total, pct: cr.rutaInterior.ciudades[2].pct, color:'#10B981', tipo:'Interior 20%' },
        { id:'BAR', label:'Barranquilla', total: cr.rutaCosta.ciudades[0].total,    pct: cr.rutaCosta.ciudades[0].pct,    color:'#F59E0B', tipo:'Costa 40%' },
        { id:'CTG', label:'Cartagena',    total: cr.rutaCosta.ciudades[1].total,    pct: cr.rutaCosta.ciudades[1].pct,    color:'#F59E0B', tipo:'Costa 35%' },
        { id:'SMA', label:'Santa Marta',  total: cr.rutaCosta.ciudades[2].total,    pct: cr.rutaCosta.ciudades[2].pct,    color:'#F59E0B', tipo:'Costa 25%' },
      ];

      ciudadesCO.forEach(cd => {
        const ciudad = AppState.catalogos.ciudades.find(c=>c.id===cd.id);
        if (!ciudad) return;
        const radio = Math.max(14, Math.round(Math.sqrt(cd.total / cr.totalPorColombia) * 95));
        const circle = L.circle(ciudad.coords, {
          radius: radio * 1000, // en metros
          color: cd.color, fillColor: cd.color,
          fillOpacity: 0.25, weight: 2, opacity: 0.8
        }).addTo(window._layerColombia);
        const labelIcon = L.divIcon({
          className: '',
          html: `<div style="background:${cd.color};color:#fff;border-radius:20px;padding:3px 9px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.2);">${cd.label} · ${cd.total.toLocaleString('es')}</div>`,
          iconAnchor: [0, 0]
        });
        L.marker(ciudad.coords, { icon: labelIcon })
          .addTo(window._layerColombia)
          .bindPopup(`<div style="font-family:Inter,sans-serif;min-width:180px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px;">🇨🇴 ${cd.label}</div>
            <div style="font-size:12px;color:#374151;margin-bottom:2px;">${cd.tipo}</div>
            <div style="font-size:14px;font-weight:800;color:${cd.color};">${cd.total.toLocaleString('es')} NNA</div>
            <div style="font-size:11px;color:#94A3B8;">del total en Colombia</div>
          </div>`, { closeButton: false });
      });

      // Línea: ruta interior CO
      const rutaInterior = [
        AppState.catalogos.ciudades.find(c=>c.id==='CUC')?.coords,
        AppState.catalogos.ciudades.find(c=>c.id==='BOG')?.coords,
        AppState.catalogos.ciudades.find(c=>c.id==='MED')?.coords,
        AppState.catalogos.ciudades.find(c=>c.id==='CAL')?.coords,
      ].filter(Boolean);
      L.polyline(rutaInterior, { color:'#10B981', weight:2.5, opacity:0.7, dashArray:'6,4' })
        .addTo(window._layerColombia);

      // Línea: ruta costera CO
      const rutaCosta = [
        AppState.catalogos.ciudades.find(c=>c.id==='RIO')?.coords,
        AppState.catalogos.ciudades.find(c=>c.id==='SMA')?.coords,
        AppState.catalogos.ciudades.find(c=>c.id==='BAR')?.coords,
        AppState.catalogos.ciudades.find(c=>c.id==='CTG')?.coords,
      ].filter(Boolean);
      L.polyline(rutaCosta, { color:'#F59E0B', weight:2.5, opacity:0.7, dashArray:'6,4' })
        .addTo(window._layerColombia);

    }, 100);
  });
}

window.toggleMapaVista = function(vista) {
  const map = window._mapRutasInstance;
  if (!map) return;
  window._mapaVistaActual = vista;
  document.getElementById('btn-vista-paises')?.setAttribute('style', vista==='paises' ? 'background:#EFF6FF;color:#2563EB;border:1.5px solid #BFDBFE;font-weight:700;' : '');
  document.getElementById('btn-vista-colombia')?.setAttribute('style', vista==='colombia' ? 'background:#EFF6FF;color:#2563EB;border:1.5px solid #BFDBFE;font-weight:700;' : '');
  if (vista === 'colombia') {
    if (window._layerPaises) map.removeLayer(window._layerPaises);
    if (window._layerColombia) window._layerColombia.addTo(map);
    map.setView([7.5, -74.5], 6);
  } else {
    if (window._layerColombia) map.removeLayer(window._layerColombia);
    if (window._layerPaises) window._layerPaises.addTo(map);
    map.setView([10, -76], 5);
  }
};

function viewMapaMigrantes(container) {
  withLoader(container, () => {
    const ms          = AppState.mockStats;
    const ciudadesData= ms.distribucionCiudadesFEM || [];
    const migrantes   = getVisibleMigrantes();
    const kpiTotal    = ms.totalRegistros || 4862;
    const kpiAtencion = ms.atencionesCumuladas || 7779;
    const kpiMulti    = ms.nnaMultiplesPuntos || 2917;
    const kpiUnico    = ms.nnaUnicoPunto || 1945;
    const femPct      = ms.femVsOtras?.fem || 85;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Mapa de Rutas Migratorias</h1>
          <p class="page-subtitle">Red territorial FEM · Colombia y Venezuela · ${kpiTotal.toLocaleString('es')} NNA registrados</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" onclick="limpiarFiltrosRutas()">✕ Limpiar filtros</button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:14px;">
        <div class="card" style="padding:14px 16px;text-align:center;border-top:3px solid #1A2B4B;">
          <div style="font-size:22px;font-weight:800;color:#1A2B4B;">${kpiTotal.toLocaleString('es')}</div>
          <div style="font-size:11px;color:#64748B;margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">NNA Registrados</div>
        </div>
        <div class="card" style="padding:14px 16px;text-align:center;border-top:3px solid #2563EB;">
          <div style="font-size:22px;font-weight:800;color:#2563EB;">${kpiAtencion.toLocaleString('es')}</div>
          <div style="font-size:11px;color:#64748B;margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Atenciones Acum.</div>
        </div>
        <div class="card" style="padding:14px 16px;text-align:center;border-top:3px solid #F59E0B;">
          <div style="font-size:22px;font-weight:800;color:#D97706;">${kpiMulti.toLocaleString('es')}</div>
          <div style="font-size:11px;color:#64748B;margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Múltiples puntos</div>
        </div>
        <div class="card" style="padding:14px 16px;text-align:center;border-top:3px solid #64748B;">
          <div style="font-size:22px;font-weight:800;color:#475569;">${kpiUnico.toLocaleString('es')}</div>
          <div style="font-size:11px;color:#64748B;margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Un solo punto</div>
        </div>
        <div class="card" style="padding:14px 16px;text-align:center;border-top:3px solid #7C3AED;">
          <div style="font-size:22px;font-weight:800;color:#7C3AED;">${femPct}%</div>
          <div style="font-size:11px;color:#64748B;margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Atendidos por FEM</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card" style="padding:14px 18px;margin-bottom:12px;">
        <div style="font-size:12px;font-weight:700;color:#475569;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px;">Filtros del mapa</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
          <div style="flex:2;min-width:240px;">
            <div style="font-size:11px;font-weight:600;color:#64748B;margin-bottom:5px;">🧒 Filtrar por NNA — ver ruta individual</div>
            <select class="form-control" id="ruta-filtro-nna" onchange="renderRutasMapa()" style="font-size:13px;">
              <option value="">— Todos los NNA —</option>
              ${migrantes.map(m=>`<option value="${m.id}">${m.nombres} ${m.apellidos}</option>`).join('')}
            </select>
          </div>
          <div style="flex:2;min-width:200px;">
            <div style="font-size:11px;font-weight:600;color:#64748B;margin-bottom:5px;">📍 Filtrar por ciudad</div>
            <select class="form-control" id="ruta-filtro-ciudad" onchange="renderRutasMapa()" style="font-size:13px;">
              <option value="">— Todas las ciudades —</option>
              ${ciudadesData.map(c=>`<option value="${c.ciudadId}">${c.label} — ${c.nnaUnicos.toLocaleString('es')} NNA</option>`).join('')}
            </select>
          </div>
          <div style="flex:1;min-width:160px;">
            <div style="font-size:11px;font-weight:600;color:#64748B;margin-bottom:5px;">🗺️ Modo de vista</div>
            <select class="form-control" id="ruta-modo" onchange="renderRutasMapa()" style="font-size:13px;">
              <option value="rutas">Rutas + Ciudades</option>
              <option value="puntos">Solo puntos actuales</option>
            </select>
          </div>
        </div>
        <div id="ruta-conteo-badge" style="margin-top:10px;font-size:12px;color:#64748B;min-height:18px;"></div>
      </div>

      <!-- Mapa -->
      <div class="card" style="padding:0;overflow:hidden;margin-bottom:16px;">
        <div id="map-rutas" style="height:560px;"></div>
      </div>

      <!-- Tabla distribución por ciudad -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Distribución por Ciudad — Red FEM</div>
            <div class="card-subtitle">Estimación técnica conservadora por ponderación territorial · Corte abril 2026</div>
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="data-table" style="min-width:640px;">
            <thead>
              <tr>
                <th>Oficina FEM</th>
                <th>País</th>
                <th style="text-align:right;">NNA Únicos</th>
                <th style="text-align:right;">Atenciones</th>
                <th style="text-align:right;">Multi-punto</th>
                <th style="text-align:right;">% Red</th>
                <th style="min-width:120px;">Cobertura</th>
              </tr>
            </thead>
            <tbody>
              ${ciudadesData.map(c=>`
                <tr>
                  <td><strong>${c.label}</strong></td>
                  <td><span class="badge badge-gray">${c.paisLabel}</span></td>
                  <td style="text-align:right;font-weight:700;color:#1A2B4B;">${c.nnaUnicos.toLocaleString('es')}</td>
                  <td style="text-align:right;color:#2563EB;font-weight:600;">${c.atenciones.toLocaleString('es')}</td>
                  <td style="text-align:right;color:#7C3AED;">${c.multiPunto.toLocaleString('es')}</td>
                  <td style="text-align:right;font-weight:700;">${c.pct}%</td>
                  <td>
                    <div style="background:#F1F5F9;border-radius:20px;height:6px;overflow:hidden;">
                      <div style="background:#2563EB;height:100%;width:${c.pct * 5}%;border-radius:20px;max-width:100%;"></div>
                    </div>
                  </td>
                </tr>
              `).join('')}
              <tr style="background:#F8FAFC;">
                <td colspan="2"><strong>TOTAL RED FEM</strong></td>
                <td style="text-align:right;font-weight:800;color:#1A2B4B;">${(4862).toLocaleString('es')}</td>
                <td style="text-align:right;font-weight:800;color:#2563EB;">${(7779).toLocaleString('es')}</td>
                <td style="text-align:right;font-weight:800;color:#7C3AED;">${(2917).toLocaleString('es')}</td>
                <td style="text-align:right;font-weight:800;">100%</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="padding:12px 16px;background:#EFF6FF;border-top:1px solid #DBEAFE;display:flex;gap:24px;flex-wrap:wrap;">
          <div style="font-size:12px;color:#1D4ED8;"><strong>85%</strong> de los NNA atendidos por oficinas FEM · <strong>15%</strong> por organizaciones aliadas de la red</div>
          <div style="font-size:12px;color:#64748B;">Supuesto conservador: 40% con 1 punto · 60% con 2 puntos de atención</div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const map = L.map('map-rutas', { zoomControl: true, scrollWheelZoom: false })
        .setView([7.5, -71.5], 5);
      currentMapInstance = map;
      window._mapaRutasInstance = map;
      window._mapaRutasLayers  = {};

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap', maxZoom: 18
      }).addTo(map);

      renderRutasMapa();
    }, 100);
  });
}

// Edad en años desde fecha ISO
function calcEdadDesde(f) {
  if (!f) return null;
  const h = new Date(), n = new Date(f.substring(0,10) + 'T00:00:00');
  if (isNaN(n)) return null;
  let e = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
  return (e >= 0 && e <= 120) ? e : null;
}

// Tabla de coords por ID de país y ciudad — completamente independiente del catálogo
const _MAP_COORDS = {
  // Países
  VE:[8.0,-66.0], CO:[4.57,-74.29], PA:[8.99,-79.51], CR:[9.74,-83.75],
  HN:[15.2,-86.2], GT:[15.78,-90.23], MX:[23.63,-102.55], US:[37.09,-95.71],
  HT:[18.97,-72.28], EC:[-1.83,-78.18], PE:[-9.19,-75.01], CU:[21.52,-77.78],
  // Ciudades
  CCS:[10.48,-66.87], MAR:[10.63,-71.64], SCR:[7.77,-72.22],
  CUC:[7.89,-72.50],  RIO:[11.54,-72.91], CTG:[10.40,-75.51],
  BAR:[10.96,-74.80], SMA:[11.24,-74.20], BOG:[4.71,-74.07],
  MED:[6.25,-75.56],  CAL:[3.45,-76.53],  PTY:[8.99,-79.51],
  DAV:[8.42,-82.43],  SJO:[9.93,-84.08],  GUA:[14.63,-90.51],
  TAP:[14.89,-92.26], CDM:[19.43,-99.13], MTY:[25.67,-100.31],
  HOU:[29.76,-95.36], MIA:[25.77,-80.19], PAP:[18.54,-72.33],
  GYE:[-2.17,-79.92], LIM:[-12.04,-77.03], TGU:[14.10,-87.22],
};

// Nombre legible de país/ciudad
const _MAP_LABELS = {
  VE:'Venezuela', CO:'Colombia', PA:'Panamá', CR:'Costa Rica',
  HN:'Honduras', GT:'Guatemala', MX:'México', US:'Estados Unidos',
  HT:'Haití', EC:'Ecuador', PE:'Perú', CU:'Cuba',
  CCS:'Caracas', MAR:'Maracaibo', SCR:'San Cristóbal',
  CUC:'Cúcuta', RIO:'Riohacha', CTG:'Cartagena',
  BAR:'Barranquilla', SMA:'Santa Marta', BOG:'Bogotá',
  MED:'Medellín', CAL:'Cali', PTY:'Ciudad de Panamá',
  DAV:'David', SJO:'San José', GUA:'Ciudad de Guatemala',
  TAP:'Tapachula', CDM:'Ciudad de México', MTY:'Monterrey',
  HOU:'Houston', MIA:'Miami', PAP:'Puerto Príncipe',
  GYE:'Guayaquil', LIM:'Lima', TGU:'Tegucigalpa',
};

function _resolverCoordsLabel(m) {
  // 1. Ciudad actual (última ruta)
  if (m.ciudadActualId && _MAP_COORDS[m.ciudadActualId]) {
    return { coords: _MAP_COORDS[m.ciudadActualId], label: _MAP_LABELS[m.ciudadActualId] || m.ciudadActualId };
  }
  // 2. Ciudad de entrevista
  if (m.ciudadEntrevistaId && _MAP_COORDS[m.ciudadEntrevistaId]) {
    return { coords: _MAP_COORDS[m.ciudadEntrevistaId], label: _MAP_LABELS[m.ciudadEntrevistaId] || m.ciudadEntrevistaId };
  }
  // 3. País actual (última ruta)
  if (m.paisActualId && _MAP_COORDS[m.paisActualId]) {
    return { coords: _MAP_COORDS[m.paisActualId], label: _MAP_LABELS[m.paisActualId] || m.paisActualId };
  }
  // 4. País de entrevista
  if (m.paisEntrevistaId && _MAP_COORDS[m.paisEntrevistaId]) {
    return { coords: _MAP_COORDS[m.paisEntrevistaId], label: _MAP_LABELS[m.paisEntrevistaId] || m.paisEntrevistaId };
  }
  return null;
}

function renderMarcadoresMigrantes(map) {
  try {
    if (window._mapaMigrantesLayer) { map.removeLayer(window._mapaMigrantesLayer); }
  } catch(e) {}

  const estadoF = (document.getElementById('mapa-filtro-estado') || {}).value || '';
  const orgF    = (document.getElementById('mapa-filtro-org')    || {}).value || '';
  const edadF   = (document.getElementById('mapa-filtro-edad')   || {}).value || '';
  const nacF    = (document.getElementById('mapa-filtro-nac')    || {}).value || '';
  const procF   = (document.getElementById('mapa-filtro-procedencia') || {}).value || '';

  const edadParts = edadF ? edadF.split('-').map(Number) : [];
  const edadMin = edadParts[0] != null ? edadParts[0] : null;
  const edadMax = edadParts[1] != null ? edadParts[1] : null;

  const layer = L.layerGroup().addTo(map);
  window._mapaMigrantesLayer = layer;

  const COLORES = { en_transito:'#F59E0B', atendido:'#3B82F6', derivado:'#8B5CF6', ubicado:'#10B981' };
  const ESTADO_LABEL = { en_transito:'En tránsito', atendido:'Atendido', derivado:'Derivado', ubicado:'Ubicado' };

  // ── Aplicar filtros y agrupar por punto ──
  const grupos = {};
  let total = 0;

  const lista = getVisibleMigrantes();
  let sinCoords = 0;
  console.log('[Mapa] Total migrantes visibles:', lista.length,
    '| Ejemplo paisActualId:', lista[0]?.paisActualId,
    '| Ejemplo ciudadActualId:', lista[0]?.ciudadActualId);

  for (let i = 0; i < lista.length; i++) {
    const m = lista[i];
    try {
      if (estadoF && m.estado !== estadoF) continue;
      if (orgF    && m.orgActualId !== orgF && m.orgId !== orgF) continue;
      if (nacF    && m.nacionalidadId !== nacF) continue;
      if (procF   && m.paisOrigenId !== procF && m.procedenciaPaisId !== procF) continue;
      if (edadMin !== null) {
        const edad = calcEdadDesde(m.fechaNacimiento || m.ninoFechaNacimiento);
        if (edad === null || edad < edadMin || edad > edadMax) continue;
      }

      const loc = _resolverCoordsLabel(m);
      if (!loc) { sinCoords++; continue; }

      const k = loc.label;
      if (!grupos[k]) grupos[k] = { coords: loc.coords, label: loc.label, conteo: {}, total: 0 };
      const est = m.estado || 'en_transito';
      grupos[k].conteo[est] = (grupos[k].conteo[est] || 0) + 1;
      grupos[k].total++;
      total++;
    } catch(e) { /* skip migrante con error */ }
  }

  // ── Renderizar un marcador por grupo ──
  const puntos = Object.values(grupos);
  for (let i = 0; i < puntos.length; i++) {
    try {
      const g = puntos[i];
      const entries = Object.entries(g.conteo).sort(function(a,b){ return b[1]-a[1]; });
      const colorPrincipal = COLORES[entries[0][0]] || '#6B7280';
      const sz = Math.max(30, Math.min(22 + Math.round(Math.sqrt(g.total) * 5), 62));
      const label = g.total > 999 ? (g.total/1000).toFixed(1)+'k' : String(g.total);

      const iconHtml = '<div style="background:' + colorPrincipal + ';color:#fff;'
        + 'border-radius:50%;width:' + sz + 'px;height:' + sz + 'px;'
        + 'display:flex;align-items:center;justify-content:center;'
        + 'font-size:' + Math.round(sz*0.37) + 'px;font-weight:800;'
        + 'border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);">'
        + label + '</div>';

      const icon = L.divIcon({ className:'', html: iconHtml, iconSize:[sz,sz], iconAnchor:[sz/2,sz/2] });

      let breakdownHtml = '';
      for (let j = 0; j < entries.length; j++) {
        const col = COLORES[entries[j][0]] || '#6B7280';
        const lbl = ESTADO_LABEL[entries[j][0]] || entries[j][0];
        breakdownHtml += '<span style="background:' + col + '22;color:' + col + ';'
          + 'padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700;margin-right:3px;">'
          + lbl + ' ' + entries[j][1] + '</span>';
      }

      const popupHtml = '<div style="font-family:Inter,sans-serif;min-width:200px;">'
        + '<b style="font-size:14px;color:#1A2B4B;">&#x1F4CD; ' + g.label + '</b>'
        + '<p style="font-size:12px;color:#64748B;margin:4px 0 8px;">' + g.total.toLocaleString('es') + ' migrante' + (g.total !== 1 ? 's' : '') + '</p>'
        + breakdownHtml
        + '</div>';

      L.marker(g.coords, { icon: icon }).addTo(layer).bindPopup(popupHtml, { closeButton: false, maxWidth: 280 });
    } catch(e) { console.warn('[Mapa] Error al crear marcador:', e); }
  }

  // ── Actualizar contador ──
  console.log('[Mapa] Puntos:', puntos.length, '| Total con coord:', total, '| Sin coords:', sinCoords);
  const badge = document.getElementById('mapa-conteo-badge');
  if (badge) {
    if (puntos.length > 0) {
      badge.innerHTML = '<span style="color:#2563EB;font-weight:700;">' + total.toLocaleString('es') + '</span>'
        + ' migrante' + (total !== 1 ? 's' : '') + ' en '
        + '<span style="color:#2563EB;font-weight:700;">' + puntos.length + '</span>'
        + ' localidad' + (puntos.length !== 1 ? 'es' : '')
        + (sinCoords > 0 ? ' · <span style="color:#94A3B8;">' + sinCoords.toLocaleString('es') + ' sin coordenadas</span>' : '');
    } else {
      badge.innerHTML = '<span style="color:#DC2626;">Sin resultados para los filtros seleccionados.</span>'
        + (sinCoords > 0 ? ' <span style="color:#94A3B8;">(' + sinCoords + ' sin coordenadas)</span>' : '');
    }
  }
}

function filtrarMapaMigrantes() {
  if (window._mapaMigrantesInstance) {
    renderMarcadoresMigrantes(window._mapaMigrantesInstance);
    _actualizarKPIsMapa();
  }
}

function _actualizarKPIsMapa() {
  // Recalcular KPIs según filtros activos
  const estadoF = (document.getElementById('mapa-filtro-estado') || {}).value || '';
  const orgF    = (document.getElementById('mapa-filtro-org')    || {}).value || '';
  const edadF   = (document.getElementById('mapa-filtro-edad')   || {}).value || '';
  const nacF    = (document.getElementById('mapa-filtro-nac')    || {}).value || '';
  const procF   = (document.getElementById('mapa-filtro-procedencia') || {}).value || '';
  const edadParts = edadF ? edadF.split('-').map(Number) : [];
  const edadMin = edadParts[0] != null ? edadParts[0] : null;
  const edadMax = edadParts[1] != null ? edadParts[1] : null;

  const lista = getVisibleMigrantes().filter(function(m) {
    if (estadoF && m.estado !== estadoF) return false;
    if (orgF    && m.orgActualId !== orgF && m.orgId !== orgF) return false;
    if (nacF    && m.nacionalidadId !== nacF) return false;
    if (procF   && m.paisOrigenId !== procF && m.procedenciaPaisId !== procF) return false;
    if (edadMin !== null) {
      const edad = calcEdadDesde(m.fechaNacimiento || m.ninoFechaNacimiento);
      if (edad === null || edad < edadMin || edad > edadMax) return false;
    }
    return true;
  });

  const set = function(id, val) { const el = document.getElementById(id); if (el) el.textContent = val.toLocaleString('es'); };
  set('kpi-total',    lista.length);
  set('kpi-transito', lista.filter(function(m){ return m.estado==='en_transito'; }).length);
  set('kpi-atendido', lista.filter(function(m){ return m.estado==='atendido'; }).length);
  set('kpi-derivado', lista.filter(function(m){ return m.estado==='derivado'; }).length);
  set('kpi-ubicado',  lista.filter(function(m){ return m.estado==='ubicado'; }).length);
  set('kpi-paises',   new Set(lista.map(function(m){ return m.paisActualId || m.paisEntrevistaId; }).filter(Boolean)).size);
  const sc = document.getElementById('mapa-subtitle-count');
  if (sc) sc.textContent = lista.length.toLocaleString('es');
}

function limpiarFiltrosMapa() {
  ['mapa-filtro-estado','mapa-filtro-org','mapa-filtro-edad','mapa-filtro-nac','mapa-filtro-procedencia']
    .forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
  filtrarMapaMigrantes();
}

function buscarEnMapa() {
  const query = document.getElementById('search-mapa')?.value.toLowerCase() || '';
  // Implementar búsqueda de migrantes en el mapa
  showToast(`Buscando: ${query || 'todos'}`, 'info');
}

function limpiarMapaBusqueda() {
  document.getElementById('search-mapa').value = '';
  showToast('Búsqueda limpiada', 'success');
}

// ─── MAPA DE RUTAS: renderizado y filtros ─────────────────────────

function renderRutasMapa() {
  const map = window._mapaRutasInstance;
  if (!map) return;

  // Limpiar capas previas
  const layers = window._mapaRutasLayers || {};
  Object.values(layers).forEach(l => { try { map.removeLayer(l); } catch(e){} });
  window._mapaRutasLayers = {};

  const nnaF    = (document.getElementById('ruta-filtro-nna')    || {}).value || '';
  const ciudadF = (document.getElementById('ruta-filtro-ciudad') || {}).value || '';
  const modo    = (document.getElementById('ruta-modo')          || {}).value || 'rutas';

  const ms           = AppState.mockStats;
  const ciudadesData = ms.distribucionCiudadesFEM || [];
  const migrantes    = getVisibleMigrantes();

  // Helper: añadir capa registrada
  function addLayer(key, layer) {
    layer.addTo(map);
    window._mapaRutasLayers[key] = layer;
    return layer;
  }

  // ── 1. Nodos FEM (modo rutas, sin NNA seleccionado) ──
  if (modo === 'rutas' && !nnaF) {
    ciudadesData.forEach((c, i) => {
      const coords = _MAP_COORDS[c.ciudadId];
      if (!coords) return;
      const isSel  = ciudadF === c.ciudadId;
      const radio  = Math.max(14, Math.min(8 + Math.round(Math.sqrt(c.nnaUnicos) * 0.6), 40));
      const color  = isSel ? '#DC2626' : '#1A2B4B';

      const circle = L.circleMarker(coords, {
        radius: radio, fillColor: color, color: '#fff',
        weight: isSel ? 3 : 2, opacity: 1, fillOpacity: isSel ? 1 : 0.85,
      });
      circle.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:200px;">
        <b style="font-size:14px;color:#1A2B4B;">📍 ${c.label}</b>
        <p style="font-size:11px;color:#64748B;margin:3px 0 8px;">${c.paisLabel}</p>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:#64748B;">NNA únicos:</span>
            <strong style="color:#1A2B4B;">${c.nnaUnicos.toLocaleString('es')}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:#64748B;">Atenciones:</span>
            <strong style="color:#2563EB;">${c.atenciones.toLocaleString('es')}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:#64748B;">Multi-punto:</span>
            <strong style="color:#7C3AED;">${c.multiPunto.toLocaleString('es')}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:#64748B;">% red FEM:</span>
            <strong style="color:#1A2B4B;">${c.pct}%</strong>
          </div>
        </div>
      </div>`, { maxWidth: 240, closeButton: false });

      const labelIcon = L.divIcon({
        className: '',
        html: `<div style="background:${color};color:#fff;font-size:9px;font-weight:800;
          padding:2px 6px;border-radius:10px;white-space:nowrap;
          box-shadow:0 1px 4px rgba(0,0,0,.3);margin-top:${radio+4}px;margin-left:-20px;">${c.label}</div>`,
        iconSize: [0,0], iconAnchor: [0,0],
      });

      addLayer('fem_circle_' + i, circle);
      addLayer('fem_label_'  + i, L.marker(coords, { icon: labelIcon, interactive: false }));
    });

    // ── 2. Rutas agregadas de fondo (sin filtro de ciudad) ──
    if (!ciudadF) {
      const RUTAS_AGRUP = [
        { from:'CCS', to:'SCR', vol:320,  label:'Caracas → San Cristóbal' },
        { from:'CCS', to:'MAR', vol:180,  label:'Caracas → Maracaibo' },
        { from:'SCR', to:'CUC', vol:580,  label:'San Cristóbal → Cúcuta' },
        { from:'MAR', to:'RIO', vol:140,  label:'Maracaibo → Riohacha' },
        { from:'RIO', to:'BAR', vol:240,  label:'Riohacha → Barranquilla' },
        { from:'BAR', to:'SMA', vol:180,  label:'Barranquilla → Santa Marta' },
        { from:'SMA', to:'CTG', vol:200,  label:'Santa Marta → Cartagena' },
        { from:'CUC', to:'BOG', vol:460,  label:'Cúcuta → Bogotá' },
        { from:'CUC', to:'MED', vol:290,  label:'Cúcuta → Medellín' },
        { from:'BOG', to:'MED', vol:180,  label:'Bogotá → Medellín' },
        { from:'BOG', to:'CAL', vol:140,  label:'Bogotá → Cali' },
        { from:'MED', to:'CTG', vol: 90,  label:'Medellín → Cartagena' },
        { from:'MED', to:'CAL', vol:110,  label:'Medellín → Cali' },
        { from:'CAL', to:'PTY', vol: 60,  label:'Cali → Ciudad de Panamá' },
        { from:'CTG', to:'PTY', vol: 80,  label:'Cartagena → Ciudad de Panamá' },
        { from:'PTY', to:'SJO', vol: 55,  label:'Panamá → San José' },
        { from:'SJO', to:'GUA', vol: 42,  label:'San José → Guatemala' },
        { from:'GUA', to:'CDM', vol: 38,  label:'Guatemala → Ciudad de México' },
        { from:'CDM', to:'MIA', vol: 30,  label:'México → Miami' },
        { from:'CDM', to:'HOU', vol: 28,  label:'México → Houston' },
      ];
      RUTAS_AGRUP.forEach((r, i) => {
        const c1 = _MAP_COORDS[r.from], c2 = _MAP_COORDS[r.to];
        if (!c1 || !c2) return;
        const weight = Math.max(1.5, Math.min(1 + r.vol / 120, 6));
        const line = L.polyline([c1, c2], {
          color: '#2563EB', weight, opacity: 0.32, dashArray: '6 4',
        });
        line.bindTooltip(r.label + ' · ~' + r.vol + ' NNA', { sticky: true });
        addLayer('ruta_agrup_' + i, line);
      });
    }

    // Anillo de highlight para la ciudad filtrada
    if (ciudadF) {
      const coords = _MAP_COORDS[ciudadF];
      if (coords) {
        addLayer('city_ring', L.circleMarker(coords, {
          radius: 38, fillColor: 'transparent', color: '#DC2626',
          weight: 2.5, opacity: 0.65, fillOpacity: 0, dashArray: '5 4',
        }));
      }
    }
  }

  // ── 3. Ruta individual de un NNA ──
  if (nnaF) {
    const m = migrantes.find(x => x.id === nnaF);
    if (m) {
      const pasos = m.ruta || [];
      const puntos = pasos
        .map(p => _MAP_COORDS[p.ciudadId] || _MAP_COORDS[p.paisId])
        .filter(Boolean);

      if (puntos.length >= 2) {
        addLayer('nna_ruta', L.polyline(puntos, {
          color: '#DC2626', weight: 4, opacity: 0.85, lineJoin: 'round',
        }));
        puntos.forEach((pt, idx) => {
          const paso = pasos[idx];
          const lugLabel = _MAP_LABELS[paso?.ciudadId] || _MAP_LABELS[paso?.paisId] || ('Punto ' + (idx+1));
          const isFirst  = idx === 0;
          const isLast   = idx === puntos.length - 1;
          const color    = isFirst ? '#16A34A' : isLast ? '#DC2626' : '#F59E0B';
          const dot = L.circleMarker(pt, {
            radius: isFirst || isLast ? 10 : 7,
            fillColor: color, color: '#fff', weight: 2, fillOpacity: 1,
          });
          dot.bindPopup(`<div style="font-family:Inter,sans-serif;">
            <b style="color:#1A2B4B;">${isFirst ? '🟢 Origen' : isLast ? '🔴 Posición actual' : '🟡 Parada ' + idx}</b>
            <p style="margin:4px 0 0;font-size:12px;color:#475569;">${lugLabel}</p>
            ${paso?.fecha ? '<p style="margin:2px 0 0;font-size:11px;color:#94A3B8;">' + paso.fecha + '</p>' : ''}
          </div>`, { closeButton: false });
          addLayer('nna_punto_' + idx, dot);
        });
        try { map.fitBounds(window._mapaRutasLayers['nna_ruta'].getBounds().pad(0.3)); } catch(e){}
      } else {
        // NNA con un solo punto
        const loc = _resolverCoordsLabel(m);
        if (loc) {
          const dot = L.circleMarker(loc.coords, {
            radius: 12, fillColor: '#DC2626', color: '#fff', weight: 3, fillOpacity: 1,
          });
          dot.bindPopup(`<div style="font-family:Inter,sans-serif;">
            <b style="color:#1A2B4B;">📍 ${loc.label}</b>
            <p style="font-size:12px;color:#475569;margin:4px 0 0;">Un solo punto de atención registrado</p>
          </div>`, { closeButton: false });
          addLayer('nna_punto_unico', dot);
          map.setView(loc.coords, 7);
        }
      }
    }
  }

  // ── 4. Modo "solo puntos actuales" ──
  if (modo === 'puntos') {
    const COLORES_EST = { en_transito:'#F59E0B', atendido:'#3B82F6', derivado:'#8B5CF6', ubicado:'#10B981' };
    const lista = ciudadF
      ? migrantes.filter(m => m.ruta?.some(p => p.ciudadId === ciudadF) || m.ciudadActualId === ciudadF)
      : migrantes;
    const grupos = {};
    lista.forEach(m => {
      const loc = _resolverCoordsLabel(m);
      if (!loc) return;
      if (!grupos[loc.label]) grupos[loc.label] = { coords: loc.coords, label: loc.label, items: [] };
      grupos[loc.label].items.push(m);
    });
    Object.values(grupos).forEach((g, i) => {
      const est   = g.items[0]?.estado || 'en_transito';
      const color = COLORES_EST[est] || '#6B7280';
      const sz    = Math.max(20, Math.min(16 + Math.round(Math.sqrt(g.items.length) * 4), 50));
      const icon  = L.divIcon({
        className: '',
        html: `<div style="background:${color};color:#fff;border-radius:50%;
          width:${sz}px;height:${sz}px;display:flex;align-items:center;justify-content:center;
          font-size:${Math.round(sz*0.37)}px;font-weight:800;
          border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);">
          ${g.items.length > 999 ? (g.items.length/1000).toFixed(1)+'k' : g.items.length}
        </div>`,
        iconSize: [sz, sz], iconAnchor: [sz/2, sz/2],
      });
      const marker = L.marker(g.coords, { icon });
      marker.bindPopup(`<div style="font-family:Inter,sans-serif;">
        <b style="color:#1A2B4B;">📍 ${g.label}</b>
        <p style="font-size:12px;color:#475569;margin:4px 0 0;">${g.items.length} NNA en este punto</p>
      </div>`, { closeButton: false });
      addLayer('punto_' + i, marker);
    });
  }

  // ── 5. Badge de conteo ──
  const badge = document.getElementById('ruta-conteo-badge');
  if (badge) {
    if (nnaF) {
      const m = migrantes.find(x => x.id === nnaF);
      if (m) {
        const pasos = (m.ruta || []).length;
        badge.innerHTML = `Mostrando ruta de <strong style="color:#DC2626;">${m.nombres} ${m.apellidos}</strong> · ${pasos || 1} punto${pasos !== 1 ? 's' : ''} de atención registrado${pasos !== 1 ? 's' : ''}`;
      }
    } else if (ciudadF) {
      const c = ciudadesData.find(x => x.ciudadId === ciudadF);
      if (c) badge.innerHTML = `Ciudad seleccionada: <strong style="color:#1A2B4B;">${c.label}</strong> · <strong>${c.nnaUnicos.toLocaleString('es')}</strong> NNA únicos · <strong>${c.atenciones.toLocaleString('es')}</strong> atenciones`;
    } else {
      const total = ciudadesData.reduce((s, c) => s + c.nnaUnicos, 0) || 4862;
      badge.innerHTML = `Red completa FEM · <strong style="color:#1A2B4B;">${total.toLocaleString('es')}</strong> NNA únicos en <strong>${ciudadesData.length || 8}</strong> ciudades`;
    }
  }
}

function limpiarFiltrosRutas() {
  ['ruta-filtro-nna', 'ruta-filtro-ciudad'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const modo = document.getElementById('ruta-modo');
  if (modo) modo.value = 'rutas';
  renderRutasMapa();
  showToast('Filtros del mapa limpiados', 'info');
}

// ─── VISTA: SEGURIDAD ────────────────────────────────────────────

function viewSeguridad(container, seccion) {
  withLoader(container, () => {

    // ── Niveles de Acceso ─────────────────────────────────────
    if (seccion === 'niveles') {
      const SECCIONES = ['migrantes','parametros','seguridad','configuracion'];
      const SECC_LABELS = { migrantes:'👤 Migrantes', parametros:'⚙️ Parámetros', seguridad:'🔒 Seguridad', configuracion:'👥 Configuración' };
      const roles = [...new Set(Object.keys(PERMISOS_DEFAULT_ROL))];

      // Usuarios reales agrupados por rol
      const usuariosPorRol = {};
      (AppState.usuarios||[]).forEach(u => {
        if (!usuariosPorRol[u.rol]) usuariosPorRol[u.rol] = [];
        usuariosPorRol[u.rol].push(u);
      });

      container.innerHTML = `
        <div class="page-header">
          <div><h1 class="page-title">Niveles de Acceso</h1>
          <p class="page-subtitle">Matriz de permisos por rol y usuarios activos</p></div>
        </div>

        <div class="card">
          <div class="card-header"><div><div class="card-title">Matriz de permisos por rol</div></div></div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rol</th>
                  ${SECCIONES.map(s=>`<th style="text-align:center;">${SECC_LABELS[s]}</th>`).join('')}
                  <th style="text-align:center;">Usuarios</th>
                </tr>
              </thead>
              <tbody>
                ${roles.map(rol => {
                  const perms = PERMISOS_DEFAULT_ROL[rol] || [];
                  const count = (usuariosPorRol[rol]||[]).length;
                  return `<tr>
                    <td><strong>${rol}</strong></td>
                    ${SECCIONES.map(s=>`
                      <td style="text-align:center;">
                        ${perms.includes(s)
                          ? '<span style="color:#16A34A;font-size:16px;">✓</span>'
                          : '<span style="color:#D1D5DB;font-size:14px;">—</span>'}
                      </td>`).join('')}
                    <td style="text-align:center;"><strong>${count}</strong></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card" style="margin-top:20px;">
          <div class="card-header">
            <div><div class="card-title">Usuarios activos (${(AppState.usuarios||[]).filter(u=>u.activo).length})</div></div>
            <button class="btn btn-primary btn-sm" onclick="navigate('/configuracion/usuarios')">Gestionar usuarios</button>
          </div>
          <div style="padding:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">
            ${(AppState.usuarios||[]).filter(u=>u.activo).map(u => {
              const perms = getPermisosUsuario(u);
              return `<div style="border:1px solid #E2E8F0;border-radius:10px;padding:14px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <div style="width:34px;height:34px;border-radius:50%;background:#2563EB;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">
                    ${((u.nombres[0]||'')+(u.apellidos[0]||'')).toUpperCase()||'?'}
                  </div>
                  <div>
                    <div style="font-weight:700;font-size:13px;color:#1A2B4B;">${u.nombres} ${u.apellidos}</div>
                    <div style="font-size:11px;color:#64748B;">${u.rol}</div>
                  </div>
                </div>
                <div style="font-size:11px;color:#94A3B8;margin-bottom:8px;font-family:monospace;word-break:break-all;">${u.email}</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;">
                  ${perms.map(p=>`<span style="background:#EFF6FF;color:#2563EB;font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;">${p}</span>`).join('')}
                  ${u.esGlobal?'<span style="background:#FEF3C7;color:#B45309;font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;">global</span>':''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      `;
      return;
    }

    // ── Gestión de Claves ─────────────────────────────────────
    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">Gestión de Claves</h1>
        <p class="page-subtitle">Configuración de autenticación y proveedores de acceso</p></div>
      </div>

      <div class="card">
        <div class="card-header"><div><div class="card-title">Proveedores de autenticación activos</div></div></div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid #E2E8F0;border-radius:10px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:22px;">📧</span>
              <div>
                <div style="font-weight:700;font-size:14px;">Email + Contraseña</div>
                <div style="font-size:12px;color:#64748B;">Autenticación con correo y clave personal</div>
              </div>
            </div>
            <span class="badge badge-success">Activo</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid #E2E8F0;border-radius:10px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <svg width="22" height="22" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              <div>
                <div style="font-weight:700;font-size:14px;">Google OAuth</div>
                <div style="font-size:12px;color:#64748B;">Inicio de sesión con cuenta de Google</div>
              </div>
            </div>
            <span class="badge badge-success">Activo</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid #E2E8F0;border-radius:10px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:22px;">✉️</span>
              <div>
                <div style="font-weight:700;font-size:14px;">Invitaciones por email</div>
                <div style="font-size:12px;color:#64748B;">Usuarios invitados por administrador vía Edge Function</div>
              </div>
            </div>
            <span class="badge badge-success">Activo</span>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:20px;">
        <div class="card-header"><div><div class="card-title">Configuración de sesión</div></div></div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #F1F5F9;">
            <div>
              <div style="font-weight:600;font-size:13px;">Proveedor de autenticación</div>
              <div style="font-size:12px;color:#64748B;">Supabase Auth (PostgreSQL)</div>
            </div>
            <span class="badge badge-info">Supabase</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #F1F5F9;">
            <div>
              <div style="font-weight:600;font-size:13px;">Expiración de sesión</div>
              <div style="font-size:12px;color:#64748B;">Configurado en Supabase Auth → Settings</div>
            </div>
            <span style="font-size:12px;font-weight:600;color:#475569;">3600 seg (1 hora)</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;">
            <div>
              <div style="font-weight:600;font-size:13px;">Panel de administración</div>
              <div style="font-size:12px;color:#64748B;">Gestión avanzada de usuarios y sesiones</div>
            </div>
            <a href="https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/auth/users" target="_blank" class="btn btn-secondary btn-sm">Abrir Supabase →</a>
          </div>
        </div>
      </div>
    `;
  });
}

// ─── MÓDULO: GESTIÓN DE USUARIOS ────────────────────────────

function viewUsuarios(container) {
  withLoader(container, () => {
    const usuarios = AppState.usuarios || [];
    const orgs     = AppState.organizaciones || [];

    const rows = usuarios.map(u => {
      const org = orgs.find(o => o.id === u.orgId);
      const orgLabel = u.esGlobal
        ? `<span style="background:#EFF6FF;color:#2563EB;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">🌐 Global</span>`
        : (org ? org.nombre : (u.orgIds?.length > 1 ? `${u.orgIds.length} organizaciones` : '—'));
      const estadoBadge = u.activo
        ? `<span class="badge badge-atendido">Activo</span>`
        : `<span class="badge badge-derivado">Suspendido</span>`;
      const rolColor = u.rol === 'Administrador' ? '#6D28D9' : u.esGlobal ? '#0F766E' : '#2563EB';
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="avatar avatar-sm" style="background:linear-gradient(135deg,${rolColor}22,${rolColor}44);color:${rolColor};font-weight:800;font-size:12px;">
                ${(u.nombres[0]||'') + (u.apellidos[0]||'')}
              </div>
              <div>
                <div style="font-weight:700;color:#1A2B4B;font-size:13px;">${u.nombres} ${u.apellidos}</div>
                <div style="font-size:11px;color:#64748B;">${u.email || '—'}</div>
              </div>
            </div>
          </td>
          <td><span style="background:${rolColor}15;color:${rolColor};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">${u.rol}</span></td>
          <td style="font-size:12px;color:#475569;">${orgLabel}</td>
          <td>${estadoBadge}</td>
          <td style="font-size:12px;color:#64748B;">${u.ultimoAcceso || '—'}</td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="navigate('/configuracion/usuario/nuevo',{editId:'${u.id}'})">✏ Editar</button>
              <button class="btn btn-secondary btn-sm" onclick="simularInvitacion('${u.id}')">✉ Reenviar</button>
              <button class="btn btn-sm" style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;" onclick="toggleUsuarioActivo('${u.id}')">
                ${u.activo ? '⊗ Suspender' : '✓ Activar'}
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Usuarios</h1>
          <p class="page-subtitle">${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''} registrado${usuarios.length !== 1 ? 's' : ''} · ${usuarios.filter(u=>u.activo).length} activos</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="navigate('/configuracion/usuario/nuevo')">+ Nuevo Usuario</button>
        </div>
      </div>

      <!-- Banner de usuario activo con org filter -->
      <div id="banner-filtro-org" style="display:none;"></div>

      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;gap:12px;">
          <div style="font-size:12px;font-weight:600;color:#475569;">Simular acceso como:</div>
          <select id="sel-simular-usuario" class="form-control" style="width:auto;min-width:220px;font-size:13px;" onchange="simularAccesoUsuario(this.value)">
            ${usuarios.map(u => `<option value="${u.id}" ${AppState.currentUser?.id === u.id ? 'selected' : ''}>${u.nombres} ${u.apellidos} (${u.rol})</option>`).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" onclick="simularAccesoUsuario(document.getElementById('sel-simular-usuario').value)">Aplicar</button>
          <div id="sim-user-badge" style="font-size:12px;color:#2563EB;"></div>
        </div>
        <div style="overflow-x:auto;">
          <table class="data-table" style="min-width:700px;">
            <thead><tr>
              <th>Usuario</th><th>Rol</th><th>Organización / Acceso</th><th>Estado</th><th>Último acceso</th><th>Acciones</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;

    // Mostrar usuario activo en badge
    actualizarBadgeSimulacion();
  });
}

function viewUsuarioForm(container, params = {}) {
  withLoader(container, () => {
    const editId  = params.editId || null;
    const u       = editId ? AppState.usuarios.find(x => x.id === editId) : null;
    const orgs    = AppState.organizaciones || [];

    const orgsCheckboxes = orgs.map(o => `
      <label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;font-size:13px;color:#334155;transition:background .15s;"
        onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='transparent'">
        <input type="checkbox" name="orgAcceso" value="${o.id}" style="accent-color:#2563EB;"
          ${u && u.orgIds && u.orgIds.includes(o.id) ? 'checked' : ''}>
        <span style="font-size:11px;color:#94A3B8;margin-right:2px;">${AppState.catalogos.paises.find(p=>p.id===o.paisId)?.bandera||''}</span>
        ${o.nombre}
      </label>`).join('');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${u ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
          <p class="page-subtitle">${u ? `Editando a ${u.nombres} ${u.apellidos}` : 'Crear cuenta e invitar por correo'}</p>
        </div>
      </div>
      <div class="card" style="max-width:680px;">
        <!-- Datos personales -->
        <div class="form-section-title fst-migrante">Datos del usuario</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label">Nombres *</label>
            <input type="text" id="usr-nombres" class="form-control" value="${u?.nombres||''}">
          </div>
          <div class="form-group">
            <label class="form-label">Apellidos *</label>
            <input type="text" id="usr-apellidos" class="form-control" value="${u?.apellidos||''}">
          </div>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label">Correo electrónico * <span style="font-size:11px;color:#64748B;">(se enviará la invitación aquí)</span></label>
          <input type="email" id="usr-email" class="form-control" value="${u?.email||''}">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
          <div class="form-group">
            <label class="form-label">Rol / Cargo</label>
            <select id="usr-rol" class="form-control">
              ${['Operador','Operadora','Coordinador','Coordinadora','Director','Directora','Administrador'].map(r =>
                `<option value="${r}" ${u?.rol===r?'selected':''}>${r}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Organización principal</label>
            <select id="usr-org-principal" class="form-control">
              <option value="">— Sin org principal —</option>
              ${orgs.map(o=>`<option value="${o.id}" ${u?.orgId===o.id?'selected':''}>${o.nombre}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Permisos de acceso -->
        <div class="form-section-title fst-entrevista">Permisos de acceso a datos</div>
        <div class="form-group" style="margin-bottom:16px;">
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:14px 16px;border:1.5px solid ${u?.esGlobal?'#2563EB':'#E2E8F0'};border-radius:10px;background:${u?.esGlobal?'#EFF6FF':'#fff'};transition:all .2s;" id="label-global">
            <input type="checkbox" id="usr-es-global" style="accent-color:#2563EB;width:16px;height:16px;" ${u?.esGlobal?'checked':''} onchange="toggleAccesoGlobal(this.checked)">
            <div>
              <div style="font-weight:700;font-size:13px;color:#1A2B4B;">🌐 Acceso Global</div>
              <div style="font-size:11px;color:#64748B;margin-top:2px;">Puede ver reportes de todas las organizaciones de la plataforma</div>
            </div>
          </label>
        </div>
        <div id="org-selector-wrapper" style="display:${u?.esGlobal?'none':'block'};">
          <div style="font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Organizaciones que puede ver:</div>
          <div style="border:1px solid #E2E8F0;border-radius:10px;padding:4px 4px;max-height:280px;overflow-y:auto;">
            ${orgsCheckboxes}
          </div>
          <div style="font-size:11px;color:#94A3B8;margin-top:6px;">Si no selecciona ninguna, solo verá datos de su organización principal.</div>
        </div>

        <!-- Permisos de secciones -->
        <div class="form-section-title fst-situacion" style="margin-top:20px;">Secciones habilitadas</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;" id="permisos-secciones">
          ${[
            { key:'migrantes',     label:'👤 Migrantes',     desc:'Dashboard, listado, mapa, registro' },
            { key:'parametros',    label:'⚙️ Parámetros',    desc:'Catálogos y tablas de referencia' },
            { key:'seguridad',     label:'🔒 Seguridad',     desc:'Niveles de acceso' },
            { key:'configuracion', label:'👥 Configuración', desc:'Gestión de usuarios' },
          ].map(s => {
            const permsU = u?.permisos?.length > 0 ? u.permisos : (PERMISOS_DEFAULT_ROL[u?.rol] || ['migrantes']);
            const checked = permsU.includes(s.key);
            return `<label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;padding:12px;border:1.5px solid ${checked?'#2563EB':'#E2E8F0'};border-radius:10px;background:${checked?'#EFF6FF':'#fff'};transition:all .2s;" id="perm-label-${s.key}">
              <input type="checkbox" name="permSeccion" value="${s.key}" style="accent-color:#2563EB;width:15px;height:15px;margin-top:2px;flex-shrink:0;" ${checked?'checked':''} onchange="togglePermLabel('${s.key}',this.checked)">
              <div>
                <div style="font-weight:700;font-size:12px;color:#1A2B4B;">${s.label}</div>
                <div style="font-size:11px;color:#64748B;">${s.desc}</div>
              </div>
            </label>`;
          }).join('')}
        </div>
        <div style="font-size:11px;color:#94A3B8;margin-bottom:20px;">Los permisos de secciones se aplican independientemente del rol asignado.</div>

        <!-- Acciones -->
        <div style="display:flex;justify-content:flex-end;gap:12px;padding-top:24px;margin-top:4px;border-top:1px solid var(--color-border);">
          <button class="btn btn-secondary" onclick="navigate('/configuracion/usuarios')">Cancelar</button>
          <button class="btn btn-primary" id="btn-guardar-usuario" onclick="guardarUsuario('${editId||''}')">
            ${u ? '✓ Guardar cambios' : '✉ Crear y enviar invitación'}
          </button>
        </div>
      </div>
    `;
  });
}

function toggleAccesoGlobal(checked) {
  const wrapper = document.getElementById('org-selector-wrapper');
  const label   = document.getElementById('label-global');
  if (wrapper) wrapper.style.display = checked ? 'none' : 'block';
  if (label) {
    label.style.borderColor = checked ? '#2563EB' : '#E2E8F0';
    label.style.background  = checked ? '#EFF6FF' : '#fff';
  }
}

function togglePermLabel(key, checked) {
  const label = document.getElementById(`perm-label-${key}`);
  if (label) {
    label.style.borderColor = checked ? '#2563EB' : '#E2E8F0';
    label.style.background  = checked ? '#EFF6FF' : '#fff';
  }
}

// ─── URL de la Edge Function ──────────────────────────────────
const EDGE_FN_INVITE = 'https://izcqcnunryhntojhxywu.supabase.co/functions/v1/invite-user';

// Helper: llamar Edge Function con el JWT del usuario activo
async function callInviteEdgeFn(payload) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const token = session?.access_token || SUPABASE_KEY;

  // window.location.origin es "null" para file:// → usar fallback de Supabase
  const origin = (window.location.origin && window.location.origin !== 'null')
    ? window.location.origin
    : 'https://izcqcnunryhntojhxywu.supabase.co';

  const res = await fetch(EDGE_FN_INVITE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_KEY,
    },
    body: JSON.stringify({ ...payload, redirect_to: origin }),
  });

  // Leer body como texto primero (evita problema de body ya consumido)
  const rawText = await res.text();
  console.log('[EdgeFn] status:', res.status, '| body:', rawText);

  let json;
  try {
    json = JSON.parse(rawText);
  } catch (_) {
    throw new Error(`Respuesta no válida (HTTP ${res.status}): ${rawText.slice(0, 300)}`);
  }

  if (!res.ok || !json.ok) {
    const errMsg = typeof json.error === 'string'
      ? json.error
      : JSON.stringify(json.error ?? json);
    throw new Error(errMsg || `HTTP ${res.status}`);
  }
  return json;
}

async function guardarUsuario(editId) {
  const nombres    = document.getElementById('usr-nombres')?.value?.trim();
  const apellidos  = document.getElementById('usr-apellidos')?.value?.trim();
  const email      = document.getElementById('usr-email')?.value?.trim();
  const rol        = document.getElementById('usr-rol')?.value;
  const orgPrinc   = document.getElementById('usr-org-principal')?.value || null;
  const esGlobal   = document.getElementById('usr-es-global')?.checked || false;
  const orgIds     = esGlobal ? [] :
    [...document.querySelectorAll('input[name="orgAcceso"]:checked')].map(el => el.value);
  const permisos   = [...document.querySelectorAll('input[name="permSeccion"]:checked')].map(el => el.value);

  if (!nombres || !apellidos || !email) {
    showToast('Completa los campos obligatorios: Nombres, Apellidos y Correo.', 'warning');
    return;
  }
  if (!email.includes('@')) {
    showToast('El correo electrónico no es válido.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-guardar-usuario');
  if (btn) { btn.disabled = true; btn.textContent = editId ? 'Guardando…' : 'Enviando invitación…'; }

  try {
    if (editId) {
      // ── Actualizar perfil existente ──────────────────────────
      await callInviteEdgeFn({
        action: 'update',
        user_id: editId,
        nombre_completo: `${nombres} ${apellidos}`,
        rol,
        organizacion_id: orgPrinc || '',
        es_global: esGlobal,
        orgs_adicionales: orgIds,
        permisos,
      });

      // Reflejar en estado local
      const idx = AppState.usuarios.findIndex(u => u.id === editId);
      if (idx !== -1) {
        AppState.usuarios[idx] = {
          ...AppState.usuarios[idx],
          nombres, apellidos, email, rol,
          orgId: orgPrinc, orgIds, esGlobal, permisos,
        };
      }
      showToast('Usuario actualizado correctamente', 'success');
      navigate('/configuracion/usuarios');

    } else {
      // ── Crear e invitar nuevo usuario ────────────────────────
      const result = await callInviteEdgeFn({
        action: 'invite',
        email,
        nombre_completo: `${nombres} ${apellidos}`,
        rol,
        organizacion_id: orgPrinc || '',
        es_global: esGlobal,
        orgs_adicionales: orgIds,
        permisos,
      });

      // Añadir a estado local
      AppState.usuarios.push({
        id:       result.userId || ('USR' + Date.now()),
        nombres, apellidos, email, rol,
        orgId: orgPrinc, orgIds, esGlobal, permisos,
        activo:   true,
        fechaInvitacion: new Date().toISOString().slice(0,10),
        ultimoAcceso: null,
      });

      mostrarModalInvitacionReal({ nombres, email, rol, orgPrinc });
    }
  } catch (err) {
    // Serializar correctamente el error (evitar "[object Object]")
    const errMsg = err instanceof Error ? err.message : (typeof err === 'string' ? err : JSON.stringify(err));
    console.error('[Usuario] Error:', errMsg, err);
    // Si la Edge Function no está desplegada, mostrar aviso claro
    if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError') || errMsg.includes('404')) {
      showToast('⚠ Edge Function no desplegada. Ejecuta: supabase functions deploy invite-user', 'warning');
      mostrarModalEdgeFnPendiente({ nombres, apellidos, email, rol, orgPrinc, editId });
    } else if (errMsg.includes('409') || errMsg.includes('ya está registrado')) {
      showToast(`El correo ${email} ya existe en el sistema.`, 'warning');
    } else {
      showToast(`Error: ${errMsg}`, 'error');
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = editId ? '✓ Guardar cambios' : '✉ Crear y enviar invitación'; }
  }
}

function mostrarModalInvitacionReal({ nombres, email, rol, orgPrinc }) {
  const orgNombre = AppState.organizaciones.find(o=>o.id===orgPrinc)?.nombre || 'Vidas en Movimiento';
  const mid = 'inv-modal-' + Date.now();
  document.body.insertAdjacentHTML('beforeend', `
    <div id="${mid}" style="position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.45);backdrop-filter:blur(4px);">
      <div style="background:#fff;border-radius:20px;padding:36px;width:100%;max-width:480px;box-shadow:0 32px 96px rgba(0,0,0,.22);text-align:center;">
        <div style="font-size:52px;margin-bottom:12px;">✅</div>
        <h3 style="font-size:18px;font-weight:800;color:#1A2B4B;margin:0 0 8px;">¡Invitación enviada!</h3>
        <p style="font-size:14px;color:#475569;margin:0 0 6px;">
          <strong>${nombres}</strong> recibirá un correo en <strong>${email}</strong>
        </p>
        <p style="font-size:13px;color:#64748B;margin:0 0 24px;">
          El link incluye un botón para establecer su contraseña y acceder como <em>${rol}</em> de <strong>${orgNombre}</strong>.
        </p>
        <div style="background:#EFF6FF;border-radius:10px;padding:12px 16px;font-size:12px;color:#2563EB;margin-bottom:20px;text-align:left;line-height:1.6;">
          <strong>¿No llegó el correo?</strong><br>
          Revisa carpeta Spam · El link expira en 24 horas · Usa el botón "✉ Reenviar" en la lista de usuarios.
        </div>
        <button onclick="document.getElementById('${mid}').remove();navigate('/configuracion/usuarios');"
          style="width:100%;padding:13px;border:none;border-radius:10px;background:#2563EB;color:#fff;cursor:pointer;font-weight:700;font-size:14px;">
          Ver lista de usuarios
        </button>
      </div>
    </div>`);
}

function mostrarModalEdgeFnPendiente({ nombres, apellidos, email, rol, orgPrinc }) {
  // Fallback cuando la Edge Function no está desplegada
  const mid = 'ef-modal-' + Date.now();
  document.body.insertAdjacentHTML('beforeend', `
    <div id="${mid}" style="position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.45);backdrop-filter:blur(4px);">
      <div style="background:#fff;border-radius:20px;padding:32px;width:100%;max-width:520px;box-shadow:0 32px 96px rgba(0,0,0,.22);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <div style="background:#FEF9C3;border-radius:12px;padding:10px;font-size:20px;">⚙️</div>
          <div>
            <h3 style="font-size:15px;font-weight:800;color:#1A2B4B;margin:0;">Falta deployar la Edge Function</h3>
            <p style="font-size:12px;color:#64748B;margin:4px 0 0;">El usuario fue guardado localmente en esta sesión</p>
          </div>
        </div>
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;font-size:12px;color:#334155;line-height:1.8;margin-bottom:20px;">
          <strong>Para activar el envío real de invitaciones, ejecuta en tu terminal:</strong><br><br>
          <code style="background:#1E293B;color:#7DD3FC;padding:8px 12px;border-radius:6px;display:block;font-size:11px;">
            cd "${window.location.pathname.split('/').slice(0,3).join('/')}"<br>
            supabase functions deploy invite-user
          </code>
          <br>
          O crea la función manualmente en:<br>
          <a href="https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/functions" target="_blank" style="color:#2563EB;">
            supabase.com → Edge Functions
          </a>
        </div>
        <button onclick="document.getElementById('${mid}').remove();navigate('/configuracion/usuarios');"
          style="width:100%;padding:12px;border:none;border-radius:8px;background:#2563EB;color:#fff;cursor:pointer;font-weight:700;">
          Entendido, ir a usuarios
        </button>
      </div>
    </div>`);
}

async function simularInvitacion(userId) {
  const u = AppState.usuarios.find(x => x.id === userId);
  if (!u || !u.email) { showToast('Sin email para reenviar', 'warning'); return; }

  showToast('Reenviando invitación…', 'info');
  try {
    await callInviteEdgeFn({ action: 'resend', email: u.email });
    showToast(`✉ Invitación reenviada a ${u.email}`, 'success');
  } catch (err) {
    // Si Edge Function no está desplegada, avisar sin bloquear
    if (err.message.includes('Failed to fetch') || err.message.includes('404')) {
      showToast('⚠ Edge Function no desplegada. Ejecuta: supabase functions deploy invite-user', 'warning');
    } else {
      showToast(`Error al reenviar: ${err.message}`, 'error');
    }
  }
}

async function toggleUsuarioActivo(userId) {
  const u = AppState.usuarios.find(x => x.id === userId);
  if (!u) return;
  const nuevoEstado = !u.activo;
  try {
    await callInviteEdgeFn({ action: 'toggle_active', user_id: userId, activo: nuevoEstado });
    u.activo = nuevoEstado;
    showToast(`Usuario ${nuevoEstado ? 'activado' : 'suspendido'} correctamente`, nuevoEstado ? 'success' : 'warning');
  } catch (err) {
    // Fallback local si la Edge Function no está desplegada
    u.activo = nuevoEstado;
    showToast(`Usuario ${nuevoEstado ? 'activado' : 'suspendido'} (local)`, nuevoEstado ? 'success' : 'warning');
  }
  navigate('/configuracion/usuarios');
}

// ─── FILTRO POR ORGANIZACIÓN SEGÚN USUARIO ACTIVO ────────────

function getVisibleMigrantes() {
  const cu = AppState.currentUser;
  if (!cu) return [];
  if (cu.esGlobal) return AppState.migrantes;
  const orgSet = new Set(cu.orgIds || []);
  if (cu.orgId) orgSet.add(cu.orgId);
  // Sin org asignada → sin datos (no filtrar hacia todos)
  if (orgSet.size === 0) return [];
  return AppState.migrantes.filter(m =>
    orgSet.has(m.orgActualId) || orgSet.has(m.orgId)
  );
}

function simularAccesoUsuario(userId) {
  const u = AppState.usuarios.find(x => x.id === userId);
  if (!u) return;
  AppState.currentUser = u;
  applyUserToUI(u.nombres, u.apellidos, u.rol,
    u.esGlobal ? 'Acceso Global' :
    (AppState.organizaciones.find(o=>o.id===u.orgId)?.nombre || 'Sin organización')
  );
  actualizarBadgeSimulacion();
  showToast(`Simulando acceso como: ${u.nombres} ${u.apellidos}`, 'info');
  // Refrescar vista actual para aplicar filtros
  navigate(currentRoute);
}

function actualizarBadgeSimulacion() {
  const cu  = AppState.currentUser;
  const el  = document.getElementById('sim-user-badge');
  if (!el || !cu) return;
  const orgLabel = cu.esGlobal ? '🌐 Global'
    : (AppState.organizaciones.find(o=>o.id===cu.orgId)?.nombre || 'Sin org');
  el.textContent = `▶ ${cu.nombres} ${cu.apellidos} — ${orgLabel}`;
}

// Mostrar banner de filtro activo en views clave
function renderBannerFiltroOrg() {
  const cu = AppState.currentUser;
  const existing = document.getElementById('org-filter-banner');
  if (existing) existing.remove();
  if (!cu || cu.esGlobal) return;

  const orgNames = (cu.orgIds || [])
    .map(id => AppState.organizaciones.find(o=>o.id===id)?.nombre)
    .filter(Boolean);
  const label = orgNames.length > 0
    ? orgNames.join(', ')
    : AppState.organizaciones.find(o=>o.id===cu.orgId)?.nombre || 'Tu organización';

  const banner = document.createElement('div');
  banner.id = 'org-filter-banner';
  banner.innerHTML = `
    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:10px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;font-size:13px;color:#1E40AF;">
      <span>🏢</span>
      <span>Viendo datos de: <strong>${label}</strong> — como <strong>${cu.nombres} ${cu.apellidos} (${cu.rol})</strong></span>
      <button onclick="simularAccesoUsuario('USR00')" style="margin-left:auto;background:none;border:1px solid #BFDBFE;border-radius:6px;padding:3px 10px;cursor:pointer;font-size:11px;color:#2563EB;font-weight:600;">Ver todo</button>
    </div>`;
  const mainContent = document.getElementById('main-content');
  if (mainContent) mainContent.prepend(banner);
}

// ─── VISTA: MI PERFIL ────────────────────────────────────────

function viewMiPerfil(container) {
  withLoader(container, () => {
    const u = AppState.currentUser || AppState.usuarios[0];
    if (!u) { container.innerHTML = '<div class="empty-state">Sin sesión activa</div>'; return; }

    const orgPrincipal = AppState.organizaciones.find(o => o.id === u.orgId);
    const orgNames = u.esGlobal
      ? ['🌐 Acceso Global — todas las organizaciones']
      : (u.orgIds||[]).map(id => AppState.organizaciones.find(o=>o.id===id)?.nombre).filter(Boolean);

    const permisos = getPermisosUsuario(u);
    const SECCIONES_LABELS = {
      migrantes:     { label: 'Migrantes', icon: '👤', desc: 'Dashboard, listado, mapa y registro' },
      parametros:    { label: 'Parámetros', icon: '⚙️', desc: 'Catálogos y tablas de referencia' },
      seguridad:     { label: 'Seguridad', icon: '🔒', desc: 'Niveles de acceso y configuración' },
      configuracion: { label: 'Configuración', icon: '👥', desc: 'Gestión de usuarios' },
    };

    container.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">Mi Perfil</h1>
        <p class="page-subtitle">Información de tu cuenta en Vidas en Movimiento</p></div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="guardarPerfil()">✓ Guardar nombre</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:960px;">

        <div class="card">
          <div class="form-section-title fst-migrante">Información personal</div>
          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label">Nombres</label>
            <input type="text" id="perfil-nombres" class="form-control" value="${u.nombres}">
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label">Apellidos</label>
            <input type="text" id="perfil-apellidos" class="form-control" value="${u.apellidos}">
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" value="${u.email||''}" readonly style="background:#F8FAFC;color:#64748B;">
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label">Rol / Cargo</label>
            <input type="text" class="form-control" value="${u.rol}" readonly style="background:#F8FAFC;color:#64748B;">
          </div>
          <div style="border-top:1px solid #F1F5F9;padding-top:14px;margin-top:4px;">
            <div style="font-size:12px;color:#94A3B8;">Último acceso: <strong style="color:#475569;">${u.ultimoAcceso||'—'}</strong></div>
            <div style="font-size:12px;color:#94A3B8;margin-top:4px;">Cuenta creada: <strong style="color:#475569;">${u.fechaInvitacion||'—'}</strong></div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="card">
            <div class="form-section-title fst-entrevista">Organización y acceso</div>
            <div style="margin-bottom:14px;">
              <div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Tipo de acceso</div>
              ${u.esGlobal
                ? '<span style="background:#DBEAFE;color:#1D4ED8;padding:5px 14px;border-radius:20px;font-weight:700;font-size:12px;">🌐 Global</span>'
                : '<span style="background:#DCFCE7;color:#166534;padding:5px 14px;border-radius:20px;font-weight:700;font-size:12px;">🏢 Por organización</span>'
              }
            </div>
            ${orgPrincipal ? `
            <div style="margin-bottom:14px;">
              <div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Organización principal</div>
              <div style="font-size:13px;font-weight:600;color:#1A2B4B;">${orgPrincipal.nombre}</div>
            </div>` : ''}
            <div>
              <div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Organizaciones visibles</div>
              <div style="border:1px solid #E2E8F0;border-radius:8px;max-height:120px;overflow-y:auto;">
                ${orgNames.length > 0
                  ? orgNames.map(n=>`<div style="padding:6px 10px;font-size:12px;color:#334155;border-bottom:1px solid #F8FAFC;">${n}</div>`).join('')
                  : '<div style="padding:10px;font-size:12px;color:#94A3B8;">Sin organizaciones asignadas</div>'}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="form-section-title fst-situacion">Secciones habilitadas</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${Object.entries(SECCIONES_LABELS).map(([key, s]) => {
                const activo = permisos.includes(key);
                return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;background:${activo?'#F0FDF4':'#FEF2F2'};">
                  <span style="font-size:16px;">${s.icon}</span>
                  <div style="flex:1;">
                    <div style="font-size:12px;font-weight:700;color:${activo?'#166534':'#991B1B'};">${s.label}</div>
                    <div style="font-size:11px;color:#64748B;">${s.desc}</div>
                  </div>
                  <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${activo?'#DCFCE7':'#FEE2E2'};color:${activo?'#166534':'#991B1B'};">
                    ${activo ? '✓ Activo' : '✗ Sin acceso'}
                  </span>
                </div>`;
              }).join('')}
            </div>
            <div style="margin-top:12px;font-size:11px;color:#94A3B8;">Para cambiar permisos, contacta al administrador del sistema.</div>
          </div>
        </div>

      </div>
    `;
  });
}

async function guardarPerfil() {
  const nombres   = document.getElementById('perfil-nombres')?.value?.trim();
  const apellidos = document.getElementById('perfil-apellidos')?.value?.trim();
  if (!nombres || !apellidos) { showToast('Nombres y apellidos son requeridos.','warning'); return; }

  const cu = AppState.currentUser;
  if (!cu) return;

  const btn = document.querySelector('[onclick="guardarPerfil()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  try {
    await callInviteEdgeFn({
      action: 'update',
      user_id: cu.id,
      nombre_completo: `${nombres} ${apellidos}`,
      rol: cu.rol,
      organizacion_id: cu.orgId || '',
      es_global: cu.esGlobal,
      orgs_adicionales: cu.orgIds || [],
      permisos: cu.permisos || [],
    });

    cu.nombres   = nombres;
    cu.apellidos = apellidos;
    applyUserToUI(nombres, apellidos, cu.rol,
      cu.esGlobal ? 'Acceso Global'
        : (AppState.organizaciones.find(o=>o.id===cu.orgId)?.nombre || ''));
    showToast('Perfil actualizado correctamente', 'success');
  } catch (err) {
    showToast(`Error al guardar: ${err.message}`, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✓ Guardar nombre'; }
  }
}

// ─── CONTROLES DEL SHELL (eventos) ───────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Colapso sidebar desktop
  const toggleBtn  = document.getElementById('sidebar-toggle');
  const sidebar    = document.getElementById('sidebar');
  const mainWrapper= document.getElementById('main-wrapper');

  toggleBtn.addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('collapsed');
    mainWrapper.classList.toggle('sidebar-collapsed', collapsed);
    toggleBtn.textContent = collapsed ? '▶' : '◀';
  });

  // Hamburger móvil
  document.getElementById('hamburger-btn').addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    document.getElementById('sidebar-overlay').classList.add('open');
  });

  document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);

  // Grupos colapsables del sidebar
  document.querySelectorAll('.nav-group-header').forEach(header => {
    header.addEventListener('click', () => {
      if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        mainWrapper.classList.remove('sidebar-collapsed');
        toggleBtn.textContent = '◀';
      }
      const groupId = header.dataset.group;
      const subItems = document.getElementById(`group-${groupId}`);
      const isOpen = subItems.classList.toggle('open');
      header.classList.toggle('open', isOpen);
    });
  });

  // Loading splash + verificar sesión activa + cargar datos
  setTimeout(async () => {
    // Intentar restaurar sesión de Supabase; si no hay, mostrar login
    await checkSession();
    if (!AppState.currentUser) {
      document.getElementById('app-loading').classList.add('hidden');
      setTimeout(() => { const el = document.getElementById('app-loading'); if (el) el.remove(); }, 500);
      document.getElementById('login-screen').classList.remove('hidden');
      return;
    }

    // Cargar catálogos y organizaciones desde Supabase
    await loadAllData();

    document.getElementById('app-loading').classList.add('hidden');
    setTimeout(() => { const el = document.getElementById('app-loading'); if (el) el.remove(); }, 500);
  }, 800);
});
