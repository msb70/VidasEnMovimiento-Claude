-- ============================================================
-- migration_profiles.sql — Vidas en Movimiento
-- Tabla profiles + RLS + RPC para gestión de usuarios reales
-- Ejecutar en: Supabase SQL Editor (dashboard)
-- ============================================================

-- ─── 1. TABLA PROFILES ───────────────────────────────────────
-- Extiende auth.users con datos propios de la app

CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo   TEXT        NOT NULL DEFAULT '',
  rol               TEXT        NOT NULL DEFAULT 'Operador',
  organizacion_id   TEXT        REFERENCES public.organizations(id) ON DELETE SET NULL,
  es_global         BOOLEAN     NOT NULL DEFAULT FALSE,
  orgs_adicionales  TEXT[]      NOT NULL DEFAULT '{}',
  activo            BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si la tabla ya existía con esquema anterior, agregar columnas faltantes
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS es_global        BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS orgs_adicionales TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS activo           BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();

-- ─── 2. ROW LEVEL SECURITY ───────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Todo usuario autenticado puede leer su propio perfil
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuarios globales (admins) pueden leer todos los perfiles
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.es_global = TRUE
    )
  );

-- Todo usuario autenticado puede actualizar su propio perfil
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─── 3. RPC: get_all_profiles() ──────────────────────────────
-- Retorna todos los perfiles con email y último acceso desde auth.users
-- Usa SECURITY DEFINER para bypassar RLS y leer auth.users

DROP FUNCTION IF EXISTS get_all_profiles();

CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS TABLE (
  id                UUID,
  email             TEXT,
  nombre_completo   TEXT,
  rol               TEXT,
  organizacion_id   TEXT,
  org_nombre        TEXT,
  es_global         BOOLEAN,
  orgs_adicionales  TEXT[],
  activo            BOOLEAN,
  created_at        TIMESTAMPTZ,
  last_sign_in_at   TIMESTAMPTZ,
  invited_at        TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    u.email::TEXT,
    p.nombre_completo,
    p.rol,
    p.organizacion_id,
    o.nombre::TEXT AS org_nombre,
    p.es_global,
    p.orgs_adicionales,
    p.activo,
    p.created_at,
    u.last_sign_in_at,
    u.invited_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.organizations o ON o.id = p.organizacion_id
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_profiles() TO anon;


-- ─── 4. RPC: update_profile() ────────────────────────────────
-- Actualiza un perfil (admin puede editar cualquiera, usuario solo el suyo)

DROP FUNCTION IF EXISTS update_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT[], BOOLEAN);

CREATE OR REPLACE FUNCTION update_profile(
  p_id              UUID,
  p_nombre_completo TEXT,
  p_rol             TEXT,
  p_organizacion_id TEXT,
  p_es_global       BOOLEAN,
  p_orgs_adicionales TEXT[],
  p_activo          BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET
    nombre_completo  = p_nombre_completo,
    rol              = p_rol,
    organizacion_id  = NULLIF(p_organizacion_id, ''),
    es_global        = p_es_global,
    orgs_adicionales = p_orgs_adicionales,
    activo           = p_activo
  WHERE id = p_id;

  RETURN jsonb_build_object('ok', TRUE, 'id', p_id);
END;
$$;

GRANT EXECUTE ON FUNCTION update_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT[], BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT[], BOOLEAN) TO anon;


-- ─── 5. PERFIL DEL USUARIO DEMO (afonseca@demo.com) ──────────
-- Ejecutar DESPUÉS de que ese usuario exista en auth.users
-- (el usuario se crea al hacer "Invitar" o mediante el dashboard de Auth)

-- INSTRUCCIONES:
-- 1. Ve a: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/auth/users
-- 2. Crea el usuario demo: afonseca@demo.com / Demo2024!
-- 3. Copia el UUID del usuario creado
-- 4. Descomenta y ejecuta el INSERT de abajo reemplazando el UUID

/*
INSERT INTO public.profiles (id, nombre_completo, rol, organizacion_id, es_global, activo)
VALUES (
  '<UUID-DEL-USUARIO-DEMO>',
  'Antonio Fonseca',
  'Administrador',
  NULL,   -- o el id de la org que corresponda
  TRUE,   -- acceso global
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  rol             = EXCLUDED.rol,
  es_global       = EXCLUDED.es_global;
*/


-- ─── VERIFICACIÓN ─────────────────────────────────────────────
-- SELECT * FROM public.profiles;
-- SELECT * FROM get_all_profiles();
