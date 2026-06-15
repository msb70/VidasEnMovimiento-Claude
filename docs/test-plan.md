# Plan de Pruebas Automatizado — Vidas en Movimiento

> Estrategia de testing para la plataforma (HTML/CSS/JS vanilla + Supabase).
> Prioriza los caminos críticos y convierte los bugs reales del proyecto en
> pruebas de regresión.
>
> **Estado actual de cobertura: 0 pruebas automatizadas.** Este plan define cómo llegar a una red de seguridad útil sin sobre-ingeniería.

---

## 1. Enfoque

La app no tiene build ni framework: `app.js` es un monolito de funciones globales
en el navegador, con la lógica de negocio crítica en la **base de datos (RLS + RPC)**
y en la **Edge Function**. Por eso la pirámide se adapta así:

```
        /   E2E (Playwright)   \      Pocos, lentos, altaconfianza: login, alta, permisos, mapa
       /  Integración DB / API   \    RLS por rol, RPCs, Edge Function (clave en este proyecto)
      /   Unit (funciones puras)   \   escapeHtml, edades, filtros, helpers del mapa
     /     Gate de sintaxis (CI)     \  node --check (ya en el workflow)
```

El mayor riesgo de esta app **no** es la UI: es el **control de acceso (RLS)** y la
**coherencia de datos**. Ahí va el grueso del esfuerzo.

---

## 2. Herramientas recomendadas

| Capa | Herramienta | Por qué |
|---|---|---|
| Sintaxis | `node --check` | Ya está en el pipeline; frena JS roto (bug P-14 real) |
| Unit (lógica pura) | **Vitest** + **jsdom** | Rápido; prueba helpers sin navegador |
| Integración DB/RLS | **Node + `@supabase/supabase-js`** con JWT por rol, o **pgTAP** | Verifica RLS como `anon` / operador / admin |
| Edge Function | Node + `fetch` con JWT de cada rol | invite-user debe rechazar a no-admin |
| E2E / UI | **Playwright** (ya disponible) | Flujos completos en navegador real |
| Responsive | Playwright (viewports) | Captura y aserciones a 375 / 768 / 1440 |
| Accesibilidad | `@axe-core/playwright` | Auditoría WCAG en las vistas clave |

> Para las pruebas unitarias, extraer los helpers puros (`escapeHtml`, `calcEdadDesde`,
> `avatarIniciales`, lógica de `_pasaPorCiudad`) a un archivo `lib.js` con `export`
> facilita testearlos. Alternativa sin refactor: ejecutarlos vía `page.evaluate` en Playwright.

---

## 3. Qué probar por área

| Área | Tipo de prueba | Prioridad |
|---|---|---|
| Autenticación (email + Google) | E2E | Alta |
| RLS por organización (anon / operador / admin) | Integración DB | **Crítica** |
| Funciones `SECURITY DEFINER` no ejecutables por anon | Integración DB | **Crítica** |
| Edge Function `invite-user` (autorización) | Integración API | **Crítica** |
| Alta / edición de migrante (incl. generación de ID) | E2E + Integración DB | Alta |
| KPIs del dashboard (`compute_dashboard_stats`) | Integración DB | Alta |
| Filtros del mapa (ciudad ↔ ruta individual) | E2E + Unit | Alta |
| Escape XSS en render | Unit + E2E | Alta |
| Escritura de catálogos/organizaciones (solo admin) | Integración DB | Media |
| Responsive (login, dashboard, mapa) | E2E viewports | Media |
| Accesibilidad (contraste, labels) | Automatizada (axe) | Media |

---

## 4. Casos de prueba — incluye regresión de los bugs reales

Cada bug del proyecto (`docs/lessons-learned.md`) se convierte en una prueba que **debe fallar antes del fix y pasar después**.

### 4.1 Seguridad / RLS (integración DB) — CRÍTICO

- **REG P-01:** cliente `anon` → `SELECT` sobre `migrantes` devuelve **0 filas / error**, nunca PII.
- **REG P-02:** `anon` (y operador) llamando `update_profile` de otro usuario → **rechazado**; operador solo cambia su propio nombre.
- **REG P-03:** `anon` → `get_all_profiles()` **falla**; solo admin global obtiene la lista.
- **REG P-04:** operador de ORG12 ve **solo** migrantes de ORG12; admin global ve todos.
- **REG P-05/Edge:** invitar usuario como **operador** → **HTTP 403**; como **admin** → 200.
- **REG P-06:** operador intenta `INSERT`/`DELETE` en `cat_paises` u `organizations` → **rechazado**; admin → ok.
- **REG P-25:** `anon` → `rpc/current_is_global`, `rpc/compute_dashboard_stats` → **sin acceso** (revocado).

### 4.2 Datos / integridad (integración DB)

