-- ============================================================
-- migration_dashboard_stats.sql — Vidas en Movimiento
-- Tabla de KPIs del dashboard (leída por supabase-data.js)
-- Ejecutar en: https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.dashboard_stats (
  id         TEXT PRIMARY KEY DEFAULT 'main',
  stats      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all_auth   ON public.dashboard_stats;
CREATE POLICY allow_all_auth ON public.dashboard_stats
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_select_anon ON public.dashboard_stats;
CREATE POLICY allow_select_anon ON public.dashboard_stats
  FOR SELECT TO anon USING (true);

GRANT SELECT, INSERT, UPDATE ON public.dashboard_stats TO authenticated;
GRANT SELECT ON public.dashboard_stats TO anon;

-- Insertar/actualizar los KPIs del dashboard
INSERT INTO public.dashboard_stats (id, stats)
VALUES ('main', '{"totalRegistros":4862,"ninos":2722,"ninas":2140,"familias":1217,"datosPendientes":391,"pctDuplicados":0.48,"nnaMultiplesPuntos":2917,"nnaUnicoPunto":1945,"pctMultiplesPuntos":60,"historico":[{"mes":"2025-05","label":"May 25","total":4362},{"mes":"2025-06","label":"Jun 25","total":4408},{"mes":"2025-07","label":"Jul 25","total":4451},{"mes":"2025-08","label":"Ago 25","total":4474},{"mes":"2025-09","label":"Sep 25","total":4484},{"mes":"2025-10","label":"Oct 25","total":4494},{"mes":"2025-11","label":"Nov 25","total":4534},{"mes":"2025-12","label":"Dic 25","total":4586},{"mes":"2026-01","label":"Ene 26","total":4666},{"mes":"2026-02","label":"Feb 26","total":4736},{"mes":"2026-03","label":"Mar 26","total":4796},{"mes":"2026-04","label":"Abr 26","total":4862}],"comparacion":{"mensual":{"label":"Marzo 2026","valor":4796,"pct":1.4},"semestral":{"label":"Oct 2025","valor":4494,"pct":8.2},"anual":{"label":"Mayo 2025","valor":4362,"pct":10.3}},"colombiaRuta":{"totalPorColombia":4382,"entradaCucuta":{"ciudad":"Cúcuta","pct":60,"total":2629},"entradaRiohacha":{"ciudad":"Riohacha","pct":40,"total":1753},"rutaCosta":{"pct":30,"total":1315,"ciudades":[{"ciudadId":"BAR","label":"Barranquilla","pct":40,"total":526},{"ciudadId":"CTG","label":"Cartagena","pct":35,"total":460},{"ciudadId":"SMA","label":"Santa Marta","pct":25,"total":329}]},"rutaInterior":{"pct":70,"total":3067,"ciudades":[{"ciudadId":"BOG","label":"Bogotá","pct":50,"total":1534},{"ciudadId":"MED","label":"Medellín","pct":30,"total":920},{"ciudadId":"CAL","label":"Cali","pct":20,"total":613}]}},"razonesTop":[{"label":"Crisis económica","pct":68},{"label":"Falta de empleo","pct":52},{"label":"Violencia/inseguridad","pct":31},{"label":"Reunificación familiar","pct":22},{"label":"Persecución política","pct":14},{"label":"Calidad de vida","pct":11}],"tipoIngresos":[{"label":"Trabajo informal","pct":38},{"label":"Sin ingresos","pct":27},{"label":"Empleo temporal","pct":19},{"label":"Apoyo familiar","pct":11},{"label":"Empleo formal","pct":3},{"label":"Emprendimiento","pct":2}],"nivelEducativo":[{"label":"Universitario","pct":29},{"label":"Técnico","pct":21},{"label":"Secundario","pct":35},{"label":"Primario","pct":12},{"label":"Sin datos","pct":3}],"nexos":[{"label":"Familiar directo","pct":34},{"label":"Org. humanitaria","pct":28},{"label":"Amigo o conocido","pct":18},{"label":"Sin nexo","pct":12},{"label":"Redes sociales","pct":5},{"label":"Autoridad migratoria","pct":3}],"rangoEdadNinos":[{"label":"0-2 años","total":287},{"label":"3-5 años","total":412},{"label":"6-11 años","total":601},{"label":"12-17 años","total":497}],"rangoEdadAdultos":[{"label":"18-24 años","total":891},{"label":"25-34 años","total":1204},{"label":"35-44 años","total":612},{"label":"45-54 años","total":234},{"label":"55+ años","total":73}],"permisosTrabajo":{"si":66,"no":34},"permanencia":{"si":44,"no":56},"intencionReuniSI":71,"sistEscolarSI":58,"plataformasDigitales":[{"label":"WhatsApp","pct":84},{"label":"Facebook","pct":62},{"label":"Email","pct":45},{"label":"Instagram","pct":38},{"label":"Sin acceso","pct":18}],"paisDestino":[{"label":"Estados Unidos","bandera":"🇺🇸","pct":41},{"label":"México","bandera":"🇲🇽","pct":22},{"label":"Colombia","bandera":"🇨🇴","pct":15},{"label":"Costa Rica","bandera":"🇨🇷","pct":9},{"label":"Panamá","bandera":"🇵🇦","pct":8},{"label":"Otro","bandera":"🌍","pct":5}],"paisResidencia":[{"label":"Colombia","bandera":"🇨🇴","pct":28},{"label":"México","bandera":"🇲🇽","pct":24},{"label":"Estados Unidos","bandera":"🇺🇸","pct":18},{"label":"Venezuela","bandera":"🇻🇪","pct":14},{"label":"Panamá","bandera":"🇵🇦","pct":9},{"label":"Costa Rica","bandera":"🇨🇷","pct":7}],"serviciosTop":[{"id":"TS01","label":"Alimentación","icono":"🍽️","pct":74,"total":3598},{"id":"TS03","label":"Atención médica","icono":"🏥","pct":68,"total":3306},{"id":"TS02","label":"Refugio temporal","icono":"🏠","pct":61,"total":2965},{"id":"TS04","label":"Atención psicológica","icono":"🧠","pct":47,"total":2285},{"id":"TS05","label":"Asesoría legal","icono":"⚖️","pct":39,"total":1896},{"id":"TS07","label":"Capacitación laboral","icono":"💼","pct":28,"total":1361},{"id":"TS06","label":"Educación","icono":"📚","pct":23,"total":1119},{"id":"TS08","label":"Transporte","icono":"🚌","pct":18,"total":875}],"recomendacionesTop":[{"id":"RC01","label":"Registro inicial completo","tipo":"Operativa","total":2922},{"id":"RC07","label":"Evaluar riesgo de vulnerabilidad alta","tipo":"Protección","total":1651},{"id":"RC02","label":"Derivar a atención médica urgente","tipo":"Salud","total":1436},{"id":"RC09","label":"Brindar kit de higiene y alimentación","tipo":"Humanitaria","total":1301},{"id":"RC08","label":"Facilitar acceso a albergue temporal","tipo":"Alojamiento","total":1116},{"id":"RC10","label":"Acompañamiento psicosocial prioritario","tipo":"Salud Mental","total":973},{"id":"RC03","label":"Solicitar documentación pendiente","tipo":"Legal","total":856},{"id":"RC04","label":"Inscribir menores en programa escolar","tipo":"Educación","total":720}]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  stats = EXCLUDED.stats,
  updated_at = NOW();

-- Verificación
SELECT
  id,
  (stats->>'totalRegistros')::int  AS total_registros,
  (stats->>'ninos')::int           AS ninos,
  (stats->>'ninas')::int           AS ninas,
  (stats->>'familias')::int        AS familias,
  (stats->>'datosPendientes')::int AS datos_pendientes,
  (stats->>'pctMultiplesPuntos')::int AS trazabilidad_pct
FROM public.dashboard_stats;

-- Esperado: total=4862 | ninos=2722 | ninas=2140 | familias=1217 | pendientes=391 | trazabilidad=60
