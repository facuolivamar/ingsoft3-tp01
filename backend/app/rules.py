"""Reglas de negocio de Salas.

Estas funciones son **puras**: reciben datos y devuelven una decision, sin tocar
la base ni el framework web. Esa separacion es deliberada — permite testearlas
sin levantar Postgres ni el servidor, y es donde vive lo que el sistema
realmente decide.

Las cinco reglas:

1. Una reserva no puede empezar en el pasado.
2. El fin tiene que ser posterior al inicio.
3. La duracion va de 30 minutos a 4 horas.
4. Los asistentes no pueden superar la capacidad de la sala.
5. Dos reservas confirmadas de la misma sala no pueden solaparse.

Y una transicion de estado: solo se cancela una reserva confirmada que todavia
no empezo.
"""
from datetime import datetime, timedelta

DURACION_MINIMA = timedelta(minutes=30)
DURACION_MAXIMA = timedelta(hours=4)


class ReglaViolada(Exception):
    """Una regla de negocio dijo que no. El mensaje es para el usuario final."""

    def __init__(self, mensaje: str):
        super().__init__(mensaje)
        self.mensaje = mensaje


def validar_rango(inicio: datetime, fin: datetime, ahora: datetime) -> None:
    """Reglas 1, 2 y 3: el intervalo tiene que ser futuro, positivo y razonable.

    `ahora` se recibe como parametro en vez de leerlo de `datetime.now()` para
    que la regla sea determinista y testeable: un test puede fijar el presente.
    """
    if inicio < ahora:
        raise ReglaViolada("No se puede reservar en el pasado.")

    if fin <= inicio:
        raise ReglaViolada("El horario de fin tiene que ser posterior al de inicio.")

    duracion = fin - inicio
    if duracion < DURACION_MINIMA:
        raise ReglaViolada("La reserva tiene que durar al menos 30 minutos.")
    if duracion > DURACION_MAXIMA:
        raise ReglaViolada("La reserva no puede durar mas de 4 horas.")


def validar_capacidad(asistentes: int, capacidad_sala: int) -> None:
    """Regla 4: no se puede citar mas gente de la que entra en la sala."""
    if asistentes < 1:
        raise ReglaViolada("Tiene que haber al menos un asistente.")
    if asistentes > capacidad_sala:
        raise ReglaViolada(
            f"La sala tiene capacidad para {capacidad_sala} personas y pediste {asistentes}."
        )


def se_solapan(inicio_a: datetime, fin_a: datetime, inicio_b: datetime, fin_b: datetime) -> bool:
    """Dos intervalos se solapan si cada uno empieza antes de que el otro termine.

    Los extremos NO cuentan como solapamiento: una reserva de 10:00 a 11:00 y
    otra de 11:00 a 12:00 conviven. Por eso las comparaciones son estrictas.
    """
    return inicio_a < fin_b and inicio_b < fin_a


def validar_sin_solapamiento(inicio: datetime, fin: datetime, reservas_de_la_sala) -> None:
    """Regla 5: la sala no puede estar ocupada por dos reservas a la vez.

    `reservas_de_la_sala` son las reservas **confirmadas** de esa sala; las
    canceladas ya liberaron el horario y no se miran.
    """
    for reserva in reservas_de_la_sala:
        if se_solapan(inicio, fin, reserva.inicio, reserva.fin):
            raise ReglaViolada(
                f"La sala ya esta reservada de {reserva.inicio:%H:%M} a {reserva.fin:%H:%M} "
                f"el {reserva.inicio:%d/%m/%Y}."
            )


def validar_cancelable(estado: str, inicio: datetime, ahora: datetime) -> None:
    """Transicion de estado: confirmada -> cancelada, y solo antes de empezar.

    Cancelar algo que ya paso no libera nada: solo falsea el historial.
    """
    if estado == "cancelada":
        raise ReglaViolada("La reserva ya estaba cancelada.")
    if inicio <= ahora:
        raise ReglaViolada("No se puede cancelar una reserva que ya empezo.")