- **REG P-13:** insertar N migrantes seguidos → todos con **ID único**, sin colisión de PK.
- **REG P-14:** la secuencia genera IDs **> 999 sin truncar** (insertar pasado el tope y verificar formato).
- **REG P-16:** `compute_dashboard_stats()` devuelve `totalRegistros` == `count(*)` real de la tabla (no cifras curadas).
- **Idempotencia:** re-ejecutar un seed/migración no duplica filas.

### 4.3 Mapa (unit + E2E)

- **REG P-18:** `_pasaPorCiudad(m, 'CTG')` es `true` **solo** si algún paso de `m.ruta` tiene `ciudadId === 'CTG'` (no por org de registro).
- **REG P-19:** seleccionar un NNA por **id** muestra **toda** su ruta; dos personas con el mismo nombre no se mezclan.
- **REG P-20:** en un set de datos, el nº de nombres completos distintos ≈ nº de registros (sin duplicación masiva).
- **E2E:** filtrar por "Bogotá" → el selector lista solo NNA con Bogotá en su ruta; la tabla de ciudades queda filtrada.

### 4.4 Frontend / XSS (unit + E2E)

- **REG P-07:** `escapeHtml('<img src=x onerror=alert(1)>')` no contiene `<` ni `>` sin escapar.
- **E2E P-07:** registrar un migrante con payload `<img onerror>` en Notas → al abrir el detalle, se muestra como **texto**, sin `alert`.
- **Unit:** `calcEdadDesde('2015-06-15')` devuelve la edad correcta; bordes (fecha futura, vacía) → manejados.

### 4.5 Auth y flujos (E2E)

- Login email/contraseña correcto → dashboard; incorrecto → mensaje de error.
- Login Google (mock o entorno de prueba) → sesión activa.
- Sesión persistente: recargar mantiene la sesión; `Cerrar sesión` la limpia.
- **REG P-15:** un error de permisos al guardar muestra el **mensaje correcto** (no "Tablas pendientes de migración").

### 4.6 Responsive y accesibilidad (E2E)

- Login + Dashboard + Mapa a **375 / 768 / 1440**: sin scroll horizontal, KPIs reflowean, sidebar colapsa en móvil.
- axe-core sin violaciones críticas de contraste/labels en login y dashboard.

---

## 5. Objetivos de cobertura (pragmáticos)

- **Matriz RLS completa:** cada tabla sensible × cada rol (anon / operador / admin) probada. *Meta: 100% de la matriz.*
- **Caminos críticos E2E:** login, alta de migrante, permisos, filtro de mapa — happy path **y** error. *Meta: 100% de los críticos.*
- **Funciones puras:** `escapeHtml`, edades, filtros del mapa. *Meta: ≥ 80% líneas.*
- **Regresión:** una prueba por cada bug P-01…P-23. *Meta: 100%.*

No perseguir % global de cobertura del monolito: aporta poco y cuesta mucho.

---

## 6. Integración con CI/CD

Extender el workflow existente (`.github/workflows/deploy.yml`) con un job **`test` previo al deploy** (el deploy depende de que pasen las pruebas):

```
jobs:
  test:        # node --check + unit (Vitest) + RLS/API contra un branch de Supabase
  e2e:         # Playwright (puede correr contra un deploy preview)
  deploy:
    needs: [test]   # solo despliega si test pasa
```

- **RLS/DB tests:** correr contra un **branch de Supabase** (`supabase branches create`) o un proyecto de staging, nunca contra producción.
- **E2E:** contra un entorno de preview o el staging, con un usuario de prueba dedicado.
- **Gate:** si `test` falla, no se despliega (cierra el riesgo de los bugs de sintaxis/RLS que tuvimos).

---

## 7. Gaps actuales y plan por fases

**Gap:** hoy no hay ninguna prueba; el único gate es `node --check` en CI.

| Fase | Entregable | Esfuerzo |
|---|---|---|
| **1 (semana 1)** | Tests de RLS/permisos + Edge Function (lo más crítico) y regresión P-13/P-14 | Bajo-medio |
| **2** | Unit de helpers puros (XSS, edades, filtros) + extraer `lib.js` | Bajo |
| **3** | E2E Playwright de los 4 flujos críticos + responsive | Medio |
| **4** | axe-core, integrar todo al CI con gate previo al deploy | Bajo-medio |

Empezar por la **Fase 1**: es donde estuvieron los riesgos reales del proyecto y donde una prueba evita un incidente de datos.

---

## 8. Próximo paso sugerido
Puedo **scaffoldear** ahora la Fase 1: un proyecto de pruebas (`/tests`) con
`@supabase/supabase-js`, casos de RLS por rol y el test de la Edge Function,
listo para correr con `npm test` y enchufar al CI. Solo dilo.
