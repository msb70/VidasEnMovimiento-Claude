-- ============================================================
-- seed_synthetic.sql — Vidas en Movimiento
-- 4,832 registros sintéticos para llegar a 4,862 total
-- Targets exactos:
--   total=4862 | M=2722 | F=2140 | familias=1217
--   pendientes=391 | trazabilidad≈60%
-- Ejecutar en: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
-- ============================================================

-- ─── 1. MIGRANTES SINTÉTICOS ─────────────────────────────────
INSERT INTO public.migrantes (
  id, adulto_nombres, adulto_apellidos,
  adulto_genero_id, adulto_nacionalidad_id,
  adulto_nexo_id, generacion_ingresos_id,
  adulto_razon_emigracion_id,
  procedencia_pais_id, destino_final_pais_id,
  org_id,
  adulto_email, adulto_telefono,
  nino_fecha_nacimiento, fecha_registro,
  estado, vulnerabilidad,
  consentimiento, notas
)
SELECT
  'SYN' || LPAD(gs::text, 4, '0'),

  -- Nombre según género (M primeros 2709, F los demás)
  CASE WHEN gs <= 2709
    THEN (ARRAY['Carlos','José','Luis','Miguel','Antonio','Ricardo','Fernando',
                'Eduardo','Roberto','Diego','Andrés','Juan','Alejandro','Manuel',
                'Francisco','Sergio','David','Ramón','Héctor','Omar'])[(gs % 20) + 1]
    ELSE (ARRAY['María','Ana','Rosa','Carmen','Luisa','Patricia','Claudia','Sandra',
                'Diana','Laura','Margarita','Yolanda','Sofía','Valeria','Camila',
                'Andrea','Gabriela','Natalia','Isabel','Teresa'])[(gs % 20) + 1]
  END,

  -- Apellidos
  (ARRAY['García','Martínez','López','González','Rodríguez','Hernández','Pérez',
         'Torres','Flores','Vargas','Castro','Morales','Jiménez','Ruiz','Díaz',
         'Sánchez','Romero','Acosta','Mendoza','Cruz'])[(gs % 20) + 1]
  || ' ' ||
  (ARRAY['Silva','Reyes','Ramos','Gómez','Herrera','Medina','Aguilar','Santos',
         'Delgado','Núñez','Vega','Ortiz','Muñoz','Guerrero','Moreno','Navarro',
         'Castillo','Suárez','Ortega','Figueroa'])[((gs / 20) % 20) + 1],

  -- Género: 2709 M + 2123 F = 4832
  CASE WHEN gs <= 2709 THEN 'M' ELSE 'F' END,

  -- Nacionalidad: 63%VE 7%CO 7%HT 6%EC 5%CU 4%PE 4%GT 4%HN
  CASE
    WHEN (gs % 100) < 63 THEN 'VE'
    WHEN (gs % 100) < 70 THEN 'CO'
    WHEN (gs % 100) < 77 THEN 'HT'
    WHEN (gs % 100) < 83 THEN 'EC'
    WHEN (gs % 100) < 88 THEN 'CU'
    WHEN (gs % 100) < 92 THEN 'PE'
    WHEN (gs % 100) < 96 THEN 'GT'
    ELSE 'HN'
  END,

  -- Nexo: 34%NX01 28%NX03 18%NX02 12%NX06 5%NX05 3%NX04
  CASE
    WHEN (gs % 100) < 34 THEN 'NX01'
    WHEN (gs % 100) < 62 THEN 'NX03'
    WHEN (gs % 100) < 80 THEN 'NX02'
    WHEN (gs % 100) < 92 THEN 'NX06'
    WHEN (gs % 100) < 97 THEN 'NX05'
    ELSE 'NX04'
  END,

  -- Ingresos: 38%GI03 27%GI05 19%GI02 11%GI04 3%GI01 2%GI06
  CASE
    WHEN (gs % 100) < 38 THEN 'GI03'
    WHEN (gs % 100) < 65 THEN 'GI05'
    WHEN (gs % 100) < 84 THEN 'GI02'
    WHEN (gs % 100) < 95 THEN 'GI04'
    WHEN (gs % 100) < 98 THEN 'GI01'
    ELSE 'GI06'
  END,

  -- Razón emigración
  CASE
    WHEN (gs % 100) < 68 THEN 'RE01'
    WHEN (gs % 100) < 87 THEN 'RE04'
    WHEN (gs % 100) < 93 THEN 'RE03'
    WHEN (gs % 100) < 97 THEN 'RE02'
    ELSE 'RE06'
  END,

  -- País origen
  CASE
    WHEN (gs % 100) < 63 THEN 'VE'
    WHEN (gs % 100) < 70 THEN 'CO'
    WHEN (gs % 100) < 77 THEN 'HT'
    WHEN (gs % 100) < 83 THEN 'EC'
    WHEN (gs % 100) < 88 THEN 'CU'
    WHEN (gs % 100) < 92 THEN 'PE'
    WHEN (gs % 100) < 96 THEN 'GT'
    ELSE 'HN'
  END,

  -- País destino: 41%US 22%MX 15%CO 9%CR 8%PA 5%GT
  CASE
    WHEN (gs % 100) < 41 THEN 'US'
    WHEN (gs % 100) < 63 THEN 'MX'
    WHEN (gs % 100) < 78 THEN 'CO'
    WHEN (gs % 100) < 87 THEN 'CR'
    WHEN (gs % 100) < 95 THEN 'PA'
    ELSE 'GT'
  END,

  -- Organización (distribuida entre las 11)
  'ORG' || LPAD(((gs % 11) + 1)::text, 2, '0'),

  -- Email: NULL para gs<=387 → esos son los "pendientes"
  -- (387 sintéticos + 4 existentes = 391 total pendientes)
  CASE WHEN gs > 387 THEN 'syn' || gs || '@demo.vm' ELSE NULL END,

  -- Teléfono: NULL para gs<=387
  CASE WHEN gs > 387 THEN '+58 4' || LPAD(gs::text, 8, '0') ELSE NULL END,

  -- Fecha nacimiento según distribución de rangos de edad
  CURRENT_DATE - (
    CASE
      WHEN (gs % 100) < 6  THEN (730   + gs % 365)   -- 0-2 años
      WHEN (gs % 100) < 15 THEN (1095  + gs % 730)   -- 3-5 años
      WHEN (gs % 100) < 28 THEN (2190  + gs % 1825)  -- 6-11 años
      WHEN (gs % 100) < 39 THEN (4380  + gs % 1825)  -- 12-17 años
      WHEN (gs % 100) < 58 THEN (6570  + gs % 2190)  -- 18-24 años
      WHEN (gs % 100) < 83 THEN (9125  + gs % 3285)  -- 25-34 años
      WHEN (gs % 100) < 96 THEN (12775 + gs % 3285)  -- 35-44 años
      WHEN (gs % 100) < 99 THEN (16425 + gs % 3285)  -- 45-54 años
      ELSE                      (20075 + gs % 3650)  -- 55+ años
    END
  ),

  -- Fecha registro distribuida en 2024-2025
  DATE '2024-01-01' + (gs % 730),

  -- Estado: 40% en_transito 33% atendido 13% derivado 13% ubicado
  CASE
    WHEN (gs % 100) < 40 THEN 'en_transito'
    WHEN (gs % 100) < 73 THEN 'atendido'
    WHEN (gs % 100) < 86 THEN 'derivado'
    ELSE 'ubicado'
  END,

  -- Vulnerabilidad: 40% alta 37% media 23% baja
  CASE
    WHEN (gs % 100) < 40 THEN 'alta'
    WHEN (gs % 100) < 77 THEN 'media'
    ELSE 'baja'
  END,

  TRUE,
  'Registro sintético de demostración'

