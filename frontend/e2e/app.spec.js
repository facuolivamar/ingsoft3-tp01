// Suite E2E: el navegador usando la app de QA desplegada, contra su api y su
// base de verdad. Nada de page.route ni mocks: si el front no llega a la api,
// estos tests fallan.
import { expect, test } from '@playwright/test'
import { primeraSala, tituloUnico, turnoFuturo } from './datos.js'

async function llenarFormulario(page, sala, titulo, turno) {
  await page.getByLabel('Sala').first().selectOption(String(sala.id))
  await page.getByLabel('Titulo').fill(titulo)
  await page.getByLabel('Responsable').fill('E2E Pipeline')
  await page.getByLabel('Asistentes').fill('2')
  await page.getByLabel('Inicio').fill(turno.inicio)
  await page.getByLabel('Fin').fill(turno.fin)
}

async function borrarPorTitulo(request, titulo) {
  const reservas = await (await request.get('/api/reservas')).json()
  for (const r of reservas.filter((r) => r.titulo === titulo)) {
    expect((await request.delete(`/api/reservas/${r.id}`)).status()).toBe(204)
  }
}

test('crear una reserva desde el formulario, verla, cancelarla y borrarla', async ({ page, request }) => {
  const sala = await primeraSala(request)
  const titulo = tituloUnico('e2e alta')
  await page.goto('/')

  await llenarFormulario(page, sala, titulo, turnoFuturo())
  await page.getByRole('button', { name: 'Reservar' }).click()

  await expect(page.getByText('Reserva confirmada.')).toBeVisible()
  const fila = page.locator('li', { hasText: titulo })
  await expect(fila).toBeVisible()

  await fila.getByRole('button', { name: 'Cancelar' }).click()
  await expect(fila.getByText('cancelada')).toBeVisible()

  await borrarPorTitulo(request, titulo)
  await page.reload()
  await expect(page.getByText(titulo)).toHaveCount(0)
})

test('reservar un turno ocupado muestra el error y no crea la reserva', async ({ page, request }) => {
  const sala = await primeraSala(request)
  const turno = turnoFuturo()
  const ocupante = tituloUnico('e2e ocupante')
  const intento = tituloUnico('e2e intento')
  const alta = await request.post('/api/reservas', {
    data: { sala_id: sala.id, titulo: ocupante, responsable: 'E2E', asistentes: 2, ...turno },
  })
  expect(alta.status()).toBe(201)

  try {
    await page.goto('/')
    await llenarFormulario(page, sala, intento, turno)
    await page.getByRole('button', { name: 'Reservar' }).click()

    await expect(page.locator('.error')).toContainText('ya esta reservada')
    await expect(page.getByText(intento)).toHaveCount(0)
  } finally {
    await borrarPorTitulo(request, ocupante)
  }
})

test('la reserva sigue ahi al recargar y aparece al filtrar por su sala', async ({ page, request }) => {
  // El flujo de todos los dias: reservo y, cuando vuelvo, mi reserva esta.
  const sala = await primeraSala(request)
  const titulo = tituloUnico('e2e persiste')
  await page.goto('/')
  await llenarFormulario(page, sala, titulo, turnoFuturo())
  await page.getByRole('button', { name: 'Reservar' }).click()
  await expect(page.getByText('Reserva confirmada.')).toBeVisible()

  try {
    await page.reload()
    await expect(page.getByText(titulo)).toBeVisible()
    await page.locator('.encabezado-lista select').selectOption(String(sala.id))
    await expect(page.getByText(titulo)).toBeVisible()
  } finally {
    await borrarPorTitulo(request, titulo)
  }
})
