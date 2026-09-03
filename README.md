# Salas — reserva de salas de reunión

[![CI](https://github.com/facuolivamar/ingsoft3-tp01/actions/workflows/ci.yml/badge.svg)](https://github.com/facuolivamar/ingsoft3-tp01/actions/workflows/ci.yml)

App del semestre de **Ingeniería de Software 3 — UCC 2026**, y repositorio donde se acumulan
los prácticos: cada TP agrega una capa de automatización sobre el mismo código.

Frontend React + Vite, backend FastAPI, base PostgreSQL. Todo contenerizado y orquestado con
Docker Compose.

## Qué hace

Gestiona la reserva de salas de reunión. La lógica que importa está en las reglas de negocio
([`backend/app/rules.py`](backend/app/rules.py)), escritas como funciones puras:

1. Una reserva no puede empezar en el pasado.
2. El horario de fin tiene que ser posterior al de inicio.
3. La duración va de 30 minutos a 4 horas.
4. Los asistentes no pueden superar la capacidad de la sala.
5. Dos reservas confirmadas de la misma sala no pueden solaparse — pero sí pueden ser
   contiguas: una de 14:00 a 16:00 y otra de 16:00 a 17:00 conviven.

Más una transición de estado: solo se cancela una reserva confirmada que todavía no empezó.

## Levantarlo en una máquina limpia

Requiere Docker con Compose v2. Nada más: ni Node, ni Python, ni PostgreSQL instalados.

```bash
git clone https://github.com/facuolivamar/ingsoft3-tp01.git
cd ingsoft3-tp01
cp .env.example .env      # 1) los secretos no viajan en el repo
docker compose up -d      # 2) levanta base, API y frontend
```

Son **dos** comandos, y el primero no se puede saltear: `.env` está en `.gitignore`, así que
no existe hasta que lo creás. Eso es a propósito — es lo único que no puede viajar en un
repositorio público.

Después:

| Qué | Dónde |
|---|---|
| Aplicación | http://localhost:8080 |
| API | http://localhost:8000/api/salas |
| Documentación interactiva de la API | http://localhost:8000/docs |

Para apagarlo:

```bash
docker compose down       # conserva los datos
docker compose down -v    # borra también el volumen de la base
```

## Levantarlo desde el registry (sin compilar)

Las imágenes están publicadas y son públicas. Con `docker-compose.registry.yml` no hace falta
el código fuente: se bajan en vez de construirse.

```bash
cp .env.example .env
docker compose -f docker-compose.registry.yml up -d
```

- `ghcr.io/facuolivamar/salas-backend:v0.1.0`
- `ghcr.io/facuolivamar/salas-frontend:v0.1.0`

## Cómo está armado

```
backend/          FastAPI + SQLAlchemy
  app/rules.py      ← las reglas de negocio, puras y sin dependencias
  app/main.py       ← la API que las aplica
  Dockerfile        ← multi-stage: compila wheels, corre sin compilador
frontend/         React + Vite
  src/format.js     ← validación y formato, funciones puras
  src/App.jsx       ← la interfaz
  nginx.conf        ← sirve la SPA y proxea /api al backend
  Dockerfile        ← multi-stage: build con Node, sirve con nginx
docker-compose.yml            construye las imágenes
docker-compose.registry.yml   las baja del registry
```

El navegador nunca le habla directo al backend: le pega a `/api` en su mismo origen y nginx
reenvía a `http://backend:8000`. `backend` es el nombre del servicio en Compose, y lo resuelve
el DNS de la red interna — por eso no hay ninguna dirección IP en el código.

## Verificación automática

Cada Pull Request hacia `main` y cada push a `main` construyen las dos imágenes con los
Dockerfiles de este repositorio, en jobs paralelos y con caché de capas. `main` no acepta un merge
si el pipeline no está en verde — y la regla alcanza también al dueño del repositorio.

El estado de la última corrida es el badge de arriba; el detalle está en la pestaña
[Actions](https://github.com/facuolivamar/ingsoft3-tp01/actions).

## Documentación de los prácticos

- **[decisiones.md](decisiones.md)** — las decisiones técnicas de cada TP y su porqué, los
  problemas encontrados, y la declaración de uso de IA.
- **[evidencias.md](evidencias.md)** — capturas y salidas que prueban que cada cosa funciona.

## Entregas

| TP | Tag | Qué incluye |
|---|---|---|
| TP1 — Git colaborativo | [`v1.0.0`](https://github.com/facuolivamar/ingsoft3-tp01/releases/tag/v1.0.0) | `main` protegida, flujo de Pull Requests, conflicto resuelto |
| TP2 — Contenedores | [`v2.0.0`](https://github.com/facuolivamar/ingsoft3-tp01/releases/tag/v2.0.0) | La app del semestre, Dockerfiles multi-stage, Compose e imágenes publicadas |
| TP3 — Planificación | [`v3.0.0`](https://github.com/facuolivamar/ingsoft3-tp01/releases/tag/v3.0.0) | Jerarquía de trabajo, sprint, tablero con límite de WIP y trazabilidad |
| TP4 — CI | [`v4.0.0`](https://github.com/facuolivamar/ingsoft3-tp01/releases/tag/v4.0.0) | Pipeline de build en cada PR, con caché de capas y actuando como gate de merge |
