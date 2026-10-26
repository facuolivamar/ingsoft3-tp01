// Tests del cliente HTTP con `fetch` reemplazado por un doble: no sale a la red.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cancelarReserva, crearReserva, listarReservas } from './api.js'

function respuesta(ok, cuerpo, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(cuerpo) }
}

afterEach(() => vi.unstubAllGlobals())

describe('api', () => {
  it('crearReserva hace POST a /api/reservas con el cuerpo en JSON', async () => {
    // Arrange: el doble de fetch devuelve una reserva creada
    const fetchFalso = vi.fn().mockResolvedValue(respuesta(true, { id: 1 }))
    vi.stubGlobal('fetch', fetchFalso)
    // Act
    const creada = await crearReserva({ titulo: 'Daily' })
    // Assert: se llamo UNA vez, con el metodo y el cuerpo correctos
    expect(creada).toEqual({ id: 1 })
    expect(fetchFalso).toHaveBeenCalledOnce()
    const [url, opciones] = fetchFalso.mock.calls[0]
    expect(url).toBe('/api/reservas')
    expect(opciones.method).toBe('POST')
    expect(JSON.parse(opciones.body)).toEqual({ titulo: 'Daily' })
  })

  it.each([
    [3, '/api/reservas?sala_id=3'],
    [undefined, '/api/reservas'],
  ])('listarReservas(%s) pide %s', async (salaId, esperada) => {
    const fetchFalso = vi.fn().mockResolvedValue(respuesta(true, []))
    vi.stubGlobal('fetch', fetchFalso)

    await listarReservas(salaId)

    expect(fetchFalso.mock.calls[0][0]).toBe(esperada)
  })

  it('si el backend rechaza, lanza el mensaje de error que mando el servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      respuesta(false, { detail: 'La reserva ya estaba cancelada.' }, 409),
    ))

    await expect(cancelarReserva(7)).rejects.toThrow('La reserva ya estaba cancelada.')
  })

  it('si el error no trae cuerpo JSON, lanza "Error <status>"', async () => {
    const sinCuerpo = { ok: false, status: 502, json: vi.fn().mockRejectedValue(new Error('no json')) }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sinCuerpo))

    await expect(cancelarReserva(7)).rejects.toThrow('Error 502')
  })
})
