-- ============================================================================
-- 2026-06-14_Remediacion_Seguridad_Critica.sql
-- Vidas en Movimiento — Cierre de los 4 hallazgos CRÍTICOS de base de datos
-- Ejecutar en: Supabase → SQL Editor (en una transacción; revisar antes de COMMIT)
--
-- Cubre:
--   CRÍTICO 1 — PII de menores legible por 'anon'
--   CRÍTICO 2 — update_profile() abierta a 'anon' (escalada de privilegios)
--   CRÍTICO 3 — get_all_profiles() abierta a 'anon' (enumeración de usuarios)
--   CRÍTICO 4 — RLS sin aislamiento por organización
--   (extra)   — dashboard_stats / ciudad_stats escribibles por cualquier auth
--
-- IMPORTANTE: prueba en un branch/staging de Supabase antes de producción.
-- El script es idempotente: se puede re-ejecutar sin error.
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════════
-- 0. FUNCIONES HELPER DE AUTORIZACIÓN
--    SECURITY DEFINER para leer 'profiles' sin disparar RLS (evita recursión).
-- ════════════════════════════════════════════════════════════════════════

-- ¿El usuario actual tiene acceso global (admin de toda la plataforma)?
CREATE OR REPLACE FUNCTION public.current_is_global()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.es_global FROM public.profiles p WHERE p.id = auth.uid()),
    FALSE
  );
$$;

-- IDs de organización a las que pertenece el usuario actual
-- (organizacion_id principal + orgs_adicionales).
CREATE OR REPLACE FUNCTION public.current_org_ids()
RETURNS TEXT[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT array_remove(
              array_cat(ARRAY[p.organizacion_id], p.orgs_adicionales),
              NULL)
     FROM public.profiles p WHERE p.id = auth.uid()),
    ARRAY[]::TEXT[]
  );
$$;

-- ¿El usuario actual está activo? (cuentas suspendidas no pasan)
CREATE OR REPLACE FUNCTION public.current_is_active()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.activo FROM public.profiles p WHERE p.id = auth.uid()),
    FALSE
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_is_global() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_org_ids()  TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_is_active() TO authenticated;
-- NO conceder a 'anon'.


-- ════════════════════════════════════════════════════════════════════════
-- CRÍTICO 1 + 4 — Revocar 'anon' y aplicar RLS por organización en PII
-- ════════════════════════════════════════════════════════════════════════

-- 1.1 Revocar TODO grant directo a 'anon' sobre tablas con PII
REVOKE ALL ON public.migrantes            FROM anon;
REVOKE ALL ON public.migrante_ruta        FROM anon;
REVOKE ALL ON public.migrante_grupo_viaje FROM anon;

-- 1.2 Eliminar políticas permisivas anteriores
DROP POLICY IF EXISTS allow_all_auth     ON public.migrantes;
DROP POLICY IF EXISTS allow_select_anon  ON public.migrantes;
DROP POLICY IF EXISTS allow_all_auth     ON public.migrante_ruta;
DROP POLICY IF EXISTS allow_select_anon  ON public.migrante_ruta;
DROP POLICY IF EXISTS allow_all_auth     ON public.migrante_grupo_viaje;
DROP POLICY IF EXISTS allow_select_anon  ON public.migrante_grupo_viaje;

-- Asegurar RLS activo
ALTER TABLE public.migrantes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migrante_ruta        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migrante_grupo_viaje ENABLE ROW LEVEL SECURITY;

-- 1.3 migrantes: el usuario solo ve/edita migrantes de SUS organizaciones
--     (org_id = organización de entrevista). Global ve todo.
DROP POLICY IF EXISTS migrantes_org_access ON public.migrantes;
CREATE POLICY migrantes_org_access ON public.migrantes
  FOR ALL TO authenticated
  USING (
    public.current_is_active() AND (
      public.current_is_global()
      OR org_id = ANY (public.current_org_ids())
    )
  )
  WITH CHECK (
    public.current_is_active() AND (
      public.current_is_global()
      OR org_id = ANY (public.current_org_ids())
    )
  );

