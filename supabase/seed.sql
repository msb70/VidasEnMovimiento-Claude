-- ============================================================
-- supabase/seed.sql — Datos de demostración (Vidas en Movimiento)
-- Se aplica con: supabase db reset  (NO en producción)
-- Consolidado de seed_migrantes.sql + seed_synthetic.sql
-- ============================================================

-- ─── SEED 1: migrantes base ─────────────────────────────────
-- ============================================================
-- seed_migrantes.sql — Vidas en Movimiento
-- 30 migrantes + 71 eventos de ruta
-- Usar UPSERT para no duplicar si ya existe (ej. M001)
-- Ejecutar en: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
-- ============================================================

-- Primero borramos rutas de estos IDs para reinsertar limpios
DELETE FROM public.migrante_ruta WHERE migrante_id IN ('M001','M002','M003','M004','M005','M006','M007','M008','M009','M010','M011','M012','M013','M014','M015','M016','M017','M018','M019','M020','M021','M022','M023','M024','M025','M026','M027','M028','M029','M030');

-- ─── MIGRANTES (UPSERT) ─────────────────────────────────────
INSERT INTO public.migrantes (
  id, adulto_nombres, adulto_apellidos, adulto_email, adulto_telefono,
  adulto_genero_id, adulto_nacionalidad_id, adulto_nexo_id,
  generacion_ingresos_id, procedencia_pais_id, adulto_razon_emigracion_id,
  destino_final_pais_id, org_id,
  nino_fecha_nacimiento, fecha_registro,
  estado, vulnerabilidad, notas, consentimiento
) VALUES
  ('M001', 'Luisa', 'Vargas Mendoza', 'luisa.vargas@gmail.com', '+58 412 8823441', 'F', 'VE', 'NX03', 'GI03', 'VE', 'RE01', 'MX', 'ORG08', '1991-03-14', '2025-11-02', 'en_transito', 'alta', 'Viaja con dos hijos menores de 7 y 4 años. Requiere apoyo urgente de refugio.', TRUE),
  ('M002', 'Andrés Felipe', 'Rondón Pérez', 'andres.rondon@hotmail.com', '+58 424 3312900', 'M', 'VE', 'NX01', 'GI01', 'VE', 'RE01', 'US', 'ORG10', '1988-11-22', '2025-04-15', 'ubicado', 'baja', 'Tiene familiar en Houston. Proceso de regularización activo.', TRUE),
  ('M003', 'Mariela', 'Torres Alvarado', NULL, '+57 301 4421890', 'F', 'VE', 'NX02', 'GI03', 'VE', 'RE01', 'CO', 'ORG04', '1995-07-03', '2025-06-18', 'atendido', 'alta', 'Embarazada al momento del registro. Derivada a atención médica prioritaria.', TRUE),
  ('M004', 'Jean-Pierre', 'Desrosiers', NULL, '+509 3412 8800', 'M', 'HT', 'NX06', 'GI05', 'HT', 'RE07', 'CO', 'ORG04', '1983-02-09', '2025-09-05', 'en_transito', 'alta', 'Víctima de terremoto. No habla español. Requiere intérprete creole.', TRUE),
  ('M005', 'Valentina', 'Castellanos Niño', NULL, NULL, 'F', 'VE', 'NX01', 'GI04', 'VE', 'RE01', 'PA', 'ORG05', '2008-05-17', '2025-10-22', 'atendido', 'alta', 'Menor de edad, viaja con madre (M001). Programa educativo activo.', TRUE),
  ('M006', 'Carlos Eduardo', 'Molina Ureña', 'cmolina79@yahoo.com', '+52 55 8810 2244', 'M', 'VE', 'NX03', 'GI02', 'VE', 'RE06', 'MX', 'ORG09', '1979-08-30', '2025-07-03', 'derivado', 'media', 'Ex funcionario público. Solicitud de refugio por persecución política.', TRUE),
  ('M007', 'Fátima', 'Guerrero Salgado', 'fatima.guerrero@gmail.com', '+57 310 9924010', 'F', 'EC', 'NX05', 'GI02', 'EC', 'RE08', 'CO', 'ORG04', '1997-12-01', '2025-08-11', 'atendido', 'baja', 'Profesional de enfermería. Interesada en validación de títulos.', TRUE),
  ('M008', 'Ricardo José', 'Blanco Escalona', NULL, '+507 66 3312 00', 'M', 'VE', 'NX02', 'GI03', 'VE', 'RE03', 'PA', 'ORG06', '1973-04-25', '2025-10-09', 'en_transito', 'media', 'Cruzó el Darién con grupo familiar. Esposa registrada por separado.', TRUE),
  ('M009', 'Yolanda', 'Figueroa Ramos', 'yolanda.fig85@gmail.com', '+506 8812 7733', 'F', 'VE', 'NX03', 'GI03', 'VE', 'RE01', 'CR', 'ORG07', '1985-09-14', '2025-08-29', 'atendido', 'media', 'Tiene hijo de 3 años. Busca reunificación con hermana en Costa Rica.', TRUE),
  ('M010', 'Sofía Alejandra', 'Mendoza Carpio', NULL, NULL, 'F', 'VE', 'NX01', 'GI04', 'VE', 'RE01', 'CR', 'ORG07', '2011-01-20', '2025-08-29', 'atendido', 'media', 'Hija de Yolanda Figueroa (M009). Programa escolar activo.', TRUE),
  ('M011', 'Diego Armando', 'Suárez Velandia', NULL, '+52 962 1100 883', 'M', 'CO', 'NX02', 'GI03', 'CO', 'RE03', 'MX', 'ORG08', '1990-06-07', '2025-11-14', 'en_transito', 'media', 'Desplazado interno que cruzó hacia México. Solicita protección.', TRUE),
  ('M012', 'Ana Lucía', 'Pacheco Díaz', 'analpacheco93@gmail.com', '+1 713 449 2211', 'F', 'VE', 'NX01', 'GI01', 'VE', 'RE08', 'US', 'ORG10', '1993-10-30', '2025-03-10', 'ubicado', 'baja', 'Ingresó con visa de trabajo. Proceso de residencia permanente en curso.', TRUE),
  ('M013', 'Oswaldo', 'Herrera Contreras', NULL, '+58 416 5541123', 'M', 'VE', 'NX06', 'GI05', 'VE', 'RE01', 'VE', 'ORG11', '1980-03-18', '2025-11-20', 'en_transito', 'alta', 'Buscando asesoramiento antes de emprender ruta hacia Colombia. Registrado en Fundación Mendoza.', TRUE),
  ('M014', 'Keyla', 'Montoya Barrios', 'keylamontoya@outlook.com', '+507 6481 9020', 'F', 'VE', 'NX03', 'GI02', 'VE', 'RE04', 'PA', 'ORG05', '1999-07-22', '2025-09-30', 'derivado', 'media', 'Técnica en contabilidad. Derivada a programa de empleo en Panamá.', TRUE),
  ('M015', 'Mamoudou', 'Diallo', NULL, '+52 55 9988 1122', 'M', 'HT', 'NX05', 'GI05', 'HT', 'RE07', 'MX', 'ORG09', '1994-11-05', '2025-10-18', 'en_transito', 'alta', 'Habla inglés y francés. Sin red de apoyo en México. Solicita protección.', TRUE),
  ('M016', 'Gabriela Inés', 'Acosta Reyes', 'gacosta87@gmail.com', '+506 8933 4410', 'F', 'VE', 'NX02', 'GI02', 'VE', 'RE02', 'CR', 'ORG07', '1987-01-09', '2025-07-21', 'atendido', 'baja', 'Médica venezolana. Proceso de validación de título en curso en Costa Rica.', TRUE),
  ('M017', 'Luis Ernesto', 'Paredes Ibáñez', NULL, NULL, 'M', 'VE', 'NX06', 'GI05', 'VE', 'RE01', 'CO', 'ORG03', '2005-03-29', '2025-11-01', 'en_transito', 'alta', 'Menor no acompañado (19 años). Sin documentos completos. Requiere seguimiento urgente.', TRUE),
  ('M018', 'Patricia Elena', 'Villalobos Quesada', 'patvillalobos@gmail.com', '+52 962 881 0099', 'F', 'CO', 'NX04', 'GI03', 'CO', 'RE03', 'MX', 'ORG08', '1982-08-12', '2025-10-30', 'derivado', 'alta', 'Periodista. Solicita refugio por amenazas documentadas.', TRUE),
  ('M019', 'Reinaldo', 'Marcano Tovar', NULL, '+58 414 9912300', 'M', 'VE', 'NX06', 'GI05', 'VE', 'RE01', 'VE', 'ORG11', '1976-06-17', '2025-11-25', 'en_transito', 'alta', 'Buscando asesoramiento antes de emprender ruta hacia Colombia. En Fundación Mendoza.', TRUE),
  ('M020', 'Camila', 'Rodríguez Ávila', 'camila.rodrigz@gmail.com', '+52 55 6612 0011', 'F', 'VE', 'NX05', 'GI02', 'VE', 'RE08', 'MX', 'ORG09', '2000-09-03', '2025-09-14', 'atendido', 'baja', 'Estudiante universitaria. Trabaja como asistente administrativa.', TRUE),
  ('M021', 'Frank', 'Domínguez Castillo', 'frank.dom@protonmail.com', '+52 962 7743 9900', 'M', 'CU', 'NX02', 'GI03', 'CU', 'RE06', 'MX', 'ORG08', '1986-11-28', '2025-11-08', 'en_transito', 'media', 'Ingeniero. Ruta Cuba→Ecuador→Colombia→México. Solicita asilo.', TRUE),
  ('M022', 'Heidi Margarita', 'Useche Bravo', NULL, NULL, 'F', 'VE', 'NX03', 'GI04', 'VE', 'RE01', 'CO', 'ORG03', '1970-02-14', '2025-10-17', 'atendido', 'alta', 'Adulta mayor. Necesita medicamentos crónicos. Sola, sin red familiar.', TRUE),
  ('M023', 'Javier Alejandro', 'Salas Mendoza', NULL, '+57 300 2219944', 'M', 'EC', 'NX02', 'GI03', 'EC', 'RE04', 'CO', 'ORG04', '1992-05-11', '2025-09-25', 'atendido', 'media', 'Albañil. Busca trabajo en Bogotá. Esposa en Ecuador.', TRUE),
  ('M024', 'Nathalia', 'Bermúdez Oropeza', 'nathalia.bermudez@gmail.com', '+1 713 339 4411', 'F', 'VE', 'NX01', 'GI01', 'VE', 'RE02', 'US', 'ORG10', '2003-12-07', '2025-02-20', 'ubicado', 'baja', 'Reunificada con madre en Miami. Trabajando y estudiando inglés.', TRUE),
  ('M025', 'Wendys Paola', 'Mejía Pineda', NULL, '+502 4422 9900', 'F', 'HN', 'NX05', 'GI05', 'HN', 'RE03', 'GT', NULL, '1996-04-11', '2025-11-10', 'en_transito', 'alta', 'Huyó de violencia doméstica. Viaja con hija de 2 años. Sin recursos.', TRUE),
  ('M026', 'Rosa Elena', 'Xic Tujal', NULL, '+52 962 5531 88', 'F', 'GT', 'NX02', 'GI05', 'GT', 'RE04', 'MX', 'ORG08', '1988-08-05', '2025-10-28', 'en_transito', 'alta', 'Habla quiché y español básico. Analfabeta funcional. Tres hijos menores.', TRUE),
  ('M027', 'Claudia Milagros', 'Quispe Huanca', 'cquispe@gmail.com', '+57 318 4410092', 'F', 'PE', 'NX03', 'GI02', 'PE', 'RE04', 'CO', 'ORG04', '1984-12-22', '2025-08-19', 'derivado', 'media', 'Técnica en gastronomía. Busca empleo formal. Derivada a bolsa de trabajo regional.', TRUE),
  ('M028', 'Gregorio José', 'Sandoval Parra', 'gsandoval@hotmail.com', '+506 7744 3300', 'M', 'VE', 'NX01', 'GI02', 'VE', 'RE06', 'CR', 'ORG07', '1977-07-14', '2025-07-08', 'atendido', 'media', 'Docente universitario. Apoya voluntariamente en talleres del centro mientras tramita visa.', TRUE),
  ('M029', 'Darlenis', 'Soto Pérez', 'darlenis.soto@gmail.com', '+52 55 8811 4422', 'F', 'VE', 'NX02', 'GI03', 'VE', 'RE01', 'MX', 'ORG09', '2001-02-28', '2025-10-05', 'en_transito', 'media', 'Joven sola. Trabaja de vendedora informal. Solicita orientación para regularizarse.', TRUE),
  ('M030', 'Marcos Antonio', 'Estrada Fuentes', 'marcosestrada@gmail.com', '+1 305 441 9921', 'M', 'CU', 'NX01', 'GI01', 'CU', 'RE06', 'US', 'ORG10', '1982-10-17', '2025-01-15', 'ubicado', 'baja', 'Médico. Solicitó asilo. Reunificado con esposa. Empleo en clínica privada.', TRUE)
