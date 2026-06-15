-- ============================================================================
-- auth_triggers.sql — Trigger que crea el perfil al registrarse un usuario
--
-- IMPORTANTE: 'supabase db pull' solo captura el esquema 'public'. Este trigger
-- vive sobre auth.users (esquema 'auth'), así que NO lo captura. Por eso se
-- mantiene como migración aparte, que debe aplicarse DESPUÉS del baseline.
--
-- CÓMO USARLO:
--   1. Tras correr 'supabase db pull' (que genera el baseline del esquema public),
--      crea una migración nueva:   supabase migration new auth_triggers
--   2. Pega el contenido de este archivo dentro del archivo .sql generado.
--   3. supabase db push   (o se aplica en el próximo db reset)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol      TEXT;
  v_permisos TEXT[];
BEGIN
  v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'Operador');

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
    id, nombre_completo, rol, organizacion_id, es_global, orgs_adicionales, permisos, activo
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nombre_completo',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    v_rol, NULL, FALSE, '{}', v_permisos, TRUE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
