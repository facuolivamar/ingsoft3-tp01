// Cliente HTTP. Todas las rutas son relativas a /api: en desarrollo las proxea
// Vite y en produccion nginx. La app nunca sabe en que host vive el backend.

async function pedir(url, opciones = {}) {
  const respuesta = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  })

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => ({}))
    throw new Error(cuerpo.detail || `Error ${respuesta.status}`)
  }
  return respuesta.json()
}

export const listarSalas = () => pedir('/api/salas')
export const listarReservas = (salaId) =>
  pedir(salaId ? `/api/reservas?sala_id=${salaId}` : '/api/reservas')
export const crearReserva = (datos) =>
  pedir('/api/reservas', { method: 'POST', body: JSON.stringify(datos) })
export const cancelarReserva = (id) =>
  pedir(`/api/reservas/${id}/cancelar`, { method: 'POST' })
