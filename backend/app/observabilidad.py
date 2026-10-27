"""Sentry: errores, demoras y uso, reportados por la propia app.

Se prende solo si hay SENTRY_DSN en el entorno: en los unit tests y en el
compose local no hay, y la app no manda nada. Cada entorno (QA, PROD) declara
su SENTRY_ENVIRONMENT, para separar en Sentry de donde vino cada dato.
"""
import os

import sentry_sdk


def iniciar_sentry() -> None:
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        return
    sentry_sdk.init(
        dsn=dsn,
        environment=os.getenv("SENTRY_ENVIRONMENT", "local"),
        release=os.getenv("SENTRY_RELEASE"),
        # Cada pedido mide su duracion: es lo que arma la tabla de uso y demoras.
        traces_sample_rate=1.0,
        send_default_pii=False,
    )
