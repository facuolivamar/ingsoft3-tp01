"""Unit tests de las reglas de negocio (app/rules.py).

Cada test sigue Arrange / Act / Assert. `AHORA` es un presente fijo: las reglas
reciben `ahora` por parametro justamente para que el test no dependa del reloj.
"""
from datetime import datetime, timedelta
from types import SimpleNamespace

import pytest

from app import rules
from app.rules import ReglaViolada

AHORA = datetime(2026, 10, 26, 10, 0)
MANANA_10 = AHORA + timedelta(days=1)


# ---- Reglas 1, 2 y 3: validar_rango ----

def test_validar_rango_acepta_una_reserva_futura_de_una_hora():
    # Arrange
    inicio, fin = MANANA_10, MANANA_10 + timedelta(hours=1)
    # Act / Assert: no levanta nada
    rules.validar_rango(inicio, fin, AHORA)


def test_validar_rango_rechaza_una_reserva_que_empieza_en_el_pasado():
    inicio = AHORA - timedelta(minutes=1)
    fin = inicio + timedelta(hours=1)

    with pytest.raises(ReglaViolada, match="pasado"):
        rules.validar_rango(inicio, fin, AHORA)


@pytest.mark.parametrize(
    "minutos, mensaje",
    [
        (0, "posterior"),      # fin == inicio: el borde del `<=`
        (-30, "posterior"),    # fin antes que inicio
        (29, "al menos 30"),   # un minuto abajo del minimo
        (241, "mas de 4"),     # un minuto arriba del maximo
    ],
)
def test_validar_rango_rechaza_duraciones_fuera_de_30_min_a_4_h(minutos, mensaje):
    fin = MANANA_10 + timedelta(minutes=minutos)

    with pytest.raises(ReglaViolada, match=mensaje):
        rules.validar_rango(MANANA_10, fin, AHORA)


@pytest.mark.parametrize("minutos", [30, 240])
def test_validar_rango_acepta_exactamente_los_bordes_de_duracion(minutos):
    # Los bordes son inclusivos: 30 min y 4 h justas valen. Si alguien cambia
    # `<` por `<=` en la regla, este test se pone en rojo.
    rules.validar_rango(MANANA_10, MANANA_10 + timedelta(minutes=minutos), AHORA)


# ---- Regla 4: validar_capacidad ----

@pytest.mark.parametrize("asistentes", [1, 6])
def test_validar_capacidad_acepta_hasta_la_capacidad_de_la_sala(asistentes):
    rules.validar_capacidad(asistentes, capacidad_sala=6)


@pytest.mark.parametrize("asistentes, mensaje", [(0, "al menos un"), (7, "capacidad para 6")])
def test_validar_capacidad_rechaza_cero_asistentes_o_mas_que_la_capacidad(asistentes, mensaje):
    with pytest.raises(ReglaViolada, match=mensaje):
        rules.validar_capacidad(asistentes, capacidad_sala=6)


# ---- Regla 5: solapamiento ----

@pytest.mark.parametrize(
    "inicio_b, fin_b, esperado",
    [
        ("09:00", "10:00", False),  # termina justo cuando empieza A: conviven
        ("11:00", "12:00", False),  # empieza justo cuando termina A: conviven
        ("10:30", "11:30", True),   # se pisa con el final de A
        ("09:30", "10:30", True),   # se pisa con el principio de A
        ("10:15", "10:45", True),   # adentro de A
    ],
)
def test_se_solapan_no_cuenta_los_extremos_como_choque(inicio_b, fin_b, esperado):
    def h(hora):
        hh, mm = map(int, hora.split(":"))
        return MANANA_10.replace(hour=hh, minute=mm)

    resultado = rules.se_solapan(h("10:00"), h("11:00"), h(inicio_b), h(fin_b))

    assert resultado is esperado


def test_validar_sin_solapamiento_rechaza_si_la_sala_ya_esta_ocupada():
    existente = SimpleNamespace(inicio=MANANA_10, fin=MANANA_10 + timedelta(hours=2))
    libre = SimpleNamespace(inicio=MANANA_10 + timedelta(hours=5), fin=MANANA_10 + timedelta(hours=6))

    with pytest.raises(ReglaViolada, match="ya esta reservada"):
        rules.validar_sin_solapamiento(
            MANANA_10 + timedelta(hours=1), MANANA_10 + timedelta(hours=3), [libre, existente]
        )


# ---- Transicion de estado: validar_cancelable ----

def test_validar_cancelable_permite_cancelar_una_confirmada_futura():
    rules.validar_cancelable("confirmada", MANANA_10, AHORA)


@pytest.mark.parametrize(
    "estado, inicio, mensaje",
    [
        ("cancelada", MANANA_10, "ya estaba cancelada"),
        ("confirmada", AHORA, "ya empezo"),  # borde: empieza exactamente ahora
    ],
)
def test_validar_cancelable_rechaza_canceladas_o_ya_empezadas(estado, inicio, mensaje):
    with pytest.raises(ReglaViolada, match=mensaje):
        rules.validar_cancelable(estado, inicio, AHORA)


# ---- Ocupacion de una sala ----

def _reserva(desde_h, hasta_h):
    return SimpleNamespace(
        inicio=MANANA_10 + timedelta(hours=desde_h), fin=MANANA_10 + timedelta(hours=hasta_h)
    )


@pytest.mark.parametrize(
    "reservas, esperado",
    [
        ([], 0),                                   # sala libre
        ([_reserva(0, 2)], 50),                    # la mitad de una ventana de 4 h
        ([_reserva(-1, 1)], 25),                   # empieza antes: solo cuenta lo de adentro
        ([_reserva(3, 6)], 25),                    # termina despues: idem
        ([_reserva(5, 6)], 0),                     # totalmente afuera de la ventana
        ([_reserva(0, 4), _reserva(0, 4)], 100),   # datos inconsistentes: nunca mas de 100
    ],
)
def test_porcentaje_de_ocupacion_cuenta_solo_lo_que_cae_en_la_ventana(reservas, esperado):
    desde, hasta = MANANA_10, MANANA_10 + timedelta(hours=4)

    assert rules.porcentaje_de_ocupacion(reservas, desde, hasta) == esperado


def test_porcentaje_de_ocupacion_rechaza_una_ventana_vacia():
    with pytest.raises(ReglaViolada, match="positiva"):
        rules.porcentaje_de_ocupacion([], MANANA_10, MANANA_10)
