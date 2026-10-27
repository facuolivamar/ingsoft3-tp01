// Suite de INTEGRACION: la api de QA desplegada, con su Postgres de verdad.
// Sin navegador y sin dobles: si el driver, la base o una regla fallan, falla.
import { expect, test } from '@playwright/test'
import { primeraSala, tituloUnico, turnoFuturo } from './datos.js'

async function titulosDeLaSala(request, salaId) {
  const respuesta = await request.get(`/api/reservas?sala_id=${salaId}`)
  expect(respuesta.ok()).toBeTruthy()
  return (await respuesta.json()).map((r) => r.titulo)
}

test('alta, verificacion y borrado de una reserva', async ({ request }) => {
  const sala = await primeraSala(request)
  const titulo = tituloUnico('integracion alta')

  const alta = await request.post('/api/reservas', {
    data: { sala_id: sala.id, titulo, responsable: 'Pipeline', asistentes: 2, ...turnoFuturo() },
  })
  expect(alta.status()).toBe(201)
  const creada = await alta.json()
  expect(creada.estado).toBe('confirmada')

  // El GET filtrado por sala (el camino que el TP5 dejo sin cubrir) la encuentra
  expect(await titulosDeLaSala(request, sala.id)).toContain(titulo)

  const borrado = await request.delete(`/api/reservas/${creada.id}`)
  expect(borrado.status()).toBe(204)
  expect(await titulosDeLaSala(request, sala.id)).not.toContain(titulo)
})

test('un alta con titulo vacio se rechaza y no crea nada', async ({ request }) => {
  const sala = await primeraSala(request)
  const antes = (await titulosDeLaSala(request, sala.id)).length

  const alta = await request.post('/api/reservas', {
    data: { sala_id: sala.id, titulo: '', responsable: 'Pipeline', asistentes: 2, ...turnoFuturo() },
  })

  // FastAPI contesta 422 (Unprocessable Entity) cuando el cuerpo no cumple el schema
  expect(alta.status()).toBe(422)
  expect((await titulosDeLaSala(request, sala.id)).length).toBe(antes)
})

test('dos reservas solapadas en la misma sala: la segunda choca con la regla 5', async ({ request }) => {
  const sala = await primeraSala(request)
  const turno = turnoFuturo()
  const primera = await request.post('/api/reservas', {
    data: { sala_id: sala.id, titulo: tituloUnico('integracion A'), responsable: 'Pipeline', asistentes: 2, ...turno },
  })
  expect(primera.status()).toBe(201)
  const { id } = await primera.json()

  try {
    const tituloB = tituloUnico('integracion B')
    const segunda = await request.post('/api/reservas', {
      data: { sala_id: sala.id, titulo: tituloB, responsable: 'Pipeline', asistentes: 2, ...turno },
    })
    expect(segunda.status()).toBe(409)
    expect((await segunda.json()).detail).toContain('ya esta reservada')
    expect(await titulosDeLaSala(request, sala.id)).not.toContain(tituloB)
  } finally {
    expect((await request.delete(`/api/reservas/${id}`)).status()).toBe(204)
  }
})
