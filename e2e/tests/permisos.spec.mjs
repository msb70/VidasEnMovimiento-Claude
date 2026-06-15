import { test, expect } from '@playwright/test';
import { login } from './helpers.mjs';

// Requiere que exista la cuenta operador (la crea el setup de /tests).
test('un operador NO ve los módulos restringidos del menú', async ({ page }) => {
  await login(page, 'operator');
  await expect(page.locator('.nav-group-header[data-group="migrantes"]')).toBeVisible();
  await expect(page.locator('.nav-group-header[data-group="seguridad"]')).toBeHidden();
  await expect(page.locator('.nav-group-header[data-group="configuracion"]')).toBeHidden();
});

test('un administrador SÍ ve todos los módulos', async ({ page }) => {
  await login(page, 'admin');
  await expect(page.locator('.nav-group-header[data-group="seguridad"]')).toBeVisible();
  await expect(page.locator('.nav-group-header[data-group="configuracion"]')).toBeVisible();
});