ON CONFLICT (id) DO UPDATE SET
  adulto_nombres = EXCLUDED.adulto_nombres,
  adulto_apellidos = EXCLUDED.adulto_apellidos,
  adulto_email = EXCLUDED.adulto_email,
  adulto_genero_id = EXCLUDED.adulto_genero_id,
  adulto_nacionalidad_id = EXCLUDED.adulto_nacionalidad_id,
  adulto_nexo_id = EXCLUDED.adulto_nexo_id,
  generacion_ingresos_id = EXCLUDED.generacion_ingresos_id,
  procedencia_pais_id = EXCLUDED.procedencia_pais_id,
  adulto_razon_emigracion_id = EXCLUDED.adulto_razon_emigracion_id,
  destino_final_pais_id = EXCLUDED.destino_final_pais_id,
  org_id = EXCLUDED.org_id,
  nino_fecha_nacimiento = EXCLUDED.nino_fecha_nacimiento,
  fecha_registro = EXCLUDED.fecha_registro,
  estado = EXCLUDED.estado,
  vulnerabilidad = EXCLUDED.vulnerabilidad,
  notas = EXCLUDED.notas,
  updated_at = NOW();

-- ─── RUTAS MIGRATORIAS (71 eventos) ─────────────────────────
INSERT INTO public.migrante_ruta (migrante_id, fecha, pais_id, ciudad_id, org_id, servicios, observaciones)
VALUES
  ('M001', '2025-07-10', 'VE', 'MAR', 'ORG02', '{"TS01","TS03"}', 'Registro inicial. Salud general estable.'),
  ('M001', '2025-08-03', 'CO', 'CUC', 'ORG03', '{"TS01","TS02"}', 'Cruzó frontera por Cúcuta. Atendida con hijos.'),
  ('M001', '2025-09-20', 'CO', 'BOG', 'ORG04', '{"TS04","TS05"}', 'Asesoría legal para documentación de menores.'),
  ('M001', '2025-10-14', 'PA', 'PTY', 'ORG05', '{"TS01","TS02","TS03"}', 'Atención post-Darién. Niños con deshidratación leve.'),
  ('M001', '2025-11-02', 'MX', 'TAP', 'ORG08', '{"TS01","TS02"}', 'En espera de resolución de solicitud migratoria.'),
  ('M002', '2025-04-15', 'VE', 'CCS', 'ORG01', '{"TS05"}', 'Orientación legal previa a la salida.'),
  ('M002', '2025-05-08', 'CO', 'BOG', 'ORG04', '{"TS05"}', 'Trámite de documentación internacional.'),
  ('M002', '2025-06-01', 'PA', 'PTY', 'ORG05', '{"TS06"}', 'Apoyo logístico de transporte.'),
  ('M002', '2025-07-10', 'MX', 'CDM', 'ORG09', '{"TS05","TS08"}', 'Asesoría migratoria en CDMX.'),
  ('M002', '2025-08-20', 'US', 'HOU', 'ORG10', '{"TS05","TS08"}', 'Solicitud de asilo presentada. Empleo temporal activo.'),
  ('M003', '2025-06-18', 'CO', 'CUC', 'ORG03', '{"TS01","TS03"}', 'Ingresó en estado gestacional avanzado.'),
  ('M003', '2025-07-12', 'CO', 'BOG', 'ORG04', '{"TS03","TS04","TS05"}', 'Parto exitoso. Recibiendo apoyo psicosocial.'),
  ('M004', '2025-09-05', 'CO', 'BOG', 'ORG04', '{"TS01","TS03","TS04"}', 'Registro inicial. Asignado intérprete voluntario.'),
  ('M004', '2025-10-01', 'CO', 'MED', NULL, '{}', 'En tránsito hacia Panamá. Sin org registrada.'),
  ('M005', '2025-10-22', 'PA', 'PTY', 'ORG05', '{"TS01","TS02","TS03","TS07"}', 'Atención integral. Ingresada a programa educativo temporal.'),
  ('M006', '2025-07-03', 'CO', 'CUC', 'ORG03', '{"TS05"}', 'Ingresó con documentación parcial.'),
  ('M006', '2025-07-28', 'CO', 'BOG', 'ORG04', '{"TS05","TS04"}', 'Expediente de refugio abierto.'),
  ('M006', '2025-08-15', 'CR', 'SJO', 'ORG07', '{"TS05"}', 'Tramitación en tránsito.'),
  ('M006', '2025-09-10', 'MX', 'TAP', 'ORG08', '{"TS01","TS05"}', 'Registro en aduana mexicana.'),
  ('M006', '2025-10-05', 'MX', 'CDM', 'ORG09', '{"TS04","TS05","TS08"}', 'Derivado a programa de integración.'),
  ('M007', '2025-08-11', 'CO', 'BOG', 'ORG04', '{"TS05","TS08"}', 'Orientación laboral y validación de títulos.'),
  ('M008', '2025-09-01', 'VE', 'MAR', 'ORG02', '{"TS01"}', 'Salida documentada.'),
  ('M008', '2025-09-22', 'CO', 'CUC', 'ORG03', '{"TS01","TS02"}', 'Cruce fronterizo tranquilo.'),
  ('M008', '2025-10-09', 'PA', 'DAV', 'ORG06', '{"TS03"}', 'Revisión médica post-Darién. Sin lesiones graves.'),
  ('M009', '2025-07-14', 'CO', 'CUC', 'ORG03', '{"TS01","TS02"}', 'Tránsito rápido.'),
  ('M009', '2025-08-01', 'PA', 'PTY', 'ORG05', '{"TS01","TS03"}', 'Atención médica al menor.'),
  ('M009', '2025-08-29', 'CR', 'SJO', 'ORG07', '{"TS04","TS07"}', 'Inscrita en programa de apoyo a madres solas.'),
  ('M010', '2025-08-29', 'CR', 'SJO', 'ORG07', '{"TS07","TS01"}', 'Integrada al programa educativo del centro.'),
  ('M011', '2025-10-10', 'CO', 'MED', NULL, '{}', 'Salida sin registro previo.'),
  ('M011', '2025-11-14', 'MX', 'TAP', 'ORG08', '{"TS01","TS02","TS05"}', 'Primer contacto. Solicitud de protección internacional.'),
  ('M012', '2025-03-10', 'VE', 'CCS', 'ORG01', '{"TS05"}', 'Orientación previa a salida.'),
  ('M012', '2025-03-28', 'CO', 'BOG', 'ORG04', '{"TS05"}', 'Apoyo documental.'),
  ('M012', '2025-04-20', 'MX', 'CDM', 'ORG09', '{"TS05"}', 'Trámite consular.'),
  ('M012', '2025-05-15', 'US', 'HOU', 'ORG10', '{"TS08"}', 'Empleo en sector salud. Caso cerrado satisfactoriamente.'),
  ('M013', '2025-11-20', 'VE', 'CCS', 'ORG11', '{"TS01","TS05"}', 'Primer registro. Orientación de ruta.'),
  ('M014', '2025-09-01', 'CO', 'CUC', 'ORG03', '{"TS01"}', 'Tránsito rápido.'),
  ('M014', '2025-09-30', 'PA', 'PTY', 'ORG05', '{"TS01","TS08"}', 'Derivada a bolsa de empleo local.'),
  ('M015', '2025-08-20', 'CO', 'BOG', 'ORG04', '{"TS01","TS04"}', 'Primera atención. Intérprete asignado.'),
  ('M015', '2025-09-15', 'CR', 'SJO', 'ORG07', '{"TS03","TS05"}', 'Atención médica y apoyo legal.'),
  ('M015', '2025-10-18', 'MX', 'CDM', 'ORG09', '{"TS04","TS05"}', 'En proceso de solicitud de refugio.'),
  ('M016', '2025-06-10', 'CO', 'BOG', 'ORG04', '{"TS05"}', 'Orientación para validación profesional.'),
  ('M016', '2025-07-21', 'CR', 'SJO', 'ORG07', '{"TS05","TS08"}', 'Derivada al Colegio de Médicos de Costa Rica.'),
  ('M017', '2025-11-01', 'CO', 'CUC', 'ORG03', '{"TS01","TS02","TS04"}', 'Llegó sin acompañante. Protocolo de menor activado.'),
  ('M018', '2025-10-01', 'CR', 'SJO', 'ORG07', '{"TS05","TS04"}', 'Primera atención. Caso derivado a ACNUR.'),
  ('M018', '2025-10-30', 'MX', 'TAP', 'ORG08', '{"TS05"}', 'Trámite de reconocimiento de refugiado activo.'),
  ('M019', '2025-11-25', 'VE', 'CCS', 'ORG11', '{"TS01","TS05"}', 'Registro inicial. Orientación de ruta.'),
  ('M020', '2025-08-01', 'CO', 'BOG', 'ORG04', '{"TS05"}', 'Orientación.'),
  ('M020', '2025-08-25', 'PA', 'PTY', 'ORG05', '{"TS01","TS06"}', 'Tránsito.'),
  ('M020', '2025-09-14', 'MX', 'CDM', 'ORG09', '{"TS08"}', 'Inserción laboral exitosa.'),
  ('M021', '2025-09-05', 'EC', 'GYE', NULL, '{}', 'Entrada por Ecuador sin registro.'),
  ('M021', '2025-10-01', 'CO', 'CUC', 'ORG03', '{"TS01"}', 'Registro en Colombia.'),
  ('M021', '2025-11-08', 'MX', 'TAP', 'ORG08', '{"TS01","TS05"}', 'Solicitud de asilo en México.'),
  ('M022', '2025-10-17', 'CO', 'CUC', 'ORG03', '{"TS01","TS02","TS03","TS04"}', 'Atención urgente. Medicamentos gestionados.'),
  ('M023', '2025-09-25', 'CO', 'BOG', 'ORG04', '{"TS01","TS08"}', 'Orientación laboral en sector construcción.'),
  ('M024', '2025-02-20', 'CO', 'BOG', 'ORG04', '{"TS05"}', 'Apoyo documental.'),
  ('M024', '2025-03-10', 'MX', 'CDM', 'ORG09', '{"TS05"}', 'Trámite visa.'),
  ('M024', '2025-04-01', 'US', 'MIA', 'ORG10', '{"TS07","TS08"}', 'Integración exitosa. Caso cerrado.'),
  ('M025', '2025-10-20', 'HN', 'TGU', NULL, '{}', 'Salida por violencia. Sin registro previo.'),
  ('M025', '2025-11-10', 'GT', 'GUA', NULL, '{"TS01","TS02"}', 'Atendida informalmente en albergue comunitario.'),
  ('M026', '2025-10-28', 'MX', 'TAP', 'ORG08', '{"TS01","TS02","TS03"}', 'Atención integral. Evaluación médica de menores.'),
  ('M027', '2025-08-19', 'CO', 'BOG', 'ORG04', '{"TS08","TS05"}', 'Orientación laboral. Verificación de títulos.'),
  ('M028', '2025-05-20', 'CO', 'BOG', 'ORG04', '{"TS05"}', 'Asesoría inicial.'),
  ('M028', '2025-06-15', 'PA', 'PTY', 'ORG05', '{"TS01","TS06"}', 'Tránsito con familia.'),
  ('M028', '2025-07-08', 'CR', 'SJO', 'ORG07', '{"TS05","TS07"}', 'Voluntario en talleres educativos. Proceso migratorio activo.'),
  ('M029', '2025-08-12', 'CO', 'CUC', 'ORG03', '{"TS01"}', 'Tránsito.'),
  ('M029', '2025-09-01', 'PA', 'PTY', 'ORG05', '{"TS01","TS02"}', 'Albergue 3 días.'),
  ('M029', '2025-09-25', 'MX', 'TAP', 'ORG08', '{"TS01","TS05"}', 'Registro en frontera sur.'),
  ('M029', '2025-10-05', 'MX', 'CDM', 'ORG09', '{"TS05","TS08"}', 'Orientación migratoria. Empleo informal activo.'),
  ('M030', '2025-01-15', 'CO', 'BOG', 'ORG04', '{"TS05"}', 'Asesoría legal para asilo.'),
  ('M030', '2025-02-10', 'MX', 'CDM', 'ORG09', '{"TS05"}', 'Tramitación consular.'),
  ('M030', '2025-03-05', 'US', 'MIA', 'ORG10', '{"TS05","TS08"}', 'Asilo aprobado. Integración laboral exitosa.');

