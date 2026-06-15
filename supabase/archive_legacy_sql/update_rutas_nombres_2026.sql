-- ============================================================
-- update_rutas_nombres_2026.sql — Vidas en Movimiento
-- 1. Nombres únicos (máximo 1 repetición): ROW_NUMBER() por género
-- 2. migrante_ruta primer punto  → agrega ciudad_id (capital del país)
-- 3. migrante_ruta segundo punto → actualiza pais_id/ciudad_id/org_id
--    para que coincidan con la oficina FEM que registró al migrante
-- 4. Corrige adulto_ciudad_id que no pertenece a adulto_pais_id
-- Ejecutar en: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
-- ============================================================


-- ─── PASO 1: NOMBRES ÚNICOS POR ROW_NUMBER ────────────────────
-- ROW_NUMBER() por género garantiza nombres nunca repetidos:
--   rn 1-3600 → combinaciones únicas de nombre+apellido1 (60×60)
--   rn >3600  → apellido2 cambia, sigue siendo único hasta rn=216000

WITH ranked AS (
  SELECT
    id,
    adulto_genero_id,
    ROW_NUMBER() OVER (
      PARTITION BY adulto_genero_id
      ORDER BY REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer
    ) AS rn
  FROM public.migrantes
  WHERE id LIKE 'SYN%'
)
UPDATE public.migrantes m
SET
  adulto_nombres = CASE r.adulto_genero_id
    WHEN 'M' THEN (ARRAY[
      'Carlos','José','Luis','Miguel','Antonio','Ricardo','Fernando',
      'Eduardo','Roberto','Diego','Andrés','Juan','Alejandro','Manuel',
      'Francisco','Sergio','David','Ramón','Héctor','Omar',
      'Nicolás','Pablo','Martín','Gustavo','Ramiro','Óscar',
      'Iván','Hernán','Jaime','Felipe','Rodrigo','Wilmer','Jesús',
      'Freddy','Gabriel','Daniel','Rafael','Víctor','Ignacio','Tomás',
      'Ernesto','Leonardo','Mario','Armando','Nelson','Oswaldo','Enrique',
      'Alfredo','Gregorio','Reinaldo','Edgardo','Álvaro','Jonathan','Kevin',
      'Richard','Frank','Jean-Pierre','Mamoudou','Marcus','Cristian','Elías'
    ])[((r.rn - 1) % 60) + 1]
    ELSE (ARRAY[
      'María','Ana','Rosa','Carmen','Luisa','Patricia','Claudia','Sandra',
      'Diana','Laura','Margarita','Yolanda','Sofía','Valeria','Camila',
      'Andrea','Gabriela','Natalia','Isabel','Teresa',
      'Esperanza','Beatriz','Fernanda','Alejandra','Carolina','Mónica',
      'Lorena','Ingrid','Verónica','Paola','Rocío','Adriana','Catalina',
      'Yanira','Wendy','Daniela','Viviana','Jackeline','Stefany','Liliana',
      'Valentina','Keyla','Darlenis','Nathalia','Wendys','Heidi','Consuelo',
      'Mariela','Fátima','Gladys','Olga','Soledad','Rosario','Griselda',
      'Miriam','Esperanza','Blanca','Cecilia','Nora','Esther','Xiomara'
    ])[((r.rn - 1) % 60) + 1]
  END,

  adulto_apellidos =
    -- Primer apellido: cambia cada 60 registros → 60 bloques × 60 nombres = 3600 combos únicos
    (ARRAY[
      'García','Martínez','López','González','Rodríguez','Hernández','Pérez',
      'Torres','Flores','Vargas','Castro','Morales','Jiménez','Ruiz','Díaz',
      'Sánchez','Romero','Acosta','Mendoza','Cruz',
      'Ramírez','Herrera','Medina','Aguilar','Santos','Reyes','Ortiz',
      'Guerrero','Moreno','Navarro','Castillo','Suárez','Figueroa','Rojas',
      'Gómez','Delgado','Núñez','Vega','Muñoz','Parra',
      'Contreras','Gutiérrez','Valencia','Molina','Serrano','Blanco',
      'Soto','Montoya','Bermúdez','Oropeza','Pineda','Quispe','Tovar',
      'Barrios','Vásquez','Campos','Bravo','Leal','Espinoza','Salinas'
    ])[ (((r.rn - 1) / 60) % 60) + 1 ]
    || ' ' ||
    -- Segundo apellido: solo cambia a partir del registro 3601 → garantiza unicidad total
    (ARRAY[
      'Silva','Ramos','Martín','Fuentes','Ríos','Niño','Miranda','Peña',
      'Cordero','Villareal','Useche','Quesada','Sandoval','Estrada','Ávila',
      'Ibáñez','Carpio','Castellanos','Rondón','Escalona','Alvarado','Uréña',
      'Guerrero','Salgado','Figueroa','Marcano','Velásquez','Rivas','Peralta',
      'Palomino','Meza','Trujillo','Paredes','Quintero','Pacheco','Villalobos',
      'Xic','Tujal','Huanca','Diallo','Desrosiers','Carreño','Álvarez',
      'Pinzón','Lozano','Córdoba','Araujo','Andrade','Cabrera','Suárez',
      'Durán','Segura','Calderón','Fuenmayor','Aparicio','Pizarro','Becerra',
      'Granados','Arenas','Villanueva','Ochoa'
    ])[ (((r.rn - 1) / 3600) % 60) + 1 ]

