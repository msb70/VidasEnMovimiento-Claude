import { test, expect } from '@playwright/test';
import { login } from './helpers.mjs';

test('el filtro por ciudad acota la tabla de ciudades FEM', async ({ page }) => {
  await login(page, 'admin');

  // Ir al Mapa de Rutas (navegación SPA)
  await page.locator('.nav-item[data-route="/migrantes/mapa"]').click();
  await expect(page.locator('#fem-ciudades-tbody')).toBeVisible({ timeout: 25000 });

  // Sin filtro, la tabla incluye varias ciudades
  await expect(page.locator('#fem-ciudades-tbody')).toContainText('Bogotá');

  // Filtrar por Cartagena (CTG)
  await page.selectOption('#ruta-filtro-ciudad', 'CTG');

  const tbody = page.locator('#fem-ciudades-tbody');
  await expect(tbody).toContainText('Cartagena');
  await expect(tbody).not.toContainText('Bogotá');
});
