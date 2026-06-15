import { test, expect } from '@playwright/test';
import pkg from '@axe-core/playwright';
import { login } from './helpers.mjs';

const AxeBuilder = pkg.default ?? pkg;

// Solo fallamos por violaciones CRÍTICAS (las "serious"/"moderate" se reportan
// en consola pero no rompen el build, para no bloquear por deuda menor de a11y).
async function auditar(page, etiqueta) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const criticas = violations.filter((v) => v.impact === 'critical');
  if (violations.length) {
    console.log(`[a11y ${etiqueta}] violaciones:`, violations.map((v) => `${v.impact}:${v.id}`).join(', '));
  }
  expect(criticas, criticas.map((v) => v.id).join(', ')).toEqual([]);
}

test('accesibilidad — pantalla de login sin violaciones críticas', async ({ page }) => {
  await page.goto('/');
  await page.locator('.login-card').waitFor({ state: 'visible', timeout: 20000 });
  await auditar(page, 'login');
});

test('accesibilidad — dashboard sin violaciones críticas', async ({ page }) => {
  await login(page, 'admin');
  await auditar(page, 'dashboard');
});