-- 1.4 migrante_ruta: hereda el control del migrante padre
DROP POLICY IF EXISTS ruta_org_access ON public.migrante_ruta;
CREATE POLICY ruta_org_access ON public.migrante_ruta
  FOR ALL TO authenticated
  USING (
    public.current_is_active() AND (
      public.current_is_global()
      OR EXISTS (
        SELECT 1 FROM public.migrantes m
        WHERE m.id = migrante_id
          AND m.org_id = ANY (public.current_org_ids())
      )
    )
  )
  WITH CHECK (
    public.current_is_active() AND (
      public.current_is_global()
      OR EXISTS (
        SELECT 1 FROM public.migrantes m
        WHERE m.id = migrante_id
          AND m.org_id = ANY (public.current_org_ids())
      )
    )
  );

-- 1.5 migrante_grupo_viaje: idéntico patrón
DROP POLICY IF EXISTS grupo_org_access ON public.migrante_grupo_viaje;
CREATE POLICY grupo_org_access ON public.migrante_grupo_viaje
  FOR ALL TO authenticated
  USING (
    public.current_is_active() AND (
      public.current_is_global()
      OR EXISTS (
        SELECT 1 FROM public.migrantes m
        WHERE m.id = migrante_id
          AND m.org_id = ANY (public.current_org_ids())
      )
    )
  )
  WITH CHECK (
    public.current_is_active() AND (
      public.current_is_global()
      OR EXISTS (
        SELECT 1 FROM public.migrantes m
        WHERE m.id = migrante_id
          AND m.org_id = ANY (public.current_org_ids())
      )
    )
  );

-- 1.6 Índices que la nueva RLS necesita para no degradar (FKs / filtros)
CREATE INDEX IF NOT EXISTS idx_migrantes_org_id      ON public.migrantes(org_id);
CREATE INDEX IF NOT EXISTS idx_ruta_migrante_id      ON public.migrante_ruta(migrante_id);
CREATE INDEX IF NOT EXISTS idx_grupo_migrante_id     ON public.migrante_grupo_viaje(migrante_id);
CREATE INDEX IF NOT EXISTS idx_migrantes_created_at  ON public.migrantes(created_at);


-- ════════════════════════════════════════════════════════════════════════
-- CRÍTICO 3 — get_all_profiles(): quitar 'anon' y exigir admin global
-- ════════════════════════════════════════════════════════════════════════

REVOKE EXECUTE ON FUNCTION public.get_all_profiles() FROM anon;

CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS TABLE (
  id                UUID,
  email             TEXT,
  nombre_completo   TEXT,
  rol               TEXT,
  organizacion_id   TEXT,
  org_nombre        TEXT,
  es_global         BOOLEAN,
  orgs_adicionales  TEXT[],
  permisos          TEXT[],
  activo            BOOLEAN,
  created_at        TIMESTAMPTZ,
  last_sign_in_at   TIMESTAMPTZ,
  invited_at        TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Autorización: solo administradores globales listan a todos los usuarios
  IF auth.uid() IS NULL OR NOT public.current_is_global() THEN
    RAISE EXCEPTION 'No autorizado: se requiere acceso global.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id, u.email::TEXT, p.nombre_completo, p.rol, p.organizacion_id,
    o.nombre::TEXT AS org_nombre, p.es_global, p.orgs_adicionales, p.permisos,
    p.activo, p.created_at, u.last_sign_in_at, u.invited_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.organizations o ON o.id = p.organizacion_id
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO authenticated;


-- ════════════════════════════════════════════════════════════════════════
-- CRÍTICO 2 — update_profile(): quitar 'anon' y bloquear escalada
--   · Admin global  → puede editar cualquier perfil y cualquier campo.
--   · Usuario normal → solo su propio perfil y SOLO nombre_completo;
--                      rol / es_global / permisos / activo / org se preservan.
-- ════════════════════════════════════════════════════════════════════════

-- Quitar grants a 'anon' de ambas firmas históricas (7 y 8 parámetros)
DO $$
BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.update_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT[], BOOLEAN) FROM anon';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;
DO $$
BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.update_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT[], BOOLEAN, TEXT[]) FROM anon';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.update_profile(
  p_id               UUID,
  p_nombre_completo  TEXT,
  p_rol              TEXT,
  p_organizacion_id  TEXT,
  p_es_global        BOOLEAN,
  p_orgs_adicionales TEXT[],
  p_activo           BOOLEAN,
  p_permisos         TEXT[] DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_is_global BOOLEAN := public.current_is_global();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado.' USING ERRCODE = '42501';
  END IF;

  -- Un usuario no global solo puede tocar SU propio perfil
  IF NOT v_is_global AND auth.uid() <> p_id THEN
    RAISE EXCEPTION 'No autorizado para editar otros perfiles.'
      USING ERRCODE = '42501';
  END IF;

  IF v_is_global THEN
    -- Admin global: actualización completa
    UPDATE public.profiles SET
      nombre_completo  = p_nombre_completo,
      rol              = p_rol,
      organizacion_id  = NULLIF(p_organizacion_id, ''),
      es_global        = p_es_global,
      orgs_adicionales = p_orgs_adicionales,
      activo           = p_activo,
      permisos         = p_permisos
    WHERE id = p_id;
  ELSE
    -- Usuario normal: SOLO su nombre; campos sensibles intactos
    UPDATE public.profiles SET
      nombre_completo  = p_nombre_completo
    WHERE id = p_id;
  END IF;

  RETURN jsonb_build_object('ok', TRUE, 'id', p_id);
