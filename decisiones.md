# Decisiones

Las decisiones técnicas de cada práctico, por qué se tomaron, qué problemas aparecieron en el
camino y cómo se resolvieron. Se acumula: cada TP agrega su sección abajo, no reemplaza a la
anterior.

---

## TP1 — Git colaborativo

### 1. Por qué Git no pudo resolver el conflicto solo

#### Qué pasó exactamente

`feature/titulo-a` y `feature/titulo-b` nacieron **las dos del mismo commit de `main`** y escribieron
un título distinto en la **misma primera línea** del `README.md`. Mergeé A: entró limpio, porque en
ese momento `main` seguía igual que cuando A se creó. Al intentar mergear B, GitHub se encontró con
que la línea que B quería escribir ya había sido escrita por otro, con otro contenido, desde el mismo
punto de partida.

Git compara texto, no significado. No tiene forma de saber si "versión A" es mejor que "versión B",
si una reemplaza a la otra o si hay que combinarlas: son dos strings distintos en la misma posición,
derivados del mismo ancestro. Frente a eso hace lo único honesto que puede hacer: escribe las dos
versiones en el archivo, marca con `<<<<<<<`, `=======` y `>>>>>>>` dónde empieza y termina cada una,
y le devuelve la decisión a una persona.

La prueba de que el criterio es **por línea y no por archivo** está en la captura 3: la sección
`## Instalación`, que venía del PR #1, se fusionó sola y aparece sin marcadores, en el mismo archivo
que sí tuvo conflicto. Ninguna de las dos ramas la tocó, así que no había nada que decidir.

Resolver, entonces, no fue ejecutar un comando: fue **decidir el contenido**. Elegí que quedara la
versión B, borré las tres líneas de marcadores a mano —el botón *Mark as resolved* está deshabilitado
mientras quede alguno— y recién ahí GitHub habilitó el merge.

#### Qué habría tenido que pasar para que nunca apareciera

**Integrar seguido.** Si `feature/titulo-b` se hubiera creado *después* de mergear A (o si antes de
crearla hubiera hecho `git pull` en `main`), habría partido de un `main` que ya tenía el título A.
El cambio habría sido secuencial —A y después B— y no habría habido nada que resolver. Las ramas
cortas no evitan los conflictos: los hacen chicos y triviales, porque cuanto menos tiempo vive una
rama, menos se aleja de `main`.

**Repartir el trabajo por zonas.** Si cada rama hubiera tocado una parte distinta del README, Git
habría fusionado las dos sin preguntar, igual que hizo con la sección de instalación.

**Ponerse de acuerdo antes de escribir.** El conflicto de fondo no era técnico: eran dos decisiones
incompatibles sobre cómo se llama el proyecto, tomadas en paralelo. Git solo lo hizo visible en el
momento de integrar. La herramienta expone el desacuerdo, no lo causa.

En este TP el conflicto se fabricó a propósito, en un entorno controlado. Es bastante mejor que
encontrarse con el primero en un repositorio de producción y con alguien esperando.

### 2. Qué problemas encontré y cómo los solucioné

#### a) La rama del primer PR nació con el nombre automático de GitHub

Al editar el README desde la web, la protección de `main` me desvió al diálogo *Create a new branch
for this commit and start a pull request* — y acepté el nombre que venía propuesto,
`facuolivamar-patch-1`. Recién lo noté en la pantalla de creación del PR, donde el nombre de la rama
ya **no es editable**: ahí solo se elige `base` y `compare`.

