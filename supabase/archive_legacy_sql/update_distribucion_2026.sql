-- ============================================================
-- update_distribucion_2026.sql — Vidas en Movimiento
-- Actualiza distribución de ciudad/país de entrevista y destino final
-- Ejecutar en: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
--
-- Distribución objetivo (ciudad de entrevista / Oficina FEM):
--   Cúcuta     20% → 972 NNA    (CO · ORG12)
--   Caracas    18% → 875 NNA    (VE · ORG11)
--   Bogotá     14% → 681 NNA    (CO · ORG13)
--   Medellín   11% → 535 NNA    (CO · ORG14)
--   Cali       10% → 486 NNA    (CO · ORG15)
--   Barranquilla 10% → 486 NNA  (CO · ORG16)
--   Cartagena   9% → 438 NNA    (CO · ORG17)
--   Santa Marta 8% → 389 NNA    (CO · ORG18)
--
-- Distribución objetivo (destino final):
--   Estados Unidos  80% → 3.889 NNA
--   México         10% → 490 NNA
--   Panamá          5% → 243 NNA
--   Costa Rica      5% → 240 NNA
-- ============================================================


-- ─── PASO 1: UPSERT organizaciones ORG11-ORG18 ───────────────
-- Garantiza que todas las oficinas FEM existen antes del UPDATE

INSERT INTO public.organizations
  (id, nombre, pais_id, ciudad_id, tipo, contacto, email_org, telefono, activa, es_fem, descripcion)
VALUES
  ('ORG11','Fundación Mendoza — Caracas',       'VE','CCS','Fundación privada','Antonio Fonseca',   'afonseca@fundacionmendoza.org',       '+58 212 9901200', TRUE, TRUE,
   'Sede principal de la Fundación Mendoza en Venezuela. Atención integral, documentación y derivación hacia Colombia.'),
  ('ORG12','Fundación Mendoza — Cúcuta',        'CO','CUC','Fundación privada','Carmen Villalba',   'cucuta@fundacionmendoza.org',         '+57 7 5714400',   TRUE, TRUE,
   'Nodo fronterizo más importante de la red FEM. Primer punto de atención tras el cruce Colombia–Venezuela. Atención 24h.'),
  ('ORG13','Fundación Mendoza — Bogotá',        'CO','BOG','Fundación privada','Lucía Morales',     'bogota@fundacionmendoza.org',         '+57 1 7115500',   TRUE, TRUE,
   'Centro de referencia y relocalización de la red FEM en Colombia. Atención integral y reinserción laboral.'),
  ('ORG14','Fundación Mendoza — Medellín',      'CO','MED','Fundación privada','Jorge Ríos',        'medellin@fundacionmendoza.org',       '+57 4 4443300',   TRUE, TRUE,
   'Punto de acogida en Medellín. Enfocado en familias y menores no acompañados en tránsito.'),
  ('ORG15','Fundación Mendoza — Cali',          'CO','CAL','Fundación privada','Adriana Zapata',    'cali@fundacionmendoza.org',           '+57 2 6618800',   TRUE, TRUE,
   'Centro de atención en Cali para NNA y familias en tránsito hacia el Pacífico y Panamá.'),
  ('ORG16','Fundación Mendoza — Barranquilla',  'CO','BAR','Fundación privada','Samuel Meza',       'barranquilla@fundacionmendoza.org',   '+57 5 3852200',   TRUE, TRUE,
   'Punto de atención en el Caribe colombiano. Atiende NNA que transitan por la costa norte.'),
  ('ORG17','Fundación Mendoza — Cartagena',     'CO','CTG','Fundación privada','Paola Herrera',     'cartagena@fundacionmendoza.org',      '+57 5 6603300',   TRUE, TRUE,
   'Centro de acogida en Cartagena. Coordinación con embarcaciones del corredor Caribe y derivación hacia Panamá.'),
  ('ORG18','Fundación Mendoza — Santa Marta',   'CO','SMA','Fundación privada','Diana Orozco',      'santamarta@fundacionmendoza.org',     '+57 5 4311100',   TRUE, TRUE,
   'Punto de atención en Santa Marta. Coordina con la red de albergues del corredor Caribe colombiano.')
