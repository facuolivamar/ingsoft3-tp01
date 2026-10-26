import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo el front corre en 5173 y el back en 8000. El proxy hace que el
// navegador vea todo bajo el mismo origen, igual que en produccion (donde el
// que proxea es nginx). Asi el codigo de la app llama siempre a "/api" y no
// necesita saber donde vive el backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      // Que ENTRA en la cuenta: solo la logica sin DOM (format.js y api.js).
      // Quedan afuera los componentes (App.jsx, main.jsx), que se verifican
      // con las pruebas e2e del TP7, y los propios archivos de test.
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js'],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: process.env.COVERAGE_DIR || 'coverage',
      // EL UMBRAL QUE ROMPE EL BUILD: si alguna metrica queda abajo, vitest
      // sale con codigo 1 aunque todos los tests pasen.
      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
})
