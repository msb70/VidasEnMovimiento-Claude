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

// Reordena una lista de forma DETERMINISTA para que elementos con claves
// alfabéticamente cercanas (apellidos/nombres parecidos o repetidos) NO queden
// contiguos. Primero ordena por la clave (agrupa los parecidos) y luego recorre
// la lista con un paso coprimo con n (~razón áurea), que salta a índices muy
// separados. Resultado: orden no alfabético, sin nombres iguales seguidos, e
// idéntico en cada render (sin azar → paginación estable).
// keyFn(item) debe devolver el string por el que se mide la similitud.
function dispersarLista(arr, keyFn) {
  const ordenado = (arr || []).slice().sort((a, b) =>
    String(keyFn(a) || '').localeCompare(String(keyFn(b) || ''), 'es'));
  const n = ordenado.length;
  if (n <= 2) return ordenado;
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  let step = Math.max(2, Math.round(n * 0.6180339887));
  while (step > 1 && gcd(step, n) !== 1) step--;
  if (step < 1) step = 1;
  const out = [];
  for (let k = 0, idx = 0; k < n; k++, idx = (idx + step) % n) out.push(ordenado[idx]);
  return out;
}

// Export para Node (pruebas). En el navegador, `module` no existe y se ignora.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escapeHtml, avatarIniciales, calcEdadDesde, rutaIncluyeCiudad, dispersarLista };
}
