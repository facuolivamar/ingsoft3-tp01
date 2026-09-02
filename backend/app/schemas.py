"""Contratos de entrada y salida de la API (Pydantic)."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SalaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    capacidad: int


class ReservaCrear(BaseModel):
    sala_id: int
    titulo: str = Field(min_length=3, max_length=120)
    responsable: str = Field(min_length=2, max_length=80)
    asistentes: int = Field(ge=1)
    inicio: datetime
    fin: datetime


class ReservaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sala_id: int
    titulo: str
    responsable: str
    asistentes: int
    inicio: datetime
    fin: datetime
    estado: str
    sala: SalaOut