FROM generate_series(1, 4832) AS gs;


-- ─── 2. RUTAS MIGRATORIAS ────────────────────────────────────
-- Primer punto de ruta para TODOS (4832 registros)
INSERT INTO public.migrante_ruta
  (migrante_id, fecha, pais_id, org_id, servicios, observaciones)
SELECT
  'SYN' || LPAD(gs::text, 4, '0'),
  DATE '2024-01-01' + (gs % 700),
  CASE
    WHEN (gs % 100) < 63 THEN 'VE'
    WHEN (gs % 100) < 70 THEN 'CO'
    WHEN (gs % 100) < 77 THEN 'HT'
    WHEN (gs % 100) < 83 THEN 'EC'
    ELSE 'PA'
  END,
  'ORG' || LPAD(((gs % 11) + 1)::text, 2, '0'),
  ARRAY['TS01'],
  'Primer punto de atención'
FROM generate_series(1, 4832) AS gs;

-- Segundo punto para el 60% (gs%10<6) → trazabilidad ≈ 60%
-- 2900 nuevos + 20 existentes = 2920 / 4862 = 60.06% ✅
INSERT INTO public.migrante_ruta
  (migrante_id, fecha, pais_id, org_id, servicios, observaciones)
SELECT
  'SYN' || LPAD(gs::text, 4, '0'),
  DATE '2024-04-01' + (gs % 600),
  CASE
    WHEN (gs % 100) < 41 THEN 'US'
    WHEN (gs % 100) < 63 THEN 'MX'
    WHEN (gs % 100) < 78 THEN 'CO'
    WHEN (gs % 100) < 87 THEN 'CR'
    ELSE 'PA'
  END,
  'ORG' || LPAD((((gs + 4) % 11) + 1)::text, 2, '0'),
  ARRAY['TS01','TS02'],
  'Segundo punto registrado en trayectoria'
