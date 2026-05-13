// ============================================================
// mockData.js — Vidas en Movimiento
// ÚNICA fuente de verdad. Todos los módulos leen desde aquí.
// v2 — 30 migrantes · 11 organizaciones · vulnerabilidad
// ============================================================

// ─── USUARIOS DEL SISTEMA ────────────────────────────────────

const USUARIOS = [
  {
    id: 'USR00',
    nombres: 'Administrador',
    apellidos: 'Global',
    email: 'admin@vidasenmovimiento.org',
    usuario: 'admin',
    password: 'admin2024',
    orgId: null,
    orgIds: [],          // vacío = acceso global
    esGlobal: true,
    rol: 'Administrador',
    activo: true,
    fechaInvitacion: '2024-09-01',
    ultimoAcceso: '2026-05-07',
  },
  {
    id: 'USR01',
    nombres: 'Antonio',
    apellidos: 'Fonseca',
    email: 'afonseca@fundacionmendoza.org',
    usuario: 'afonseca',
    password: 'mendoza2024',
    orgId: 'ORG11',
    orgIds: ['ORG11'],
    esGlobal: false,
    rol: 'Operador',
    activo: true,
    fechaInvitacion: '2024-10-15',
    ultimoAcceso: '2026-05-06',
  },
  {
    id: 'USR02',
    nombres: 'Alejandra',
    apellidos: 'Ríos',
    email: 'arios@acnur.org',
    usuario: 'arios',
    password: 'acnur2024',
    orgId: 'ORG04',
    orgIds: ['ORG04'],
    esGlobal: false,
    rol: 'Coordinadora',
    activo: true,
    fechaInvitacion: '2024-11-03',
    ultimoAcceso: '2026-05-05',
  },
  {
    id: 'USR03',
    nombres: 'Roberto',
    apellidos: 'Gutiérrez',
    email: 'rgutierrez@alberguepuente.pa',
    usuario: 'rgutierrez',
    password: 'puente2024',
    orgId: 'ORG05',
    orgIds: ['ORG05'],
    esGlobal: false,
    rol: 'Operador',
    activo: true,
    fechaInvitacion: '2024-11-20',
    ultimoAcceso: '2026-05-04',
  },
  {
    id: 'USR04',
    nombres: 'Carmen',
    apellidos: 'Villalba',
    email: 'cvillalba@pastoralsocial.co',
    usuario: 'cvillalba',
    password: 'cucuta2024',
    orgId: 'ORG03',
    orgIds: ['ORG03'],
    esGlobal: false,
    rol: 'Operadora',
    activo: true,
    fechaInvitacion: '2025-01-08',
    ultimoAcceso: '2026-05-03',
  },
  {
    id: 'USR05',
    nombres: 'Luis',
    apellidos: 'Valenzuela',
    email: 'lvalenzuela@iom.int',
    usuario: 'lvalenzuela',
    password: 'oim2024',
    orgId: 'ORG09',
    orgIds: ['ORG08', 'ORG09'],   // acceso a dos orgs en México
    esGlobal: false,
    rol: 'Coordinador Regional',
    activo: true,
    fechaInvitacion: '2025-02-14',
    ultimoAcceso: '2026-05-07',
  },
  {
    id: 'USR06',
    nombres: 'Sandra',
    apellidos: 'Villarreal',
    email: 'svillaarreal@raices.org',
    usuario: 'svillarreal',
    password: 'raices2024',
    orgId: 'ORG10',
    orgIds: ['ORG10'],
    esGlobal: false,
    rol: 'Directora',
    activo: false,    // cuenta suspendida (demo de estado inactivo)
    fechaInvitacion: '2025-03-01',
    ultimoAcceso: '2026-04-12',
  },
];

// ─── CATÁLOGOS ───────────────────────────────────────────────

const PAISES = [
  { id: 'VE', label: 'Venezuela',       coords: [8.0,   -66.0],    bandera: '🇻🇪' },
  { id: 'CO', label: 'Colombia',        coords: [4.57,  -74.29],   bandera: '🇨🇴' },
  { id: 'PA', label: 'Panamá',          coords: [8.99,  -79.51],   bandera: '🇵🇦' },
  { id: 'CR', label: 'Costa Rica',      coords: [9.74,  -83.75],   bandera: '🇨🇷' },
  { id: 'HN', label: 'Honduras',        coords: [15.2,  -86.2],    bandera: '🇭🇳' },
  { id: 'GT', label: 'Guatemala',       coords: [15.78, -90.23],   bandera: '🇬🇹' },
  { id: 'MX', label: 'México',          coords: [23.63, -102.55],  bandera: '🇲🇽' },
  { id: 'US', label: 'Estados Unidos',  coords: [37.09, -95.71],   bandera: '🇺🇸' },
  { id: 'HT', label: 'Haití',           coords: [18.97, -72.28],   bandera: '🇭🇹' },
  { id: 'EC', label: 'Ecuador',         coords: [-1.83, -78.18],   bandera: '🇪🇨' },
  { id: 'PE', label: 'Perú',            coords: [-9.19, -75.01],   bandera: '🇵🇪' },
  { id: 'CU', label: 'Cuba',            coords: [21.52, -77.78],   bandera: '🇨🇺' },
];

const CIUDADES = [
  // Venezuela — orígenes principales
  { id: 'CCS', label: 'Caracas',            paisId: 'VE', coords: [10.48,  -66.87] },
  { id: 'MAR', label: 'Maracaibo',          paisId: 'VE', coords: [10.63,  -71.64] },
  { id: 'SCR', label: 'San Cristóbal',      paisId: 'VE', coords: [7.77,   -72.22] },
  // Colombia — puntos de entrada (frontera)
  { id: 'CUC', label: 'Cúcuta',             paisId: 'CO', coords: [7.89,   -72.50] },
  { id: 'RIO', label: 'Riohacha',           paisId: 'CO', coords: [11.54,  -72.91] },
  // Colombia — costa Caribe
  { id: 'CTG', label: 'Cartagena',          paisId: 'CO', coords: [10.40,  -75.51] },
  { id: 'BAR', label: 'Barranquilla',       paisId: 'CO', coords: [10.96,  -74.80] },
  { id: 'SMA', label: 'Santa Marta',        paisId: 'CO', coords: [11.24,  -74.20] },
  // Colombia — interior
  { id: 'BOG', label: 'Bogotá',             paisId: 'CO', coords: [4.71,   -74.07] },
  { id: 'MED', label: 'Medellín',           paisId: 'CO', coords: [6.25,   -75.56] },
  { id: 'CAL', label: 'Cali',               paisId: 'CO', coords: [3.45,   -76.53] },
  // Resto de la ruta
  { id: 'PTY', label: 'Ciudad de Panamá',   paisId: 'PA', coords: [8.99,   -79.51] },
  { id: 'DAV', label: 'David',              paisId: 'PA', coords: [8.42,   -82.43] },
  { id: 'SJO', label: 'San José',           paisId: 'CR', coords: [9.93,   -84.08] },
  { id: 'GUA', label: 'Ciudad de Guatemala',paisId: 'GT', coords: [14.63,  -90.51] },
  { id: 'TAP', label: 'Tapachula',          paisId: 'MX', coords: [14.89,  -92.26] },
  { id: 'CDM', label: 'Ciudad de México',   paisId: 'MX', coords: [19.43,  -99.13] },
  { id: 'MTY', label: 'Monterrey',          paisId: 'MX', coords: [25.67, -100.31] },
  { id: 'HOU', label: 'Houston',            paisId: 'US', coords: [29.76,  -95.36] },
  { id: 'MIA', label: 'Miami',              paisId: 'US', coords: [25.77,  -80.19] },
  { id: 'PAP', label: 'Puerto Príncipe',    paisId: 'HT', coords: [18.54,  -72.33] },
  { id: 'GYE', label: 'Guayaquil',          paisId: 'EC', coords: [-2.17,  -79.92] },
  { id: 'LIM', label: 'Lima',               paisId: 'PE', coords: [-12.04, -77.03] },
  { id: 'TGU', label: 'Tegucigalpa',        paisId: 'HN', coords: [14.10,  -87.22] },
];

const NACIONALIDADES = [
  { id: 'VE', label: 'Venezolana'    },
  { id: 'CO', label: 'Colombiana'    },
  { id: 'HT', label: 'Haitiana'      },
  { id: 'EC', label: 'Ecuatoriana'   },
  { id: 'PE', label: 'Peruana'       },
  { id: 'CU', label: 'Cubana'        },
  { id: 'GT', label: 'Guatemalteca'  },
  { id: 'HN', label: 'Hondureña'     },
  { id: 'MX', label: 'Mexicana'      },
];

const GENEROS = [
  { id: 'F',  label: 'Femenino'        },
  { id: 'M',  label: 'Masculino'       },
  { id: 'NB', label: 'No binario'      },
  { id: 'NE', label: 'No especificado' },
];

const IDIOMAS = [
  { id: 'ES', label: 'Español'         },
  { id: 'EN', label: 'Inglés'          },
  { id: 'HT', label: 'Creole haitiano' },
  { id: 'PT', label: 'Portugués'       },
  { id: 'FR', label: 'Francés'         },
  { id: 'QU', label: 'Quechua'         },
];

const NEXOS = [
  { id: 'NX01', label: 'Familiar directo'          },
  { id: 'NX02', label: 'Amigo o conocido'           },
  { id: 'NX03', label: 'Organización humanitaria'   },
  { id: 'NX04', label: 'Autoridad migratoria'       },
  { id: 'NX05', label: 'Redes sociales'             },
  { id: 'NX06', label: 'Sin nexo / llegada propia'  },
];

const RAZONES_EMIGRACION = [
  { id: 'RE01', label: 'Crisis económica'                 },
  { id: 'RE02', label: 'Reunificación familiar'           },
  { id: 'RE03', label: 'Violencia o inseguridad'          },
  { id: 'RE04', label: 'Falta de empleo'                  },
  { id: 'RE05', label: 'Acceso a salud o educación'       },
  { id: 'RE06', label: 'Persecución política'             },
  { id: 'RE07', label: 'Desastres naturales'              },
  { id: 'RE08', label: 'Búsqueda de mejor calidad de vida'},
];

const TIPOS_SERVICIO = [
  { id: 'TS01', label: 'Alimentación',         icono: '🍽️', color: '#F59E0B' },
  { id: 'TS02', label: 'Refugio temporal',     icono: '🏠',  color: '#3B82F6' },
  { id: 'TS03', label: 'Atención médica',      icono: '🏥',  color: '#EF4444' },
  { id: 'TS04', label: 'Atención psicológica', icono: '🧠',  color: '#8B5CF6' },
  { id: 'TS05', label: 'Asesoría legal',       icono: '⚖️',  color: '#10B981' },
  { id: 'TS06', label: 'Transporte',           icono: '🚌',  color: '#6B7280' },
  { id: 'TS07', label: 'Educación',            icono: '📚',  color: '#EC4899' },
  { id: 'TS08', label: 'Inserción laboral',    icono: '💼',  color: '#14B8A6' },
];

