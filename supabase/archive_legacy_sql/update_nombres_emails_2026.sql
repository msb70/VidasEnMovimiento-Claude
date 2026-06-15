-- ============================================================
-- update_nombres_emails_2026.sql — Vidas en Movimiento
-- 1. Nombres y apellidos variados (sin repetición en paginado)
-- 2. Llenar email de todos los adultos acompañantes con NULL
-- Ejecutar en: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
-- ============================================================

-- ─── PASO 1: NOMBRES VARIADOS ────────────────────────────────
-- Usa (id_num * primo) % 60 para distribuir sin secuencias visibles
-- en páginas contiguas. Con primos distintos para nombre/apellido1/apellido2
-- cada página de 20 registros muestra combinaciones completamente diferentes.

UPDATE public.migrantes
SET
  adulto_nombres = CASE WHEN adulto_genero_id = 'M'

    THEN (ARRAY[
      'Carlos','José','Luis','Miguel','Antonio','Ricardo','Fernando',
      'Eduardo','Roberto','Diego','Andrés','Juan','Alejandro','Manuel',
      'Francisco','Sergio','David','Ramón','Héctor','Omar',
      'Nicolás','Pablo','Martín','Gustavo','Ramiro','Óscar',
      'Iván','Hernán','Jaime','Felipe','Rodrigo','Wilmer','Jesús',
      'Freddy','Gabriel','Daniel','Rafael','Víctor','Ignacio','Tomás',
      'Ernesto','Leonardo','Mario','Armando','Nelson','Oswaldo','Enrique',
      'Alfredo','Gregorio','Reinaldo','Edgardo','Álvaro','Jonathan','Kevin',
      'Richard','Frank','Jean-Pierre','Mamoudou','Marcus','Cristian'
    ])[(REGEXP_REPLACE(id, '[^0-9]', '', 'g')::bigint * 7 % 60) + 1]

    ELSE (ARRAY[
      'María','Ana','Rosa','Carmen','Luisa','Patricia','Claudia','Sandra',
      'Diana','Laura','Margarita','Yolanda','Sofía','Valeria','Camila',
      'Andrea','Gabriela','Natalia','Isabel','Teresa',
      'Esperanza','Beatriz','Fernanda','Alejandra','Carolina','Mónica',
      'Lorena','Ingrid','Verónica','Paola','Rocío','Adriana','Catalina',
      'Yanira','Wendy','Daniela','Viviana','Jackeline','Stefany','Liliana',
      'Valentina','Keyla','Darlenis','Nathalia','Wendys','Heidi','Patricia',
      'Mariela','Fátima','Claudia','Yolanda','Soledad','Rosario','Griselda',
      'Miriam','Esperanza','Blanca','Cecilia','Nora','Esther'
    ])[(REGEXP_REPLACE(id, '[^0-9]', '', 'g')::bigint * 7 % 60) + 1]
  END,

  adulto_apellidos =
    -- Primer apellido — primo 13 para desplazamiento independiente al nombre
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
    ])[(REGEXP_REPLACE(id, '[^0-9]', '', 'g')::bigint * 13 % 60) + 1]
    || ' ' ||
    -- Segundo apellido — primo 17 para variación adicional
    (ARRAY[
      'Silva','Ramos','Martín','Fuentes','Ríos','Niño','Miranda','Peña',
      'Cordero','Villareal','Useche','Quesada','Sandoval','Estrada','Ávila',
      'Ibáñez','Carpio','Castellanos','Rondón','Escalona','Alvarado','Uréña',
      'Guerrero','Salgado','Figueroa','Marcano','Velásquez','Rivas','Peralta',
      'Palomino','Meza','Trujillo','Paredes','Quintero','Pacheco','Villalobos',
      'Xic','Tujal','Huanca','Diallo','Desrosiers','Carreño','Álvarez',
      'Pinzón','Lozano','Córdoba','Araujo','Andrade','Cabrera','Suárez',
      'Durán','Segura','Calderón','Fuenmayor','Aparicio','Pizarro','Becerra',
      'Granados','Arenas','Villanueva'
    ])[(REGEXP_REPLACE(id, '[^0-9]', '', 'g')::bigint * 17 % 60) + 1]

WHERE id LIKE 'SYN%';


-- ─── PASO 2: LLENAR EMAILS DE ADULTOS ACOMPAÑANTES ────────────
-- Genera email único: nombre.apellido1{id_number}@vidasenmovimiento.org
-- Se eliminan espacios, tildes y se lleva a minúsculas

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
  || '@vidasenmovimiento.org'
)
WHERE (adulto_email IS NULL OR adulto_email = '')
  AND adulto_nombres IS NOT NULL;


-- ─── VERIFICACIÓN ─────────────────────────────────────────────

-- Confirmar que no quedan emails vacíos en registros con nombre
SELECT
  COUNT(*)                                                        AS total,
  COUNT(CASE WHEN adulto_email IS NULL OR adulto_email = '' THEN 1 END) AS sin_email,
  COUNT(CASE WHEN adulto_email IS NOT NULL AND adulto_email != '' THEN 1 END) AS con_email
FROM public.migrantes
WHERE adulto_nombres IS NOT NULL;

-- Muestra de nombres para verificar variedad (primeras 30 páginas ≈ 600 registros)
SELECT id, adulto_nombres, adulto_apellidos, adulto_email
FROM public.migrantes
WHERE id LIKE 'SYN%'
ORDER BY id
LIMIT 40;
