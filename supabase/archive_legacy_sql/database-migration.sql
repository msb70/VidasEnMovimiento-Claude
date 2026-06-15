-- ============================================================
-- Migración: Vidas en Movimiento — Stats y Organizaciones FEM
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-05-12
-- ============================================================

-- ─── 1. TABLA: dashboard_stats ────────────────────────────────
-- Almacena todos los KPIs y distribuciones agregadas del sistema.
-- Una sola fila (id = 'main') actualizable desde el panel admin.

CREATE TABLE IF NOT EXISTS dashboard_stats (
  id                    TEXT PRIMARY KEY DEFAULT 'main',
  -- KPIs principales
  total_registros       INTEGER NOT NULL DEFAULT 4862,
  atenciones_cumuladas  INTEGER NOT NULL DEFAULT 7779,
  nna_multiples_puntos  INTEGER NOT NULL DEFAULT 2917,
  nna_unico_punto       INTEGER NOT NULL DEFAULT 1945,
  pct_multiples_puntos  INTEGER NOT NULL DEFAULT 60,
  ninos                 INTEGER NOT NULL DEFAULT 2722,
  ninas                 INTEGER NOT NULL DEFAULT 2140,
  familias              INTEGER NOT NULL DEFAULT 1217,
  datos_pendientes      INTEGER NOT NULL DEFAULT 391,
  pct_duplicados        NUMERIC(5,2)     DEFAULT 0.48,
  -- FEM vs otras organizaciones
  fem_pct               INTEGER NOT NULL DEFAULT 85,
  fem_total             INTEGER NOT NULL DEFAULT 4132,
  otras_total           INTEGER NOT NULL DEFAULT 730,
  -- Distribuciones (almacenadas como JSONB para flexibilidad)
  historico             JSONB,
  razones_top           JSONB,
  tipo_ingresos         JSONB,
  nivel_educativo       JSONB,
  nexos                 JSONB,
  rango_edad_ninos      JSONB,
  rango_edad_adultos    JSONB,
  pais_destino          JSONB,
  pais_residencia       JSONB,
  servicios_top         JSONB,
  recomendaciones_top   JSONB,
  plataformas_digitales JSONB,
  permisos_trabajo      JSONB,
  permanencia           JSONB,
  intencion_reuni_si    INTEGER          DEFAULT 71,
  sist_escolar_si       INTEGER          DEFAULT 58,
  -- Auditoría
  updated_at            TIMESTAMPTZ      DEFAULT NOW(),
  updated_by            TEXT
);

-- RLS: solo lectura pública (los datos son de presentación, no sensibles)
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_read_stats" ON dashboard_stats;
CREATE POLICY "allow_read_stats" ON dashboard_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "allow_update_stats" ON dashboard_stats;
CREATE POLICY "allow_update_stats" ON dashboard_stats FOR ALL USING (auth.role() = 'authenticated');


-- ─── 2. TABLA: ciudad_stats_fem ───────────────────────────────
-- Distribución de NNA por ciudad de la red FEM.
-- Una fila por ciudad. Permite filtrar el mapa y estadísticas.

