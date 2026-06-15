import { test, expect } from '@playwright/test';
import { login, CREDS } from './helpers.mjs';

test('login con credenciales válidas muestra el dashboard', async ({ page }) => {
  await login(page, 'admin');
  await expect(page.getByText('Total Registros')).toBeVisible();
});

test('login con contraseña incorrecta muestra error y no entra', async ({ page }) => {
  await page.goto('/');
  await page.locator('#login-usuario').fill(CREDS.admin.email);
  await page.locator('#login-password').fill('clave-incorrecta-xyz');
  await page.locator('#login-btn').click();
  await expect(page.locator('#login-error')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Dashboard General')).toBeHidden();
});
