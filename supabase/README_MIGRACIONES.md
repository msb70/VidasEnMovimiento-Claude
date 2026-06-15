# Migraciones y datos — Vidas en Movimiento

Guía del flujo de base de datos. **Objetivo: no volver a correr SQL suelto en el editor.**
Toda la estructura de la base vive versionada en `supabase/migrations/`.

> **Estado actual (2026-06-15):** estructura y flujo listos. Repo reorganizado,
> SQL suelto archivado, seeds consolidados, `supabase init`/`link` hechos.
> **Baseline pendiente:** `supabase db pull` requiere Docker (no instalado aún).
> No bloquea el trabajo: los migrations nuevos se aplican sobre la base existente.
> Genera el baseline (pasos abajo) cuando tengas Docker, o vía `pg_dump`.

## Por qué existe este documento

El proyecto creció con ~14 archivos `.sql` sueltos en la raíz (esquema, parches
y seeds mezclados), aplicados a mano en distintos momentos. Eso causó problemas
reales y difíciles de rastrear:

- la secuencia de IDs quedó desincronizada con los datos sembrados;
- el `DEFAULT` del `id` truncaba IDs ≥ 1000 (`LPAD(n,3,'0')`), un bug latente
  que habría reventado el primer registro real pasado el tope;
- cambios de seguridad (RLS, grants) aplicados directo sin historial.

Esos SQL históricos están archivados en `supabase/archive_legacy_sql/`
**solo como referencia**. No se ejecutan más.

## Estructura

```
supabase/
├── config.toml            ← lo crea 'supabase init'
├── migrations/            ← FUENTE DE VERDAD del esquema (versionada en git)
├── seed.sql               ← datos de demostración (NO producción)
├── functions/             ← edge functions (invite-user)
├── migrations_pending/    ← SQL listo para incorporar como migración (auth_triggers)
└── archive_legacy_sql/    ← SQL histórico, NO se ejecuta
```

## Puesta en marcha (una sola vez)

Desde la carpeta del proyecto:

```bash
# 1. Inicializar estructura local (crea config.toml + migrations/)
supabase init

# 2. Generar el baseline desde la base REAL (captura todo lo aplicado hasta hoy,
#    incluyendo los arreglos de seguridad y el fix del id). Pide la contraseña de la BD.
supabase link --project-ref izcqcnunryhntojhxywu   # si no está enlazado
supabase db pull

# 3. Añadir los triggers de auth (db pull NO captura el esquema 'auth')
supabase migration new auth_triggers
#    → abre el archivo .sql recién creado en supabase/migrations/ y pega
#      el contenido de supabase/migrations_pending/auth_triggers.sql

# 4. Marcar el baseline como YA aplicado en la base existente
#    (evita que push intente recrearlo). Sustituye <version> por el timestamp
#    del archivo de baseline generado en el paso 2.
supabase migration repair --status applied <version>
```

## Flujo de trabajo de ahora en adelante

**Nunca** ejecutes SQL directamente en el SQL Editor para cambios de esquema.
En su lugar:

```bash
# 1. Crear una migración nueva (con nombre descriptivo)
supabase migration new agrega_columna_x

# 2. Escribir el SQL en el archivo generado en supabase/migrations/
#    Reglas: idempotente siempre que sea posible
#    (CREATE ... IF NOT EXISTS, CREATE OR REPLACE, DROP POLICY IF EXISTS, etc.)

# 3. Probar en local o en un branch de Supabase antes de producción
supabase db reset          # reconstruye desde cero (migrations + seed.sql)

# 4. Aplicar a la base remota
supabase db push
```

## Datos de demostración

`seed.sql` contiene los datos mock (consolidado de los seeds antiguos).
Se aplica automáticamente con `supabase db reset` en local. **No** lo ejecutes
contra producción.

> Nota: los seeds insertan IDs explícitos (`M001`…). Tras sembrar, si vas a
> registrar por la app, asegúrate de que la secuencia `migrantes_seq` esté por
> encima del id numérico máximo:
> `SELECT setval('migrantes_seq', (SELECT MAX(NULLIF(regexp_replace(id,'\D','','g'),'')::bigint) FROM migrantes), true);`

## Branches (recomendado para no romper producción)

Para probar migraciones sin riesgo, usa un branch de Supabase:

```bash
supabase branches create pruebas
# aplicar y validar ahí; luego merge
```