-- ─── VERIFICACIÓN ────────────────────────────────────────────
SELECT 
  COUNT(*) AS total_migrantes,
  COUNT(CASE WHEN estado = 'en_transito' THEN 1 END) AS en_transito,
  COUNT(CASE WHEN estado = 'atendido'    THEN 1 END) AS atendido,
  COUNT(CASE WHEN estado = 'derivado'    THEN 1 END) AS derivado,
  COUNT(CASE WHEN estado = 'ubicado'     THEN 1 END) AS ubicado
FROM public.migrantes
WHERE id LIKE 'M%';

SELECT
  COUNT(CASE WHEN vulnerabilidad = 'alta'  THEN 1 END) AS vuln_alta,
  COUNT(CASE WHEN vulnerabilidad = 'media' THEN 1 END) AS vuln_media,
  COUNT(CASE WHEN vulnerabilidad = 'baja'  THEN 1 END) AS vuln_baja
FROM public.migrantes WHERE id LIKE 'M%';

SELECT COUNT(*) AS total_rutas FROM public.migrante_ruta;

-- Esperado:
-- total_migrantes=30 | en_transito=12 | atendido=10 | derivado=4 | ubicado=4
-- vuln_alta=12 | vuln_media=11 | vuln_baja=7
-- total_rutas=71

