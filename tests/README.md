# Pruebas — Fase 1 (RLS, funciones, Edge Function, integridad)

Pruebas de integración contra Supabase con Vitest. Cubren lo más crítico del
proyecto: control de acceso (RLS), funciones `SECURITY DEFINER`, la Edge
Function `invite-user` y la generación de IDs.

## Qué verifica

| Archivo | Cubre |
|---|---|
| `rls.test.mjs` | anon no lee PII (P-01); operador acotado a su org (P-04); catálogos solo admin escribe (P-06) |
| `functions.test.mjs` | anon no ejecuta funciones (P-25, P-03); KPIs == datos reales (P-16); scoping por org |
| `edge.test.mjs` | operador → 403 al invitar; sin token → 401/403 (P-05) |
| `data-integrity.test.mjs` | IDs únicos y sin truncar (P-13, P-14) — *solo con `TEST_ALLOW_WRITES=true`* |

## Configuración

```bash
cd tests
npm install
cp .env.example .env     # y rellena SUPABASE_SERVICE_ROLE_KEY
```

- `SUPABASE_SERVICE_ROLE_KEY`: Dashboard → Project Settings → API → `service_role` (secreto).
  Solo se usa en el setup para crear/garantizar los 2 usuarios de prueba. **No lo commitees.**
- El setup crea (idempotente) `test-admin@viamovimiento.test` (global) y
  `test-operator@viamovimiento.test` (operador de `ORG12`).

## Ejecutar

```bash
npm test            # todas (las de escritura se saltan por defecto)
npm run test:watch  # modo watch
```

Para las pruebas que escriben (regresión de IDs), **contra un branch/staging**:

```bash
TEST_ALLOW_WRITES=true npm test
```

## Importante

- Las pruebas de lectura son seguras contra producción (no modifican datos).
- Las de escritura (`data-integrity`) insertan y borran migrantes: úsalas contra un
  **branch de Supabase** (`supabase branches create pruebas`), no contra producción.
- En CI, `SUPABASE_SERVICE_ROLE_KEY` va como **secret** del repositorio y los tests
  corren contra el branch, como paso previo al deploy (ver `docs/test-plan.md` §6).