La convención de la materia es `feature/<descripcion>`, así que no lo dejé pasar. Sin crear todavía
el PR, lo renombré desde **Branches → Rename branch** a `feature/seccion-instalacion`, y volví a
abrir el PR desde cero. El PR [#1](https://github.com/facuolivamar/ingsoft3-tp01/pull/1) quedó con el
nombre correcto.

Lo que aprendí: el nombre de la rama se decide en el diálogo del commit, que es el único momento en
que la web te lo deja escribir. Después se puede corregir, pero es un paso extra.

#### b) El README quedó con dos títulos H1

Al fabricar el conflicto, en vez de **reemplazar** la primera línea del README agregué una línea
nueva arriba en cada rama. El conflicto salió igual —las dos ramas escribieron la misma posición—
pero el resultado del merge fue un archivo con dos encabezados de nivel 1: el título del ejercicio
(`# rama b _ eDICION EJERCICIO`) y el original (`# ingsoft3-tp01`). En Markdown eso está mal formado:
un documento tiene un solo H1.

Lo corregí en el PR de documentación, dejando un único título. La historia del conflicto no se pierde
por eso: sigue estando en los PRs #2 y #3 y en el commit `f9eef5d`, que es adonde apunta el tag
`v1.0.0`.

#### c) El push rechazado no era un error a arreglar

La primera reacción al ver `[remote rejected] main -> main (protected branch hook declined)` en rojo
fue buscar qué había hecho mal. No había nada: ese mensaje **es** el resultado esperado del paso, la
prueba de que la protección funciona y de que me alcanza a mí. El commit local que había quedado
huérfano se descartó con `git reset --hard HEAD~1`.

#### d) Aprobaciones obligatorias en un TP individual

Al activar *Require a pull request before merging*, GitHub tilda solo *Require approvals* con valor
1. Lo dejé en **cero**, porque GitHub no permite que el autor de un PR apruebe su propio PR: con una
aprobación obligatoria en un trabajo individual, ningún PR se podría mergear nunca. La revisión la
hice igual, a mano, leyendo el diff en *Files changed* antes de mergear cada PR. En un equipo real
ahí iría 1 o más.

### 3. Declaración de uso de IA

Usé **Claude (Claude Code)** durante todo el TP, con acceso a la terminal y al repositorio local.

#### Qué hice yo

- Leer y resumir la consigna del repositorio de la cátedra, y armarme la hoja de ruta de los pasos que faltaban.
- Crear el repositorio público y configurar la protección de `main` (*Require a pull request*, cero
  aprobaciones, *Do not allow bypassing*).
- Provocar el rechazo del push directo y sacar la captura.
- Crear las ramas, editar los archivos y abrir y mergear los tres Pull Requests desde la web.
- **Resolver el conflicto**: decidir que quedara la versión B y borrar los marcadores a mano en el
  editor web, en vez de usar los botones *Accept current / incoming change*.
- Sacar las cuatro capturas.

#### Qué delegué
  
- Ejecutar comandos de Git ya decididos: `git pull`, la creación y push del tag anotado `v1.0.0`, y
  el borrado de las dos ramas de feature ya mergeadas.
- Ordenar y renombrar las capturas dentro de `img/`.
- Redactar los borradores de este archivo y de `evidencias.md`.

#### Cómo verifiqué lo que me devolvió

No di por buena ninguna afirmación sin contrastarla contra el estado real del repositorio:

- El listado de PRs, sus ramas y sus fechas de merge, contra la API de GitHub
  (`/repos/facuolivamar/ingsoft3-tp01/pulls?state=all`): los tres figuran mergeados contra `main`.
- El historial y el tag, contra `git log --oneline --decorate`: `v1.0.0` apunta a `f9eef5d`, el
  commit del PR que resolvió el conflicto.
- Los textos de `evidencias.md`, contra las capturas abiertas una por una: los mensajes de error, el
  hash `5adf3c2`, el `1 conflict` y los marcadores están transcriptos de lo que se ve en la imagen,
  no reconstruidos de memoria.
- La ubicación del tag, contra el repositorio de ejemplo de la cátedra (`arielsch74/tp01live`), donde
  `v1.0.0` está en la misma posición: el merge del conflicto, antes de los archivos de documentación.

Lo que la IA no puede hacer por mí es la defensa oral, así que las explicaciones de la sección 1 —por
qué Git no pudo decidir solo, y por qué el resto del archivo se fusionó sin preguntar— las escribí
después de mirar la captura de los marcadores y entender qué estaba viendo.

---

## TP2 — Contenedores

### 1. Qué app elegí y por qué

**Salas** — un sistema de reserva de salas de reunión, escrito para este TP: FastAPI + React/Vite
+ PostgreSQL.

La guía da cinco criterios para elegir la app del semestre. Contra esos criterios:

| Criterio | Cómo lo cumple |
|---|---|
| Arranca de entrada | `docker compose up -d` levanta las tres piezas; no hay pasos manuales más allá del `cp .env.example .env`. |
| Sé los comandos de build | `pip wheel -r requirements.txt` y `npm run build`. Son los que están en los Dockerfiles. |
| La conexión a la BD es parametrizable | `backend/app/config.py` arma la cadena desde variables de entorno. Cambiar de base no toca una línea de código. |
| Tiene lógica testeable | Cinco reglas de negocio en `backend/app/rules.py`, más una transición de estado, escritas como **funciones puras**: no tocan la base ni FastAPI. Del lado del front, `src/format.js` tiene la validación y el formato, también puros. |
| La entiendo entera | La escribí yo, con la asistencia declarada abajo. No hay una línea que no pueda explicar. |

**Por qué no cloné una de GitHub.** Era la opción obvia y la descarté por dos razones. La primera
es de riesgo: si un proyecto ajeno no levanta en la primera media hora, el tiempo perdido sale del
TP4. La segunda pesa más — la defensa oral es el 50% de la nota, y una de las preguntas anunciadas
es enumerar las reglas de negocio de la app. Defender reglas que escribió otro es exactamente el
escenario que la cátedra dice que no aprueba.

**Por qué este dominio.** Reservar salas produce reglas que se verifican solas: un horario se
solapa o no se solapa, la gente entra o no entra. El TP5 va a pedir 8 tests de backend y 4 de
frontend, y acá salen del dominio sin inventar nada. El caso más interesante ya está resuelto: dos
reservas **contiguas** (14:00 a 16:00 y 16:00 a 17:00) no se solapan, porque la comparación de los
extremos es estricta. Es un caso borde real, no decorativo, y es el primero que se rompe si alguien
cambia un `<` por un `<=`.

### 2. Decisiones de contenerización

**Imágenes base.**

- Backend: `python:3.11-slim`. La variante slim trae el intérprete y poco más. `alpine` habría sido
  más chica todavía, pero usa musl en vez de glibc, y compilar extensiones en C ahí (psycopg2) trae
  problemas que no quería sumar.
- Frontend en build: `node:22-alpine`, donde el tamaño no importa porque la etapa se descarta.
- Frontend en runtime: `nginx:1.27-alpine`. Un servidor de archivos estáticos no necesita más.
- Base: `postgres:16-alpine`, la oficial.

Todas con la versión fijada. `latest` significa "lo que haya hoy", y eso es lo contrario de
reproducible: el mismo `docker build` daría imágenes distintas dentro de dos semanas.

**Por qué multi-stage, con números.** No es una formalidad; se mide:

| Imagen | Etapa de build | Final | Diferencia |
|---|---|---|---|
| backend | 374 MB | 223 MB | -151 MB (-40%) |
| frontend | 218 MB | 48,4 MB | -78% |

En el backend, la etapa de build carga `gcc`, `libc6-dev` y `libpq-dev` para compilar psycopg2
desde fuente. Nada de eso hace falta para **correr**: la imagen final solo lleva `libpq5`, que es la
biblioteca cliente. En el frontend la diferencia es más grande porque la imagen final **no tiene
Node**: es nginx con los archivos estáticos que Vite generó. Las 117 dependencias de desarrollo
existieron durante el build y desaparecieron.

Si no fuera multi-stage, además del peso, cada imagen en producción llevaría un compilador adentro.
Eso no es solo desperdicio: es una herramienta disponible para cualquiera que consiga ejecutar algo
dentro del contenedor.

**Orden de las capas.** En los dos Dockerfiles se copia primero el manifiesto de dependencias
(`requirements.txt` en uno, `package.json` y `package-lock.json` en el otro) y recién después el
código. Mientras las dependencias no cambien, Docker reutiliza esa capa y se saltea la instalación
entera. Al revés, copiando todo junto, cada cambio de una línea de código invalidaría el caché y
volvería a bajar todo. Esto se vuelve importante en el TP4, cuando el que construye es un pipeline
que arranca de cero cada vez.

**Qué persiste y qué no.** Solo la base, en el volumen con nombre `datos_db` montado en
`/var/lib/postgresql/data`. Todo lo demás es descartable por diseño: los contenedores de backend y
de frontend no guardan estado, y se pueden borrar y recrear sin pérdida. Por eso `docker compose
down` conserva los datos y solo `down -v` los borra: el volumen tiene un ciclo de vida propio,
independiente del contenedor que lo usa.

**El usuario no root.** La imagen del backend crea el usuario `salas` (uid 1001) y corre con él. Por
defecto un contenedor corre como root, y no hay razón para que un proceso que solo responde HTTP
tenga ese privilegio.

**Los secretos.** `.env` está en `.gitignore` y nunca se commiteó; lo que se versiona es
`.env.example`, que documenta **qué** variables hacen falta sin revelar sus valores. Por eso el
arranque son dos comandos y no uno: el `cp .env.example .env` no se puede evitar, y esa fricción es
justamente el punto. En el TP4, cuando esto lo levante un pipeline, esos valores van a venir de los
secrets del repositorio y no de un archivo en disco.

**Por qué el navegador no le habla directo al backend.** nginx sirve la SPA y proxea `/api` hacia
`http://backend:8000`. El front pide siempre rutas relativas, así que no sabe (ni necesita saber)
dónde vive la API. `backend` es el nombre del servicio en Compose, y lo resuelve el DNS de la red
interna: por eso no hay ninguna dirección IP en el código ni en la configuración.

### 3. Qué problemas encontré y cómo los solucioné

#### a) gcc instalado, pero incapaz de compilar

El primer `docker compose build` falló compilando psycopg2, con `error: command '/usr/bin/gcc'
failed with exit code 1`. El mensaje que imprime psycopg2 sugiere que falta `pg_config`, y ese es el
diagnóstico equivocado: `pg_config` estaba instalado.

Lo aislé fuera del Dockerfile, corriendo el mismo `apt-get` y el mismo `pip wheel` en un contenedor
suelto. Con `apt-get install gcc libpq-dev` compilaba bien. Con `apt-get install
--no-install-recommends gcc libpq-dev`, que es lo que decía mi Dockerfile, fallaba. La diferencia
estaba ahí: **gcc declara `libc6-dev` como paquete recomendado, no como dependencia**, así que
`--no-install-recommends` lo deja afuera. El resultado es un compilador presente que no encuentra
`stdio.h`.

La verificación fue directa: `ls /usr/include/stdio.h` decía que el archivo no existía en el caso
que fallaba, y existía en el que funcionaba. La solución es nombrar `libc6-dev` explícitamente en la
línea de instalación. Se mantiene `--no-install-recommends`, que es lo que evita que la imagen se
llene de paquetes que nadie pidió, y se declara la dependencia real que estaba implícita.

Lo que aprendí: `--no-install-recommends` es correcto, pero convierte los paquetes recomendados en
responsabilidad tuya. Y el mensaje de error de una herramienta apunta a su causa más común, que no
es necesariamente la tuya.

#### b) npm ci necesita un lockfile que no existía

El Dockerfile del frontend usa `npm ci` en vez de `npm install`, porque `ci` instala exactamente las
versiones del `package-lock.json` y falla si el lock no coincide con el `package.json`. Eso es
justamente lo que se quiere en un build reproducible. Pero el proyecto era nuevo y no tenía lock, y
`ci` aborta.

Se resolvió corriendo `npm install` una vez en local para generar el `package-lock.json` (117
paquetes, lockfileVersion 3) y commiteándolo. El lock **se versiona**: es lo que hace que el build de
hoy y el del pipeline del TP4 instalen exactamente lo mismo.

#### c) El healthcheck no era opcional

`depends_on` solo espera a que el contenedor de Postgres **arranque**, y Postgres acepta conexiones
bastante después de eso. Sin la sonda, el backend arrancaba primero y se caía al no poder
conectarse. Con `healthcheck` más `condition: service_healthy`, la salida de `docker compose up` lo
muestra explícito: `db Waiting`, después `db Healthy`, y recién ahí `backend Starting`.

### 4. Declaración de uso de IA

Usé **Claude (Claude Code)** con acceso a la terminal, a Docker y al repositorio.

**Qué decidí yo:** el dominio de la aplicación y cuáles son sus reglas de negocio; el stack; que la
app fuera escrita a medida en vez de clonada de GitHub.

**Qué delegué:** la escritura del código de la app, de los Dockerfiles y de los archivos de Compose;
el diagnóstico del error de compilación de psycopg2; la ejecución de los builds y de las pruebas
contra la API; y los borradores de este archivo y de `evidencias.md`.

**Cómo verifiqué lo que me devolvió.** Nada de lo que está acá se afirma sin haberlo corrido:

- Las cinco reglas de negocio se probaron **contra la API levantada**, con ocho llamadas HTTP: una
  reserva válida (201), un solapamiento (409), el caso borde de dos reservas contiguas (201, que es
  el resultado correcto y el que más fácil se rompe), capacidad excedida (409), duración menor a 30
  minutos (409), una reserva en el pasado (409), una cancelación (200) y la misma cancelación
  repetida (409). Las salidas completas están en `evidencias.md`.
- La persistencia se probó de verdad: `down`, `up`, y las dos reservas seguían ahí; después `down
  -v` y la base volvió vacía.
- Los tamaños de imagen de la tabla salen de `docker images`, construyendo las etapas intermedias
  con `--target build` para poder compararlas. No son estimaciones.
- El diagnóstico de `libc6-dev` no se aceptó como explicación: se reprodujo el fallo y el éxito en
  contenedores sueltos, y se confirmó con `ls /usr/include/stdio.h` en los dos casos.
- El arranque desde cero se verificó siguiendo el README, no de memoria.
