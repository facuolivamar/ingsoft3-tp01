"""Tests de los endpoints con la base reemplazada por un doble.

Los endpoints reciben la sesion de base por parametro (`db: Session =
Depends(get_db)`): la dependencia ya entra desde afuera, asi que en el test se
le pasa un `MagicMock` en lugar de una sesion real. No hace falta Postgres.
"""
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app import main
from app.models import Reserva
from app.schemas import ReservaCrear


def _datos(asistentes=4, horas_desde_ahora=24, duracion_min=60, sala_id=1):
    inicio = datetime.now().replace(microsecond=0) + timedelta(hours=horas_desde_ahora)
    return ReservaCrear(
        sala_id=sala_id,
        titulo="Daily",
        responsable="Facu",
        asistentes=asistentes,
        inicio=inicio,
        fin=inicio + timedelta(minutes=duracion_min),
    )


def _db_con(sala, confirmadas=()):
    """Doble de la sesion: `get` devuelve la sala, `scalars().all()` las reservas."""
    db = MagicMock()
    db.get.return_value = sala
    db.scalars.return_value.all.return_value = list(confirmadas)
    return db


def test_crear_reserva_valida_persiste_y_confirma():
    # Arrange
    db = _db_con(SimpleNamespace(id=1, capacidad=6))
    # Act
    reserva = main.crear_reserva(_datos(), db)
    # Assert: se guardo UNA reserva, confirmada, y se hizo commit
    db.add.assert_called_once()
    guardada = db.add.call_args.args[0]
    assert isinstance(guardada, Reserva)
    assert guardada.estado == "confirmada"
    db.commit.assert_called_once()
    assert reserva is guardada


def test_crear_reserva_que_viola_una_regla_devuelve_409_y_no_guarda_nada():
    db = _db_con(SimpleNamespace(id=1, capacidad=6))

    with pytest.raises(HTTPException) as error:
        main.crear_reserva(_datos(asistentes=10), db)

    assert error.value.status_code == 409
    assert "capacidad" in error.value.detail
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_crear_reserva_en_una_sala_inexistente_devuelve_404():
    db = _db_con(sala=None)

    with pytest.raises(HTTPException) as error:
        main.crear_reserva(_datos(sala_id=99), db)

    assert error.value.status_code == 404
    db.add.assert_not_called()


def test_cancelar_reserva_confirmada_futura_la_marca_cancelada():
    reserva = SimpleNamespace(estado="confirmada", inicio=datetime.now() + timedelta(days=1))
    db = MagicMock()
    db.get.return_value = reserva

    resultado = main.cancelar_reserva(7, db)

    assert resultado.estado == "cancelada"
    db.commit.assert_called_once()


@pytest.mark.parametrize("reserva, codigo", [(None, 404), ("ya_cancelada", 409)])
def test_cancelar_reserva_inexistente_o_ya_cancelada_falla(reserva, codigo):
    if reserva == "ya_cancelada":
        reserva = SimpleNamespace(estado="cancelada", inicio=datetime.now() + timedelta(days=1))
    db = MagicMock()
    db.get.return_value = reserva

    with pytest.raises(HTTPException) as error:
        main.cancelar_reserva(7, db)

    assert error.value.status_code == codigo
    db.commit.assert_not_called()


def test_ocupacion_de_sala_consulta_las_confirmadas_y_devuelve_el_porcentaje():
    ahora = datetime(2026, 11, 2, 10, 0)
    reserva = SimpleNamespace(inicio=ahora, fin=ahora + timedelta(hours=1))
    db = _db_con(SimpleNamespace(id=3, capacidad=6), confirmadas=[reserva])

    resultado = main.ocupacion_de_sala(3, ahora, ahora + timedelta(hours=2), db)

    assert resultado == {"sala_id": 3, "porcentaje": 50}
    db.scalars.assert_called_once()


@pytest.mark.parametrize("sala, horas, codigo", [(None, 2, 404), (SimpleNamespace(id=3), 0, 422)])
def test_ocupacion_de_sala_inexistente_o_ventana_invalida_falla(sala, horas, codigo):
    ahora = datetime(2026, 11, 2, 10, 0)
    db = _db_con(sala)

    with pytest.raises(HTTPException) as error:
        main.ocupacion_de_sala(3, ahora, ahora + timedelta(hours=horas), db)

    assert error.value.status_code == codigo


def test_borrar_reserva_existente_la_elimina():
    reserva = SimpleNamespace(id=7)
    db = MagicMock()
    db.get.return_value = reserva

    main.borrar_reserva(7, db)

    db.delete.assert_called_once_with(reserva)
    db.commit.assert_called_once()


def test_borrar_reserva_inexistente_devuelve_404_y_no_borra():
    db = MagicMock()
    db.get.return_value = None

    with pytest.raises(HTTPException) as error:
        main.borrar_reserva(7, db)

    assert error.value.status_code == 404
    db.delete.assert_not_called()


def test_un_pedido_que_no_cumple_el_schema_devuelve_400():
    import asyncio

    from fastapi.exceptions import RequestValidationError

    error = RequestValidationError([{"loc": ("body", "titulo"), "msg": "muy corto"}])

    respuesta = asyncio.run(main.pedido_invalido(MagicMock(), error))

    assert respuesta.status_code == 400
    assert b"titulo" in respuesta.body
