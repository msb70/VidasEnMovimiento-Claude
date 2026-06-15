# Vidas en Movimiento — Auditoría y Lecciones Aprendidas

> Base de conocimiento permanente del proyecto. Documenta la auditoría técnica,
> todos los problemas resueltos durante el desarrollo (causa raíz + solución) y
> un checklist preventivo para no repetirlos.
>
> **Última actualización:** 2026-06-15 · **Estado:** En producción (https://vidasenmovimiento.com)

---

## 1. Resumen de arquitectura

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | HTML/CSS/JS vanilla (sin build) | `app.js` ~4.900 líneas (monolito), Leaflet + Chart.js por CDN |
| Backend | Supabase | Auth (GoTrue), PostgreSQL con RLS, Edge Functions (Deno) |
| Datos | PostgreSQL | RLS por organización, RPCs `SECURITY DEFINER`, índices en FKs y filtros |
| Hosting | Hostinger (estático) | `vidasenmovimiento.com`, despliegue manual vía API |
| Repo | GitHub `msb70/VidasEnMovimiento-Claude` | rama `main` |
| Auth | Email/contraseña + Google OAuth | invitaciones vía Edge Function `invite-user` |

**Proyecto Supabase:** `izcqcnunryhntojhxywu` · **Datos:** sintéticos (demo público con datos ficticios).

---

## 2. Resultado de la auditoría (estado actual)

| Área | Estado | Observación |
|---|---|---|
| Arquitectura | 🟡 Aceptable | SPA vanilla funcional; `app.js` monolítico (candidato a modularizar) |
| Código | 🟡 Mejorado | `escapeHtml` aplicado; sin pruebas automatizadas |
| Seguridad | 🟢 Resuelto | 5 críticos cerrados; RLS por organización; funciones con auth interna |
| Base de datos | 🟢 Bueno | Índices, secuencia/ID corregidos, KPIs en vivo, baseline versionado |
| APIs / Edge | 🟢 Bueno | RPCs con scoping; Edge Function con verificación JWT + admin |
| Variables de entorno | 🟢 Bueno | `publishable key` pública (OK); `service_role` solo en `Deno.env`, no commiteada |
| GitHub Actions / CI/CD | 🔴 Ausente | No hay `.github/workflows`; despliegue 100% manual |
| Deploy | 🟡 Manual | Estático en Hostinger; sin pipeline automatizado |
| Responsive Desktop (1440) | 🟢 Correcto | Verificado en vivo: layout completo, KPIs en grilla |
| Responsive Tablet (768) | 🟢 Correcto | Verificado: KPIs 4→2 columnas, sidebar colapsa |
| Responsive Mobile (375) | 🟢 Correcto | Verificado: KPIs 2 columnas, filtros y botones apilados |

**Avisos de seguridad residuales (no bloqueantes):** funciones `SECURITY DEFINER` ejecutables por
`authenticated` (intencional, con verificación interna de rol) y protección de contraseñas filtradas
de Supabase Auth **pendiente de activar** (toggle en Authentication → Policies).

**Pendientes recomendados:** CI/CD, pruebas automatizadas, paginación server-side del listado,
monitoreo de errores, autocompletar `org_id` del usuario en el formulario de registro.

---

## 3. Base de conocimiento — Problemas resueltos

Para cada uno: **síntoma → causa raíz → solución → cómo prevenirlo**.

### 3.1 Seguridad (CRÍTICOS)

**P-01 · PII de menores legible sin autenticación**
- **Síntoma:** cualquiera con la URL podía descargar la base de niñez migrante.
- **Causa raíz:** RLS con `USING (true)` y `GRANT SELECT ... TO anon` en `migrantes` y tablas hijas.
- **Solución:** revocar todo acceso `anon`; RLS solo `authenticated`, filtrada por organización.
- **Prevención:** nunca `GRANT ... TO anon` ni `USING(true)` sobre tablas con PII. Revisar el Security Advisor tras cada cambio de DDL.

**P-02 · Escalada de privilegios vía `update_profile()`**
- **Síntoma:** se podía cambiar rol/permisos/`es_global` de cualquier usuario.
- **Causa raíz:** función `SECURITY DEFINER` sin validar al llamante y con `GRANT EXECUTE ... TO anon`.
- **Solución:** revocar de `anon`/`PUBLIC`; validar `auth.uid()` y rol admin dentro de la función; usuario normal solo edita su propio nombre.
- **Prevención:** toda función `SECURITY DEFINER` debe (a) verificar identidad internamente y (b) no estar concedida a `anon`/`PUBLIC`.

**P-03 · Enumeración de usuarios vía `get_all_profiles()`**
- **Síntoma:** listado completo de usuarios + emails accesible sin sesión.
- **Causa raíz:** función `SECURITY DEFINER` con JOIN a `auth.users`, concedida a `anon`.
- **Solución:** revocar de `anon`; exigir admin global dentro de la función.
- **Prevención:** las funciones que leen `auth.users` se restringen a administradores.

**P-04 · RLS sin aislamiento entre organizaciones**
- **Síntoma:** un operador veía y modificaba datos de todas las organizaciones.
- **Causa raíz:** política `USING(true) WITH CHECK(true)`; el modelo multi-organización vivía solo en el frontend.
- **Solución:** RLS por organización con funciones auxiliares `current_is_global()` / `current_org_ids()`.
- **Prevención:** el control de acceso multi-tenant se aplica en la base de datos, no en el cliente.

**P-05 · Edge Function `invite-user` sin autorización**
- **Síntoma:** cualquier usuario autenticado podía crear cuentas con permisos máximos.
- **Causa raíz:** la función usaba `service_role` sin verificar que el llamante fuera admin; CORS `*`.
- **Solución:** verificar el JWT del llamante y su rol admin antes de operar; CORS por lista de orígenes; protección contra auto-suspensión.
- **Prevención:** toda función con `service_role` valida identidad y rol del invocador como primer paso.

**P-06 · Catálogos y organizaciones con escritura abierta** *(detectado por el Security Advisor)*
- **Síntoma:** cualquier autenticado podía crear/editar/borrar catálogos y organizaciones.
- **Causa raíz:** política `auth_all` con `USING(true)` para `ALL`.
- **Solución:** lectura para `authenticated`, escritura solo para admin global.
- **Prevención:** separar políticas de lectura y escritura; correr el Security Advisor antes de cada release.

### 3.2 Seguridad (ALTAS)

**P-07 · XSS almacenado vía `innerHTML`**
- **Síntoma:** un registro con código malicioso se ejecutaba al visualizarlo.
- **Causa raíz:** plantillas con `innerHTML` interpolando datos sin escapar (66 puntos).
- **Solución:** función `escapeHtml()` aplicada en contenido y atributos; centralizada en `datoFicha`, `showToast`, render de catálogos.
- **Prevención:** todo dato dinámico que entre a HTML pasa por `escapeHtml`; preferir `textContent`.

**P-08 · Credenciales demo expuestas en el HTML**
- **Síntoma:** correo y contraseña visibles en la pantalla de login en producción.
- **Causa raíz:** bloque de hint hardcodeado en `index.html`.
- **Solución:** eliminar el bloque del HTML (login con correo/contraseña + Google sigue activo).
- **Prevención:** nunca incrustar credenciales en el código fuente del cliente.

### 3.3 Autenticación / acceso

**P-09 · Ningún login funcionaba (401 en `/auth/v1/token`)**
- **Síntoma:** todos los inicios de sesión devolvían 401, también Google.
- **Causa raíz:** la `publishable key` del proyecto fue **rotada**; `supabase-config.js` tenía la vieja.
- **Solución:** actualizar la key vigente en `supabase-config.js`.
- **Prevención:** documentar que al rotar claves hay que actualizar el front; centralizar la key en un solo lugar.

**P-10 · La app servía JS viejo (caché) y “conexión rechazada”**
- **Síntoma:** cambios sin efecto; consola mostraba la key vieja; `localhost` rechazaba conexión.
- **Causa raíz:** no había servidor activo y la pestaña era una caché vieja; el versionado `?v=` no cambiaba.
- **Solución:** servir desde un servidor estático real y subir el `?v=` al cambiar JS; probar en incógnito.
- **Prevención:** cache-busting con versión nueva en cada cambio; servir siempre desde un servidor, no abrir archivos sueltos.

**P-11 · Usuario demo no podía iniciar sesión**
- **Síntoma:** 401 incluso con la contraseña correcta.
- **Causa raíz:** la cuenta demo no tenía contraseña usable / email sin confirmar en Auth.
- **Solución:** recrear el usuario con “Auto Confirm” y contraseña conocida; marcarlo admin global por SQL.
- **Prevención:** crear cuentas de prueba con Auto Confirm y verificar el estado en Authentication → Users.

**P-12 · Google login “Redirigiendo” sin avanzar**
- **Síntoma:** el botón se quedaba en “Redirigiendo a Google…”.
- **Causa raíz:** faltaban las **Redirect URLs** del dominio en Supabase (y origins en Google Cloud).
- **Solución:** configurar Site URL + Redirect URLs en Supabase y Authorized origins en Google Cloud.
- **Prevención:** al cambiar de dominio, actualizar siempre Auth URL Configuration y el cliente OAuth.

### 3.4 Base de datos / datos

**P-13 · El registro de migrante fallaba con `duplicate key`**
- **Síntoma:** error `23505` al guardar un migrante nuevo.
- **Causa raíz:** la secuencia `migrantes_seq` arrancaba en 1, pero los seeds insertaron IDs `M001…` sin avanzarla.
- **Solución:** `setval('migrantes_seq', max_id_numérico, true)`.
- **Prevención:** tras sembrar datos con IDs explícitos, sincronizar siempre la secuencia.

**P-14 · El generador de IDs truncaba IDs ≥ 1000** *(bug latente de producción)*
- **Síntoma:** colisiones persistentes de PK al registrar.
- **Causa raíz:** `DEFAULT 'M' || LPAD(nextval::text, 3, '0')` — `LPAD` **trunca** cuando el texto supera el ancho, generando `M778` para 7780.
- **Solución:** `DEFAULT 'M' || nextval('migrantes_seq')::text` (sin truncar).
- **Prevención:** no usar `LPAD`/formatos de ancho fijo en generación de IDs que crecen sin techo; probar el registro pasado el tope del padding.

**P-15 · Mensaje de error engañoso ocultaba errores reales**
- **Síntoma:** “Tablas pendientes de migración” cuando el problema era RLS.
- **Causa raíz:** el `catch` mostraba ese aviso ante cualquier error cuyo mensaje contuviera “migrantes”.
- **Solución:** distinguir por código (`PGRST205`/`42P01` = tabla inexistente, `42501`/403 = permisos, resto = genérico).
- **Prevención:** los mensajes de error se basan en el código del error, no en coincidencias de texto.

**P-16 · KPIs del dashboard desacoplados de los datos reales**
- **Síntoma:** dashboard (4.862) ≠ listado (7.780) ≠ datos reales (~vacío).
- **Causa raíz:** 7.779 registros “esqueleto” sin datos + KPIs curados a mano en una tabla aparte.
- **Solución:** poblar datos sintéticos coherentes y reescribir `compute_dashboard_stats()` para calcular en vivo desde las tablas.
- **Prevención:** las métricas se calculan desde la fuente de verdad; evitar cifras curadas paralelas.

**P-17 · Datos sin versionar (SQL suelto)**
- **Síntoma:** 14 archivos `.sql` sueltos aplicados a mano; estado de la base no reproducible.
- **Causa raíz:** ausencia de `supabase/migrations/` y de disciplina de migraciones.
- **Solución:** archivar el SQL histórico, consolidar seeds, `supabase init` + `db pull` (baseline versionado).
- **Prevención:** ningún cambio de esquema en el editor SQL; todo como migración versionada y probada en un branch.

### 3.5 Mapa de rutas (coherencia de datos)

**P-18 · El filtro por ciudad mostraba personas que no pasaban por ella**
- **Síntoma:** filtrar por “Cartagena” listaba NNA cuya ruta no incluía Cartagena.
- **Causa raíz:** `_pasaPorCiudad` incluía por **organización de registro** y por ciudad de entrevista, no solo por la ruta.
- **Solución:** filtrar estrictamente por los pasos de la ruta (`p.ciudadId === ciudadF`); alinear la primera parada a la ciudad de la org de registro.
- **Prevención:** que el criterio del filtro coincida con lo que el usuario ve (la trayectoria), no con metadatos.

**P-19 · La ruta individual mezclaba personas distintas**
- **Síntoma:** seleccionar un NNA mostraba una ruta incoherente con paradas ajenas.
- **Causa raíz:** el mapa **agrupaba por nombre del adulto** (colisiones de nombre) y usaba solo `ruta[0]` de cada registro.
- **Solución:** keyar cada NNA por **id de migrante** y usar **toda** su ruta (`migrante_ruta`) ordenada por fecha.
- **Prevención:** identificar entidades por ID único, nunca por nombre; alinear el render con el modelo de datos real (1 migrante = 1 NNA con ruta completa).

**P-20 · Demasiados nombres y apellidos idénticos**
- **Síntoma:** muchos registros con el mismo nombre completo.
- **Causa raíz:** pools de nombres pequeños (20/25) con distribución de baja entropía.
- **Solución:** pools grandes (50 nombres × 80 apellidos) con codificación biyectiva del ID → 7.780 nombres únicos.
- **Prevención:** para datos sintéticos, dimensionar el espacio de nombres muy por encima del nº de registros.

### 3.6 Infra / despliegue / proceso

**P-21 · CORS bloqueaba la Edge Function en desarrollo**
- **Síntoma:** error de CORS al llamar a `invite-user` desde `localhost`.
- **Causa raíz:** `ALLOWED_ORIGIN` fijo a un solo dominio.
- **Solución:** lista de orígenes (`ALLOWED_ORIGINS`) que refleja el origen si está permitido.
- **Prevención:** CORS configurable por entorno (dev + prod) y recordar que CORS no es el control de seguridad (lo es el JWT).

**P-22 · `git` desde el entorno aislado / `index.lock`**
- **Síntoma:** `fatal: Unable to create ... index.lock: File exists`.
- **Causa raíz:** un proceso git previo (desde el sandbox) dejó un candado y permisos no aplicables.
- **Solución:** `rm -f .git/index.lock` y commitear/empujar desde la máquina del usuario.
- **Prevención:** las operaciones git (commit/push con credenciales) se hacen desde la máquina local, no desde entornos sin acceso a credenciales.

**P-23 · Archivos basura en el repositorio**
- **Síntoma:** ficheros temporales (`zi*`, zips de 0 bytes) commiteados.
- **Causa raíz:** patrones no contemplados en `.gitignore`.
- **Solución:** `git rm --cached` + patrones en `.gitignore` (`zi*`, `*.zip`, etc.).
- **Prevención:** mantener `.gitignore` al día; revisar `git status` antes de commitear.

---

## 4. Checklist preventivo

### Seguridad (correr antes de cada release)
- [ ] Ejecutar el **Security Advisor** de Supabase y resolver WARN nuevos.
- [ ] Ninguna tabla con PII concede acceso a `anon`; sin políticas `USING(true)` para escritura.
- [ ] RLS aplica el aislamiento por organización (no solo el frontend).
- [ ] Toda función `SECURITY DEFINER` verifica identidad/rol internamente y no está concedida a `anon`/`PUBLIC`.
- [ ] Escritura de catálogos/organizaciones restringida a admin.
- [ ] Datos dinámicos escapados antes de entrar a HTML (`escapeHtml`).
- [ ] Sin credenciales ni secretos en el código del cliente; `service_role` solo en el servidor.
- [ ] Protección de contraseñas filtradas activada en Auth.

### Base de datos
- [ ] Cambios de esquema como **migración versionada**, nunca SQL suelto en el editor.
- [ ] Tras sembrar IDs explícitos, sincronizar las **secuencias**.
- [ ] Generación de IDs sin formatos de ancho fijo que trunquen al crecer.
- [ ] Métricas calculadas desde la fuente de verdad, no cifras curadas paralelas.
- [ ] Índices en claves foráneas y columnas de filtro/orden frecuentes.

### Autenticación / despliegue
- [ ] Al rotar claves, actualizar el front (`publishable key`).
- [ ] Al cambiar de dominio: Site URL + Redirect URLs en Supabase y Authorized origins en Google Cloud.
- [ ] Cache-busting (`?v=`) actualizado en cada cambio de JS/CSS; probar en incógnito.
- [ ] Cuentas de prueba con Auto Confirm; verificar estado en Authentication → Users.
- [ ] CORS de Edge Functions configurable por entorno; desplegar con verificación de JWT.

### Código / frontend
- [ ] Identificar entidades por **ID único**, nunca por nombre.
- [ ] El render coincide con el modelo de datos real.
- [ ] Mensajes de error basados en código de error, no en coincidencias de texto.
- [ ] Verificar responsive en Desktop / Tablet / Mobile antes de publicar.

### Proceso / repositorio
- [ ] `.gitignore` al día (temporales, zips, artefactos).
- [ ] `git status` revisado antes de commitear; commits y push desde la máquina local.
- [ ] Datos sintéticos con espacio de nombres >> nº de registros.

---

## 5. Pendientes para madurez de producción
1. **CI/CD** (GitHub Actions): build/lint + despliegue automático a Hostinger.
2. **Pruebas automatizadas** de flujos críticos (login, alta, permisos, filtros del mapa).
3. **Paginación server-side** del listado (escala a decenas de miles).
4. **Autocompletar `org_id`** del usuario en el registro (evita bloqueos de RLS a operadores).
5. **Monitoreo** de errores y logs en producción.
6. **Activar** protección de contraseñas filtradas en Supabase Auth.
7. **Backups / PITR** verificados y plan de recuperación documentado.
