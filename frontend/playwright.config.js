// Dos suites de Playwright, contra el entorno de QA YA DESPLEGADO:
//   - integracion: pedidos HTTP a la api (fixture `request`), sin navegador.
//   - e2e: el navegador usando la app como un usuario.
// Ninguna mockea nada: si el sistema real no responde, fallan.
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // QA es uno solo y lo comparten todas las corridas: un test a la vez.
  workers: 1,
  // Un reintento absorbe un tropiezo de red; dos fallos seguidos son un bug.
  retries: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: process.env.REPORTE || 'playwright-report' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'integracion',
      testMatch: /api\.spec\.js/,
      use: { baseURL: process.env.API_BASE_URL || 'http://localhost:8001' },
    },
    {
      name: 'e2e',
      testMatch: /app\.spec\.js/,
      use: { ...devices['Desktop Chrome'], baseURL: process.env.E2E_BASE_URL || 'http://localhost:8081' },
    },
  ],
})
