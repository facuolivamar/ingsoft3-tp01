"""Configuracion leida del entorno.

Ningun valor sensible vive en el codigo: la cadena de conexion se arma con
variables de entorno, que es lo que permite mover la misma imagen entre
entornos (local, CI, QA, produccion) sin recompilarla.
"""
import os


def database_url() -> str:
    """Cadena de conexion a PostgreSQL, armada desde el entorno.

    `POSTGRES_HOST` vale `db` dentro de compose (el nombre del servicio, que
    la red de compose resuelve por DNS) y `localhost` cuando se corre a mano.
    """
    url = os.getenv("DATABASE_URL")
    if url:
        return url

    user = os.getenv("POSTGRES_USER", "salas")
    password = os.getenv("POSTGRES_PASSWORD", "salas")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "salas")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}"
