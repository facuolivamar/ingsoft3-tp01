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
})
