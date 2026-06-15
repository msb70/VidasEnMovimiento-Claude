import { test, expect } from '@playwright/test';
import { login } from './helpers.mjs';

const viewports = [
  { name: 'móvil (375)',   width: 375,  height: 812 },
  { name: 'tablet (768)',  width: 768,  height: 1024 },
  { name: 'desktop (1440)', width: 1440, height: 900 },
];

async function sinScrollHorizontal(page) {
  return page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}

for (const v of viewports) {
  test(`login sin scroll horizontal en ${v.name}`, async ({ page }) => {
    await page.setViewportSize({ width: v.width, height: v.height });
    await page.goto('/');
    await expect(page.locator('.login-card')).toBeVisible({ timeout: 20000 });
    expect(await sinScrollHorizontal(page), 'no debe haber scroll horizontal').toBe(true);
  });
}

test('dashboard sin scroll horizontal en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page, 'admin');
  expect(await sinScrollHorizontal(page)).toBe(true);
});