CREATE TABLE IF NOT EXISTS ciudad_stats_fem (
  ciudad_id    TEXT    PRIMARY KEY,
  label        TEXT    NOT NULL,
  pais_id      TEXT    NOT NULL,
  pais_label   TEXT    NOT NULL,
  pct          INTEGER NOT NULL DEFAULT 0,
  nna_unicos   INTEGER NOT NULL DEFAULT 0,
  atenciones   INTEGER NOT NULL DEFAULT 0,
  multi_punto  INTEGER NOT NULL DEFAULT 0,
  orden        INTEGER NOT NULL DEFAULT 99,
  activa       BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE ciudad_stats_fem ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_read_ciudad_stats" ON ciudad_stats_fem;
CREATE POLICY "allow_read_ciudad_stats" ON ciudad_stats_fem FOR SELECT USING (true);
DROP POLICY IF EXISTS "allow_write_ciudad_stats" ON ciudad_stats_fem;
CREATE POLICY "allow_write_ciudad_stats" ON ciudad_stats_fem FOR ALL USING (auth.role() = 'authenticated');


-- ─── 3. COLUMNA es_fem EN organizations ───────────────────────
-- Marca qué organizaciones son oficinas de la Fundación Mendoza.

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS es_fem BOOLEAN DEFAULT FALSE;


-- ─── 4. SEED: dashboard_stats ─────────────────────────────────

INSERT INTO dashboard_stats (
  id,
  total_registros, atenciones_cumuladas,
  nna_multiples_puntos, nna_unico_punto, pct_multiples_puntos,
  ninos, ninas, familias, datos_pendientes, pct_duplicados,
  fem_pct, fem_total, otras_total,
  historico, razones_top, tipo_ingresos, nivel_educativo, nexos,
  rango_edad_ninos, rango_edad_adultos,
  pais_destino, pais_residencia, servicios_top, recomendaciones_top,
  plataformas_digitales, permisos_trabajo, permanencia,
  intencion_reuni_si, sist_escolar_si
) VALUES (
  'main',
  4862, 7779,
  2917, 1945, 60,
  2722, 2140, 1217, 391, 0.48,
  85, 4132, 730,

  -- historico: evolución mensual de registros
  '[
    {"mes":"2025-05","label":"May 25","total":4362},
    {"mes":"2025-06","label":"Jun 25","total":4408},
    {"mes":"2025-07","label":"Jul 25","total":4451},
    {"mes":"2025-08","label":"Ago 25","total":4474},
    {"mes":"2025-09","label":"Sep 25","total":4484},
    {"mes":"2025-10","label":"Oct 25","total":4494},
    {"mes":"2025-11","label":"Nov 25","total":4534},
    {"mes":"2025-12","label":"Dic 25","total":4586},
    {"mes":"2026-01","label":"Ene 26","total":4666},
    {"mes":"2026-02","label":"Feb 26","total":4736},
    {"mes":"2026-03","label":"Mar 26","total":4796},
    {"mes":"2026-04","label":"Abr 26","total":4862}
  ]'::JSONB,

  -- razones_top
  '[
    {"label":"Crisis económica","pct":68},
    {"label":"Falta de empleo","pct":52},
    {"label":"Violencia/inseguridad","pct":31},
    {"label":"Reunificación familiar","pct":22},
    {"label":"Persecución política","pct":14},
    {"label":"Calidad de vida","pct":11}
  ]'::JSONB,

  -- tipo_ingresos
  '[
    {"label":"Trabajo informal","pct":38},
    {"label":"Sin ingresos","pct":27},
    {"label":"Empleo temporal","pct":19},
    {"label":"Apoyo familiar","pct":11},
    {"label":"Empleo formal","pct":3},
    {"label":"Emprendimiento","pct":2}
  ]'::JSONB,

  -- nivel_educativo
  '[
    {"label":"Secundario","pct":35},
    {"label":"Universitario","pct":29},
    {"label":"Técnico","pct":21},
    {"label":"Primario","pct":12},
    {"label":"Sin datos","pct":3}
  ]'::JSONB,

  -- nexos
  '[
    {"label":"Familiar directo","pct":34},
    {"label":"Org. humanitaria","pct":28},
    {"label":"Amigo o conocido","pct":18},
    {"label":"Sin nexo","pct":12},
    {"label":"Redes sociales","pct":5},
    {"label":"Autoridad migratoria","pct":3}
  ]'::JSONB,

  -- rango_edad_ninos (NNA 0-17 años)
  '[
    {"label":"0-2 años","total":287},
    {"label":"3-5 años","total":412},
    {"label":"6-11 años","total":601},
    {"label":"12-17 años","total":497}
  ]'::JSONB,

  -- rango_edad_adultos (acompañantes)
  '[
    {"label":"18-24 años","total":891},
    {"label":"25-34 años","total":1204},
    {"label":"35-44 años","total":612},
    {"label":"45-54 años","total":234},
    {"label":"55+ años","total":73}
  ]'::JSONB,

  -- pais_destino
  '[
    {"label":"Estados Unidos","bandera":"🇺🇸","pct":41},
    {"label":"México","bandera":"🇲🇽","pct":22},
    {"label":"Colombia","bandera":"🇨🇴","pct":15},
    {"label":"Costa Rica","bandera":"🇨🇷","pct":9},
    {"label":"Panamá","bandera":"🇵🇦","pct":8},
    {"label":"Otro","bandera":"🌍","pct":5}
  ]'::JSONB,

  -- pais_residencia
  '[
    {"label":"Colombia","bandera":"🇨🇴","pct":28},
    {"label":"México","bandera":"🇲🇽","pct":24},
    {"label":"Estados Unidos","bandera":"🇺🇸","pct":18},
    {"label":"Venezuela","bandera":"🇻🇪","pct":14},
    {"label":"Panamá","bandera":"🇵🇦","pct":9},
    {"label":"Costa Rica","bandera":"🇨🇷","pct":7}
  ]'::JSONB,

  -- servicios_top
  '[
    {"id":"TS01","label":"Alimentación","icono":"🍽️","pct":74,"total":3598},
    {"id":"TS03","label":"Atención médica","icono":"🏥","pct":68,"total":3306},
    {"id":"TS02","label":"Refugio temporal","icono":"🏠","pct":61,"total":2965},
    {"id":"TS04","label":"Atención psicológica","icono":"🧠","pct":47,"total":2285},
    {"id":"TS05","label":"Asesoría legal","icono":"⚖️","pct":39,"total":1896},
    {"id":"TS07","label":"Capacitación laboral","icono":"💼","pct":28,"total":1361},
    {"id":"TS06","label":"Educación","icono":"📚","pct":23,"total":1119},
    {"id":"TS08","label":"Transporte","icono":"🚌","pct":18,"total":875}
  ]'::JSONB,

  -- recomendaciones_top
  '[
    {"id":"RC01","label":"Registro inicial completo","tipo":"Operativa","total":2922},
    {"id":"RC07","label":"Evaluar riesgo de vulnerabilidad alta","tipo":"Protección","total":1651},
    {"id":"RC02","label":"Derivar a atención médica urgente","tipo":"Salud","total":1436},
    {"id":"RC09","label":"Brindar kit de higiene y alimentación","tipo":"Humanitaria","total":1301},
    {"id":"RC08","label":"Facilitar acceso a albergue temporal","tipo":"Alojamiento","total":1116},
    {"id":"RC10","label":"Acompañamiento psicosocial prioritario","tipo":"Salud Mental","total":973},
    {"id":"RC03","label":"Solicitar documentación pendiente","tipo":"Legal","total":856},
    {"id":"RC04","label":"Inscribir menores en programa escolar","tipo":"Educación","total":720}
  ]'::JSONB,

  -- plataformas_digitales
  '[
    {"label":"WhatsApp","pct":84},
    {"label":"Facebook","pct":62},
    {"label":"Email","pct":45},
    {"label":"Instagram","pct":38},
    {"label":"Sin acceso","pct":18}
  ]'::JSONB,

  -- permisos_trabajo
  '{"si":66,"no":34}'::JSONB,

  -- permanencia
  '{"si":44,"no":56}'::JSONB,

  71, 58
)
ON CONFLICT (id) DO UPDATE SET
  total_registros       = EXCLUDED.total_registros,
  atenciones_cumuladas  = EXCLUDED.atenciones_cumuladas,
  nna_multiples_puntos  = EXCLUDED.nna_multiples_puntos,
  nna_unico_punto       = EXCLUDED.nna_unico_punto,
  pct_multiples_puntos  = EXCLUDED.pct_multiples_puntos,
  ninos                 = EXCLUDED.ninos,
  ninas                 = EXCLUDED.ninas,
  familias              = EXCLUDED.familias,
  datos_pendientes      = EXCLUDED.datos_pendientes,
  fem_pct               = EXCLUDED.fem_pct,
  fem_total             = EXCLUDED.fem_total,
  otras_total           = EXCLUDED.otras_total,
  historico             = EXCLUDED.historico,
  razones_top           = EXCLUDED.razones_top,
  tipo_ingresos         = EXCLUDED.tipo_ingresos,
  nivel_educativo       = EXCLUDED.nivel_educativo,
  nexos                 = EXCLUDED.nexos,
  rango_edad_ninos      = EXCLUDED.rango_edad_ninos,
  rango_edad_adultos    = EXCLUDED.rango_edad_adultos,
  pais_destino          = EXCLUDED.pais_destino,
  pais_residencia       = EXCLUDED.pais_residencia,
  servicios_top         = EXCLUDED.servicios_top,
  recomendaciones_top   = EXCLUDED.recomendaciones_top,
  plataformas_digitales = EXCLUDED.plataformas_digitales,
  permisos_trabajo      = EXCLUDED.permisos_trabajo,
  permanencia           = EXCLUDED.permanencia,
  intencion_reuni_si    = EXCLUDED.intencion_reuni_si,
  sist_escolar_si       = EXCLUDED.sist_escolar_si,
  updated_at            = NOW();


