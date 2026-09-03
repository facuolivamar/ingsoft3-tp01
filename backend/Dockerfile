# ---- Etapa 1: build (compila las dependencias) ----
# Necesita compilador y headers de PostgreSQL porque psycopg2 se construye
# desde fuente. Nada de esto tiene que sobrevivir a la imagen final.
FROM python:3.11-slim AS build

WORKDIR /build

# libc6-dev va explicito y no es redundante: con --no-install-recommends, apt
# instala gcc SIN los headers estandar de C, y el compilador queda presente
# pero incapaz de compilar (no encuentra stdio.h).
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libc6-dev libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Se copia solo requirements.txt antes que el codigo: mientras las dependencias
# no cambien, Docker reutiliza esta capa y no vuelve a compilar nada.
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# ---- Etapa 2: runtime (imagen final, sin compilador) ----
FROM python:3.11-slim AS runtime

# libpq5 es la biblioteca cliente que psycopg2 necesita para *correr*.
# libpq-dev y gcc, que hicieron falta para *compilar*, se quedaron en la etapa 1.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
    && rm -rf /wheels

COPY app ./app

# Usuario sin privilegios: si alguien se escapa del proceso, no es root.
RUN useradd --create-home --uid 1001 salas
USER salas

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
