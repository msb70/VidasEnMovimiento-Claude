-- ============================================================
-- update_contacto_adulto_2026.sql — Vidas en Movimiento
-- 1. Regenera emails con dominios de consumidor
--    (@gmail.com 40% · @hotmail.com 30% · @outlook.com 20% · @yahoo.com 10%)
-- 2. Llena adulto_pais_id    = procedencia_pais_id
-- 3. Llena adulto_ciudad_id  = capital del país de procedencia
-- Ejecutar en: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
-- ============================================================


-- ─── PASO 1: REGENERAR EMAILS CON DOMINIO CONSUMIDOR ─────────
-- Aplica a TODOS los registros con nombre (sobreescribe @vidasenmovimiento.org y @demo.vm)

UPDATE public.migrantes
SET adulto_email = LOWER(
  translate(
    regexp_replace(coalesce(adulto_nombres, 'adulto'), '\s+', '', 'g'),
    'áéíóúàèìòùäëïöüâêîôûñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑ',
    'aeiouaeiouaeiouaeiounAEIOUAEIOUAEIOUAEIOUN'
  )
  || '.' ||
  translate(
    regexp_replace(split_part(coalesce(adulto_apellidos, 'migrante'), ' ', 1), '\s+', '', 'g'),
    'áéíóúàèìòùäëïöüâêîôûñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑ',
    'aeiouaeiouaeiouaeiounAEIOUAEIOUAEIOUAEIOUN'
  )
  || regexp_replace(id, '[^0-9]', '', 'g')
  || CASE (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::bigint % 10)
       WHEN 0 THEN '@gmail.com'
       WHEN 1 THEN '@gmail.com'
       WHEN 2 THEN '@gmail.com'
       WHEN 3 THEN '@gmail.com'
       WHEN 4 THEN '@hotmail.com'
       WHEN 5 THEN '@hotmail.com'
       WHEN 6 THEN '@hotmail.com'
       WHEN 7 THEN '@outlook.com'
       WHEN 8 THEN '@outlook.com'
       ELSE         '@yahoo.com'
     END
)
WHERE adulto_nombres IS NOT NULL;


-- ─── PASO 2: LLENAR PAIS DEL ADULTO ACOMPAÑANTE ─────────────
-- adulto_pais_id = país de procedencia del migrante

UPDATE public.migrantes
SET adulto_pais_id = procedencia_pais_id
WHERE procedencia_pais_id IS NOT NULL
  AND (adulto_pais_id IS NULL OR adulto_pais_id = '');


-- ─── PASO 3: LLENAR CIUDAD DEL ADULTO ACOMPAÑANTE ────────────
-- Capital representativa según país de procedencia

UPDATE public.migrantes
SET adulto_ciudad_id = CASE procedencia_pais_id
  WHEN 'VE' THEN 'CCS'   -- Caracas
  WHEN 'CO' THEN 'BOG'   -- Bogotá
  WHEN 'HT' THEN 'PAP'   -- Puerto Príncipe
  WHEN 'EC' THEN 'GYE'   -- Guayaquil
  WHEN 'PE' THEN 'LIM'   -- Lima
  WHEN 'GT' THEN 'GUA'   -- Ciudad de Guatemala
  WHEN 'HN' THEN 'TGU'   -- Tegucigalpa
  WHEN 'MX' THEN 'CDM'   -- Ciudad de México
  WHEN 'PA' THEN 'PTY'   -- Ciudad de Panamá
  WHEN 'CR' THEN 'SJO'   -- San José
  WHEN 'CU' THEN 'CCS'   -- Cuba → CCS como proxy (no hay ciudad CU en catálogo)
  ELSE NULL
END
WHERE procedencia_pais_id IS NOT NULL
  AND (adulto_ciudad_id IS NULL OR adulto_ciudad_id = '');


-- ─── VERIFICACIÓN ─────────────────────────────────────────────

-- Distribución de dominios de email
SELECT
  CASE
    WHEN adulto_email LIKE '%@gmail.com'   THEN '@gmail.com'
    WHEN adulto_email LIKE '%@hotmail.com' THEN '@hotmail.com'
    WHEN adulto_email LIKE '%@outlook.com' THEN '@outlook.com'
    WHEN adulto_email LIKE '%@yahoo.com'   THEN '@yahoo.com'
    ELSE 'otro / null'
  END AS dominio,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM public.migrantes
GROUP BY 1
ORDER BY total DESC;

-- Registros sin email (deben ser 0 si tienen nombre)
SELECT COUNT(*) AS sin_email_con_nombre
FROM public.migrantes
WHERE adulto_nombres IS NOT NULL
  AND (adulto_email IS NULL OR adulto_email = '');

-- Registros con adulto_pais_id y adulto_ciudad_id vacíos
SELECT COUNT(*) AS falta_pais, COUNT(CASE WHEN adulto_ciudad_id IS NULL THEN 1 END) AS falta_ciudad
FROM public.migrantes
WHERE procedencia_pais_id IS NOT NULL
  AND (adulto_pais_id IS NULL OR adulto_ciudad_id IS NULL);

-- Muestra de 10 registros para confirmar
SELECT id, adulto_nombres, adulto_email, adulto_pais_id, adulto_ciudad_id, procedencia_pais_id
FROM public.migrantes
WHERE id LIKE 'SYN%'
ORDER BY id
LIMIT 10;