-- ─── 5. SEED: ciudad_stats_fem ────────────────────────────────
-- Distribución técnica conservadora por ponderación territorial

INSERT INTO ciudad_stats_fem
  (ciudad_id, label, pais_id, pais_label, pct, nna_unicos, atenciones, multi_punto, orden)
VALUES
  ('CUC', 'Cúcuta',       'CO', 'Colombia',  20,  972, 1556, 583, 1),
  ('CCS', 'Caracas',      'VE', 'Venezuela', 18,  875, 1400, 525, 2),
  ('BOG', 'Bogotá',       'CO', 'Colombia',  14,  681, 1089, 408, 3),
  ('MED', 'Medellín',     'CO', 'Colombia',  11,  535,  856, 321, 4),
  ('CAL', 'Cali',         'CO', 'Colombia',  10,  486,  778, 292, 5),
  ('BAR', 'Barranquilla', 'CO', 'Colombia',  10,  486,  778, 292, 6),
  ('CTG', 'Cartagena',    'CO', 'Colombia',   9,  438,  700, 263, 7),
  ('SMA', 'Santa Marta',  'CO', 'Colombia',   8,  389,  622, 233, 8)
ON CONFLICT (ciudad_id) DO UPDATE SET
  pct          = EXCLUDED.pct,
  nna_unicos   = EXCLUDED.nna_unicos,
  atenciones   = EXCLUDED.atenciones,
  multi_punto  = EXCLUDED.multi_punto,
  orden        = EXCLUDED.orden;


