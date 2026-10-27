import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'

// Sentry en el navegador (TP9): errores de JavaScript y la duracion de cada
// carga y pedido. El DSN no es secreto: viaja igual al navegador. El entorno
// sale del puerto (8081 = QA, 8082 = PROD) porque es la MISMA imagen en los dos.
const ENTORNOS = { '8081': 'qa', '8082': 'production' }
Sentry.init({
  dsn: 'https://bc717023f562b64269d957a28d983313@o4512325542150144.ingest.us.sentry.io/4512325560893440',
  environment: ENTORNOS[window.location.port] || 'local',
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  tracePropagationTargets: [/^\/api\//],
})
window.errorDePruebaSentry = () => {
  throw new Error('Error de prueba para Sentry desde el front (TP9)')
}
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
