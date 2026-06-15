// ============================================================
// lib.js — Funciones puras compartidas (Vidas en Movimiento)
// Única fuente de verdad para helpers sin dependencias del DOM.
//
// - En el navegador se carga como <script> clásico ANTES de app.js,
//   por lo que estas funciones quedan disponibles como globals.
// - En Node (pruebas) se importan vía module.exports.
// ============================================================

// SEGURIDAD: escapa los 5 caracteres peligrosos para HTML (anti-XSS).
// Seguro en contenido de elementos y dentro de atributos entre comillas.
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Iniciales (máx. 2) en mayúscula, ya escapadas.
function avatarIniciales(nombre) {
  return escapeHtml((nombre || '').split(' ').slice(0, 2).map(p => p[0] || '').join('').toUpperCase());
}

// Edad en años desde una fecha ISO (YYYY-MM-DD...). Devuelve null si es
// inválida, futura o fuera de rango [0, 120].
function calcEdadDesde(f) {
  if (!f) return null;
  const h = new Date(), n = new Date(String(f).substring(0, 10) + 'T00:00:00');
  if (isNaN(n)) return null;
  let e = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
  return (e >= 0 && e <= 120) ? e : null;
}

// Un NNA "pasa por" una ciudad si algún paso de su ruta tiene esa ciudad.
function rutaIncluyeCiudad(ruta, ciudadId) {
  return (ruta || []).some(p => p && p.ciudadId === ciudadId);
}

// Export para Node (pruebas). En el navegador, `module` no existe y se ignora.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escapeHtml, avatarIniciales, calcEdadDesde, rutaIncluyeCiudad };
}