ON CONFLICT (id) DO UPDATE SET
  nombre     = EXCLUDED.nombre,
  pais_id    = EXCLUDED.pais_id,
  ciudad_id  = EXCLUDED.ciudad_id,
  contacto   = EXCLUDED.contacto,
  email_org  = EXCLUDED.email_org,
  telefono   = EXCLUDED.telefono,
  activa     = EXCLUDED.activa,
  es_fem     = EXCLUDED.es_fem,
  descripcion= EXCLUDED.descripcion;


-- ─── PASO 2: ACTUALIZAR migrantes sintéticos (SYN*) ──────────
-- Usa el número del ID para distribución determinista

UPDATE public.migrantes
SET
  -- Ciudad de entrevista — oficina FEM donde fue registrado el NNA
  ciudad_entrevista_id = CASE
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  20 THEN 'CUC'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  38 THEN 'CCS'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  52 THEN 'BOG'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  63 THEN 'MED'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  73 THEN 'CAL'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  83 THEN 'BAR'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  92 THEN 'CTG'
    ELSE                                                                     'SMA'
  END,

  -- País de entrevista — se deriva de la ciudad (Caracas=VE, resto=CO)
  pais_entrevista_id = CASE
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  20 THEN 'CO'   -- Cúcuta
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  38 THEN 'VE'   -- Caracas
    ELSE                                                                     'CO'   -- resto Colombia
  END,

  -- Organización FEM que hizo la entrevista
  org_id = CASE
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  20 THEN 'ORG12'  -- Cúcuta
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  38 THEN 'ORG11'  -- Caracas
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  52 THEN 'ORG13'  -- Bogotá
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  63 THEN 'ORG14'  -- Medellín
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  73 THEN 'ORG15'  -- Cali
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  83 THEN 'ORG16'  -- Barranquilla
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  92 THEN 'ORG17'  -- Cartagena
    ELSE                                                                     'ORG18'  -- Santa Marta
  END,

  -- Destino final: US=80% MX=10% PA=5% CR=5%
  destino_final_pais_id = CASE
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  80 THEN 'US'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  90 THEN 'MX'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  95 THEN 'PA'
    ELSE                                                                     'CR'
  END

WHERE id LIKE 'SYN%';


-- ─── PASO 3: ACTUALIZAR migrantes manuales (M001-M030) ────────
-- Misma lógica, mismo tramo de modulo para consistencia

UPDATE public.migrantes
SET
  ciudad_entrevista_id = CASE
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  20 THEN 'CUC'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  38 THEN 'CCS'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  52 THEN 'BOG'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  63 THEN 'MED'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  73 THEN 'CAL'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  83 THEN 'BAR'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  92 THEN 'CTG'
    ELSE                                                                     'SMA'
  END,
  pais_entrevista_id = CASE
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  20 THEN 'CO'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  38 THEN 'VE'
    ELSE                                                                     'CO'
  END,
  org_id = CASE
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  20 THEN 'ORG12'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  38 THEN 'ORG11'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  52 THEN 'ORG13'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  63 THEN 'ORG14'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  73 THEN 'ORG15'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  83 THEN 'ORG16'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  92 THEN 'ORG17'
    ELSE                                                                     'ORG18'
  END,
  destino_final_pais_id = CASE
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  80 THEN 'US'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  90 THEN 'MX'
    WHEN (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer % 100) <  95 THEN 'PA'
    ELSE                                                                     'CR'
  END

WHERE id LIKE 'M%';


-- ─── VERIFICACIÓN ─────────────────────────────────────────────

-- Distribución ciudad de entrevista (esperado: CUC≈20%, CCS≈18%, BOG≈14% …)
SELECT
  ciudad_entrevista_id AS ciudad,
  pais_entrevista_id   AS pais,
  org_id,
  COUNT(*)             AS total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM public.migrantes
GROUP BY ciudad_entrevista_id, pais_entrevista_id, org_id
ORDER BY total DESC;

-- Distribución destino final (esperado: US≈80%, MX≈10%, PA≈5%, CR≈5%)
SELECT
  destino_final_pais_id AS destino,
  COUNT(*)              AS total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM public.migrantes
GROUP BY destino_final_pais_id
ORDER BY total DESC;
