// ============================================================
// supabase-config.js — Vidas en Movimiento
// Inicialización del cliente Supabase
// ============================================================

const SUPABASE_URL  = 'https://izcqcnunryhntojhxywu.supabase.co';
const SUPABASE_KEY  = 'sb_publishable__LIveg146Avk4WSUp3WjWA_G55IhbYa';

// El build UMD expone supabase como global cuando se carga por CDN
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
