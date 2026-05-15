-- ============================================================
-- update_nombres_rutas_2026.sql — Vidas en Movimiento
-- 1. Nombres únicos con arrays de tamaños 60/61/83 (LCM=303,780)
--    → Cada índice avanza distinto por registro: cero duplicados
--    → Máxima variedad visual en cualquier página consecutiva
-- 2. Rutas: DELETE segundo punto, UPDATE primer punto = ciudad_entrevista
-- Ejecutar en: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
-- ============================================================


-- ─── PASO 1: NOMBRES ÚNICOS (arrays 60 / 61 / 83) ────────────
-- Lógica:
--   nombre    = names_60  [ (id_num-1) % 60  ]   → 60 posibles
--   apellido1 = last1_61  [ (id_num-1) % 61  ]   → 61 posibles
--   apellido2 = last2_83  [ (id_num-1) % 83  ]   → 83 posibles
--   LCM(60,61,83) = 303,780 → 0 repeticiones para los ~4,832 registros SYN

WITH id_nums AS (
  SELECT id, adulto_genero_id,
         (REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer - 1) AS n
  FROM public.migrantes
  WHERE id LIKE 'SYN%'
)
UPDATE public.migrantes m
SET
  adulto_nombres = CASE u.adulto_genero_id
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
    ])[ (u.n % 60) + 1 ]
    ELSE (ARRAY[
      'María','Ana','Rosa','Carmen','Luisa','Patricia','Claudia','Sandra',
      'Diana','Laura','Margarita','Yolanda','Sofía','Valeria','Camila',
      'Andrea','Gabriela','Natalia','Isabel','Teresa',
      'Esperanza','Beatriz','Fernanda','Alejandra','Carolina','Mónica',
      'Lorena','Ingrid','Verónica','Paola','Rocío','Adriana','Catalina',
      'Yanira','Wendy','Daniela','Viviana','Jackeline','Stefany','Liliana',
      'Valentina','Keyla','Darlenis','Nathalia','Wendys','Heidi','Consuelo',
      'Mariela','Fátima','Gladys','Olga','Soledad','Rosario','Griselda',
      'Miriam','Blanca','Cecilia','Nora','Esther','Xiomara'
    ])[ (u.n % 60) + 1 ]
  END,

  adulto_apellidos =
    -- Primer apellido: 61 valores → índice avanza 1 cada registro
    (ARRAY[
      'García','Martínez','López','González','Rodríguez','Hernández','Pérez',
      'Torres','Flores','Vargas','Castro','Morales','Jiménez','Ruiz','Díaz',
      'Sánchez','Romero','Acosta','Mendoza','Cruz',
      'Ramírez','Herrera','Medina','Aguilar','Santos','Reyes','Ortiz',
      'Guerrero','Moreno','Navarro','Castillo','Suárez','Figueroa','Rojas',
      'Gómez','Delgado','Núñez','Vega','Muñoz','Parra',
      'Contreras','Gutiérrez','Valencia','Molina','Serrano','Blanco',
      'Soto','Montoya','Bermúdez','Oropeza','Pineda','Quispe','Tovar',
      'Barrios','Vásquez','Campos','Bravo','Leal','Espinoza','Salinas','Peña'
    ])[ (u.n % 61) + 1 ]
    || ' ' ||
    -- Segundo apellido: 83 valores → índice avanza a ritmo distinto (coprimo con 60 y 61)
    (ARRAY[
      'Silva','Ramos','Martín','Fuentes','Ríos','Niño','Miranda','Peña',
      'Cordero','Villareal','Useche','Quesada','Sandoval','Estrada','Ávila',
      'Ibáñez','Carpio','Castellanos','Rondón','Escalona','Alvarado','Uréña',
      'Guerrero','Salgado','Figueroa','Marcano','Velásquez','Rivas','Peralta',
      'Palomino','Meza','Trujillo','Paredes','Quintero','Pacheco','Villalobos',
      'Xic','Tujal','Huanca','Diallo','Desrosiers','Carreño','Álvarez',
      'Pinzón','Lozano','Córdoba','Araujo','Andrade','Cabrera','Suárez',
      'Durán','Segura','Calderón','Fuenmayor','Aparicio','Pizarro','Becerra',
      'Granados','Arenas','Villanueva','Ochoa','Pinto','Delgado','Romero',
      'Navas','Rosales','Vela','Tapia','Benítez','Salazar','Cáceres',
      'Muñiz','Leiva','Torrealba','Sosa','Hidalgo','Ureña','Chávez',
      'Fonseca','Varela','Medrano','Orellana'
    ])[ (u.n % 83) + 1 ]

FROM id_nums u
WHERE m.id = u.id;


-- ─── PASO 2: ELIMINAR SEGUNDOS PUNTOS DE RUTA ────────────────
-- Cada migrante debe tener EXACTAMENTE 1 entrada en migrante_ruta
-- Borramos el "Segundo punto" que generaba rutas duplicadas

DELETE FROM public.migrante_ruta
WHERE observaciones = 'Segundo punto registrado en trayectoria';


-- ─── PASO 3: ACTUALIZAR PRIMER PUNTO = CIUDAD DE ENTREVISTA ──
-- El único punto de ruta debe reflejar la ciudad donde FEM atendió al migrante
-- (coincide con ciudad_entrevista_id / pais_entrevista_id de la tabla migrantes)

UPDATE public.migrante_ruta mr
SET
  ciudad_id = m.ciudad_entrevista_id,
  pais_id   = m.pais_entrevista_id
FROM public.migrantes m
WHERE mr.migrante_id = m.id
  AND mr.observaciones = 'Primer punto de atención'
  AND m.ciudad_entrevista_id IS NOT NULL;


-- ─── VERIFICACIÓN ─────────────────────────────────────────────

-- 1. Nombres duplicados (debe ser 0 para ~4,832 registros SYN)
SELECT adulto_nombres || ' ' || adulto_apellidos AS nombre_completo, COUNT(*) AS apariciones
FROM public.migrantes
WHERE id LIKE 'SYN%'
GROUP BY 1
HAVING COUNT(*) > 1
ORDER BY apariciones DESC
LIMIT 20;

-- 2. Distribución de primeros apellidos — verificar variedad
SELECT split_part(adulto_apellidos, ' ', 1) AS apellido1, COUNT(*) AS total
FROM public.migrantes
WHERE id LIKE 'SYN%'
GROUP BY 1
ORDER BY total DESC
LIMIT 20;

-- 3. Recuento de entradas por migrante (todos deben ser 1)
SELECT conteo, COUNT(*) AS migrantes
FROM (
  SELECT migrante_id, COUNT(*) AS conteo
  FROM public.migrante_ruta
  GROUP BY migrante_id
) t
GROUP BY conteo
ORDER BY conteo;

-- 4. Rutas sin ciudad_id (deben ser 0 o mínimas si el migrante no tiene ciudad_entrevista)
SELECT COUNT(*) AS puntos_sin_ciudad
FROM public.migrante_ruta
WHERE ciudad_id IS NULL OR ciudad_id = '';

-- 5. Muestra de 10 registros para confirmar
SELECT id, adulto_nombres, adulto_apellidos
FROM public.migrantes
WHERE id LIKE 'SYN%'
ORDER BY REGEXP_REPLACE(id, '[^0-9]', '', 'g')::integer
LIMIT 10;
