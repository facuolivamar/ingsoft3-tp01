// Unit tests de las funciones puras de presentacion (sin DOM, sin React).
import { describe, expect, it } from 'vitest'
import { duracionEnMinutos, formatearDuracion, validarFormulario } from './format.js'

const valido = {
  salaId: 1,
  titulo: 'Daily',
  responsable: 'Facu',
  asistentes: 4,
  inicio: '2026-11-10T10:00',
  fin: '2026-11-10T11:00',
}

describe('validarFormulario', () => {
  it('devuelve null cuando el formulario cumple todas las reglas', () => {
    // Arrange / Act
    const error = validarFormulario(valido)
    // Assert
    expect(error).toBeNull()
  })

  // Parametrizado: cada fila rompe UNA regla y espera SU mensaje.
  it.each([
    ['sin sala', { salaId: '' }, 'Elegí una sala.'],
    ['titulo corto', { titulo: ' ab ' }, 'El título necesita al menos 3 caracteres.'],
    ['sin responsable', { responsable: '' }, 'Falta el responsable.'],
    ['cero asistentes', { asistentes: 0 }, 'Tiene que haber al menos un asistente.'],
    ['sin fin', { fin: '' }, 'Completá el horario de inicio y de fin.'],
    ['fin igual a inicio', { fin: '2026-11-10T10:00' }, 'El fin tiene que ser posterior al inicio.'],
    ['29 minutos', { fin: '2026-11-10T10:29' }, 'La reserva tiene que durar al menos 30 minutos.'],
    ['4 h y 1 min', { fin: '2026-11-10T14:01' }, 'La reserva no puede durar más de 4 horas.'],
  ])('rechaza el caso "%s" con su mensaje', (_caso, cambio, mensaje) => {
    expect(validarFormulario({ ...valido, ...cambio })).toBe(mensaje)
  })

  it.each([
    ['30 min justos', '2026-11-10T10:30'],
    ['4 h justas', '2026-11-10T14:00'],
  ])('acepta el borde de %s', (_caso, fin) => {
    expect(validarFormulario({ ...valido, fin })).toBeNull()
  })
})

describe('formatearDuracion', () => {
  it.each([
    ['2026-11-10T10:00', '2026-11-10T10:45', '45 min'],
    ['2026-11-10T10:00', '2026-11-10T12:00', '2 h'],
    ['2026-11-10T10:00', '2026-11-10T11:30', '1 h 30 min'],
  ])('de %s a %s muestra "%s"', (inicio, fin, esperado) => {
    expect(formatearDuracion(inicio, fin)).toBe(esperado)
  })
})

describe('duracionEnMinutos', () => {
  it('da negativo si el fin es anterior al inicio (caso de error que valida el formulario)', () => {
    expect(duracionEnMinutos('2026-11-10T11:00', '2026-11-10T10:00')).toBe(-60)
  })
})
