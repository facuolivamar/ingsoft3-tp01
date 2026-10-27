// Datos de prueba que no chocan entre corridas: QA es compartido.
// El titulo lleva la hora; el horario cae en un dia habil futuro al azar, a una
// hora al azar, para que dos corridas no se pisen el turno de la misma sala.

export function tituloUnico(prefijo) {
  return `${prefijo} ${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

const dosDigitos = (n) => String(n).padStart(2, '0')

/** Un turno de 1 h en un dia habil futuro, como "YYYY-MM-DDTHH:MM" (hora local). */
export function turnoFuturo() {
  const d = new Date()
  d.setDate(d.getDate() + 30 + Math.floor(Math.random() * 300))
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  const hora = 8 + Math.floor(Math.random() * 10)
  const dia = `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
  return {
    inicio: `${dia}T${dosDigitos(hora)}:00`,
    fin: `${dia}T${dosDigitos(hora + 1)}:00`,
  }
}

export async function primeraSala(request) {
  const salas = await (await request.get('/api/salas')).json()
  return salas[0]
}
