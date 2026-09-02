"""API de Salas: reserva de salas de reunion."""
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import rules
from app.db import Base, engine, get_db
from app.models import ESTADO_CANCELADA, ESTADO_CONFIRMADA, Reserva, Sala
from app.schemas import ReservaCrear, ReservaOut, SalaOut

app = FastAPI(title="Salas", version="1.0.0")

# En desarrollo el front corre en Vite (puerto 5173) y el back en 8000, asi que
# son origenes distintos. En produccion nginx sirve el front y proxea /api, con
# lo cual el navegador ve un unico origen y CORS deja de intervenir.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SALAS_INICIALES = [
    ("Auditorio", 40),
    ("Sala Norte", 12),
    ("Sala Sur", 6),
    ("Box de reuniones", 4),
]


@app.on_event("startup")
def preparar_base() -> None:
    """Crea las tablas y carga las salas si la base esta vacia.

    Alcanza para este TP; a partir del momento en que el esquema cambie sobre
    datos existentes, esto se reemplaza por migraciones.
    """
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        if db.scalar(select(Sala).limit(1)) is None:
            db.add_all([Sala(nombre=n, capacidad=c) for n, c in SALAS_INICIALES])
            db.commit()


@app.get("/api/health")
def health():
    """Sonda de salud: la usa el healthcheck del contenedor."""
    return {"status": "ok"}


@app.get("/api/salas", response_model=list[SalaOut])
def listar_salas(db: Session = Depends(get_db)):
    return db.scalars(select(Sala).order_by(Sala.nombre)).all()


@app.get("/api/reservas", response_model=list[ReservaOut])
def listar_reservas(sala_id: int | None = None, db: Session = Depends(get_db)):
    consulta = select(Reserva).order_by(Reserva.inicio)
    if sala_id is not None:
        consulta = consulta.where(Reserva.sala_id == sala_id)
    return db.scalars(consulta).all()


@app.post("/api/reservas", response_model=ReservaOut, status_code=201)
def crear_reserva(datos: ReservaCrear, db: Session = Depends(get_db)):
    """Aplica las cinco reglas de negocio antes de persistir."""
    sala = db.get(Sala, datos.sala_id)
    if sala is None:
        raise HTTPException(status_code=404, detail="La sala no existe.")

    confirmadas = db.scalars(
        select(Reserva).where(
            Reserva.sala_id == sala.id,
            Reserva.estado == ESTADO_CONFIRMADA,
        )
    ).all()

    try:
        rules.validar_rango(datos.inicio, datos.fin, datetime.now())
        rules.validar_capacidad(datos.asistentes, sala.capacidad)
        rules.validar_sin_solapamiento(datos.inicio, datos.fin, confirmadas)
    except rules.ReglaViolada as error:
        # 409: el pedido esta bien formado, pero choca con el estado del sistema.
        raise HTTPException(status_code=409, detail=error.mensaje) from error

    reserva = Reserva(**datos.model_dump(), estado=ESTADO_CONFIRMADA)
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva


@app.post("/api/reservas/{reserva_id}/cancelar", response_model=ReservaOut)
def cancelar_reserva(reserva_id: int, db: Session = Depends(get_db)):
    reserva = db.get(Reserva, reserva_id)
    if reserva is None:
        raise HTTPException(status_code=404, detail="La reserva no existe.")

    try:
        rules.validar_cancelable(reserva.estado, reserva.inicio, datetime.now())
    except rules.ReglaViolada as error:
        raise HTTPException(status_code=409, detail=error.mensaje) from error

    reserva.estado = ESTADO_CANCELADA
    db.commit()
    db.refresh(reserva)
    return reserva