-- ─── 6. UPSERT: organizaciones FEM ────────────────────────────
-- Inserta u actualiza las 8 oficinas de la Fundación Mendoza.
-- Ajusta los campos a la estructura de tu tabla 'organizations'.

INSERT INTO organizations
  (id, nombre, pais_id, ciudad_id, tipo, contacto, email_org, telefono,
   servicios, total_atendidos, recomendaciones_count, activa, descripcion, es_fem)
VALUES
  ('ORG11','Fundación Mendoza — Caracas',    'VE','CCS','Fundación privada','Antonio Fonseca',    'afonseca@fundacionmendoza.org',  '+58 212 9901200', ARRAY['TS01','TS02','TS03','TS05','TS07'],  875, 98, true, 'Sede principal FEM en Venezuela. Atención integral y derivación hacia Colombia.',                                          true),
  ('ORG12','Fundación Mendoza — Cúcuta',     'CO','CUC','Fundación privada','Carmen Villalba',    'cucuta@fundacionmendoza.org',    '+57 7 5714400',   ARRAY['TS01','TS02','TS03','TS04','TS05','TS07'],  972, 118, true, 'Nodo fronterizo principal. Primer punto de atención tras cruce Colombia–Venezuela. Atención 24h.',                        true),
  ('ORG13','Fundación Mendoza — Bogotá',     'CO','BOG','Fundación privada','Lucía Morales',      'bogota@fundacionmendoza.org',    '+57 1 7115500',   ARRAY['TS01','TS02','TS03','TS04','TS05','TS07','TS08'], 681, 82, true, 'Centro de referencia y relocalización en Colombia. Atención integral y reinserción laboral.',                            true),
  ('ORG14','Fundación Mendoza — Medellín',   'CO','MED','Fundación privada','Jorge Ríos',         'medellin@fundacionmendoza.org',  '+57 4 4443300',   ARRAY['TS01','TS02','TS03','TS05','TS07'],  535, 64, true, 'Punto de acogida en Medellín. Enfocado en familias y menores no acompañados.',                                            true),
  ('ORG15','Fundación Mendoza — Cali',       'CO','CAL','Fundación privada','Adriana Zapata',     'cali@fundacionmendoza.org',      '+57 2 6618800',   ARRAY['TS01','TS02','TS03','TS04','TS05'],  486, 57, true, 'Centro de atención en Cali para NNA y familias en tránsito hacia el Pacífico.',                                          true),
  ('ORG16','Fundación Mendoza — Barranquilla','CO','BAR','Fundación privada','Samuel Meza',       'barranquilla@fundacionmendoza.org','+57 5 3852200',  ARRAY['TS01','TS02','TS03','TS05','TS07'],  486, 57, true, 'Punto de atención en el Caribe colombiano. NNA en tránsito por la costa norte.',                                          true),
  ('ORG17','Fundación Mendoza — Cartagena',  'CO','CTG','Fundación privada','Paola Herrera',      'cartagena@fundacionmendoza.org', '+57 5 6603300',   ARRAY['TS01','TS02','TS03','TS04','TS05'],  438, 52, true, 'Centro de acogida en Cartagena. Coordinación con corredor Caribe y derivación a Panamá.',                                 true),
  ('ORG18','Fundación Mendoza — Santa Marta','CO','SMA','Fundación privada','Diana Orozco',       'santamarta@fundacionmendoza.org','+57 5 4311100',   ARRAY['TS01','TS02','TS03','TS05'],         389, 44, true, 'Punto de atención en Santa Marta. Coordinación con albergues del corredor Caribe colombiano.',                            true)
