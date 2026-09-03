import { useEffect, useState } from 'react'
import * as api from './api.js'
import { formatearRango, formatearDuracion, validarFormulario } from './format.js'

const FORMULARIO_VACIO = {
  salaId: '',
  titulo: '',
  responsable: '',
  asistentes: 1,
  inicio: '',
  fin: '',
}

export default function App() {
  const [salas, setSalas] = useState([])
  const [reservas, setReservas] = useState([])
  const [filtroSala, setFiltroSala] = useState('')
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    api.listarSalas().then(setSalas).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    refrescarReservas()
  }, [filtroSala])

  function refrescarReservas() {
    api
      .listarReservas(filtroSala || undefined)
      .then(setReservas)
      .catch((e) => setError(e.message))
  }

  function actualizar(campo, valor) {
    setFormulario((f) => ({ ...f, [campo]: valor }))
  }

  // El error local se recalcula en cada render: es lo que deshabilita el boton.
  const errorLocal = validarFormulario(formulario)

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setAviso(null)
    setCargando(true)
    try {
      await api.crearReserva({
        sala_id: Number(formulario.salaId),
        titulo: formulario.titulo.trim(),
        responsable: formulario.responsable.trim(),
        asistentes: Number(formulario.asistentes),
        inicio: formulario.inicio,
        fin: formulario.fin,
      })
      setFormulario(FORMULARIO_VACIO)
      setAviso('Reserva confirmada.')
      refrescarReservas()
    } catch (e) {
      // Este es el mensaje que devolvio una regla de negocio del backend (409).
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  async function cancelar(id) {
    setError(null)
    setAviso(null)
    try {
      await api.cancelarReserva(id)
      setAviso('Reserva cancelada.')
      refrescarReservas()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <main>
      <header>
        <h1>Salas</h1>
        <p>Reserva de salas de reunion</p>
      </header>

      <section className="panel">
        <h2>Nueva reserva</h2>
        <form onSubmit={enviar}>
          <label>
            Sala
            <select value={formulario.salaId} onChange={(e) => actualizar('salaId', e.target.value)}>
              <option value="">Elegi una sala...</option>
              {salas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} (hasta {s.capacidad})
                </option>
              ))}
            </select>
          </label>

          <label>
            Titulo
            <input
              value={formulario.titulo}
              onChange={(e) => actualizar('titulo', e.target.value)}
              placeholder="Revision de sprint"
            />
          </label>

          <label>
            Responsable
            <input
              value={formulario.responsable}
              onChange={(e) => actualizar('responsable', e.target.value)}
              placeholder="Nombre y apellido"
            />
          </label>

          <label>
            Asistentes
            <input
              type="number"
              min="1"
              value={formulario.asistentes}
              onChange={(e) => actualizar('asistentes', e.target.value)}
            />
          </label>

          <label>
            Inicio
            <input
              type="datetime-local"
              value={formulario.inicio}
              onChange={(e) => actualizar('inicio', e.target.value)}
            />
          </label>

          <label>
            Fin
            <input
              type="datetime-local"
              value={formulario.fin}
              onChange={(e) => actualizar('fin', e.target.value)}
            />
          </label>

          {errorLocal && <p className="hint">{errorLocal}</p>}

          <button type="submit" disabled={Boolean(errorLocal) || cargando}>
            {cargando ? 'Reservando...' : 'Reservar'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {aviso && <p className="aviso">{aviso}</p>}
      </section>

      <section className="panel">
        <div className="encabezado-lista">
          <h2>Reservas</h2>
          <select value={filtroSala} onChange={(e) => setFiltroSala(e.target.value)}>
            <option value="">Todas las salas</option>
            {salas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {reservas.length === 0 ? (
          <p className="vacio">Todavia no hay reservas.</p>
        ) : (
          <ul className="reservas">
            {reservas.map((r) => (
              <li key={r.id} className={r.estado}>
                <div>
                  <strong>{r.titulo}</strong>
                  <span className="meta">
                    {r.sala.nombre} - {formatearRango(r.inicio, r.fin)} - {formatearDuracion(r.inicio, r.fin)} - {r.asistentes} pers. - {r.responsable}
                  </span>
                </div>
                {r.estado === 'confirmada' ? (
                  <button className="secundario" onClick={() => cancelar(r.id)}>
                    Cancelar
                  </button>
                ) : (
                  <span className="etiqueta">cancelada</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
