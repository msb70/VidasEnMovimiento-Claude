import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// lib.js es CommonJS (también es global en el navegador); lo importamos así.
const require = createRequire(import.meta.url);
const lib = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'lib.js'));
const { escapeHtml, avatarIniciales, calcEdadDesde, rutaIncluyeCiudad } = lib;

describe('escapeHtml — anti-XSS (P-07)', () => {
  it('escapa los 5 caracteres peligrosos', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
  });
  it('neutraliza un payload de XSS', () => {
    const out = escapeHtml('<img src=x onerror=alert(1)>');
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).toContain('&lt;img');
  });
  it('null / undefined → cadena vacía', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
  it('convierte números a texto', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});

describe('avatarIniciales', () => {
  it('toma hasta 2 iniciales en mayúscula', () => {
    expect(avatarIniciales('juana perez')).toBe('JP');
    expect(avatarIniciales('Ana')).toBe('A');
  });
  it('vacío / null → cadena vacía', () => {
    expect(avatarIniciales('')).toBe('');
    expect(avatarIniciales(null)).toBe('');
  });
  it('escapa nombres maliciosos', () => {
    expect(avatarIniciales('<x')).not.toContain('<');
  });
});

describe('calcEdadDesde', () => {
  const y = new Date().getFullYear();
  it('calcula la edad correctamente (cumpleaños 1-ene ya pasado)', () => {
    expect(calcEdadDesde(`${y - 20}-01-01`)).toBe(20);
    expect(calcEdadDesde(`${y - 8}-01-01`)).toBe(8);
  });
  it('fecha futura → null', () => {
    expect(calcEdadDesde(`${y + 1}-01-01`)).toBeNull();
  });
  it('entradas inválidas → null', () => {
    expect(calcEdadDesde('')).toBeNull();
    expect(calcEdadDesde(null)).toBeNull();
    expect(calcEdadDesde('no-es-fecha')).toBeNull();
  });
  it('acepta timestamp ISO completo (usa solo la fecha)', () => {
    expect(calcEdadDesde(`${y - 15}-01-01T12:34:56Z`)).toBe(15);
  });
});

describe('rutaIncluyeCiudad — filtro del mapa (P-18)', () => {
  const ruta = [{ ciudadId: 'CUC' }, { ciudadId: 'BOG' }, { ciudadId: 'CTG' }];
  it('true si algún paso tiene la ciudad', () => {
    expect(rutaIncluyeCiudad(ruta, 'CTG')).toBe(true);
    expect(rutaIncluyeCiudad(ruta, 'CUC')).toBe(true);
  });
  it('false si la ciudad no está en la ruta', () => {
    expect(rutaIncluyeCiudad(ruta, 'MED')).toBe(false);
  });
  it('ruta vacía o nula → false', () => {
    expect(rutaIncluyeCiudad([], 'CTG')).toBe(false);
    expect(rutaIncluyeCiudad(null, 'CTG')).toBe(false);
  });
});
