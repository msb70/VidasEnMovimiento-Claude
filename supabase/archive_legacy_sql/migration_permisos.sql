-- ============================================================
-- migration_permisos.sql — Vidas en Movimiento
-- Agrega columna permisos a profiles + actualiza RPCs
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ─── 1. COLUMNA PERMISOS ─────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS permisos TEXT[] NOT NULL DEFAULT '{}';

-- ─── 2. ACTUALIZAR get_all_profiles() ────────────────────────
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
  permisos          TEXT[],
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
    p.permisos,
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

-- ─── 3. ACTUALIZAR update_profile() ──────────────────────────
DROP FUNCTION IF EXISTS update_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT[], BOOLEAN);

CREATE OR REPLACE FUNCTION update_profile(
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
    activo           = p_activo,
    permisos         = p_permisos
  WHERE id = p_id;

  RETURN jsonb_build_object('ok', TRUE, 'id', p_id);
END;
$$;

GRANT EXECUTE ON FUNCTION update_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT[], BOOLEAN, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT[], BOOLEAN, TEXT[]) TO anon;

-- ─── 4. ACTUALIZAR TRIGGER handle_new_user() ─────────────────
-- Asigna permisos por defecto según el rol al crear perfil vía Google/email

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol     TEXT;
  v_permisos TEXT[];
BEGIN
  -- Determinar rol por defecto
  v_rol := COALESCE(
    NEW.raw_user_meta_data->>'rol',
    'Operador'
  );

  -- Permisos por defecto según rol
  v_permisos := CASE v_rol
    WHEN 'Administrador'  THEN ARRAY['migrantes','parametros','seguridad','configuracion']
    WHEN 'Administradora' THEN ARRAY['migrantes','parametros','seguridad','configuracion']
    WHEN 'Director'       THEN ARRAY['migrantes','parametros','seguridad','configuracion']
    WHEN 'Directora'      THEN ARRAY['migrantes','parametros','seguridad','configuracion']
    WHEN 'Coordinador'    THEN ARRAY['migrantes','parametros']
    WHEN 'Coordinadora'   THEN ARRAY['migrantes','parametros']
    ELSE                       ARRAY['migrantes']
  END;

  INSERT INTO public.profiles (
    id,
    nombre_completo,
    rol,
    organizacion_id,
    es_global,
    orgs_adicionales,
    permisos,
    activo
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nombre_completo',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    v_rol,
    NULL,
    FALSE,
    '{}',
    v_permisos,
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── VERIFICACIÓN ─────────────────────────────────────────────
-- SELECT id, nombre_completo, rol, permisos FROM public.profiles;
-- SELECT * FROM get_all_profiles();