-- ─── SEED 2: datos sintéticos ───────────────────────────────
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
  pais_entrevista_id, ciudad_entrevista_id,
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

  -- País destino: 80%US 10%MX 5%PA 5%CR
  CASE
    WHEN (gs % 100) < 80 THEN 'US'
    WHEN (gs % 100) < 90 THEN 'MX'
    WHEN (gs % 100) < 95 THEN 'PA'
    ELSE                      'CR'
  END,

  -- País de entrevista (Oficina FEM que registró al NNA)
  -- Cúcuta=CO 20% | Caracas=VE 18% | Bogotá=CO 14% | Medellín=CO 11%
  -- Cali=CO 10% | Barranquilla=CO 10% | Cartagena=CO 9% | Santa Marta=CO 8%
  CASE
    WHEN (gs % 100) < 20 THEN 'CO'  -- Cúcuta
    WHEN (gs % 100) < 38 THEN 'VE'  -- Caracas
    ELSE                      'CO'  -- resto Colombia
  END,

  -- Ciudad de entrevista (Oficina FEM)
  CASE
    WHEN (gs % 100) < 20 THEN 'CUC'
    WHEN (gs % 100) < 38 THEN 'CCS'
    WHEN (gs % 100) < 52 THEN 'BOG'
    WHEN (gs % 100) < 63 THEN 'MED'
    WHEN (gs % 100) < 73 THEN 'CAL'
    WHEN (gs % 100) < 83 THEN 'BAR'
    WHEN (gs % 100) < 92 THEN 'CTG'
    ELSE                      'SMA'
  END,

  -- Organización FEM de la entrevista
  CASE
    WHEN (gs % 100) < 20 THEN 'ORG12'  -- Cúcuta
    WHEN (gs % 100) < 38 THEN 'ORG11'  -- Caracas
    WHEN (gs % 100) < 52 THEN 'ORG13'  -- Bogotá
    WHEN (gs % 100) < 63 THEN 'ORG14'  -- Medellín
    WHEN (gs % 100) < 73 THEN 'ORG15'  -- Cali
    WHEN (gs % 100) < 83 THEN 'ORG16'  -- Barranquilla
    WHEN (gs % 100) < 92 THEN 'ORG17'  -- Cartagena
    ELSE                      'ORG18'  -- Santa Marta
  END,

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
