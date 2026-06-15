-- ============================================================
-- migration_migrantes.sql — Vidas en Movimiento
-- Ejecutar en Supabase SQL Editor:
-- https://supabase.com/dashboard/project/izcqcnunryhntojhxywu/editor
-- ============================================================

-- ─── SECUENCIA PARA IDs ───────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS migrantes_seq START 1;

-- ─── TABLA PRINCIPAL: MIGRANTES ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.migrantes (
  -- Identificador
  id TEXT PRIMARY KEY DEFAULT 'M' || LPAD(CAST(nextval('migrantes_seq') AS TEXT), 3, '0'),

  -- SECCIÓN: Consentimiento y organización
  consentimiento          BOOLEAN,
  org_id                  TEXT REFERENCES public.organizations(id),

  -- SECCIÓN: Datos de la entrevista
  fecha_entrevista        TIMESTAMPTZ DEFAULT NOW(),
  pais_entrevista_id      TEXT REFERENCES public.cat_paises(id),
  municipio_entrevista    TEXT,
  ciudad_entrevista_id    TEXT REFERENCES public.cat_ciudades(id),

  -- SECCIÓN: Datos del adulto acompañante
  adulto_nombres          TEXT,
  adulto_apellidos        TEXT,
  adulto_direccion        TEXT,
  adulto_email            TEXT,
  adulto_ciudad_id        TEXT REFERENCES public.cat_ciudades(id),
  adulto_pais_id          TEXT REFERENCES public.cat_paises(id),
  adulto_nacionalidad_id  TEXT REFERENCES public.cat_nacionalidades(id),
  adulto_genero_id        TEXT REFERENCES public.cat_generos(id),
  adulto_telefono         TEXT,
  adulto_residencia       TEXT,          -- 'tiene' | 'no_tiene' | 'en_tramite'
  adulto_nexo_id          TEXT REFERENCES public.cat_nexos(id),
  adulto_permiso_residencia BOOLEAN,
  adulto_doc_residencia_url TEXT,
  adulto_custodia         BOOLEAN,
  adulto_foto_custodia_url TEXT,
  adulto_permiso_trabajo  BOOLEAN,
  adulto_doc_trabajo_url  TEXT,
  adulto_razon_emigracion_id TEXT REFERENCES public.cat_razones_emigracion(id),

  -- SECCIÓN: Ruta y situación económica
  procedencia_pais_id     TEXT REFERENCES public.cat_paises(id),
  destino_final_pais_id   TEXT REFERENCES public.cat_paises(id),
  generacion_ingresos_id  TEXT REFERENCES public.cat_generacion_ingresos(id),

  -- SECCIÓN: Datos del niño/a
  nino_nombres            TEXT,
  nino_apellidos          TEXT,
  nino_genero_id          TEXT REFERENCES public.cat_generos(id),
  nino_fecha_nacimiento   DATE,
  nino_pais_nacimiento_id TEXT REFERENCES public.cat_paises(id),
  nino_municipio          TEXT,
  nino_idioma_id          TEXT REFERENCES public.cat_idiomas(id),
  nino_nivel_educacion_id TEXT REFERENCES public.cat_niveles_educacion(id),
  nino_fecha_ultimo_nivel DATE,
  nino_asistencia_trayectoria TEXT,
  nino_discapacidades     TEXT,
  nino_vacunas            TEXT,
  nino_foto_vacunas_url   TEXT,
  nino_medicacion         TEXT,

  -- SECCIÓN: Recomendaciones
  rec_ultimo_centro       TEXT,
  rec_siguiente_puesto    TEXT,
  rec_familia             TEXT,

  -- Campos de compatibilidad con datos mock existentes
  estado                  TEXT DEFAULT 'en_transito',
  vulnerabilidad          TEXT DEFAULT 'media',
  notas                   TEXT,
  fecha_registro          DATE DEFAULT CURRENT_DATE,

  -- Metadata
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: GRUPO DE VIAJE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.migrante_grupo_viaje (
  id                BIGSERIAL PRIMARY KEY,
  migrante_id       TEXT NOT NULL REFERENCES public.migrantes(id) ON DELETE CASCADE,
  acompanante_nombre TEXT,
  genero_id         TEXT REFERENCES public.cat_generos(id),
  nexo_id           TEXT REFERENCES public.cat_nexos(id),
  fecha_nacimiento  DATE,
  edad              INT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: RUTA MIGRATORIA ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.migrante_ruta (
  id           BIGSERIAL PRIMARY KEY,
  migrante_id  TEXT NOT NULL REFERENCES public.migrantes(id) ON DELETE CASCADE,
  fecha        DATE,
  pais_id      TEXT REFERENCES public.cat_paises(id),
  ciudad_id    TEXT REFERENCES public.cat_ciudades(id),
  org_id       TEXT REFERENCES public.organizations(id),
  servicios    TEXT[] DEFAULT '{}',
  observaciones TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.migrantes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migrante_grupo_viaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migrante_ruta        ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios autenticados pueden hacer todo
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['migrantes','migrante_grupo_viaje','migrante_ruta']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS allow_all_auth ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY allow_all_auth ON public.%I
       FOR ALL TO authenticated
       USING (true) WITH CHECK (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS allow_select_anon ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY allow_select_anon ON public.%I
       FOR SELECT TO anon USING (true)', t);
  END LOOP;
END $$;

-- ─── GRANTS ──────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.migrantes            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.migrante_grupo_viaje TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.migrante_ruta        TO authenticated;
GRANT SELECT ON public.migrantes            TO anon;
GRANT SELECT ON public.migrante_grupo_viaje TO anon;
GRANT SELECT ON public.migrante_ruta        TO anon;
GRANT USAGE, SELECT ON SEQUENCE migrantes_seq TO authenticated;

-- ─── TRIGGER: updated_at automático ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.migrantes;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.migrantes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── VERIFICACIÓN ─────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('migrantes','migrante_grupo_viaje','migrante_ruta')
ORDER BY table_name;
