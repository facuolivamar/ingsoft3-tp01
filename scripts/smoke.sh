#!/usr/bin/env bash
# Smoke test post-deploy: ¿el entorno recien desplegado contesta?
#
# Tres preguntas, de afuera hacia adentro:
#   1. /api/health       -> el proceso de la api esta vivo
#   2. /api/salas        -> la api llega a SU base (consulta real)
#   3. el front + /api/salas a traves de nginx -> el front habla con su api
#
# Reintenta porque "docker compose up" vuelve apenas arranca los contenedores,
# no cuando la app esta lista (Postgres y uvicorn tardan unos segundos). Si
# despues de todos los intentos no contesta, sale con 1 y el job queda rojo.
#
# Lo que NO prueba: que la version que corre sea la correcta, ni que las
# reglas de negocio funcionen. Eso es de los tests (TP5) y de las e2e (TP7).
set -u
INTENTOS=${INTENTOS:-20}
ESPERA=${ESPERA:-5}

for i in $(seq 1 "$INTENTOS"); do
  if curl -fsS --max-time 10 "$URL_API/api/health" > /dev/null \
     && curl -fsS --max-time 10 "$URL_API/api/salas" > /dev/null \
     && curl -fsS --max-time 10 "$URL_WEB/" > /dev/null \
     && curl -fsS --max-time 10 "$URL_WEB/api/salas" > /dev/null; then
    echo "OK en el intento $i: api viva, base accesible, front sirviendo y hablando con su api"
    exit 0
  fi
  echo "Intento $i/$INTENTOS: todavia no responde, espero ${ESPERA}s"
  sleep "$ESPERA"
done

echo "El entorno no respondio despues de $INTENTOS intentos"
exit 1
