// ============================================================
// supabase-config.js — Vidas en Movimiento
// Inicialización del cliente Supabase
// ============================================================

const SUPABASE_URL  = 'https://izcqcnunryhntojhxywu.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_zqGcupKoPZPNZkhKZJTu2A_t1gEGY2x';

// El build UMD expone supabase como global cuando se carga por CDN
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
