// Funciones puras de presentacion. Estan separadas de los componentes a
// proposito: se pueden testear sin montar React ni tocar el DOM.

/** "2026-09-10T14:00" -> "10/09/2026 14:00" */
export function formatearRango(inicio, fin) {
  const i = new Date(inicio)
  const f = new Date(fin)
  const dia = i.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hi = i.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const hf = f.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  return `${dia} · ${hi} a ${hf}`
}

/** Duracion en minutos entre dos fechas ISO. */
export function duracionEnMinutos(inicio, fin) {
  return Math.round((new Date(fin) - new Date(inicio)) / 60000)
}

/**
 * Espejo en el cliente de las reglas del backend: sirve para deshabilitar el
 * boton y avisar antes de gastar un viaje al servidor.
 *
 * No reemplaza la validacion del backend — la del cliente es comodidad, la del
 * servidor es la que manda. Cualquiera puede saltear esta.
 */
export function validarFormulario({ salaId, titulo, responsable, asistentes, inicio, fin }) {
  if (!salaId) return 'Elegí una sala.'
  if (!titulo || titulo.trim().length < 3) return 'El título necesita al menos 3 caracteres.'
  if (!responsable || responsable.trim().length < 2) return 'Falta el responsable.'
  if (!asistentes || Number(asistentes) < 1) return 'Tiene que haber al menos un asistente.'
  if (!inicio || !fin) return 'Completá el horario de inicio y de fin.'

  const minutos = duracionEnMinutos(inicio, fin)
  if (minutos <= 0) return 'El fin tiene que ser posterior al inicio.'
  if (minutos < 30) return 'La reserva tiene que durar al menos 30 minutos.'
  if (minutos > 240) return 'La reserva no puede durar más de 4 horas.'

  return null
}
