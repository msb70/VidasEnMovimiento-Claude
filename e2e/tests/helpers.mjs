import { expect } from '@playwright/test';

export const CREDS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'afonseca@demo.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'Demo2024!',
  },
  operator: {
    email: process.env.E2E_OPERATOR_EMAIL || 'test-operator@viamovimiento.test',
    password: process.env.E2E_OPERATOR_PASSWORD || 'Test-Operator-2026!',
  },
};

/** Inicia sesión y espera a que el dashboard esté cargado. */
export async function login(page, who = 'admin') {
  const c = CREDS[who];
  await page.goto('/');
  await page.locator('#login-usuario').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#login-usuario').fill(c.email);
  await page.locator('#login-password').fill(c.password);
  await page.locator('#login-btn').click();
  // El dashboard aparece tras autenticar + cargar datos (puede tardar).
  await expect(page.getByText('Dashboard General')).toBeVisible({ timeout: 50000 });
}