const GENERACION_INGRESOS = [
  { id: 'GI01', label: 'Empleo formal'         },
  { id: 'GI02', label: 'Empleo temporal'       },
  { id: 'GI03', label: 'Trabajo informal'      },
  { id: 'GI04', label: 'Apoyo familiar'        },
  { id: 'GI05', label: 'Sin ingresos'          },
  { id: 'GI06', label: 'Emprendimiento propio' },
  { id: 'GI07', label: 'Remesas'              },
];

const MATERIAL_EDUCATIVO = [
  { id: 'ME01', label: 'Guía de derechos del migrante',          tipo: 'PDF',   idioma: 'ES' },
  { id: 'ME02', label: 'Mapa de rutas y puntos de atención',     tipo: 'Mapa',  idioma: 'ES' },
  { id: 'ME03', label: 'Protocolo de salud en tránsito',         tipo: 'PDF',   idioma: 'ES' },
  { id: 'ME04', label: 'Guía de regularización migratoria',      tipo: 'PDF',   idioma: 'ES' },
  { id: 'ME05', label: 'Recursos para madres en tránsito',       tipo: 'Video', idioma: 'ES' },
  { id: 'ME06', label: 'Guide des droits — version créole',      tipo: 'PDF',   idioma: 'HT' },
  { id: 'ME07', label: 'Información sobre albergues disponibles',tipo: 'PDF',   idioma: 'ES' },
  { id: 'ME08', label: 'Acceso a educación para niñas y niños',  tipo: 'PDF',   idioma: 'ES' },
  { id: 'ME09', label: 'Derechos laborales en tránsito',         tipo: 'PDF',   idioma: 'ES' },
  { id: 'ME10', label: 'Guía de salud mental para migrantes',    tipo: 'PDF',   idioma: 'ES' },
];

const NIVELES_EDUCACION = [
  { id: 'NE01', label: 'Sin escolarización'  },
  { id: 'NE02', label: 'Primario incompleto' },
  { id: 'NE03', label: 'Primario completo'   },
  { id: 'NE04', label: 'Secundario incompleto' },
  { id: 'NE05', label: 'Secundario completo'   },
  { id: 'NE06', label: 'Técnico / Tecnólogo'   },
  { id: 'NE07', label: 'Universitario incompleto' },
  { id: 'NE08', label: 'Universitario completo'   },
  { id: 'NE09', label: 'Posgrado'               },
  { id: 'NE10', label: 'Sin datos'              },
];

const RECOMENDACIONES = [
  { id: 'RC01', label: 'Registro inicial completo',            tipo: 'Operativa' },
  { id: 'RC02', label: 'Derivar a atención médica urgente',    tipo: 'Salud'     },
  { id: 'RC03', label: 'Solicitar documentación pendiente',    tipo: 'Legal'     },
  { id: 'RC04', label: 'Inscribir menores en programa escolar',tipo: 'Educación' },
  { id: 'RC05', label: 'Orientar sobre trámite de refugio',    tipo: 'Legal'     },
  { id: 'RC06', label: 'Conectar con red de apoyo local',      tipo: 'Social'    },
  { id: 'RC07', label: 'Evaluar riesgo de vulnerabilidad alta',tipo: 'Protección'},
  { id: 'RC08', label: 'Facilitar acceso a albergue temporal', tipo: 'Alojamiento'},
  { id: 'RC09', label: 'Brindar kit de higiene y alimentación',tipo: 'Humanitaria'},
  { id: 'RC10', label: 'Acompañamiento psicosocial prioritario',tipo: 'Salud Mental'},
  { id: 'RC11', label: 'Gestionar reunificación familiar',     tipo: 'Familia'   },
  { id: 'RC12', label: 'Derivar a bolsa de empleo local',      tipo: 'Laboral'   },
];

// ─── ORGANIZACIONES ──────────────────────────────────────────

const ORGANIZACIONES = [
  {
    id: 'ORG01',
    nombre: 'Fundación Mendoza — Caracas (Área Norte)',
    paisId: 'VE', ciudadId: 'CCS',
    tipo: 'Fundación privada',
    contacto: 'Manuel Torres',
    email: 'caracas.norte@fundacionmendoza.org',
    telefono: '+58 212 4421100',
    servicios: ['TS01','TS02','TS05'],
    totalAtendidos: 312, activa: true, recomendaciones: 29, esFEM: true,
    descripcion: 'Sede norte de la Fundación Mendoza en Caracas. Preparación y acompañamiento pre-salida.'
  },
  {
    id: 'ORG02',
    nombre: 'Fundación Mendoza — Maracaibo',
    paisId: 'VE', ciudadId: 'MAR',
    tipo: 'Fundación privada',
    contacto: 'Carlos Fuenmayor',
    email: 'maracaibo@fundacionmendoza.org',
    telefono: '+58 261 7853390',
    servicios: ['TS01','TS03','TS04'],
    totalAtendidos: 198, activa: true, recomendaciones: 17, esFEM: true,
    descripcion: 'Oficina FEM en Maracaibo. Zona fronteriza occidente venezolano.'
  },
  {
    id: 'ORG03',
    nombre: 'Fundación Mendoza — Cúcuta (Frontera Norte)',
    paisId: 'CO', ciudadId: 'CUC',
    tipo: 'Fundación privada',
    contacto: 'Carlos Vargas',
    email: 'cucuta.norte@fundacionmendoza.org',
    telefono: '+57 7 5712234',
    servicios: ['TS01','TS02','TS03','TS05'],
    totalAtendidos: 541, activa: true, recomendaciones: 61, esFEM: true,
    descripcion: 'Punto FEM de primer ingreso en Cúcuta. Atención 24h en frontera.'
  },
  {
    id: 'ORG04',
    nombre: 'Fundación Mendoza — Bogotá (Zona Centro)',
    paisId: 'CO', ciudadId: 'BOG',
    tipo: 'Fundación privada',
    contacto: 'Alejandra Ríos',
    email: 'bogota.centro@fundacionmendoza.org',
    telefono: '+57 1 6257900',
    servicios: ['TS03','TS04','TS05','TS07','TS08'],
    totalAtendidos: 834, activa: true, recomendaciones: 94, esFEM: true,
    descripcion: 'Hub FEM en Bogotá. Derivación y atención integral en la capital.'
  },
  {
    id: 'ORG05',
    nombre: 'Fundación Mendoza — Riohacha',
    paisId: 'CO', ciudadId: 'RIO',
    tipo: 'Fundación privada',
    contacto: 'Roberto Gutiérrez',
    email: 'riohacha@fundacionmendoza.org',
    telefono: '+57 5 7274400',
    servicios: ['TS01','TS02','TS03','TS06'],
    totalAtendidos: 407, activa: true, recomendaciones: 48, esFEM: true,
    descripcion: 'Oficina FEM en Riohacha. Corredor costero y atención humanitaria.'
  },
  {
    id: 'ORG06',
    nombre: 'Fundación Mendoza — San Cristóbal',
    paisId: 'VE', ciudadId: 'SCR',
    tipo: 'Fundación privada',
    contacto: 'Sofía Vargas',
    email: 'sancristo@fundacionmendoza.org',
    telefono: '+58 276 3441100',
    servicios: ['TS03','TS04','TS06'],
    totalAtendidos: 276, activa: true, recomendaciones: 33, esFEM: true,
    descripcion: 'Oficina FEM en San Cristóbal. Atención en corredor fronterizo táchirense.'
  },
  {
    id: 'ORG07',
    nombre: 'Fundación Mendoza — Barranquilla (Zona Norte)',
    paisId: 'CO', ciudadId: 'BAR',
    tipo: 'Fundación privada',
    contacto: 'Xavier Bermúdez',
    email: 'barranquilla.norte@fundacionmendoza.org',
    telefono: '+57 5 3602200',
    servicios: ['TS01','TS02','TS04','TS05','TS07'],
    totalAtendidos: 359, activa: true, recomendaciones: 41, esFEM: true,
    descripcion: 'Sede norte FEM en Barranquilla. Apoyo integral a NNA y familias en la costa.'
  },
  {
    id: 'ORG08',
    nombre: 'Fundación Mendoza — Medellín (Zona Centro)',
    paisId: 'CO', ciudadId: 'MED',
    tipo: 'Fundación privada',
    contacto: 'Laura Gómez',
    email: 'medellin.centro@fundacionmendoza.org',
    telefono: '+57 4 4441100',
    servicios: ['TS01','TS02','TS03','TS05'],
    totalAtendidos: 623, activa: true, recomendaciones: 72, esFEM: true,
    descripcion: 'Sede centro FEM en Medellín. Atención y estabilización a familias migrantes.'
  },
  {
    id: 'ORG09',
    nombre: 'Fundación Mendoza — Bogotá (Zona Sur)',
    paisId: 'CO', ciudadId: 'BOG',
    tipo: 'Fundación privada',
    contacto: 'Luis Valenzuela',
    email: 'bogota.sur@fundacionmendoza.org',
    telefono: '+57 1 5521100',
    servicios: ['TS04','TS05','TS07','TS08'],
    totalAtendidos: 489, activa: true, recomendaciones: 55, esFEM: true,
    descripcion: 'Sede sur FEM en Bogotá. Reinserción laboral y asesoría legal.'
  },
  {
    id: 'ORG10',
    nombre: 'Fundación Mendoza — Cali (Zona Norte)',
    paisId: 'CO', ciudadId: 'CAL',
    tipo: 'Fundación privada',
    contacto: 'Sandra Zapata',
    email: 'cali.norte@fundacionmendoza.org',
    telefono: '+57 2 6611200',
    servicios: ['TS05','TS07','TS08'],
    totalAtendidos: 217, activa: true, recomendaciones: 26, esFEM: true,
    descripcion: 'Sede norte FEM en Cali. Orientación y regularización migratoria.'
  },
  {
    id: 'ORG11',
    nombre: 'Fundación Mendoza — Caracas',
    paisId: 'VE', ciudadId: 'CCS',
    tipo: 'Fundación privada',
    contacto: 'Antonio Fonseca',
    email: 'afonseca@fundacionmendoza.org',
    telefono: '+58 212 9901200',
    servicios: ['TS01','TS02','TS03','TS05','TS07'],
    totalAtendidos: 875, activa: true, recomendaciones: 98,
    esFEM: true,
    descripcion: 'Sede principal de la Fundación Mendoza en Venezuela. Atención integral, documentación y derivación hacia Colombia.'
  },
  {
    id: 'ORG12',
    nombre: 'Fundación Mendoza — Cúcuta',
    paisId: 'CO', ciudadId: 'CUC',
    tipo: 'Fundación privada',
    contacto: 'Carmen Villalba',
    email: 'cucuta@fundacionmendoza.org',
    telefono: '+57 7 5714400',
    servicios: ['TS01','TS02','TS03','TS04','TS05','TS07'],
    totalAtendidos: 972, activa: true, recomendaciones: 118,
    esFEM: true,
    descripcion: 'Nodo fronterizo más importante de la red FEM. Primer punto de atención tras el cruce Colombia–Venezuela. Atención 24h.'
  },
  {
    id: 'ORG13',
    nombre: 'Fundación Mendoza — Bogotá',
    paisId: 'CO', ciudadId: 'BOG',
    tipo: 'Fundación privada',
    contacto: 'Lucía Morales',
    email: 'bogota@fundacionmendoza.org',
    telefono: '+57 1 7115500',
    servicios: ['TS01','TS02','TS03','TS04','TS05','TS07','TS08'],
    totalAtendidos: 681, activa: true, recomendaciones: 82,
    esFEM: true,
    descripcion: 'Centro de referencia y relocalización de la red FEM en Colombia. Atención integral y reinserción laboral.'
  },
  {
    id: 'ORG14',
    nombre: 'Fundación Mendoza — Medellín',
    paisId: 'CO', ciudadId: 'MED',
    tipo: 'Fundación privada',
    contacto: 'Jorge Ríos',
    email: 'medellin@fundacionmendoza.org',
    telefono: '+57 4 4443300',
    servicios: ['TS01','TS02','TS03','TS05','TS07'],
    totalAtendidos: 535, activa: true, recomendaciones: 64,
    esFEM: true,
    descripcion: 'Punto de acogida en Medellín. Enfocado en familias y menores no acompañados en tránsito.'
  },
  {
    id: 'ORG15',
    nombre: 'Fundación Mendoza — Cali',
    paisId: 'CO', ciudadId: 'CAL',
    tipo: 'Fundación privada',
    contacto: 'Adriana Zapata',
    email: 'cali@fundacionmendoza.org',
    telefono: '+57 2 6618800',
    servicios: ['TS01','TS02','TS03','TS04','TS05'],
    totalAtendidos: 486, activa: true, recomendaciones: 57,
    esFEM: true,
    descripcion: 'Centro de atención en Cali para NNA y familias en tránsito hacia el Pacífico y Panamá.'
  },
  {
    id: 'ORG16',
    nombre: 'Fundación Mendoza — Barranquilla',
    paisId: 'CO', ciudadId: 'BAR',
    tipo: 'Fundación privada',
    contacto: 'Samuel Meza',
    email: 'barranquilla@fundacionmendoza.org',
    telefono: '+57 5 3852200',
    servicios: ['TS01','TS02','TS03','TS05','TS07'],
    totalAtendidos: 486, activa: true, recomendaciones: 57,
    esFEM: true,
    descripcion: 'Punto de atención en el Caribe colombiano. Atiende NNA que transitan por la costa norte.'
  },
  {
    id: 'ORG17',
    nombre: 'Fundación Mendoza — Cartagena',
    paisId: 'CO', ciudadId: 'CTG',
    tipo: 'Fundación privada',
    contacto: 'Paola Herrera',
    email: 'cartagena@fundacionmendoza.org',
    telefono: '+57 5 6603300',
    servicios: ['TS01','TS02','TS03','TS04','TS05'],
    totalAtendidos: 438, activa: true, recomendaciones: 52,
    esFEM: true,
    descripcion: 'Centro de acogida en Cartagena. Coordinación con embarcaciones del corredor Caribe y derivación hacia Panamá.'
  },
  {
    id: 'ORG18',
    nombre: 'Fundación Mendoza — Santa Marta',
    paisId: 'CO', ciudadId: 'SMA',
    tipo: 'Fundación privada',
    contacto: 'Diana Orozco',
    email: 'santamarta@fundacionmendoza.org',
    telefono: '+57 5 4311100',
    servicios: ['TS01','TS02','TS03','TS05'],
    totalAtendidos: 389, activa: true, recomendaciones: 44,
    esFEM: true,
    descripcion: 'Punto de atención en Santa Marta. Coordina con la red de albergues del corredor Caribe colombiano.'
  },
];

