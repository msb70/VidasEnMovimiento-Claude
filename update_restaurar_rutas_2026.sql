-- ============================================================
-- update_restaurar_rutas_2026.sql — Vidas en Movimiento
-- Restaura 2.917 migrantes con 2 puntos de ruta FEM.
--
-- Tipos de ruta de 2 puntos (solo Colombia y Venezuela):
--   Tipo A — ORG11 (CCS/VE):  CCS → CUC  (VE→CO)   ~525 migrantes
--   Tipo B — ORG12 (CUC/CO):  CCS → CUC  (VE→CO)   ~583 migrantes
--   Tipo C — ORG13-18 (CO):   CUC → ciudad CO        ~1.809 migrantes
--
-- Criterio determinístico: (id_num-1) % 10 < 6  → 60% de cada org
-- Migrantes con 1 punto (40%) conservan su ruta actual (ciudad entrevista).
--
-- PREREQUISITO: haber ejecutado update_nombres_rutas_2026.sql
--   (todos los migrantes tienen 1 ruta = ciudad_entrevista_id)
--
-- Ejecutar en: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
-- ============================================================


-- ─── PASO 1: ELIMINAR RUTAS ACTUALES de los 2.917 multi-punto ──
-- Los migrantes con 1 punto actualmente son correctos para los de 1 punto.
-- Los multi-punto necesitan 2 filas; borramos su única fila para reinsertarla.

DELETE FROM public.migrante_ruta
WHERE migrante_id IN (
  SELECT id FROM public.migrantes
  WHERE id LIKE 'SYN%'
    AND (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer - 1) % 10 < 6
);


-- ─── PASO 2A: TIPO A — ORG11 (CCS, Venezuela) → 2 puntos ─────
-- Estos migrantes están en Caracas y su ruta proyectada va a Cúcuta.
-- Primer punto: CCS / Venezuela
-- Segundo punto: CUC / Colombia

INSERT INTO public.migrante_ruta
  (migrante_id, pais_id, ciudad_id, org_id, fecha, observaciones)
SELECT m.id, 'VE', 'CCS', 'ORG11', m.fecha_entrevista,
       'Primer punto de atención'
FROM public.migrantes m
WHERE m.id LIKE 'SYN%'
  AND m.org_id = 'ORG11'
  AND (REGEXP_REPLACE(m.id, '[^0-9]', '', 'g')::integer - 1) % 10 < 6;

INSERT INTO public.migrante_ruta
  (migrante_id, pais_id, ciudad_id, org_id, fecha, observaciones)
SELECT m.id, 'CO', 'CUC', 'ORG12',
       m.fecha_entrevista + INTERVAL '15 days',
       'Segundo punto registrado en trayectoria'
FROM public.migrantes m
WHERE m.id LIKE 'SYN%'
  AND m.org_id = 'ORG11'
  AND (REGEXP_REPLACE(m.id, '[^0-9]', '', 'g')::integer - 1) % 10 < 6;


-- ─── PASO 2B: TIPO B — ORG12 (CUC, Colombia) → 2 puntos ──────
-- Migrantes atendidos en Cúcuta que cruzaron desde Venezuela.
-- Primer punto: CCS / Venezuela (origen)
-- Segundo punto: CUC / Colombia (ciudad entrevista actual)

INSERT INTO public.migrante_ruta
  (migrante_id, pais_id, ciudad_id, org_id, fecha, observaciones)
SELECT m.id, 'VE', 'CCS', 'ORG11',
       m.fecha_entrevista - INTERVAL '20 days',
       'Primer punto de atención'
FROM public.migrantes m
WHERE m.id LIKE 'SYN%'
  AND m.org_id = 'ORG12'
  AND (REGEXP_REPLACE(m.id, '[^0-9]', '', 'g')::integer - 1) % 10 < 6;

INSERT INTO public.migrante_ruta
  (migrante_id, pais_id, ciudad_id, org_id, fecha, observaciones)
SELECT m.id, m.pais_entrevista_id, m.ciudad_entrevista_id, m.org_id,
       m.fecha_entrevista,
       'Segundo punto registrado en trayectoria'