ON CONFLICT (id) DO UPDATE SET
  nombre               = EXCLUDED.nombre,
  pais_id              = EXCLUDED.pais_id,
  ciudad_id            = EXCLUDED.ciudad_id,
  total_atendidos      = EXCLUDED.total_atendidos,
  recomendaciones_count = EXCLUDED.recomendaciones_count,
  es_fem               = EXCLUDED.es_fem,
  descripcion          = EXCLUDED.descripcion;

-- Marcar todas las FEM ya existentes (por si se agregaron manualmente)
UPDATE organizations SET es_fem = TRUE
WHERE id IN ('ORG11','ORG12','ORG13','ORG14','ORG15','ORG16','ORG17','ORG18');


-- ─── 7. RPC: get_dashboard_stats ──────────────────────────────
-- Reemplaza compute_dashboard_stats. Devuelve los datos de la tabla
-- dashboard_stats directamente (ya no los calcula sobre la marcha,
-- sino que lee los valores curados por el equipo).

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT row_to_json(ds)::JSONB
  FROM dashboard_stats ds
  WHERE ds.id = 'main'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO anon, authenticated;


-- ─── 8. RPC: get_ciudad_stats_fem ─────────────────────────────
-- Devuelve la distribución por ciudad, ordenada por peso.

CREATE OR REPLACE FUNCTION get_ciudad_stats_fem()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT json_agg(
    json_build_object(
      'ciudadId',   c.ciudad_id,
      'label',      c.label,
      'paisId',     c.pais_id,
      'paisLabel',  c.pais_label,
      'pct',        c.pct,
      'nnaUnicos',  c.nna_unicos,
      'atenciones', c.atenciones,
      'multiPunto', c.multi_punto
    ) ORDER BY c.orden
  )::JSONB
  FROM ciudad_stats_fem c
  WHERE c.activa = TRUE;
$$;

GRANT EXECUTE ON FUNCTION get_ciudad_stats_fem() TO anon, authenticated;


-- ─── 9. RPC LEGADA: compute_dashboard_stats ───────────────────
-- Mantiene compatibilidad con código existente que llama a esta RPC.
-- Ahora simplemente lee desde dashboard_stats en lugar de calcular.

CREATE OR REPLACE FUNCTION compute_dashboard_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'totalRegistros',     ds.total_registros,
    'ninos',              ds.ninos,
    'ninas',              ds.ninas,
    'familias',           ds.familias,
    'datosPendientes',    ds.datos_pendientes,
    'nnaMultiplesPuntos', ds.nna_multiples_puntos,
    'nnaUnicoPunto',      ds.nna_unico_punto,
    'pctMultiplesPuntos', ds.pct_multiples_puntos,
    'atencionesCumuladas',ds.atenciones_cumuladas,
    'femPct',             ds.fem_pct,
    'femTotal',           ds.fem_total,
    'otrasTotal',         ds.otras_total
  )::JSONB
  FROM dashboard_stats ds
  WHERE ds.id = 'main'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION compute_dashboard_stats() TO anon, authenticated;


-- ─── VERIFICACIÓN ─────────────────────────────────────────────
SELECT 'dashboard_stats' AS tabla, count(*) AS filas FROM dashboard_stats
UNION ALL
SELECT 'ciudad_stats_fem', count(*) FROM ciudad_stats_fem
UNION ALL
SELECT 'organizations FEM', count(*) FROM organizations WHERE es_fem = TRUE;