// ─── MIGRANTES ───────────────────────────────────────────────
// vulnerabilidad: 'alta' | 'media' | 'baja'

const MIGRANTES = [
  {
    id: 'M001',
    nombres: 'Luisa',
    apellidos: 'Vargas Mendoza',
    fechaNacimiento: '1991-03-14',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Casada', nivelEducativo: 'Universitario',
    idiomas: ['ES'], telefono: '+58 412 8823441', email: 'luisa.vargas@gmail.com',
    documentoTipo: 'Cédula', documentoNumero: 'V-18923441',
    paisOrigenId: 'VE', ciudadOrigenId: 'MAR',
    paisActualId: 'MX', ciudadActualId: 'TAP',
    estado: 'en_transito', nexoId: 'NX03', razonesIds: ['RE01','RE04'],
    ingresosId: 'GI03', orgActualId: 'ORG08',
    fechaRegistro: '2025-11-02',
    vulnerabilidad: 'alta',
    notas: 'Viaja con dos hijos menores de 7 y 4 años. Requiere apoyo urgente de refugio.',
    ruta: [
      { fecha:'2025-07-10', paisId:'VE', ciudadId:'MAR', orgId:'ORG02', servicios:['TS01','TS03'], obs:'Registro inicial. Salud general estable.' },
      { fecha:'2025-08-03', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01','TS02'], obs:'Cruzó frontera por Cúcuta. Atendida con hijos.' },
      { fecha:'2025-09-20', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS04','TS05'], obs:'Asesoría legal para documentación de menores.' },
      { fecha:'2025-10-14', paisId:'PA', ciudadId:'PTY', orgId:'ORG05', servicios:['TS01','TS02','TS03'], obs:'Atención post-Darién. Niños con deshidratación leve.' },
      { fecha:'2025-11-02', paisId:'MX', ciudadId:'TAP', orgId:'ORG08', servicios:['TS01','TS02'], obs:'En espera de resolución de solicitud migratoria.' },
    ]
  },
  {
    id: 'M002',
    nombres: 'Andrés Felipe',
    apellidos: 'Rondón Pérez',
    fechaNacimiento: '1988-11-22',
    generoId: 'M', nacionalidadId: 'VE',
    estadoCivil: 'Soltero', nivelEducativo: 'Técnico',
    idiomas: ['ES','EN'], telefono: '+58 424 3312900', email: 'andres.rondon@hotmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-AA381920',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'US', ciudadActualId: 'HOU',
    estado: 'ubicado', nexoId: 'NX01', razonesIds: ['RE01','RE08'],
    ingresosId: 'GI01', orgActualId: 'ORG10',
    fechaRegistro: '2025-04-15',
    vulnerabilidad: 'baja',
    notas: 'Tiene familiar en Houston. Proceso de regularización activo.',
    ruta: [
      { fecha:'2025-04-15', paisId:'VE', ciudadId:'CCS', orgId:'ORG01', servicios:['TS05'], obs:'Orientación legal previa a la salida.' },
      { fecha:'2025-05-08', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS05'], obs:'Trámite de documentación internacional.' },
      { fecha:'2025-06-01', paisId:'PA', ciudadId:'PTY', orgId:'ORG05', servicios:['TS06'], obs:'Apoyo logístico de transporte.' },
      { fecha:'2025-07-10', paisId:'MX', ciudadId:'CDM', orgId:'ORG09', servicios:['TS05','TS08'], obs:'Asesoría migratoria en CDMX.' },
      { fecha:'2025-08-20', paisId:'US', ciudadId:'HOU', orgId:'ORG10', servicios:['TS05','TS08'], obs:'Solicitud de asilo presentada. Empleo temporal activo.' },
    ]
  },
  {
    id: 'M003',
    nombres: 'Mariela',
    apellidos: 'Torres Alvarado',
    fechaNacimiento: '1995-07-03',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Unión libre', nivelEducativo: 'Secundario',
    idiomas: ['ES'], telefono: '+57 301 4421890', email: '',
    documentoTipo: 'Cédula', documentoNumero: 'V-22341109',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'CO', ciudadActualId: 'BOG',
    estado: 'atendido', nexoId: 'NX02', razonesIds: ['RE01','RE03'],
    ingresosId: 'GI03', orgActualId: 'ORG04',
    fechaRegistro: '2025-06-18',
    vulnerabilidad: 'alta',
    notas: 'Embarazada al momento del registro. Derivada a atención médica prioritaria.',
    ruta: [
      { fecha:'2025-06-18', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01','TS03'], obs:'Ingresó en estado gestacional avanzado.' },
      { fecha:'2025-07-12', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS03','TS04','TS05'], obs:'Parto exitoso. Recibiendo apoyo psicosocial.' },
    ]
  },
  {
    id: 'M004',
    nombres: 'Jean-Pierre',
    apellidos: 'Desrosiers',
    fechaNacimiento: '1983-02-09',
    generoId: 'M', nacionalidadId: 'HT',
    estadoCivil: 'Casado', nivelEducativo: 'Primario',
    idiomas: ['HT','FR'], telefono: '+509 3412 8800', email: '',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-HT039281',
    paisOrigenId: 'HT', ciudadOrigenId: 'PAP',
    paisActualId: 'CO', ciudadActualId: 'MED',
    estado: 'en_transito', nexoId: 'NX06', razonesIds: ['RE07','RE01'],
    ingresosId: 'GI05', orgActualId: 'ORG04',
    fechaRegistro: '2025-09-05',
    vulnerabilidad: 'alta',
    notas: 'Víctima de terremoto. No habla español. Requiere intérprete creole.',
    ruta: [
      { fecha:'2025-09-05', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS01','TS03','TS04'], obs:'Registro inicial. Asignado intérprete voluntario.' },
      { fecha:'2025-10-01', paisId:'CO', ciudadId:'MED', orgId:null, servicios:[], obs:'En tránsito hacia Panamá. Sin org registrada.' },
    ]
  },
  {
    id: 'M005',
    nombres: 'Valentina',
    apellidos: 'Castellanos Niño',
    fechaNacimiento: '2008-05-17',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'No aplica', nivelEducativo: 'Primario',
    idiomas: ['ES'], telefono: '', email: '',
    documentoTipo: 'Partida de nacimiento', documentoNumero: 'PAN-2008-441',
    paisOrigenId: 'VE', ciudadOrigenId: 'MAR',
    paisActualId: 'PA', ciudadActualId: 'PTY',
    estado: 'atendido', nexoId: 'NX01', razonesIds: ['RE01'],
    ingresosId: 'GI04', orgActualId: 'ORG05',
    fechaRegistro: '2025-10-22',
    vulnerabilidad: 'alta',
    notas: 'Menor de edad, viaja con madre (M001). Programa educativo activo.',
    ruta: [
      { fecha:'2025-08-10', paisId:'VE', ciudadId:'CCS', orgId:'ORG01', servicios:['TS01'], obs:'Orientación previa a la salida. Viaja con madre (M001).' },
      { fecha:'2025-09-05', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01','TS02'], obs:'Cruce fronterizo. Atención humanitaria junto a su madre.' },
      { fecha:'2025-10-22', paisId:'PA', ciudadId:'PTY', orgId:'ORG05', servicios:['TS01','TS02','TS03','TS07'], obs:'Atención integral. Ingresada a programa educativo temporal.' },
    ]
  },
  {
    id: 'M006',
    nombres: 'Carlos Eduardo',
    apellidos: 'Molina Ureña',
    fechaNacimiento: '1979-08-30',
    generoId: 'M', nacionalidadId: 'VE',
    estadoCivil: 'Divorciado', nivelEducativo: 'Universitario',
    idiomas: ['ES','EN'], telefono: '+52 55 8810 2244', email: 'cmolina79@yahoo.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-AA219033',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'MX', ciudadActualId: 'CDM',
    estado: 'derivado', nexoId: 'NX03', razonesIds: ['RE06','RE01'],
    ingresosId: 'GI02', orgActualId: 'ORG09',
    fechaRegistro: '2025-07-03',
    vulnerabilidad: 'media',
    notas: 'Ex funcionario público. Solicitud de refugio por persecución política.',
    ruta: [
      { fecha:'2025-07-03', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS05'], obs:'Ingresó con documentación parcial.' },
      { fecha:'2025-07-28', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS05','TS04'], obs:'Expediente de refugio abierto.' },
      { fecha:'2025-08-15', paisId:'CR', ciudadId:'SJO', orgId:'ORG07', servicios:['TS05'], obs:'Tramitación en tránsito.' },
      { fecha:'2025-09-10', paisId:'MX', ciudadId:'TAP', orgId:'ORG08', servicios:['TS01','TS05'], obs:'Registro en aduana mexicana.' },
      { fecha:'2025-10-05', paisId:'MX', ciudadId:'CDM', orgId:'ORG09', servicios:['TS04','TS05','TS08'], obs:'Derivado a programa de integración.' },
    ]
  },
  {
    id: 'M007',
    nombres: 'Fátima',
    apellidos: 'Guerrero Salgado',
    fechaNacimiento: '1997-12-01',
    generoId: 'F', nacionalidadId: 'EC',
    estadoCivil: 'Soltera', nivelEducativo: 'Universitario',
    idiomas: ['ES'], telefono: '+57 310 9924010', email: 'fatima.guerrero@gmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-EC092821',
    paisOrigenId: 'EC', ciudadOrigenId: 'GYE',
    paisActualId: 'CO', ciudadActualId: 'BOG',
    estado: 'atendido', nexoId: 'NX05', razonesIds: ['RE08','RE04'],
    ingresosId: 'GI02', orgActualId: 'ORG04',
    fechaRegistro: '2025-08-11',
    vulnerabilidad: 'baja',
    notas: 'Profesional de enfermería. Interesada en validación de títulos.',
    ruta: [
      { fecha:'2025-06-20', paisId:'VE', ciudadId:'MAR', orgId:'ORG02', servicios:['TS01'], obs:'Registro previo. Planificación de ruta migratoria.' },
      { fecha:'2025-07-15', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01'], obs:'Cruce por Cúcuta. Tránsito rápido hacia Bogotá.' },
      { fecha:'2025-08-11', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS05','TS08'], obs:'Orientación laboral y validación de títulos.' },
    ]
  },
  {
    id: 'M008',
    nombres: 'Ricardo José',
    apellidos: 'Blanco Escalona',
    fechaNacimiento: '1973-04-25',
    generoId: 'M', nacionalidadId: 'VE',
    estadoCivil: 'Casado', nivelEducativo: 'Secundario',
    idiomas: ['ES'], telefono: '+507 66 3312 00', email: '',
    documentoTipo: 'Cédula', documentoNumero: 'V-10341229',
    paisOrigenId: 'VE', ciudadOrigenId: 'MAR',
    paisActualId: 'PA', ciudadActualId: 'DAV',
    estado: 'en_transito', nexoId: 'NX02', razonesIds: ['RE03','RE01'],
    ingresosId: 'GI03', orgActualId: 'ORG06',
    fechaRegistro: '2025-10-09',
    vulnerabilidad: 'media',
    notas: 'Cruzó el Darién con grupo familiar. Esposa registrada por separado.',
    ruta: [
      { fecha:'2025-09-01', paisId:'VE', ciudadId:'MAR', orgId:'ORG02', servicios:['TS01'], obs:'Salida documentada.' },
      { fecha:'2025-09-22', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01','TS02'], obs:'Cruce fronterizo tranquilo.' },
      { fecha:'2025-10-09', paisId:'PA', ciudadId:'DAV', orgId:'ORG06', servicios:['TS03'], obs:'Revisión médica post-Darién. Sin lesiones graves.' },
    ]
  },
  {
    id: 'M009',
    nombres: 'Yolanda',
    apellidos: 'Figueroa Ramos',
    fechaNacimiento: '1985-09-14',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Viuda', nivelEducativo: 'Técnico',
    idiomas: ['ES'], telefono: '+506 8812 7733', email: 'yolanda.fig85@gmail.com',
    documentoTipo: 'Cédula', documentoNumero: 'V-14892200',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'CR', ciudadActualId: 'SJO',
    estado: 'atendido', nexoId: 'NX03', razonesIds: ['RE01','RE02'],
    ingresosId: 'GI03', orgActualId: 'ORG07',
    fechaRegistro: '2025-08-29',
    vulnerabilidad: 'media',
    notas: 'Tiene hijo de 3 años. Busca reunificación con hermana en Costa Rica.',
    ruta: [
      { fecha:'2025-07-14', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01','TS02'], obs:'Tránsito rápido.' },
      { fecha:'2025-08-01', paisId:'PA', ciudadId:'PTY', orgId:'ORG05', servicios:['TS01','TS03'], obs:'Atención médica al menor.' },
      { fecha:'2025-08-29', paisId:'CR', ciudadId:'SJO', orgId:'ORG07', servicios:['TS04','TS07'], obs:'Inscrita en programa de apoyo a madres solas.' },
    ]
  },
  {
    id: 'M010',
    nombres: 'Sofía Alejandra',
    apellidos: 'Mendoza Carpio',
    fechaNacimiento: '2011-01-20',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'No aplica', nivelEducativo: 'Primario',
    idiomas: ['ES'], telefono: '', email: '',
    documentoTipo: 'Partida de nacimiento', documentoNumero: 'PAN-2011-882',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'CR', ciudadActualId: 'SJO',
    estado: 'atendido', nexoId: 'NX01', razonesIds: ['RE01'],
    ingresosId: 'GI04', orgActualId: 'ORG07',
    fechaRegistro: '2025-08-29',
    vulnerabilidad: 'media',
    notas: 'Hija de Yolanda Figueroa (M009). Programa escolar activo.',
    ruta: [
      { fecha:'2025-07-14', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01','TS02'], obs:'Tránsito con madre (M009). Atención básica familiar.' },
      { fecha:'2025-08-01', paisId:'PA', ciudadId:'PTY', orgId:'ORG05', servicios:['TS01','TS03'], obs:'Atención pediátrica. Evaluación médica general.' },
      { fecha:'2025-08-29', paisId:'CR', ciudadId:'SJO', orgId:'ORG07', servicios:['TS07','TS01'], obs:'Integrada al programa educativo del centro.' },
    ]
  },
  {
    id: 'M011',
    nombres: 'Diego Armando',
    apellidos: 'Suárez Velandia',
    fechaNacimiento: '1990-06-07',
    generoId: 'M', nacionalidadId: 'CO',
    estadoCivil: 'Unión libre', nivelEducativo: 'Secundario',
    idiomas: ['ES'], telefono: '+52 962 1100 883', email: '',
    documentoTipo: 'Cédula', documentoNumero: 'CC-1013398210',
    paisOrigenId: 'CO', ciudadOrigenId: 'MED',
    paisActualId: 'MX', ciudadActualId: 'TAP',
    estado: 'en_transito', nexoId: 'NX02', razonesIds: ['RE03','RE04'],
    ingresosId: 'GI03', orgActualId: 'ORG08',
    fechaRegistro: '2025-11-14',
    vulnerabilidad: 'media',
    notas: 'Desplazado interno que cruzó hacia México. Solicita protección.',
    ruta: [
      { fecha:'2025-10-10', paisId:'CO', ciudadId:'MED', orgId:null, servicios:[], obs:'Salida sin registro previo.' },
      { fecha:'2025-11-14', paisId:'MX', ciudadId:'TAP', orgId:'ORG08', servicios:['TS01','TS02','TS05'], obs:'Primer contacto. Solicitud de protección internacional.' },
    ]
  },
  {
    id: 'M012',
    nombres: 'Ana Lucía',
    apellidos: 'Pacheco Díaz',
    fechaNacimiento: '1993-10-30',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Soltera', nivelEducativo: 'Universitario',
    idiomas: ['ES','EN'], telefono: '+1 713 449 2211', email: 'analpacheco93@gmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-AA447710',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'US', ciudadActualId: 'HOU',
    estado: 'ubicado', nexoId: 'NX01', razonesIds: ['RE08','RE01'],
    ingresosId: 'GI01', orgActualId: 'ORG10',
    fechaRegistro: '2025-03-10',
    vulnerabilidad: 'baja',
    notas: 'Ingresó con visa de trabajo. Proceso de residencia permanente en curso.',
    ruta: [
      { fecha:'2025-03-10', paisId:'VE', ciudadId:'CCS', orgId:'ORG01', servicios:['TS05'], obs:'Orientación previa a salida.' },
      { fecha:'2025-03-28', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS05'], obs:'Apoyo documental.' },
      { fecha:'2025-04-20', paisId:'MX', ciudadId:'CDM', orgId:'ORG09', servicios:['TS05'], obs:'Trámite consular.' },
      { fecha:'2025-05-15', paisId:'US', ciudadId:'HOU', orgId:'ORG10', servicios:['TS08'], obs:'Empleo en sector salud. Caso cerrado satisfactoriamente.' },
    ]
  },
  {
    id: 'M013',
    nombres: 'Oswaldo',
    apellidos: 'Herrera Contreras',
    fechaNacimiento: '1980-03-18',
    generoId: 'M', nacionalidadId: 'VE',
    estadoCivil: 'Casado', nivelEducativo: 'Primario',
    idiomas: ['ES'], telefono: '+58 416 5541123', email: '',
    documentoTipo: 'Cédula', documentoNumero: 'V-11003881',
    paisOrigenId: 'VE', ciudadOrigenId: 'MAR',
    paisActualId: 'VE', ciudadActualId: 'CCS',
    estado: 'en_transito', nexoId: 'NX06', razonesIds: ['RE01','RE04'],
    ingresosId: 'GI05', orgActualId: 'ORG11',
    fechaRegistro: '2025-11-20',
    vulnerabilidad: 'alta',
    notas: 'Buscando asesoramiento antes de emprender ruta hacia Colombia. Registrado en Fundación Mendoza.',
    ruta: [
      { fecha:'2025-11-20', paisId:'VE', ciudadId:'CCS', orgId:'ORG11', servicios:['TS01','TS05'], obs:'Primer registro. Orientación de ruta.' },
    ]
  },
  {
    id: 'M014',
    nombres: 'Keyla',
    apellidos: 'Montoya Barrios',
    fechaNacimiento: '1999-07-22',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Soltera', nivelEducativo: 'Técnico',
    idiomas: ['ES'], telefono: '+507 6481 9020', email: 'keylamontoya@outlook.com',
    documentoTipo: 'Cédula', documentoNumero: 'V-26441009',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'PA', ciudadActualId: 'PTY',
    estado: 'derivado', nexoId: 'NX03', razonesIds: ['RE04','RE08'],
    ingresosId: 'GI02', orgActualId: 'ORG05',
    fechaRegistro: '2025-09-30',
    vulnerabilidad: 'media',
    notas: 'Técnica en contabilidad. Derivada a programa de empleo en Panamá.',
    ruta: [
      { fecha:'2025-09-01', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01'], obs:'Tránsito rápido.' },
      { fecha:'2025-09-30', paisId:'PA', ciudadId:'PTY', orgId:'ORG05', servicios:['TS01','TS08'], obs:'Derivada a bolsa de empleo local.' },
    ]
  },
  {
    id: 'M015',
    nombres: 'Mamoudou',
    apellidos: 'Diallo',
    fechaNacimiento: '1994-11-05',
    generoId: 'M', nacionalidadId: 'HT',
    estadoCivil: 'Soltero', nivelEducativo: 'Secundario',
    idiomas: ['HT','FR','EN'], telefono: '+52 55 9988 1122', email: '',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-HT112233',
    paisOrigenId: 'HT', ciudadOrigenId: 'PAP',
    paisActualId: 'MX', ciudadActualId: 'CDM',
    estado: 'en_transito', nexoId: 'NX05', razonesIds: ['RE07','RE08'],
    ingresosId: 'GI05', orgActualId: 'ORG09',
    fechaRegistro: '2025-10-18',
    vulnerabilidad: 'alta',
    notas: 'Habla inglés y francés. Sin red de apoyo en México. Solicita protección.',
    ruta: [
      { fecha:'2025-08-20', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS01','TS04'], obs:'Primera atención. Intérprete asignado.' },
      { fecha:'2025-09-15', paisId:'CR', ciudadId:'SJO', orgId:'ORG07', servicios:['TS03','TS05'], obs:'Atención médica y apoyo legal.' },
      { fecha:'2025-10-18', paisId:'MX', ciudadId:'CDM', orgId:'ORG09', servicios:['TS04','TS05'], obs:'En proceso de solicitud de refugio.' },
    ]
  },
  {
    id: 'M016',
    nombres: 'Gabriela Inés',
    apellidos: 'Acosta Reyes',
    fechaNacimiento: '1987-01-09',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Casada', nivelEducativo: 'Universitario',
    idiomas: ['ES'], telefono: '+506 8933 4410', email: 'gacosta87@gmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-AA380100',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'CR', ciudadActualId: 'SJO',
    estado: 'atendido', nexoId: 'NX02', razonesIds: ['RE02','RE01'],
    ingresosId: 'GI02', orgActualId: 'ORG07',
    fechaRegistro: '2025-07-21',
    vulnerabilidad: 'baja',
    notas: 'Médica venezolana. Proceso de validación de título en curso en Costa Rica.',
    ruta: [
      { fecha:'2025-06-10', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS05'], obs:'Orientación para validación profesional.' },
      { fecha:'2025-07-21', paisId:'CR', ciudadId:'SJO', orgId:'ORG07', servicios:['TS05','TS08'], obs:'Derivada al Colegio de Médicos de Costa Rica.' },
    ]
  },
  {
    id: 'M017',
    nombres: 'Luis Ernesto',
    apellidos: 'Paredes Ibáñez',
    fechaNacimiento: '2005-03-29',
    generoId: 'M', nacionalidadId: 'VE',
    estadoCivil: 'Soltero', nivelEducativo: 'Secundario incompleto',
    idiomas: ['ES'], telefono: '', email: '',
    documentoTipo: 'Cédula juvenil', documentoNumero: 'V-29880441',
    paisOrigenId: 'VE', ciudadOrigenId: 'MAR',
    paisActualId: 'CO', ciudadActualId: 'CUC',
    estado: 'en_transito', nexoId: 'NX06', razonesIds: ['RE01','RE03'],
    ingresosId: 'GI05', orgActualId: 'ORG03',
    fechaRegistro: '2025-11-01',
    vulnerabilidad: 'alta',
    notas: 'Menor no acompañado (19 años). Sin documentos completos. Requiere seguimiento urgente.',
    ruta: [
      { fecha:'2025-10-10', paisId:'VE', ciudadId:'SCR', orgId:null, servicios:[], obs:'Salida desde San Cristóbal. Viajaba en grupo informal sin adulto referente.' },
      { fecha:'2025-11-01', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01','TS02','TS04'], obs:'Llegó sin acompañante. Protocolo de menor activado.' },
    ]
  },
  {
    id: 'M018',
    nombres: 'Patricia Elena',
    apellidos: 'Villalobos Quesada',
    fechaNacimiento: '1982-08-12',
    generoId: 'F', nacionalidadId: 'CO',
    estadoCivil: 'Separada', nivelEducativo: 'Universitario',
    idiomas: ['ES'], telefono: '+52 962 881 0099', email: 'patvillalobos@gmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-CO881122',
    paisOrigenId: 'CO', ciudadOrigenId: 'BOG',
    paisActualId: 'MX', ciudadActualId: 'TAP',
    estado: 'derivado', nexoId: 'NX04', razonesIds: ['RE03','RE06'],
    ingresosId: 'GI03', orgActualId: 'ORG08',
    fechaRegistro: '2025-10-30',
    vulnerabilidad: 'alta',
    notas: 'Periodista. Solicita refugio por amenazas documentadas.',
    ruta: [
      { fecha:'2025-10-01', paisId:'CR', ciudadId:'SJO', orgId:'ORG07', servicios:['TS05','TS04'], obs:'Primera atención. Caso derivado a ACNUR.' },
      { fecha:'2025-10-30', paisId:'MX', ciudadId:'TAP', orgId:'ORG08', servicios:['TS05'], obs:'Trámite de reconocimiento de refugiado activo.' },
    ]
  },
  {
    id: 'M019',
    nombres: 'Reinaldo',
    apellidos: 'Marcano Tovar',
    fechaNacimiento: '1976-06-17',
    generoId: 'M', nacionalidadId: 'VE',
    estadoCivil: 'Casado', nivelEducativo: 'Técnico',
    idiomas: ['ES'], telefono: '+58 414 9912300', email: '',
    documentoTipo: 'Cédula', documentoNumero: 'V-8881773',
    paisOrigenId: 'VE', ciudadOrigenId: 'MAR',
    paisActualId: 'VE', ciudadActualId: 'CCS',
    estado: 'en_transito', nexoId: 'NX06', razonesIds: ['RE01','RE04'],
    ingresosId: 'GI05', orgActualId: 'ORG11',
    fechaRegistro: '2025-11-25',
    vulnerabilidad: 'alta',
    notas: 'Buscando asesoramiento antes de emprender ruta hacia Colombia. En Fundación Mendoza.',
    ruta: [
      { fecha:'2025-11-25', paisId:'VE', ciudadId:'CCS', orgId:'ORG11', servicios:['TS01','TS05'], obs:'Registro inicial. Orientación de ruta.' },
    ]
  },
  {
    id: 'M020',
    nombres: 'Camila',
    apellidos: 'Rodríguez Ávila',
    fechaNacimiento: '2000-09-03',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Soltera', nivelEducativo: 'Universitario incompleto',
    idiomas: ['ES'], telefono: '+52 55 6612 0011', email: 'camila.rodrigz@gmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-AA551800',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'MX', ciudadActualId: 'CDM',
    estado: 'atendido', nexoId: 'NX05', razonesIds: ['RE08','RE04'],
    ingresosId: 'GI02', orgActualId: 'ORG09',
    fechaRegistro: '2025-09-14',
    vulnerabilidad: 'baja',
    notas: 'Estudiante universitaria. Trabaja como asistente administrativa.',
    ruta: [
      { fecha:'2025-08-01', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS05'], obs:'Orientación.' },
      { fecha:'2025-08-25', paisId:'PA', ciudadId:'PTY', orgId:'ORG05', servicios:['TS01','TS06'], obs:'Tránsito.' },
      { fecha:'2025-09-14', paisId:'MX', ciudadId:'CDM', orgId:'ORG09', servicios:['TS08'], obs:'Inserción laboral exitosa.' },
    ]
  },
  {
    id: 'M021',
    nombres: 'Frank',
    apellidos: 'Domínguez Castillo',
    fechaNacimiento: '1986-11-28',
    generoId: 'M', nacionalidadId: 'CU',
    estadoCivil: 'Soltero', nivelEducativo: 'Universitario',
    idiomas: ['ES'], telefono: '+52 962 7743 9900', email: 'frank.dom@protonmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-CU390011',
    paisOrigenId: 'CU', ciudadOrigenId: null,
    paisActualId: 'MX', ciudadActualId: 'TAP',
    estado: 'en_transito', nexoId: 'NX02', razonesIds: ['RE06','RE08'],
    ingresosId: 'GI03', orgActualId: 'ORG08',
    fechaRegistro: '2025-11-08',
    vulnerabilidad: 'media',
    notas: 'Ingeniero. Ruta Cuba→Ecuador→Colombia→México. Solicita asilo.',
    ruta: [
      { fecha:'2025-09-05', paisId:'EC', ciudadId:'GYE', orgId:null, servicios:[], obs:'Entrada por Ecuador sin registro.' },
      { fecha:'2025-10-01', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01'], obs:'Registro en Colombia.' },
      { fecha:'2025-11-08', paisId:'MX', ciudadId:'TAP', orgId:'ORG08', servicios:['TS01','TS05'], obs:'Solicitud de asilo en México.' },
    ]
  },
  {
    id: 'M022',
    nombres: 'Heidi Margarita',
    apellidos: 'Useche Bravo',
    fechaNacimiento: '1970-02-14',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Viuda', nivelEducativo: 'Primario',
    idiomas: ['ES'], telefono: '', email: '',
    documentoTipo: 'Cédula', documentoNumero: 'V-6441992',
    paisOrigenId: 'VE', ciudadOrigenId: 'MAR',
    paisActualId: 'CO', ciudadActualId: 'CUC',
    estado: 'atendido', nexoId: 'NX03', razonesIds: ['RE01','RE05'],
    ingresosId: 'GI04', orgActualId: 'ORG03',
    fechaRegistro: '2025-10-17',
    vulnerabilidad: 'alta',
    notas: 'Adulta mayor. Necesita medicamentos crónicos. Sola, sin red familiar.',
    ruta: [
      { fecha:'2025-09-20', paisId:'VE', ciudadId:'MAR', orgId:'ORG02', servicios:['TS01','TS03'], obs:'Registro previo. Condición médica crónica documentada.' },
      { fecha:'2025-10-17', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01','TS02','TS03','TS04'], obs:'Atención urgente. Medicamentos gestionados.' },
    ]
  },
  {
    id: 'M023',
    nombres: 'Javier Alejandro',
    apellidos: 'Salas Mendoza',
    fechaNacimiento: '1992-05-11',
    generoId: 'M', nacionalidadId: 'EC',
    estadoCivil: 'Casado', nivelEducativo: 'Secundario',
    idiomas: ['ES'], telefono: '+57 300 2219944', email: '',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-EC441122',
    paisOrigenId: 'EC', ciudadOrigenId: 'GYE',
    paisActualId: 'CO', ciudadActualId: 'BOG',
    estado: 'atendido', nexoId: 'NX02', razonesIds: ['RE04','RE01'],
    ingresosId: 'GI03', orgActualId: 'ORG04',
    fechaRegistro: '2025-09-25',
    vulnerabilidad: 'media',
    notas: 'Albañil. Busca trabajo en Bogotá. Esposa en Ecuador.',
    ruta: [
      { fecha:'2025-08-05', paisId:'EC', ciudadId:'GYE', orgId:null, servicios:[], obs:'Salida de Guayaquil. Viaje terrestre hacia Colombia.' },
      { fecha:'2025-09-01', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01'], obs:'Cruce fronterizo. Registro básico.' },
      { fecha:'2025-09-25', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS01','TS08'], obs:'Orientación laboral en sector construcción.' },
    ]
  },
  {
    id: 'M024',
    nombres: 'Nathalia',
    apellidos: 'Bermúdez Oropeza',
    fechaNacimiento: '2003-12-07',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Soltera', nivelEducativo: 'Secundario',
    idiomas: ['ES'], telefono: '+1 713 339 4411', email: 'nathalia.bermudez@gmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-AA819303',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'US', ciudadActualId: 'MIA',
    estado: 'ubicado', nexoId: 'NX01', razonesIds: ['RE02','RE08'],
    ingresosId: 'GI01', orgActualId: 'ORG10',
    fechaRegistro: '2025-02-20',
    vulnerabilidad: 'baja',
    notas: 'Reunificada con madre en Miami. Trabajando y estudiando inglés.',
    ruta: [
      { fecha:'2025-02-20', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS05'], obs:'Apoyo documental.' },
      { fecha:'2025-03-10', paisId:'MX', ciudadId:'CDM', orgId:'ORG09', servicios:['TS05'], obs:'Trámite visa.' },
      { fecha:'2025-04-01', paisId:'US', ciudadId:'MIA', orgId:'ORG10', servicios:['TS07','TS08'], obs:'Integración exitosa. Caso cerrado.' },
    ]
  },

  // ── MIGRANTES M025–M030 (nuevos) ─────────────────────────

  {
    id: 'M025',
    nombres: 'Wendys Paola',
    apellidos: 'Mejía Pineda',
    fechaNacimiento: '1996-04-11',
    generoId: 'F', nacionalidadId: 'HN',
    estadoCivil: 'Soltera', nivelEducativo: 'Secundario',
    idiomas: ['ES'], telefono: '+502 4422 9900', email: '',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-HN220411',
    paisOrigenId: 'HN', ciudadOrigenId: 'TGU',
    paisActualId: 'GT', ciudadActualId: 'GUA',
    estado: 'en_transito', nexoId: 'NX05', razonesIds: ['RE03','RE04'],
    ingresosId: 'GI05', orgActualId: null,
    fechaRegistro: '2025-11-10',
    vulnerabilidad: 'alta',
    notas: 'Huyó de violencia doméstica. Viaja con hija de 2 años. Sin recursos.',
    ruta: [
      { fecha:'2025-10-20', paisId:'HN', ciudadId:'TGU', orgId:null, servicios:[], obs:'Salida por violencia. Sin registro previo.' },
      { fecha:'2025-11-10', paisId:'GT', ciudadId:'GUA', orgId:null, servicios:['TS01','TS02'], obs:'Atendida informalmente en albergue comunitario.' },
    ]
  },
  {
    id: 'M026',
    nombres: 'Rosa Elena',
    apellidos: 'Xic Tujal',
    fechaNacimiento: '1988-08-05',
    generoId: 'F', nacionalidadId: 'GT',
    estadoCivil: 'Casada', nivelEducativo: 'Primario',
    idiomas: ['ES','QU'], telefono: '+52 962 5531 88', email: '',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-GT880805',
    paisOrigenId: 'GT', ciudadOrigenId: 'GUA',
    paisActualId: 'MX', ciudadActualId: 'TAP',
    estado: 'en_transito', nexoId: 'NX02', razonesIds: ['RE04','RE01'],
    ingresosId: 'GI05', orgActualId: 'ORG08',
    fechaRegistro: '2025-10-28',
    vulnerabilidad: 'alta',
    notas: 'Habla quiché y español básico. Analfabeta funcional. Tres hijos menores.',
    ruta: [
      { fecha:'2025-09-10', paisId:'GT', ciudadId:'GUA', orgId:null, servicios:[], obs:'Salida de Ciudad de Guatemala en grupo familiar numeroso.' },
      { fecha:'2025-10-28', paisId:'MX', ciudadId:'TAP', orgId:'ORG08', servicios:['TS01','TS02','TS03'], obs:'Atención integral. Evaluación médica de menores.' },
    ]
  },
  {
    id: 'M027',
    nombres: 'Claudia Milagros',
    apellidos: 'Quispe Huanca',
    fechaNacimiento: '1984-12-22',
    generoId: 'F', nacionalidadId: 'PE',
    estadoCivil: 'Divorciada', nivelEducativo: 'Técnico',
    idiomas: ['ES'], telefono: '+57 318 4410092', email: 'cquispe@gmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-PE841222',
    paisOrigenId: 'PE', ciudadOrigenId: 'LIM',
    paisActualId: 'CO', ciudadActualId: 'BOG',
    estado: 'derivado', nexoId: 'NX03', razonesIds: ['RE04','RE08'],
    ingresosId: 'GI02', orgActualId: 'ORG04',
    fechaRegistro: '2025-08-19',
    vulnerabilidad: 'media',
    notas: 'Técnica en gastronomía. Busca empleo formal. Derivada a bolsa de trabajo regional.',
    ruta: [
      { fecha:'2025-06-15', paisId:'PE', ciudadId:'LIM', orgId:null, servicios:[], obs:'Salida de Lima. Ruta terrestre hacia Colombia.' },
      { fecha:'2025-07-20', paisId:'EC', ciudadId:'GYE', orgId:null, servicios:['TS01'], obs:'Tránsito por Guayaquil. Apoyo humanitario informal.' },
      { fecha:'2025-08-19', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS08','TS05'], obs:'Orientación laboral. Verificación de títulos.' },
    ]
  },
  {
    id: 'M028',
    nombres: 'Gregorio José',
    apellidos: 'Sandoval Parra',
    fechaNacimiento: '1977-07-14',
    generoId: 'M', nacionalidadId: 'VE',
    estadoCivil: 'Casado', nivelEducativo: 'Universitario',
    idiomas: ['ES','EN'], telefono: '+506 7744 3300', email: 'gsandoval@hotmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-AA772200',
    paisOrigenId: 'VE', ciudadOrigenId: 'CCS',
    paisActualId: 'CR', ciudadActualId: 'SJO',
    estado: 'atendido', nexoId: 'NX01', razonesIds: ['RE06','RE01'],
    ingresosId: 'GI02', orgActualId: 'ORG07',
    fechaRegistro: '2025-07-08',
    vulnerabilidad: 'media',
    notas: 'Docente universitario. Apoya voluntariamente en talleres del centro mientras tramita visa.',
    ruta: [
      { fecha:'2025-05-20', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS05'], obs:'Asesoría inicial.' },
      { fecha:'2025-06-15', paisId:'PA', ciudadId:'PTY', orgId:'ORG05', servicios:['TS01','TS06'], obs:'Tránsito con familia.' },
      { fecha:'2025-07-08', paisId:'CR', ciudadId:'SJO', orgId:'ORG07', servicios:['TS05','TS07'], obs:'Voluntario en talleres educativos. Proceso migratorio activo.' },
    ]
  },
  {
    id: 'M029',
    nombres: 'Darlenis',
    apellidos: 'Soto Pérez',
    fechaNacimiento: '2001-02-28',
    generoId: 'F', nacionalidadId: 'VE',
    estadoCivil: 'Soltera', nivelEducativo: 'Secundario',
    idiomas: ['ES'], telefono: '+52 55 8811 4422', email: 'darlenis.soto@gmail.com',
    documentoTipo: 'Cédula', documentoNumero: 'V-27991010',
    paisOrigenId: 'VE', ciudadOrigenId: 'MAR',
    paisActualId: 'MX', ciudadActualId: 'CDM',
    estado: 'en_transito', nexoId: 'NX02', razonesIds: ['RE01','RE08'],
    ingresosId: 'GI03', orgActualId: 'ORG09',
    fechaRegistro: '2025-10-05',
    vulnerabilidad: 'media',
    notas: 'Joven sola. Trabaja de vendedora informal. Solicita orientación para regularizarse.',
    ruta: [
      { fecha:'2025-08-12', paisId:'CO', ciudadId:'CUC', orgId:'ORG03', servicios:['TS01'], obs:'Tránsito.' },
      { fecha:'2025-09-01', paisId:'PA', ciudadId:'PTY', orgId:'ORG05', servicios:['TS01','TS02'], obs:'Albergue 3 días.' },
      { fecha:'2025-09-25', paisId:'MX', ciudadId:'TAP', orgId:'ORG08', servicios:['TS01','TS05'], obs:'Registro en frontera sur.' },
      { fecha:'2025-10-05', paisId:'MX', ciudadId:'CDM', orgId:'ORG09', servicios:['TS05','TS08'], obs:'Orientación migratoria. Empleo informal activo.' },
    ]
  },
  {
    id: 'M030',
    nombres: 'Marcos Antonio',
    apellidos: 'Estrada Fuentes',
    fechaNacimiento: '1982-10-17',
    generoId: 'M', nacionalidadId: 'CU',
    estadoCivil: 'Casado', nivelEducativo: 'Universitario',
    idiomas: ['ES','EN'], telefono: '+1 305 441 9921', email: 'marcosestrada@gmail.com',
    documentoTipo: 'Pasaporte', documentoNumero: 'P-CU820019',
    paisOrigenId: 'CU', ciudadOrigenId: null,
    paisActualId: 'US', ciudadActualId: 'MIA',
    estado: 'ubicado', nexoId: 'NX01', razonesIds: ['RE06','RE08'],
    ingresosId: 'GI01', orgActualId: 'ORG10',
    fechaRegistro: '2025-01-15',
    vulnerabilidad: 'baja',
    notas: 'Médico. Solicitó asilo. Reunificado con esposa. Empleo en clínica privada.',
    ruta: [
      { fecha:'2025-01-15', paisId:'CO', ciudadId:'BOG', orgId:'ORG04', servicios:['TS05'], obs:'Asesoría legal para asilo.' },
      { fecha:'2025-02-10', paisId:'MX', ciudadId:'CDM', orgId:'ORG09', servicios:['TS05'], obs:'Tramitación consular.' },
      { fecha:'2025-03-05', paisId:'US', ciudadId:'MIA', orgId:'ORG10', servicios:['TS05','TS08'], obs:'Asilo aprobado. Integración laboral exitosa.' },
    ]
  },
];

// ─── ESTADÍSTICAS AGREGADAS MOCK ────────────────────────────
// Representan el universo real del sistema (no solo la muestra de 30)

const MOCK_STATS = {
  totalRegistros: 4862,
  ninos: 2722,              // 55.98% masculino
  ninas: 2140,              // 44.02% femenino
  familias: 1217,
  datosPendientes: 391,
  pctDuplicados: 0.48,

  // Trazabilidad: NNA acompañados en más de un punto de la red
  nnaMultiplesPuntos: 2917, // 60% — acompañados en trayectoria
  nnaUnicoPunto:      1945, // 40% — atendidos en un solo punto
  pctMultiplesPuntos: 60,

  // Atenciones acumuladas (NNA únicos × promedio de puntos visitados)
  // 1.945 × 1 + 2.917 × 2 = 7.779
  atencionesCumuladas: 7779,

  // Distribución por ciudad — Red territorial FEM
  distribucionCiudadesFEM: [
    { ciudadId:'CUC', label:'Cúcuta',       paisId:'CO', paisLabel:'Colombia',  pct:20, nnaUnicos: 972, atenciones:1556, multiPunto:583 },
    { ciudadId:'CCS', label:'Caracas',      paisId:'VE', paisLabel:'Venezuela', pct:18, nnaUnicos: 875, atenciones:1400, multiPunto:525 },
    { ciudadId:'BOG', label:'Bogotá',       paisId:'CO', paisLabel:'Colombia',  pct:14, nnaUnicos: 681, atenciones:1089, multiPunto:408 },
    { ciudadId:'MED', label:'Medellín',     paisId:'CO', paisLabel:'Colombia',  pct:11, nnaUnicos: 535, atenciones: 856, multiPunto:321 },
    { ciudadId:'CAL', label:'Cali',         paisId:'CO', paisLabel:'Colombia',  pct:10, nnaUnicos: 486, atenciones: 778, multiPunto:292 },
    { ciudadId:'BAR', label:'Barranquilla', paisId:'CO', paisLabel:'Colombia',  pct:10, nnaUnicos: 486, atenciones: 778, multiPunto:292 },
    { ciudadId:'CTG', label:'Cartagena',    paisId:'CO', paisLabel:'Colombia',  pct: 9, nnaUnicos: 438, atenciones: 700, multiPunto:263 },
    { ciudadId:'SMA', label:'Santa Marta',  paisId:'CO', paisLabel:'Colombia',  pct: 8, nnaUnicos: 389, atenciones: 622, multiPunto:233 },
  ],

  // Distribución institucional — Fundación Mendoza (FEM)
  femVsOtras: {
    fem:        100, // 100% de los NNA atendidos por FEM (Fundación Mendoza)
    otras:        0,
    femTotal:  4862, // Total NNA atendidos por FEM
    otrasTotal:   0,
  },

  historico: [
    { mes: '2025-05', label: 'May 25', total: 4362 },
    { mes: '2025-06', label: 'Jun 25', total: 4408 },
    { mes: '2025-07', label: 'Jul 25', total: 4451 },
    { mes: '2025-08', label: 'Ago 25', total: 4474 },
    { mes: '2025-09', label: 'Sep 25', total: 4484 },
    { mes: '2025-10', label: 'Oct 25', total: 4494 },
    { mes: '2025-11', label: 'Nov 25', total: 4534 },
    { mes: '2025-12', label: 'Dic 25', total: 4586 },
    { mes: '2026-01', label: 'Ene 26', total: 4666 },
    { mes: '2026-02', label: 'Feb 26', total: 4736 },
    { mes: '2026-03', label: 'Mar 26', total: 4796 },
    { mes: '2026-04', label: 'Abr 26', total: 4862 },
  ],

  comparacion: {
    mensual:   { label: 'Marzo 2026',  valor: 4796, pct: 1.4 },
    semestral: { label: 'Oct 2025',    valor: 4494, pct: 8.2 },
    anual:     { label: 'Mayo 2025',   valor: 4362, pct: 10.3 },
  },

  // Distribución de NNA a lo largo de Colombia (ruta principal)
  colombiaRuta: {
    totalPorColombia: 4382,  // ~90% del total pasa por Colombia
    entradaCucuta: { ciudad: 'Cúcuta',     pct: 60, total: 2629 },
    entradaRiohacha: { ciudad: 'Riohacha', pct: 40, total: 1753 },
    rutaCosta: {
      pct: 30, total: 1315,
      ciudades: [
        { ciudadId: 'BAR', label: 'Barranquilla', pct: 40, total: 526 },
        { ciudadId: 'CTG', label: 'Cartagena',    pct: 35, total: 460 },
        { ciudadId: 'SMA', label: 'Santa Marta',  pct: 25, total: 329 },
      ]
    },
    rutaInterior: {
      pct: 70, total: 3067,
      ciudades: [
        { ciudadId: 'BOG', label: 'Bogotá',   pct: 50, total: 1534 },
        { ciudadId: 'MED', label: 'Medellín', pct: 30, total:  920 },
        { ciudadId: 'CAL', label: 'Cali',     pct: 20, total:  613 },
      ]
    }
  },

  razonesTop: [
    { label: 'Crisis económica',       pct: 68 },
    { label: 'Falta de empleo',        pct: 52 },
    { label: 'Violencia/inseguridad',  pct: 31 },
    { label: 'Reunificación familiar', pct: 22 },
    { label: 'Persecución política',   pct: 14 },
    { label: 'Calidad de vida',        pct: 11 },
  ],

  tipoIngresos: [
    { label: 'Trabajo informal',  pct: 38 },
    { label: 'Sin ingresos',      pct: 27 },
    { label: 'Empleo temporal',   pct: 19 },
    { label: 'Apoyo familiar',    pct: 11 },
    { label: 'Empleo formal',     pct: 3  },
    { label: 'Emprendimiento',    pct: 2  },
  ],

  nivelEducativo: [
    { label: 'Universitario', pct: 29 },
    { label: 'Técnico',       pct: 21 },
    { label: 'Secundario',    pct: 35 },
    { label: 'Primario',      pct: 12 },
    { label: 'Sin datos',     pct: 3  },
  ],

  nexos: [
    { label: 'Familiar directo',      pct: 34 },
    { label: 'Org. humanitaria',      pct: 28 },
    { label: 'Amigo o conocido',      pct: 18 },
    { label: 'Sin nexo',              pct: 12 },
    { label: 'Redes sociales',        pct: 5  },
    { label: 'Autoridad migratoria',  pct: 3  },
  ],

  rangoEdadNinos: [
    { label: '0-2 años',   total: 287 },
    { label: '3-5 años',   total: 412 },
    { label: '6-11 años',  total: 601 },
    { label: '12-17 años', total: 497 },
  ],

  rangoEdadAdultos: [
    { label: '18-24 años', total: 891  },
    { label: '25-34 años', total: 1204 },
    { label: '35-44 años', total: 612  },
    { label: '45-54 años', total: 234  },
    { label: '55+ años',   total: 73   },
  ],

  permisosTrabajo:    { si: 66, no: 34 },
  permanencia:        { si: 44, no: 56 },
  intencionReuniSI:   71,
  sistEscolarSI:      58,

  plataformasDigitales: [
    { label: 'WhatsApp',   pct: 84 },
    { label: 'Facebook',   pct: 62 },
    { label: 'Email',      pct: 45 },
    { label: 'Instagram',  pct: 38 },
    { label: 'Sin acceso', pct: 18 },
  ],

  // Distribución de NNA únicos por país (solo red FEM: VE + CO)
  paisDestino: [
    { label: 'Colombia',  bandera: '🇨🇴', pct: 82, nna: 3987, atenciones: 6379 },
    { label: 'Venezuela', bandera: '🇻🇪', pct: 18, nna:  875, atenciones: 1400 },
  ],

  // Atenciones acumuladas por país (solo red FEM: VE + CO)
  paisResidencia: [
    { label: 'Colombia',  bandera: '🇨🇴', pct: 82, nna: 3987, atenciones: 6379 },
    { label: 'Venezuela', bandera: '🇻🇪', pct: 18, nna:  875, atenciones: 1400 },
  ],

  serviciosTop: [
    { id: 'TS01', label: 'Alimentación',         icono: '🍽️', pct: 74, total: 3598 },
    { id: 'TS03', label: 'Atención médica',      icono: '🏥', pct: 68, total: 3306 },
    { id: 'TS02', label: 'Refugio temporal',     icono: '🏠', pct: 61, total: 2965 },
    { id: 'TS04', label: 'Atención psicológica', icono: '🧠', pct: 47, total: 2285 },
    { id: 'TS05', label: 'Asesoría legal',       icono: '⚖️', pct: 39, total: 1896 },
    { id: 'TS07', label: 'Capacitación laboral', icono: '💼', pct: 28, total: 1361 },
    { id: 'TS06', label: 'Educación',            icono: '📚', pct: 23, total: 1119 },
    { id: 'TS08', label: 'Transporte',           icono: '🚌', pct: 18, total:  875 },
  ],

  recomendacionesTop: [
    { id: 'RC01', label: 'Registro inicial completo',             tipo: 'Operativa',   total: 2922 },
    { id: 'RC07', label: 'Evaluar riesgo de vulnerabilidad alta', tipo: 'Protección',  total: 1651 },
    { id: 'RC02', label: 'Derivar a atención médica urgente',     tipo: 'Salud',       total: 1436 },
    { id: 'RC09', label: 'Brindar kit de higiene y alimentación', tipo: 'Humanitaria', total: 1301 },
    { id: 'RC08', label: 'Facilitar acceso a albergue temporal',  tipo: 'Alojamiento', total: 1116 },
    { id: 'RC10', label: 'Acompañamiento psicosocial prioritario',tipo: 'Salud Mental',total:  973 },
    { id: 'RC03', label: 'Solicitar documentación pendiente',     tipo: 'Legal',       total:  856 },
    { id: 'RC04', label: 'Inscribir menores en programa escolar', tipo: 'Educación',   total:  720 },
  ],
};

// ─── AppState ─────────────────────────────────────────────────

const AppState = {
  migrantes:      [...MIGRANTES],
  organizaciones: [...ORGANIZACIONES],
  usuarios:       [...USUARIOS],
  currentUser:    null,
  mockStats:      MOCK_STATS,
  catalogos: {
    paises:             PAISES,
    ciudades:           CIUDADES,
    nacionalidades:     NACIONALIDADES,
    generos:            GENEROS,
    idiomas:            IDIOMAS,
    nexos:              NEXOS,
    razonesEmigracion:  RAZONES_EMIGRACION,
    tiposServicio:      TIPOS_SERVICIO,
    generacionIngresos: GENERACION_INGRESOS,
    materialEducativo:  MATERIAL_EDUCATIVO,
    nivelesEducacion:   NIVELES_EDUCACION,
    recomendaciones:    RECOMENDACIONES,
  },
  _nextId: 31,
};

// ─── HELPERS ──────────────────────────────────────────────────

const Helpers = {
  genId: (p = 'M') => {
    const id = `${p}${String(AppState._nextId).padStart(3,'0')}`;
    AppState._nextId++;
    return id;
  },
  today: () => new Date().toISOString().split('T')[0],
  labelById: (cat, id) => {
    const arr = AppState.catalogos[cat];
    return arr?.find(x=>x.id===id)?.label || id;
  },
  orgById:      id => AppState.organizaciones.find(o=>o.id===id),
  migranteById: id => AppState.migrantes.find(m=>m.id===id),
  ciudadById:   id => AppState.catalogos.ciudades.find(c=>c.id===id),
  paisById:     id => AppState.catalogos.paises.find(p=>p.id===id),
  usuarioByLogin: (u,p) => AppState.usuarios.find(x=>x.usuario===u && x.password===p),

  edad: (fn) => {
    const hoy = new Date(), nac = new Date(fn);
    let e = hoy.getFullYear() - nac.getFullYear();
    if (hoy.getMonth() - nac.getMonth() < 0 ||
       (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) e--;
    return e;
  },
  nombreCompleto: m => `${m.nombres} ${m.apellidos}`,

  estadoLabel: e => ({
    en_transito:'En tránsito', atendido:'Atendido',
    derivado:'Derivado', ubicado:'Ubicado', archivado:'Archivado'
  })[e] || e,

  estadoColor: e => ({
    en_transito:'#F59E0B', atendido:'#3B82F6',
    derivado:'#8B5CF6', ubicado:'#10B981', archivado:'#6B7280'
  })[e] || '#6B7280',

  vulnerabilidadLabel: v => ({alta:'Alta',media:'Media',baja:'Baja'})[v] || v,
  vulnerabilidadColor: v => ({alta:'#EF4444',media:'#F59E0B',baja:'#10B981'})[v] || '#6B7280',
  vulnerabilidadBadge: v => ({alta:'badge-red',media:'badge-yellow',baja:'badge-green'})[v] || 'badge-gray',

  formatFecha: f => {
    if (!f) return '—';
    const [y,m,d] = f.split('-'); return `${d}/${m}/${y}`;
  },

  stats: () => {
    const m = AppState.migrantes;
    const total = m.length;
    const porEstado = {}, porPaisOrigen = {}, porPaisActual = {},
          porOrg = {}, porNacionalidad = {}, servicioCount = {},
          porVulnerabilidad = {};
    let totalEventos = 0, conMultiOrg = 0;

    m.forEach(mi => {
      porEstado[mi.estado]         = (porEstado[mi.estado]||0) + 1;
      porPaisOrigen[mi.paisOrigenId]= (porPaisOrigen[mi.paisOrigenId]||0) + 1;
      porPaisActual[mi.paisActualId]= (porPaisActual[mi.paisActualId]||0) + 1;
      porNacionalidad[mi.nacionalidadId]=(porNacionalidad[mi.nacionalidadId]||0)+1;
      porVulnerabilidad[mi.vulnerabilidad]=(porVulnerabilidad[mi.vulnerabilidad]||0)+1;
      if (mi.orgActualId) porOrg[mi.orgActualId]=(porOrg[mi.orgActualId]||0)+1;
      const orgsUnicas = new Set(mi.ruta.filter(e=>e.orgId).map(e=>e.orgId));
      if (orgsUnicas.size > 1) conMultiOrg++;
      totalEventos += mi.ruta.length;
      mi.ruta.forEach(ev => ev.servicios.forEach(s => {
        servicioCount[s]=(servicioCount[s]||0)+1;
      }));
    });
    return {
      total, porEstado, porPaisOrigen, porPaisActual, porNacionalidad,
      porOrg, servicioCount, porVulnerabilidad, totalEventos, conMultiOrg,
      orgsActivas:  AppState.organizaciones.filter(o=>o.activa).length,
      paisesEnRuta: [...new Set(m.flatMap(mi=>mi.ruta.map(e=>e.paisId)))].length,
    };
  },

  registrosPorMes: () => {
    const map = {};
    AppState.migrantes.forEach(m => {
      if (!m.fechaRegistro) return;
      const mes = m.fechaRegistro.substring(0,7);
      map[mes] = (map[mes]||0)+1;
    });
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b));
  },

  migrantesPorOrg: () => AppState.organizaciones.map(org => {
    const lista   = AppState.migrantes.filter(m=>m.orgActualId===org.id);
    const eventos = AppState.migrantes.flatMap(m=>m.ruta.filter(e=>e.orgId===org.id));
    const servicios = {};
    eventos.forEach(ev => ev.servicios.forEach(s => {
      servicios[s]=(servicios[s]||0)+1;
    }));
    return { org, totalActuales:lista.length, totalEventos:eventos.length, servicios };
  }),
};

// ─── DB ───────────────────────────────────────────────────────

const DB = {
  migrantes: {
    list: (f={}) => {
      let r = [...AppState.migrantes];
      if (f.estado)          r = r.filter(m=>m.estado===f.estado);
      if (f.paisActualId)    r = r.filter(m=>m.paisActualId===f.paisActualId);
      if (f.orgActualId)     r = r.filter(m=>m.orgActualId===f.orgActualId);
      if (f.generoId)        r = r.filter(m=>m.generoId===f.generoId);
      if (f.nacionalidadId)  r = r.filter(m=>m.nacionalidadId===f.nacionalidadId);
      if (f.vulnerabilidad)  r = r.filter(m=>m.vulnerabilidad===f.vulnerabilidad);
      if (f.q) {
        const q = f.q.toLowerCase();
        r = r.filter(m => Helpers.nombreCompleto(m).toLowerCase().includes(q)
                       || m.documentoNumero.toLowerCase().includes(q));
      }
      return r;
    },
    get:    id   => AppState.migrantes.find(m=>m.id===id),
    create: data => {
      const n = { ...data, id:Helpers.genId('M'), fechaRegistro:Helpers.today(), ruta:data.ruta||[], vulnerabilidad:data.vulnerabilidad||'media' };
      AppState.migrantes.push(n); return n;
    },
    update: (id, data) => {
      const i = AppState.migrantes.findIndex(m=>m.id===id);
      if (i===-1) return null;
      AppState.migrantes[i] = {...AppState.migrantes[i],...data};
      return AppState.migrantes[i];
    },
    delete: id => {
      const i = AppState.migrantes.findIndex(m=>m.id===id);
      if (i>-1) AppState.migrantes.splice(i,1);
    },
    addEvento: (mid, ev) => {
      const m = DB.migrantes.get(mid); if (!m) return null;
      m.ruta.push({...ev, fecha:ev.fecha||Helpers.today()}); return m;
    },
  },
  organizaciones: {
    list: (f={}) => {
      let r = [...AppState.organizaciones];
      if (f.paisId)            r = r.filter(o=>o.paisId===f.paisId);
      if (f.activa!==undefined) r = r.filter(o=>o.activa===f.activa);
      if (f.q) { const q=f.q.toLowerCase(); r=r.filter(o=>o.nombre.toLowerCase().includes(q)); }
      return r;
    },
    get:    id   => AppState.organizaciones.find(o=>o.id===id),
    create: data => {
      const n = {...data, id:Helpers.genId('ORG'), activa:true, totalAtendidos:0, recomendaciones:0};
      AppState.organizaciones.push(n); return n;
    },
    update: (id,data) => {
      const i = AppState.organizaciones.findIndex(o=>o.id===id);
      if (i===-1) return null;
      AppState.organizaciones[i]={...AppState.organizaciones[i],...data};
      return AppState.organizaciones[i];
    },
    delete: id => {
      const i=AppState.organizaciones.findIndex(o=>o.id===id);
      if (i>-1) AppState.organizaciones.splice(i,1);
    },
  },
  catalogos: {
    get:        nombre     => AppState.catalogos[nombre]||[],
    addItem:    (cat,item) => AppState.catalogos[cat]?.push(item),
    updateItem: (cat,id,d) => {
      const arr=AppState.catalogos[cat]; if (!arr) return;
      const i=arr.findIndex(x=>x.id===id); if (i>-1) arr[i]={...arr[i],...d};
    },
    deleteItem: (cat,id)   => {
      if (AppState.catalogos[cat]) AppState.catalogos[cat]=AppState.catalogos[cat].filter(x=>x.id!==id);
    },
  },
};

window.AppState  = AppState;
window.DB        = DB;
window.Helpers   = Helpers;
window.USUARIOS  = USUARIOS;