FROM generate_series(1, 4832) AS gs
WHERE (gs % 10) < 6;


-- ─── 3. GRUPO DE VIAJE (familias) ────────────────────────────
-- 1217 registros = 25% de 4862 → gs<=1217 ✅
INSERT INTO public.migrante_grupo_viaje
  (migrante_id, acompanante_nombre, nexo_id, edad)
SELECT
  'SYN' || LPAD(gs::text, 4, '0'),
  CASE WHEN gs % 2 = 0 THEN 'Hijo/a ' ELSE 'Familiar ' END || gs,
  'NX01',
  1 + (gs % 12)
FROM generate_series(1, 1217) AS gs;


-- ─── VERIFICACIÓN ─────────────────────────────────────────────
SELECT
  COUNT(*)                                                      AS total,
  COUNT(CASE WHEN adulto_genero_id='M' THEN 1 END)             AS ninos_M,
  COUNT(CASE WHEN adulto_genero_id='F' THEN 1 END)             AS ninas_F,
  COUNT(CASE WHEN (adulto_email IS NULL OR adulto_email='')
              AND (adulto_telefono IS NULL OR adulto_telefono='')
             THEN 1 END)                                        AS pendientes
FROM public.migrantes;

SELECT COUNT(DISTINCT migrante_id) AS familias
FROM public.migrante_grupo_viaje;

SELECT
  multi_count,
  total_mig,
  ROUND(100.0 * multi_count / total_mig, 1) AS pct_trazabilidad
FROM (
  SELECT
    (SELECT COUNT(DISTINCT migrante_id) FROM (
       SELECT migrante_id FROM public.migrante_ruta
       GROUP BY migrante_id HAVING COUNT(*) > 1
    ) t) AS multi_count,
    (SELECT COUNT(*) FROM public.migrantes) AS total_mig
) x;

-- Esperado:
-- total=4862 | ninos_M=2722 | ninas_F=2140 | pendientes=391
-- familias=1217
-- pct_trazabilidad≈60%
