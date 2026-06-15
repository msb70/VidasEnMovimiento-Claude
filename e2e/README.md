# Pruebas E2E — Fase 3 (Playwright + accesibilidad)

Pruebas de extremo a extremo en navegador real contra el sitio en vivo.

## Qué cubre

| Archivo | Flujo |
|---|---|
| `login.spec.mjs` | Login correcto → dashboard; contraseña incorrecta → error |
| `permisos.spec.mjs` | Operador no ve módulos restringidos; admin ve todo (P-04) |
| `mapa.spec.mjs` | Filtro por ciudad acota la tabla de ciudades FEM (P-18) |
| `responsive.spec.mjs` | Sin scroll horizontal en móvil/tablet/desktop |
| `a11y.spec.mjs` | axe-core: login y dashboard sin violaciones **críticas** |

## Requisitos

- La cuenta admin demo (`afonseca@demo.com`) debe poder iniciar sesión.
- La cuenta operador (`test-operator@viamovimiento.test`) debe existir — la crea
  el setup de `../tests` (corre `npm test` en `tests/` una vez para generarla).

## Ejecutar

```bash
cd e2e
npm install
npx playwright install chromium   # primera vez: descarga el navegador
npm test                          # corre contra https://vidasenmovimiento.com
npm run report                    # abre el reporte HTML
```

Para probar contra otro entorno o con otras credenciales, copia `.env.example`
a `.env` y ajusta `BASE_URL` / credenciales.

## CI

El workflow `.github/workflows/e2e.yml` corre esta suite **a demanda**
(Actions → Run workflow) y como smoke **semanal**. No bloquea el deploy
(eso sería circular: el deploy actualiza el sitio que el E2E prueba).
El reporte HTML queda como artefacto del run.

## Notas

- Las pruebas son de **solo lectura**: inician sesión y navegan, no crean ni borran datos.
- `a11y` solo falla por violaciones de impacto **critical**; las menores se imprimen
  en el log para revisarlas sin bloquear.