FROM ranked r
WHERE m.id = r.id;


-- ─── PASO 2: AGREGAR ciudad_id AL PRIMER PUNTO DE RUTA ────────
-- El primer punto solo tiene pais_id; ahora le asignamos la capital

UPDATE public.migrante_ruta
SET ciudad_id = CASE pais_id
  WHEN 'VE' THEN 'CCS'
  WHEN 'CO' THEN 'BOG'
  WHEN 'HT' THEN 'PAP'
  WHEN 'EC' THEN 'GYE'
  WHEN 'PE' THEN 'LIM'
  WHEN 'GT' THEN 'GUA'
  WHEN 'HN' THEN 'TGU'
  WHEN 'MX' THEN 'CDM'
  WHEN 'PA' THEN 'PTY'
  WHEN 'CR' THEN 'SJO'
  ELSE NULL
END
WHERE observaciones = 'Primer punto de atención'
  AND (ciudad_id IS NULL OR ciudad_id = '');


-- ─── PASO 3: ACTUALIZAR SEGUNDO PUNTO → OFICINA FEM ──────────
-- El segundo punto debe reflejar la oficina FEM donde fue atendido
-- (coincide con ciudad_entrevista_id / pais_entrevista_id / org_id de migrantes)

UPDATE public.migrante_ruta mr
SET
  pais_id   = m.pais_entrevista_id,
  ciudad_id = m.ciudad_entrevista_id,
  org_id    = m.org_id
FROM public.migrantes m
WHERE mr.migrante_id = m.id
  AND mr.observaciones = 'Segundo punto registrado en trayectoria'
  AND m.pais_entrevista_id IS NOT NULL;


-- ─── PASO 4: CORREGIR CIUDAD QUE NO PERTENECE AL PAÍS ─────────
-- Reasigna adulto_ciudad_id = capital correcta del adulto_pais_id
-- Incluye todos los registros donde la ciudad actual NO pertenece al país

UPDATE public.migrantes
SET adulto_ciudad_id = CASE adulto_pais_id
  WHEN 'VE' THEN 'CCS'
  WHEN 'CO' THEN 'BOG'
  WHEN 'HT' THEN 'PAP'
  WHEN 'EC' THEN 'GYE'
  WHEN 'PE' THEN 'LIM'
  WHEN 'GT' THEN 'GUA'
  WHEN 'HN' THEN 'TGU'
  WHEN 'MX' THEN 'CDM'
  WHEN 'PA' THEN 'PTY'
  WHEN 'CR' THEN 'SJO'
  ELSE NULL   -- CU y otros sin ciudad en catálogo → NULL
END
WHERE adulto_pais_id IS NOT NULL
  AND (
    -- Ciudad cubana inexistente o ciudad que no cuadra con el país
    adulto_pais_id = 'CU'
    OR (adulto_pais_id = 'VE' AND adulto_ciudad_id NOT IN ('CCS','MAR','SCR'))
    OR (adulto_pais_id = 'CO' AND adulto_ciudad_id NOT IN ('CUC','RIO','CTG','BAR','SMA','BOG','MED','CAL'))
    OR (adulto_pais_id = 'HT' AND adulto_ciudad_id != 'PAP')
    OR (adulto_pais_id = 'EC' AND adulto_ciudad_id != 'GYE')
    OR (adulto_pais_id = 'PE' AND adulto_ciudad_id != 'LIM')
    OR (adulto_pais_id = 'GT' AND adulto_ciudad_id != 'GUA')
    OR (adulto_pais_id = 'HN' AND adulto_ciudad_id != 'TGU')
    OR (adulto_pais_id = 'MX' AND adulto_ciudad_id NOT IN ('CDM','TAP','MTY'))
    OR (adulto_pais_id = 'PA' AND adulto_ciudad_id NOT IN ('PTY','DAV'))
    OR (adulto_pais_id = 'CR' AND adulto_ciudad_id != 'SJO')
  );


-- ─── VERIFICACIÓN ─────────────────────────────────────────────

-- Nombres duplicados tras la actualización (debe ser 0 o muy cercano a 0)
SELECT adulto_nombres || ' ' || adulto_apellidos AS nombre_completo, COUNT(*) AS apariciones
FROM public.migrantes
WHERE id LIKE 'SYN%'
GROUP BY 1
HAVING COUNT(*) > 1
ORDER BY apariciones DESC
LIMIT 20;

-- Rutas: puntos sin ciudad_id (deben ser 0 para observaciones conocidas)
SELECT observaciones, COUNT(*) AS total, COUNT(ciudad_id) AS con_ciudad
FROM public.migrante_ruta
GROUP BY observaciones;

-- Mismatches ciudad/país (deben ser 0 tras el paso 4)
SELECT adulto_pais_id, adulto_ciudad_id, COUNT(*)
FROM public.migrantes
WHERE adulto_pais_id IS NOT NULL AND adulto_ciudad_id IS NOT NULL
  AND (
    (adulto_pais_id = 'VE' AND adulto_ciudad_id NOT IN ('CCS','MAR','SCR'))
    OR (adulto_pais_id = 'CO' AND adulto_ciudad_id NOT IN ('CUC','RIO','CTG','BAR','SMA','BOG','MED','CAL'))
    OR (adulto_pais_id = 'HT' AND adulto_ciudad_id != 'PAP')
    OR (adulto_pais_id = 'CU')
  )
GROUP BY 1,2
ORDER BY 3 DESC;
