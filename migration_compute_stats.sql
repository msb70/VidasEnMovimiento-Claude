-- ============================================================
-- migration_compute_stats.sql
-- Crea la función RPC compute_dashboard_stats()
-- Esta función calcula los KPIs del dashboard en tiempo real
-- desde las tablas: migrantes, migrante_ruta, migrante_grupo_viaje
-- ============================================================

-- Eliminar versión anterior si existe
DROP FUNCTION IF EXISTS compute_dashboard_stats();

-- Crear función
CREATE OR REPLACE FUNCTION compute_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total           INT;
  v_ninos           INT;
  v_ninas           INT;
  v_familias        INT;
  v_pendientes      INT;
  v_multi_puntos    INT;
  v_unico_punto     INT;
  v_pct_multi       NUMERIC(5,2);
  v_total_con_ruta  INT;
BEGIN
  -- Total de registros
  SELECT COUNT(*) INTO v_total FROM migrantes;

  -- Niños (género masculino)
  SELECT COUNT(*) INTO v_ninos
  FROM migrantes
  WHERE adulto_genero_id = 'M';

  -- Niñas (género femenino)
  SELECT COUNT(*) INTO v_ninas
  FROM migrantes
  WHERE adulto_genero_id = 'F';

  -- Familias: migrantes que tienen al menos un miembro en grupo_viaje
  SELECT COUNT(DISTINCT migrante_id) INTO v_familias
  FROM migrante_grupo_viaje;

  -- Datos pendientes: sin email Y sin teléfono
  SELECT COUNT(*) INTO v_pendientes
  FROM migrantes
  WHERE (adulto_email IS NULL OR adulto_email = '')
    AND (adulto_telefono IS NULL OR adulto_telefono = '');

  -- NNA con múltiples puntos de trazabilidad (más de 1 evento de ruta)
  SELECT COUNT(*) INTO v_multi_puntos
  FROM (
    SELECT migrante_id
    FROM migrante_ruta
    GROUP BY migrante_id
    HAVING COUNT(*) > 1
  ) sub;

  -- Total de migrantes con al menos 1 evento de ruta
  SELECT COUNT(DISTINCT migrante_id) INTO v_total_con_ruta
  FROM migrante_ruta;

  -- NNA con único punto de trazabilidad
  v_unico_punto := v_total_con_ruta - v_multi_puntos;

  -- Porcentaje con múltiples puntos
  IF v_total_con_ruta > 0 THEN
    v_pct_multi := ROUND((v_multi_puntos::NUMERIC / v_total_con_ruta) * 100, 2);
  ELSE
    v_pct_multi := 0;
  END IF;

  -- Retornar JSON con todos los KPIs
  RETURN jsonb_build_object(
    'totalRegistros',       v_total,
    'ninos',                v_ninos,
    'ninas',                v_ninas,
    'familias',             v_familias,
    'datosPendientes',      v_pendientes,
    'nnaMultiplesPuntos',   v_multi_puntos,
    'nnaUnicoPunto',        v_unico_punto,
    'pctMultiplesPuntos',   v_pct_multi,
    'totalConRuta',         v_total_con_ruta
  );
END;
$$;

-- Permisos para roles anon y authenticated (requerido por PostgREST)
GRANT EXECUTE ON FUNCTION compute_dashboard_stats() TO anon;
GRANT EXECUTE ON FUNCTION compute_dashboard_stats() TO authenticated;

-- ============================================================
-- Verificación: ejecuta esto para comprobar que funciona
-- ============================================================
-- SELECT compute_dashboard_stats();
