import 'dotenv/config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './global-setup.mjs',
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false, // evita choques de sesión entre archivos
    reporters: 'verbose',
  },
});
