"""Modelo de datos: salas y reservas."""
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

ESTADO_CONFIRMADA = "confirmada"
ESTADO_CANCELADA = "cancelada"


class Sala(Base):
    __tablename__ = "salas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    capacidad: Mapped[int] = mapped_column(Integer, nullable=False)

    reservas: Mapped[list["Reserva"]] = relationship(back_populates="sala")


class Reserva(Base):
    __tablename__ = "reservas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sala_id: Mapped[int] = mapped_column(ForeignKey("salas.id"), nullable=False)
    titulo: Mapped[str] = mapped_column(String(120), nullable=False)
    responsable: Mapped[str] = mapped_column(String(80), nullable=False)
    asistentes: Mapped[int] = mapped_column(Integer, nullable=False)
    inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fin: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    estado: Mapped[str] = mapped_column(String(20), nullable=False, default=ESTADO_CONFIRMADA)

    sala: Mapped["Sala"] = relationship(back_populates="reservas")