END;
$$;

GRANT EXECUTE ON FUNCTION
  public.update_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT[], BOOLEAN, TEXT[])
  TO authenticated;


-- ════════════════════════════════════════════════════════════════════════
-- CRÍTICO 3 (refuerzo) — Quitar recursión y reescribir RLS de 'profiles'
--   La política previa hacía EXISTS sobre la propia tabla (riesgo de
--   recursión). Se reemplaza por las funciones helper.
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own        ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_select_all  ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own        ON public.profiles;

-- Lectura: tu propio perfil, o todos si eres global
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.current_is_global());

-- Actualización directa (vía PostgREST): solo tu propio perfil.
-- Los cambios sensibles deben pasar por update_profile() (con sus reglas).
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

REVOKE ALL ON public.profiles FROM anon;


-- ════════════════════════════════════════════════════════════════════════
-- EXTRA (ALTA) — dashboard_stats / ciudad_stats: lectura auth, escritura admin
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE public.dashboard_stats  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ciudad_stats_fem ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_read_stats        ON public.dashboard_stats;
DROP POLICY IF EXISTS allow_update_stats       ON public.dashboard_stats;
DROP POLICY IF EXISTS allow_read_ciudad_stats  ON public.ciudad_stats_fem;
DROP POLICY IF EXISTS allow_write_ciudad_stats ON public.ciudad_stats_fem;

CREATE POLICY stats_read   ON public.dashboard_stats
  FOR SELECT TO authenticated USING (true);
CREATE POLICY stats_write  ON public.dashboard_stats
  FOR ALL TO authenticated
  USING (public.current_is_global()) WITH CHECK (public.current_is_global());

CREATE POLICY ciudad_read  ON public.ciudad_stats_fem
  FOR SELECT TO authenticated USING (true);
CREATE POLICY ciudad_write ON public.ciudad_stats_fem
  FOR ALL TO authenticated
  USING (public.current_is_global()) WITH CHECK (public.current_is_global());

REVOKE ALL ON public.dashboard_stats  FROM anon;
REVOKE ALL ON public.ciudad_stats_fem FROM anon;

-- Las RPC de stats ya no deben ser ejecutables por 'anon' (la app va tras login)
DO $$ BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_dashboard_stats()  FROM anon';
EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_ciudad_stats_fem() FROM anon';
EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.compute_dashboard_stats() FROM anon';
EXCEPTION WHEN undefined_function THEN NULL; END $$;


-- ════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN (revisar la salida ANTES de hacer COMMIT)
-- ════════════════════════════════════════════════════════════════════════

-- A. Ninguna tabla con PII debe conceder privilegios a 'anon'
SELECT 'GRANTS_ANON_PII' AS check, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
  AND table_schema = 'public'
  AND table_name IN ('migrantes','migrante_ruta','migrante_grupo_viaje','profiles',
                     'dashboard_stats','ciudad_stats_fem');
-- ↑ Debe devolver 0 filas.

-- B. Políticas activas resultantes
SELECT 'POLICIES' AS check, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('migrantes','migrante_ruta','migrante_grupo_viaje','profiles',
                    'dashboard_stats','ciudad_stats_fem')
ORDER BY tablename, policyname;

-- C. RPC sensibles: ningún EXECUTE para 'anon'
SELECT 'RPC_ANON' AS check, p.proname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('update_profile','get_all_profiles',
                    'get_dashboard_stats','get_ciudad_stats_fem','compute_dashboard_stats')
  AND has_function_privilege('anon', p.oid, 'EXECUTE');
-- ↑ Debe devolver 0 filas.

-- Si todo lo anterior es correcto:  COMMIT;
-- Si algo no cuadra:                ROLLBACK;

COMMIT;