FROM public.migrantes m
WHERE m.id LIKE 'SYN%'
  AND m.org_id = 'ORG12'
  AND (REGEXP_REPLACE(m.id, '[^0-9]', '', 'g')::integer - 1) % 10 < 6;


-- ─── PASO 2C: TIPO C — ORG13-18 (otras ciudades CO) → 2 puntos
-- Migrantes en ciudades interiores de Colombia (Bogotá, Medellín, etc.)
-- que ingresaron por Cúcuta (punto de entrada desde Venezuela).
-- Primer punto: CUC / Colombia (entrada al país)
-- Segundo punto: ciudad FEM actual (Bogotá, Medellín, Cali, etc.)

INSERT INTO public.migrante_ruta
  (migrante_id, pais_id, ciudad_id, org_id, fecha, observaciones)
SELECT m.id, 'CO', 'CUC', 'ORG12',
       m.fecha_entrevista - INTERVAL '30 days',
       'Primer punto de atención'
FROM public.migrantes m
WHERE m.id LIKE 'SYN%'
  AND m.org_id IN ('ORG13','ORG14','ORG15','ORG16','ORG17','ORG18')
  AND (REGEXP_REPLACE(m.id, '[^0-9]', '', 'g')::integer - 1) % 10 < 6;

INSERT INTO public.migrante_ruta
  (migrante_id, pais_id, ciudad_id, org_id, fecha, observaciones)
SELECT m.id, m.pais_entrevista_id, m.ciudad_entrevista_id, m.org_id,
       m.fecha_entrevista,
       'Segundo punto registrado en trayectoria'
FROM public.migrantes m
WHERE m.id LIKE 'SYN%'
  AND m.org_id IN ('ORG13','ORG14','ORG15','ORG16','ORG17','ORG18')
  AND (REGEXP_REPLACE(m.id, '[^0-9]', '', 'g')::integer - 1) % 10 < 6;


-- ─── VERIFICACIÓN ─────────────────────────────────────────────

-- 1. Distribución por cantidad de puntos (esperado: ~2917 con 2, ~1945 con 1)
SELECT conteo, COUNT(*) AS migrantes,
       ROUND(COUNT(*)*100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM (
  SELECT migrante_id, COUNT(*) AS conteo
  FROM public.migrante_ruta
  WHERE migrante_id LIKE 'SYN%'
  GROUP BY migrante_id
) t
GROUP BY conteo ORDER BY conteo;

-- 2. Total atenciones (debe ser ~7779)
SELECT COUNT(*) AS total_atenciones
FROM public.migrante_ruta
WHERE migrante_id LIKE 'SYN%';

-- 3. Distribución de primeros puntos (VE/CCS vs CO/CUC)
SELECT pais_id, ciudad_id, COUNT(*) AS total
FROM public.migrante_ruta
WHERE migrante_id LIKE 'SYN%'
  AND observaciones = 'Primer punto de atención'
GROUP BY pais_id, ciudad_id ORDER BY total DESC;

-- 4. Muestra rutas Tipo A (ORG11, CCS→CUC)
SELECT m.id, m.adulto_nombres, mr.pais_id, mr.ciudad_id, mr.observaciones
FROM public.migrante_ruta mr
JOIN public.migrantes m ON mr.migrante_id = m.id
WHERE m.id LIKE 'SYN%' AND m.org_id = 'ORG11'
  AND (REGEXP_REPLACE(m.id,'[^0-9]','','g')::integer - 1) % 10 < 6
ORDER BY m.id, mr.observaciones LIMIT 6;

-- 5. Muestra rutas Tipo C (ORG13+, CUC→ciudad interior)
SELECT m.id, m.adulto_nombres, mr.pais_id, mr.ciudad_id, mr.observaciones
FROM public.migrante_ruta mr
JOIN public.migrantes m ON mr.migrante_id = m.id
WHERE m.id LIKE 'SYN%' AND m.org_id IN ('ORG13','ORG14')
  AND (REGEXP_REPLACE(m.id,'[^0-9]','','g')::integer - 1) % 10 < 6
ORDER BY m.id, mr.observaciones LIMIT 6;
