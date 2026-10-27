# Decisiones

Las decisiones técnicas de cada práctico, por qué se tomaron, qué problemas aparecieron en el
camino y cómo se resolvieron. Se acumula: cada TP agrega su sección abajo, no reemplaza a la
anterior.

## Enlaces de los TPs 6 y 7

Lo que no se encuentra navegando el repo: los paquetes, las URLs y las corridas que prueban cada decisión. El detalle de cada TP está en su sección.

### Enlaces del TP6

| Lo que prueba | Enlace |
|---|---|
| Paquete del backend (público, etiquetas `sha-<commit>`) | https://github.com/users/facuolivamar/packages/container/package/salas-backend · espejo: https://hub.docker.com/r/facuolivam/salas-backend/tags |
| Paquete del frontend | https://github.com/users/facuolivamar/packages/container/package/salas-frontend · espejo: https://hub.docker.com/r/facuolivam/salas-frontend/tags |
| Cadena (1): job de un **PR** con los tests en verde y «Entrar al registry» **salteado** | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40430415676/job/121946435557 |
| Cadena (2): job de **`main`** donde «Construir y publicar la imagen» es el **último** paso, después de los tests | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40428688559/job/121940783542 |
| Flujo completo: QA verde → *Waiting for review* → aprobación → PROD con smoke verde | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40428688559 |
| **Rechazo** con motivo | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40430500012 |
| URLs (plan C, en la notebook) | QA: http://localhost:8081 (api http://localhost:8001) · PROD: http://localhost:8082 (api http://localhost:8002) |

`docker pull ghcr.io/facuolivamar/salas-backend:sha-3de35b3e70e5403e94f2ffb83b332b998a3650b4` funciona
sin credenciales desde cualquier máquina (y su espejo `docker.io/facuolivam/salas-backend:sha-…`).

### Enlaces del TP7

| Lo que prueba | Enlace |
|---|---|
| Paquetes con sus etiquetas `sha-…` | los de la tabla del TP6 |
| El **commit que rompió la app** (texto del botón, código de la app, no de `e2e/`) | https://github.com/facuolivamar/ingsoft3-tp01/pull/24 |
| La corrida con **integración VERDE y e2e ROJA**, `Deploy a PROD` sin arrancar | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40429673414 |
| Su reporte de integración (verde) | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40429673414/artifacts/12701217545 |
| Su reporte e2e (rojo, con screenshot y traza) | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40429673414/artifacts/12701154770 |
| El arreglo | https://github.com/facuolivamar/ingsoft3-tp01/pull/27 |
| La **corrida completa en verde** posterior, hasta PROD | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40430750509 |
| URLs de QA y PROD | las del TP6 (plan C) |

---

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

---

## TP3 — Planificación y trazabilidad

### 1. Duración del sprint: 1 semana

La materia entrega un práctico por semana y la clase funciona como evento de revisión. Un sprint
de una semana hace que el corte del sprint coincida con el momento en que hay algo que mostrar:
el final de la iteración y la demostración caen juntos, que es para lo que sirve el corte.

Con dos semanas, cada sprint cruzaría dos entregas y el límite dejaría de significar algo — sería
una fecha en el calendario sin nada que la haga cierta. Con menos de una semana, la ceremonia
(planificar, revisar, ajustar) pesaría más que el trabajo que se planifica.

El contraargumento que reconozco: cursando otras materias, la capacidad real por semana calendario
es baja, y una semana deja poco margen para una historia completa. Si en la práctica veo que las
historias no entran, el ajuste correcto es partirlas más chicas antes que alargar el sprint —
porque una historia que no entra en el sprint viola la *S* de INVEST, y ése es el problema real.

### 2. Límite de trabajo en progreso: 2

La regla de arranque es **cantidad de personas + 1**. Trabajando solo: 2.

El "+1" es la válvula. Con límite 1, cada vez que mi única tarjeta queda esperando algo que no
depende de mí —el pipeline corriendo, una revisión— me quedaría sin nada que hacer. Con 2 puedo
avanzar en otra cosa mientras tanto, sin que eso se convierta en empezar todo.

Con 3 o más, trabajando solo, el límite dejaría de limitar: tendría todo empezado y nada terminado,
que es exactamente lo que la restricción viene a evitar. El trabajo empezado y sin terminar no es
avance, es inventario, y el inventario cuesta — más cambio de contexto, ramas que envejecen, y
conflictos más grandes al integrar.

**La señal para ajustarlo**: si nunca lo alcanzo, está demasiado alto y no está limitando nada.
Hoy el tablero muestra *In Progress 2/2*, o sea que el número efectivamente aprieta. Si lo
alcanzara seguido pero porque todo está bloqueado por afuera, el problema no sería el límite sino
el bloqueo, y subir el número sólo escondería el síntoma.

Vale aclarar que GitHub **no lo impide**: pone el contador de la columna en rojo y deja pasar
igual. Es un acuerdo de trabajo, no un candado de la herramienta.

### 3. Diagnóstico de la historia mal escrita

> `Como desarrollador quiero crear la tabla usuarios para guardar los datos.`

Está mal escrita porque es una **tarea técnica con molde de historia**: el rol es quien construye
y no quien recibe valor, el "quiero" ya elige la solución (una tabla) en vez de nombrar la
capacidad, y el "para" repite el qué en lugar de justificar por qué vale hacerla. Rompe INVEST en
**Valiosa** y **Testeable**: no hay comportamiento observable que se pueda demostrar, ni criterios
de aceptación que escribirle.

**Cómo la reescribiría**, subiendo de la solución técnica a la capacidad que habilita:

> **Como** persona que reserva salas
> **quiero** que mis reservas queden asociadas a mi cuenta
> **para** poder volver a verlas y cancelarlas sin que nadie más pueda tocarlas.
>
> Criterios de aceptación:
> - [ ] Me registro con correo y contraseña
> - [ ] Al entrar veo únicamente mis reservas
> - [ ] No puedo cancelar la reserva de otra persona

Y `crear la tabla usuarios` pasa a ser una **tarea** colgada de esa historia, que es donde
correspondía desde el principio.


### 4. Qué problemas encontré y cómo los solucioné

#### a) La jerarquía navegable necesita sub-issues, y sub-issues necesita `gh` reciente

La primera idea fue armar la jerarquía con una task-list en el cuerpo de la épica (`- [ ] #7`).
Funciona visualmente, pero es una relación **degradada**: no crea el vínculo padre-hijo, así que
desde una tarea no se puede subir a su historia ni de ahí a la épica. El enunciado pide
explícitamente "jerarquía navegable", y eso solo lo dan los sub-issues.

Por consola el flag es `gh issue edit <padre> --add-sub-issue <hijo>`, y existe recién desde la
versión 2.94. Verifiqué con `gh --version` (2.99.0) antes de usarlo. Con una versión anterior el
flag no existe y hay que hacerlo desde la web.

#### b) `gh` no trae permiso sobre Projects por defecto

Después de `gh auth login`, cualquier comando `gh project ...` falla por permisos: el token que se
emite no incluye el alcance de Projects. Se resuelve con `gh auth refresh -s project,read:project`,
que reabre el navegador y agrega el permiso al token existente sin tener que volver a loguearse.

#### c) El proyecto nace privado, y el enunciado lo exige público

Un Project recién creado es privado. Como en este práctico el proyecto **reemplaza a
`evidencias.md`** —quien corrige abre su URL y ve la jerarquía, el sprint y el límite en vivo—, si
queda privado el corrector no ve nada y el TP queda sin evidencia. Se cambia en *Settings* →
*Danger zone* → *Change visibility*, o con `gh project edit <n> --owner "@me" --visibility PUBLIC`.

#### d) El campo Iteration no se puede crear por consola

`gh project field-create` acepta campos de texto, número, fecha y selección simple, pero **no**
de tipo Iteration. El campo *Sprint* hubo que crearlo desde la web (`+` al final de las columnas →
*New field* → tipo *Iteration* → duración *1 week*). Una vez creado, asignar valores sí se puede
por consola.

#### e) El orden importa para poder ver la automatización

Merguear el pull request antes de crear el proyecto habría cerrado la tarea #8 fuera del tablero:
al importarse después, habría entrado ya cerrada, directo a *Done*, sin que se viera la
transición. Primero el proyecto configurado, después el merge: así el `Closes #8` cierra la tarea
y el workflow *Item closed → Done* la mueve solo, que es lo que hay que poder mostrar.


### 5. Declaración de uso de IA

Usé **Claude (Claude Code)** con acceso a la terminal, a `gh` y al repositorio.

**Qué decidí yo:** la duración del sprint y su justificación; el número del límite de trabajo en
progreso; el diagnóstico de la historia mal escrita y su reescritura;la creación de las etiquetas y de los cinco issues con sus cuerpos y criterios de
aceptación; y qué bug cargar —uno real
de mi app en vez del genérico del video.

**Qué delegué:** el armado de la jerarquía con sub-issues; la carga de los valores de *Status*; el
cambio de visibilidad del proyecto a público; y el pull request que cierra la tarea #8.

**Qué hice yo a mano:** la creación del proyecto desde la web con *Import items from repository*,
el campo *Sprint* de una semana, la vista de tablero, el límite de 2 en *In Progress*, la
asignación de las iteraciones y el merge de los pull requests.

**Cómo verifiqué lo que me devolvió:**

- La jerarquía, contra la API de GraphQL de GitHub pidiendo los `subIssues` de cada issue: la
  épica #6 devuelve la historia #7, y la historia #7 devuelve las tareas #8 y #9. El bug #10 no
  aparece colgando de ninguno, que es lo correcto.
- La configuración del sprint, contra la API: campo de tipo Iteration, `duration: 7` días, con
  *Sprint 1* arrancando el 2026-09-02, y asignado a #7, #8 y #9 — no a la épica ni al bug.
- La trazabilidad, después de mergear: el issue #8 quedó `CLOSED` con razón `COMPLETED` y con el
  pull request #11 registrado como el que lo cerró; el tablero lo movió a *Done* solo; y la
  historia #7 quedó **abierta**, como corresponde porque falta la tarea #9.
- El límite de trabajo en progreso, mirando el tablero: la columna *In Progress* marcaba 2/2 con
  la historia y su tarea, o sea que el número efectivamente aprieta y no es decorativo.

---

## TP4 — CI: Pipelines as Code

### 1. Estructura del pipeline

**Dos jobs, uno por imagen, corriendo en paralelo.**

```
backend   ─┐
           ├─→ ambos tienen que estar verdes para poder mergear
frontend  ─┘
```

No están en paralelo por una configuración que lo pida: **están en paralelo porque son
independientes**. En GitHub Actions, los jobs de un mismo workflow corren simultáneamente salvo
que uno declare `needs:` sobre otro. Construir el backend no necesita nada del frontend, así que
no hay ninguna dependencia que declarar.

La medición de la primera corrida lo muestra:

```
Build imagen del backend:   00:26:48 → 00:27:45   (57 s)
Build imagen del frontend:  00:26:48 → 00:27:37   (49 s)
```

Los dos arrancaron **en el mismo segundo**. El pipeline tardó 57 segundos —lo que tardó el más
lento— y no 106, que sería la suma. Con diez servicios la diferencia deja de ser una curiosidad.

**Qué NO comparten dos jobs**, que es la contracara: cada uno corre en una máquina virtual limpia
y distinta. No comparten disco, ni variables, ni contenedores, ni el resultado de un `docker
build`. Todo lo que un job necesite de otro tiene que viajar explícitamente por un artefacto o por
la caché. Es la razón por la que cada job hace su propio `checkout`: el segundo no tiene el
repositorio solo porque el primero lo bajó.

**Los dos disparadores** responden preguntas distintas y ninguno sobra:

| Disparador | Pregunta | Cuándo |
|---|---|---|
| `pull_request` a `main` | ¿este cambio se puede integrar? | antes del merge, sobre la fusión tentativa |
| `push` a `main` | ¿`main` sigue sano? | después del merge, sobre lo que quedó |

El segundo no es redundante: entre que un PR se verifica y se mergea, `main` pudo haberse movido
por otro merge. Dos ramas verdes por separado pueden romper `main` juntas.

### 2. Qué cachea el pipeline, y qué pasa si el caché desaparece

Cachea **capas de imagen de Docker**, en el almacenamiento de GitHub Actions
(`cache-from`/`cache-to: type=gha`). No cachea el código ni el resultado del build: cachea los
pasos intermedios de construir cada imagen.

Qué se reutiliza y qué no lo decide el orden de los Dockerfiles, que se escribió pensando en
esto: primero se copia el manifiesto de dependencias (`requirements.txt`, `package.json` +
`package-lock.json`) y recién después el código.

| Capa | ¿Se reutiliza? |
|---|---|
| Instalar `gcc`, `libc6-dev`, `libpq-dev` | Sí, mientras no cambie el `apt-get` |
| Compilar los wheels de Python / `npm ci` | Sí, mientras no cambie el manifiesto |
| Copiar el código (`COPY app`, `COPY . .`) | No: el código cambia en cada commit |
| Todo lo posterior a la copia del código | No: una capa invalidada invalida las siguientes |

La corrida verde del PR #12 reutilizó **13 capas** marcadas `CACHED` en el log. Lo que se
reconstruyó fue lo que venía después de copiar el código, que es exactamente lo que había
cambiado.

**Si el caché desaparece —expira, se limpia, o cambia una dependencia— no se rompe nada: el build
tarda más.** Esa es la propiedad importante. El caché es una optimización de velocidad, no una
fuente de verdad: cualquier corrida tiene que poder construir desde cero y dar el mismo
resultado. Un pipeline que *necesita* el caché para funcionar no es reproducible, y esa es
justamente la falla que se busca evitar.

Cada imagen usa su propio `scope`. Sin eso, los dos jobs escribirían en la misma clave y se
pisarían las capas mutuamente: el backend guardaría las suyas, el frontend las sobreescribiría, y
en la corrida siguiente ninguno encontraría lo que dejó.

### 3. Por qué el pipeline construye con el Dockerfile en vez de compilar por su cuenta

Podría haber puesto `pip install` y `npm run build` como pasos del workflow, sin Docker. Sería más
rápido de escribir y funcionaría. El problema es qué se estaría verificando.

Con pasos propios, el pipeline verifica que la app compila **en el runner de GitHub**: Ubuntu, con
las versiones de Python y Node que ese runner traiga. Pero lo que se despliega no es eso: es la
imagen construida con el Dockerfile, sobre `python:3.11-slim` y `nginx:1.27-alpine`. Serían dos
entornos distintos, y el pipeline estaría dando por buena una construcción que nadie va a usar.

Construyendo con el Dockerfile, **lo verificado y lo desplegado son el mismo artefacto**. Si el
build pasa, pasó sobre las mismas imágenes base, las mismas versiones y los mismos pasos que van a
correr en producción. Es la diferencia entre "compila en algún lado" y "compila donde va a vivir",
y es el problema que evita: el clásico *funciona en mi máquina*, con el pipeline en el papel de la
máquina.

Y hay un efecto secundario que importa: la definición del build vive en **un solo lugar**. Si
mañana el backend necesita una biblioteca de sistema nueva, se agrega al Dockerfile y el pipeline
la toma sin tocar el workflow. Con pasos duplicados, habría dos definiciones que se desincronizan
en silencio.

### 4. El pipeline como gate

`main` exige hoy **dos** condiciones para aceptar un merge, y las dos alcanzan también al dueño
del repositorio (`enforce_admins: true`, que viene del TP1):

1. El cambio entra por Pull Request.
2. Los dos checks —`Build imagen del backend` y `Build imagen del frontend`— están en verde.

Con **`strict: true`** se suma una tercera condición, más sutil: los checks tienen que haber
pasado **contra el estado actual de `main`**, no contra el que había cuando se abrió el PR. Si
`main` se movió, la rama queda *out-of-date* y hay que actualizarla y volver a verificar.

Sin `strict`, dos PRs verdes por separado pueden romper `main` al integrarse juntos: cada uno se
verificó en un mundo donde el otro no existía. Con `strict`, esa combinación se verifica antes de
entrar.

**Las dos cosas se vieron pasar en este repositorio**, y no como ejercicio teórico:

- El PR #12 importaba `formatearDuracion` desde `format.js`, donde nunca se había escrito. El job
  del backend pasó; el del frontend falló con `"formatearDuracion" is not exported by
  "src/format.js"`, y el merge quedó bloqueado. Se agregó la función faltante, el pipeline pasó a
  verde y recién ahí se habilitó el botón.
- Después de mergear el PR #13, ese mismo PR #12 —con sus dos checks verdes— quedó en estado
  `BEHIND`. GitHub lo bloqueó hasta usar *Update branch*. Eso es `strict: true`.

### 5. Qué problemas encontré y cómo los solucioné

Este práctico fue el que menos fricción tuvo, porque se apoya entero sobre los Dockerfiles del
TP2: el pipeline no define cómo se construye la aplicación, solo la manda a construir. Lo que sí
apareció:

#### a) La primera corrida no puede demostrar el caché

La evidencia que pide el enunciado es una corrida que **reutilice** capas, y la primera corrida no
tiene nada que reutilizar: llena el caché, no lo aprovecha. El `CACHED` aparece recién en la
segunda. La demostración salió de la secuencia del gate: la corrida que arregló el build del PR
#12 fue la segunda sobre ese código y reutilizó 13 capas.

#### b) Una trampa que esquivé, y por qué la dejo anotada

En *Required status checks* hay que registrar el nombre **visible** de cada job —`Build imagen del
backend`— y no su identificador en el YAML (`backend`). Son dos strings distintos y la
configuración acepta cualquiera de los dos sin protestar, porque no valida contra los workflows
existentes: se puede exigir un check que no existe.

Si se registra el identificador, el gate queda esperando un check que nunca va a reportar. El PR
muestra "Expected — Waiting for status to be reported" indefinidamente y no se puede mergear
nunca, sin ningún mensaje que explique por qué.

No tropecé con esto —usé los nombres visibles desde el principio— pero lo verifiqué en vez de
darlo por hecho: leí de vuelta la protección desde la API y comparé los dos contextos guardados
contra los nombres que el workflow publica en cada corrida. Lo dejo anotado porque el modo de
falla es silencioso, y un gate mal configurado se parece mucho a un gate que funciona.

#### c) Aviso de Node 20 en cada corrida

Las corridas emiten una anotación: las acciones `actions/checkout@v4`,
`docker/setup-buildx-action@v3` y `docker/build-push-action@v6` apuntan a Node 20, que está
deprecado, y el runner las fuerza a correr sobre Node 24. Es una **advertencia, no un error**: no
afecta el resultado y no rompe el build. Se deja registrada acá en vez de silenciarla, porque la
corrección real es actualizar esas acciones cuando publiquen versiones que apunten a Node 24.

### 6. Declaración de uso de IA

Usé **Claude (Claude Code)** con acceso a la terminal, a `gh` y al repositorio.

**Qué decidí yo:** que el pipeline construyera con los Dockerfiles en vez de compilar por su
cuenta; que el gate alcanzara también al dueño del repositorio; y qué romper para demostrar que el
gate bloquea.

**Qué delegué:** la escritura del workflow; la configuración de *Required status checks* por API;
la ejecución de la secuencia rojo → verde; y los borradores de esta sección.

**Cómo verifiqué lo que me devolvió:**

- El paralelismo, contra los timestamps que devuelve la API de Actions: los dos jobs arrancaron
  `00:26:48`. No es una afirmación sobre cómo *debería* comportarse, es la medición.
- El caché, contando las líneas `CACHED` en el log de la corrida verde: 13.
- El gate, provocando un fallo real y comprobando que el merge quedaba bloqueado — y después
  comprobando que se habilitaba con el fix. Un gate que nunca bloqueó nada no se sabe si funciona,
  igual que la protección de rama del TP1.
- `strict: true`, observando que el PR #12 pasaba a `BEHIND` después de mergear el #13, con sus
  dos checks todavía en verde.
- La configuración de la protección, leyéndola de vuelta de la API después de escribirla:
  `strict: true`, los dos contextos, PR obligatorio y `enforce_admins: true`.

---

## TP5 — Calidad automatizada: tests, coverage y el umbral que frena un merge

### Enlaces de este TP

| Lo que prueba | Enlace |
|---|---|
| Corrida con el resumen de cobertura de los dos lados y los reportes descargables (`coverage-backend`, `coverage-frontend`) | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40393007612 |
| Corrida **roja por umbral** (27 tests en verde, `FAIL Required test coverage of 80% not reached. Total coverage: 72.37%`) | https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40394126834 |
| Secuencia rojo → tests → verde → merge (PR **mergeado**) | https://github.com/facuolivamar/ingsoft3-tp01/pull/16 |
| El freno vigente: PR **abierto y en rojo** hasta la defensa | https://github.com/facuolivamar/ingsoft3-tp01/pull/17 |

### 1. Qué lógica testeé y por qué ésa

En Salas un bug duele en un solo lugar: **una reserva que no debería existir** (dos equipos en la
misma sala, una reunión de 6 h, 10 personas en un box de 4). Todo eso lo decide
`backend/app/rules.py`, así que la suite está parada ahí:

| Regla | Tests (backend) | Qué la pone en rojo si la invierto |
|---|---|---|
| 1 · no reservar en el pasado | `test_validar_rango_rechaza_una_reserva_que_empieza_en_el_pasado` | cambiar `inicio < ahora` por `>` |
| 2 y 3 · fin posterior, 30 min a 4 h | parametrizado con 4 filas de rechazo + 2 de bordes aceptados (30 y 240 min) | correr `<` a `<=` en cualquiera de los dos límites: el borde exacto se pone rojo |
| 4 · capacidad | parametrizados de aceptación (1 y 6 = capacidad) y de rechazo (0 y 7) | `>` por `>=`: la fila «6 de 6» falla |
| 5 · solapamiento | 5 filas: los dos extremos que se tocan **conviven**, los tres solapes reales chocan | `<` por `<=` en `se_solapan`: las filas de extremos se ponen rojas |
| transición confirmada → cancelada | permite la futura; rechaza la cancelada y la que empieza **justo ahora** (borde del `<=`) | `<=` por `<`: la fila «empieza ahora» falla |
| ocupación (agregada en el PR #16) | 6 filas: ventana libre, mitad, reservas que cruzan cada borde, afuera, y el tope de 100 | sacar el `max`/`min` del recorte: las filas que cruzan los bordes fallan |

Backend: **37 tests** en `backend/tests/` (16 funciones, varias parametrizadas). Frontend: **20
tests** en `frontend/src/*.test.js` sobre `validarFormulario` (el espejo de las reglas en el
cliente), `formatearDuracion` y el cliente HTTP `api.js`.

**Las tres técnicas, de los dos lados:**

| | Backend (pytest) | Frontend (vitest) |
|---|---|---|
| Parametrizado | `@pytest.mark.parametrize` (p. ej. bordes de duración) | `it.each` (8 casos de rechazo de `validarFormulario`) |
| Caso de error | `pytest.raises(ReglaViolada, match=…)`, 404/409 de los endpoints | `rejects.toThrow('La reserva ya estaba cancelada.')`, y `Error 502` cuando no hay cuerpo |
| Mock | `MagicMock` en lugar de la `Session` de SQLAlchemy (`tests/test_endpoints.py`) | `vi.fn()` en lugar de `fetch`, con `vi.stubGlobal` (`src/api.test.js`) |

**El mock del backend, sin refactor:** los endpoints ya reciben la sesión por parámetro
(`db: Session = Depends(get_db)`), así que la dependencia entraba desde afuera desde el TP2. El test
le pasa un `MagicMock` configurado (`db.get` devuelve la sala, `db.scalars().all()` las reservas
confirmadas) y verifica **la interacción**: que con una reserva válida se llama `db.add` una vez con
una `Reserva` confirmada y se hace `commit`, y que con una regla violada se devuelve 409 **y no se
llama ni a `add` ni a `commit`**. Eso un stub no lo puede verificar, porque sólo devuelve datos: es
la diferencia entre los dos.

**El mock del frontend:** `api.js` usa el `fetch` global. El test lo reemplaza con un `vi.fn()` que
devuelve una respuesta falsa, y verifica URL, método y cuerpo del pedido, sin salir a la red.

### 2. Mi stack no es el de la cátedra: qué usé en cada fila

| Lo que pide | Lo que usé |
|---|---|
| Dónde viven los tests | `backend/tests/` (pytest) · `frontend/src/*.test.js` (vitest) |
| Parametrizado | `@pytest.mark.parametrize` · `it.each` |
| El doble | `unittest.mock.MagicMock` · `vi.fn()` + `vi.stubGlobal` |
| Medir la cobertura | `pytest-cov` con `--cov-branch` · `@vitest/coverage-v8` |
| Umbral que rompe el build | `--cov-fail-under=80` en `backend/pytest.ini` · `coverage.thresholds` en `frontend/vite.config.js` |
| Qué entra en la cuenta | `omit =` en `backend/.coveragerc` · `include`/`exclude` en `vite.config.js` |
| Reporte legible | `--cov-report=html`, y `coverage report --format=markdown` al Summary · reporters `html` + `json-summary` (el Summary lo arma `jq`) |
| Herramientas dentro de la etapa de tests | `requirements-dev.txt`, instalado **sólo** en la etapa `test` del Dockerfile · el `npm ci` de `build` ya trae las devDependencies |

Los dos Dockerfiles tienen ahora tres etapas: `build` → **`test`** (`FROM build`) → `runtime`. El
pipeline construye `target: test` con `load: true`, la corre con `docker run -v …/out:/out` y saca
los reportes por ese volumen. La imagen final no se lleva ni pytest ni vitest.

### 3. El umbral: 80 %, y sobre qué métrica

- **Backend: 80 % del total de coverage.py con `branch = True`**, que **combina líneas y ramas** en
  un solo número: `(líneas cubiertas + ramas cubiertas) / (líneas + ramas)`. No es «sólo líneas»: un
  `if` recorrido por un solo lado resta.
- **Frontend: 80 % de líneas y 80 % de ramas**, las dos por separado (`thresholds.lines` y
  `thresholds.branches`).

**Por qué 80 y no otro número** — lo fijé contra la medición real, no copiado:

| | Líneas | Ramas | Total |
|---|---|---|---|
| Backend, hoy (`main`) | 90,5 % (105/116) | **88,9 % (32/36)** | 90,1 % |
| Frontend, hoy (`main`) | 89,4 % | **100 %** | — |

Ese margen de ~10 puntos deja lugar para el pegamento que no vale la pena testear con unit tests
(los listados, el arranque), pero **no** alcanza para que entre una regla nueva sin tests: la de
ocupación (~20 líneas con 4 ramas) bajó el total a 72 %, y la de reservas recurrentes a 78,5 %. Justo
eso es lo que el umbral tiene que atrapar.

**Si mañana lo subo diez puntos (90 %)**: el backend hoy pasa por 0,1 punto, así que cualquier
cambio en los endpoints de listado frenaría el build. Para sostenerlo habría que cubrir
`listar_salas`, `listar_reservas` y el `startup` — consultas sin lógica: subiría el número sin subir
lo que se verifica. Para eso sirven mejor los tests de integración del TP7.

### 4. Qué dejé afuera de la cuenta

- **Backend** (`.coveragerc`): `config.py` y `db.py` (arranque y cableado: leer variables y crear el
  engine; no deciden nada), `models.py` y `schemas.py` (declaraciones de columnas y campos, sin ramas
  propias). **Sí entra** `main.py` entero, con sus endpoints.
- **Frontend** (`vite.config.js`): entra sólo `src/**/*.js` — `format.js` y `api.js`. Quedan afuera
  los componentes (`App.jsx`, `main.jsx`), porque son UI que se verifica con las e2e del TP7 y no con
  unit tests sin DOM, y los propios `*.test.js`.

### 5. Por qué coverage alto no garantiza calidad — con mi ejemplo

`rules.py` tiene **100 %** de líneas y ramas. Pero este test sumaría exactamente lo mismo:

```python
def test_que_no_verifica_nada():
    try:
        rules.validar_capacidad(10, capacidad_sala=6)
    except Exception:
        pass
```

Recorre la línea del `raise` y pasa en verde aunque la regla esté invertida. La cobertura mide **qué
se ejecutó**, no **qué se comprobó**: lo que verifica es el `assert`/`match=` del test real. La forma
de comprobarlo es invertir la regla y ver qué se pone en rojo — lo que hice para la tabla de la
sección 1, que es la idea del *mutation testing*.

### 6. El Pull Request bloqueado

- **PR #16** (mergeado): agregué `porcentaje_de_ocupacion` y su endpoint sin tests. Compilaba, y los
  **27 tests existentes pasaban**. El check que se puso en rojo fue **«Build imagen del backend»**,
  en el paso *Correr los tests con coverage*: `FAIL Required test coverage of 80% not reached. Total
  coverage: 72.37%`. La métrica es el **total combinado líneas + ramas** (116 líneas con 30 sin
  cubrir, 36 ramas). El segundo commit agregó los tests que faltaban (6 filas parametrizadas de
  ocupación, la ventana inválida y los caminos del endpoint): 37 tests, 90,13 %, verde, merge.
- **PR #17** (abierto, en rojo): reservas recurrentes, también sin tests: 78,53 %. Queda así hasta la
  defensa.

**Por qué este freno es distinto del del TP4**: el del TP4 frenaba código que **no compila**. Éste
frena código que compila y no rompe ningún test, pero que **nadie verificó**. **Qué deja pasar
igual**: código testeado con asserts vacíos (sección 5), errores de integración con la base real (el
mock dice que se llamó a `db.add`, no que Postgres aceptó la fila) y todo lo que pasa en el
navegador.

### 7. El ejercicio del camino sin cubrir

En el reporte HTML del backend, `app/main.py`, **línea 62**: `if sala_id is not None:` en
`listar_reservas`. Ningún test llama a ese endpoint, así que **ninguno de sus dos caminos** se
recorre: son 2 de las 4 ramas que faltan (88,9 % de ramas).

- **Qué entrada lo recorrería:** `listar_reservas(sala_id=2, db=mock)` para el camino del `if` (el
  que agrega el `where`), y `listar_reservas(sala_id=None, db=mock)` para el otro.
- **Qué decidí: no lo agregué.** Con un mock, el test sólo comprobaría que se llamó a `db.scalars`; no
  si el `where` filtra bien, que es lo único que puede fallar ahí. Ese filtro se verifica contra una
  base real en la suite de integración del TP7 (`GET /api/reservas?sala_id=…`).

### 8. Problemas encontrados y cómo los resolví

- **El `.dockerignore` del backend excluía `tests/`** (lo había puesto en el TP2 para que no
  viajaran a la imagen), y la etapa `test` no encontraba nada que correr. Lo saqué: la imagen final
  igual no los lleva, porque `runtime` copia sólo `app/`.
- **`psycopg2` no instala en Windows sin `pg_config`**, y yo quería correr los tests en mi máquina
  antes de cada push. En el pipeline no es problema (corren en el contenedor, con las wheels de la
  etapa `build`); localmente uso un entorno virtual con `psycopg2-binary`.
- **El resumen del backend en el Summary**: `pytest-cov` no escribe Markdown. Lo resolví con un
  segundo `docker run` de la misma imagen que corre `coverage report --format=markdown` y lee el
  `.coverage` que quedó en el volumen (`COVERAGE_FILE=/out/.coverage`).

### 9. Declaración de uso de IA

Usé **Claude (Claude Code)** con acceso a la terminal, a `gh` y al repositorio.

**Qué decidí yo:** dónde duele un bug en esta app (las reglas), el umbral y su métrica, qué queda
afuera de la cuenta, y qué hacer con el camino sin cubrir.

**Qué delegué:** la escritura de los tests, de la etapa `test` de los Dockerfiles y de los pasos del
workflow; la secuencia de los dos PRs; los borradores de esta sección.

**Cómo verifiqué lo que me devolvió:** corrí la suite localmente antes de cada push; comprobé que el
umbral frena **de verdad** con la corrida roja del PR #16 (27 tests en verde, job en rojo); y revisé
cada test contra la tabla de la sección 1: qué assert lo pone en rojo si se invierte la regla. Lo que
la suite **no** cubre está dicho en las secciones 6 y 7.

---

## TP6 — CD: environments, aprobaciones y deployment patterns

Los enlaces de este TP están [arriba de todo](#enlaces-de-los-tps-6-y-7).

### 1. Por qué el plan C, y qué pierde

Usé el **fallback local (§3.6)**: mi notebook registrada como *self-hosted runner* (`notebook-facu`) y
dos proyectos de Compose, `compose.qa.yml` (`name: salas-qa`, puertos 8081/8001, volumen
`datos_db_qa`, base `salas_qa`) y `compose.prod.yml` (`name: salas-prod`, 8082/8002, `datos_db_prod`,
`salas_prod`). **El deploy lo hace siempre el pipeline**: nunca corro `docker compose up` a mano.

Pierdo respecto de la nube: URLs públicas (QA y PROD existen sólo mientras la notebook está prendida
y el runner corriendo: `C:\actions-runner\run.cmd`), un entorno ajeno a mi máquina, y el cold start
real de un free tier. Lo elegí por tiempo y porque no dependía de cuentas externas.

### 2. El artefacto se publica sólo con la verificación en verde

Tres eslabones, encadenados, lo hacen imposible por accidente:
1. **Nada entra a `main` sin verde**: los dos jobs de build son *required checks* (TP4/TP5).
2. **Sólo `main` publica**: los pasos «Entrar al registry» y «Construir y publicar la imagen» tienen
   `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`. En un PR salen salteados
   (enlace de la cadena 1).
3. **Publicar es el último paso del job que testea**: si los tests o el umbral fallan, el job se
   corta antes (enlace de la cadena 2).

Si se publicara igual, el registry dejaría de significar «esto pasó la verificación»: una etiqueta
`sha-…` podría ser código roto, y nadie podría desplegar desde ahí sin volver a verificar.

La etiqueta es **`sha-<commit>`**: dice exactamente de qué código salió. No publico `latest`: es una
etiqueta que se mueve, y con ella «qué corre en PROD» deja de tener una respuesta.

### 3. Continuous Delivery, no Deployment

Implementé **Continuous Delivery**: QA se actualiza solo con cada merge, PROD **sólo** con
aprobación humana. Para Continuous Deployment me faltarían pruebas que me den confianza suficiente
para sacar al humano (las e2e del TP7 son un paso) y, sobre todo, observabilidad en PROD para
detectar y revertir solo (TP9). Con una app de reservas usada por una oficina, un deploy
automático roto un lunes a las 9 cuesta más que el minuto de aprobar.

### 4. El diseño de la cadena y el alcance de cada secret

`backend` + `frontend` (build, tests, umbral, publicar) → `deploy-qa` (`needs` de los dos,
`environment: qa`) → *(TP7: `integracion` → `e2e`)* → `deploy-prod` (`environment: production`).

- `DB_PASSWORD` es un **environment secret**, distinto en cada environment: el de `qa` sólo lo ve
  un job con `environment: qa`, y el de `production` sólo `deploy-prod`, **después** de la
  aprobación. Si estuviera en el repo, cualquier job —incluido el de un PR— podría leer la clave de
  PROD.
- `DOCKERHUB_TOKEN` es un secret de repo, porque lo usan los jobs de build en `main`.
- `production` tiene **required reviewer** (yo, con *Prevent self-review* apagado).

### 5. Qué miro antes de aprobar

1. Que el commit que espera sea **el último de `main`** (si no, promuevo algo viejo: fue el motivo
   del rechazo).
2. Smoke de QA en verde y, desde el TP7, integración y e2e en verde **de esa misma corrida**.
3. Que la etiqueta del deploy (`TAG: sha-…` en el log) sea la de ese commit.
4. Que no haya un PR de cambio de esquema de base sin plan de vuelta atrás.

### 6. El rechazo

Corrida https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40430500012 (commit `9fbe5e5`, el
arreglo del botón): todo en verde, pero detrás ya habían entrado Dependabot (#25) y el TP8 (#26) en
`5e9258c`. Aprobarla dejaba PROD en un commit que ya era viejo y me obligaba a promover dos veces;
la rechacé con ese motivo y promoví `5e9258c`.

### 7. El smoke test: qué prueba y qué no

`scripts/smoke.sh` pregunta, con hasta 20 reintentos cada 5 s: `/api/health` (el proceso vive),
`/api/salas` (la api llega a **su** base), `/` del front y `/api/salas` **a través del nginx del
front** (el front habla con su api). Reintenta porque `docker compose up` vuelve apenas arranca
los contenedores, no cuando Postgres y uvicorn están listos. Si después de todo no contesta, sale
con 1 y el job queda rojo.

**Qué no prueba:** qué versión corre (contesta igual una imagen vieja), ni que las reglas
funcionen. Eso es de los tests y de las e2e.

### 8. La misma imagen del front en QA y en PROD

La dirección del backend **no está en la imagen**: `nginx.conf` es un *template*
(`/etc/nginx/templates/default.conf.template`) con `proxy_pass ${BACKEND_URL}/api/;`, y la imagen
oficial de nginx lo procesa con `envsubst` al arrancar. Cada compose le pasa su `BACKEND_URL`.
Adentro de la imagen quedan los estáticos compilados y la configuración de nginx; por variable,
la dirección del backend (y en el backend, toda la conexión a la base).

### 9. La letra chica (plan C) y la garantía que perdería Render

No hay free tier: el límite es la notebook (prendida y con el runner corriendo). Los minutos de
Actions de los jobs `self-hosted` no se cuentan.

En el riel de Render, el proveedor **reconstruye** desde el repo: lo que corre sería otra
construcción del mismo código, no la imagen que pasó los tests. En mi plan C eso no pasa: los
entornos hacen `pull` de la etiqueta `sha-<commit>` del registry (ver TP7, §1).

### 10. Deployment pattern y rollback

**Para producción real elegiría blue-green.** La app es una sola instancia con una base: un canary
pide repartir tráfico por porcentaje (un balanceador) y métricas por versión que hoy no tengo.
Blue-green es más barato de razonar: levanto la versión nueva al lado, la verifico con el mismo
smoke y las e2e, y cambio el tráfico de golpe; el rollback es volver a apuntar a la vieja, en
segundos. Su costo: dos entornos a la vez y que las migraciones de base sean compatibles hacia
atrás. Me falta observabilidad (errores y latencia por versión) para saber cuándo volver.

**Mi rollback actual**, paso a paso: (1) en *Deployments* veo el commit anterior que estuvo en
`production`; (2) en esa corrida, *Re-run* del job `Deploy a PROD`; (3) apruebo; (4) el job hace
`pull` de la imagen `sha-<anterior>` —ya está en el registry, no se reconstruye nada— y el smoke
verifica.

**Rollback medido** (lo hice de verdad el 26/10, sobre PROD): con `5e9258c` en PROD, decidí volver a
`3de35b3` a las **01:18:49 UTC**; *Re-run* del job + aprobación; el job arrancó 01:19:06 y terminó
01:19:47 con el smoke en verde, y `docker inspect salas-prod-backend-1` mostraba
`sha-3de35b3…`. **60 segundos** de la decisión al smoke verde (41 s de job). El rastro es el
intento 2 del job: https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40428688559/job/121951119425
— y *Deployments* muestra los dos deploys a `production`. Después volví PROD a `5e9258c` igual
(re-run del deploy de la corrida 40430750509). Es la métrica DORA **tiempo de restauración**:
rápido porque la imagen vieja ya está en el registry y no se reconstruye nada.

### 11. Problemas y cómo los resolví

- **`permission_denied: write_package`**: los paquetes `salas-*` existían desde el TP2, subidos a
  mano con un PAT, y no estaban vinculados al repo. Les di acceso de escritura al repo en *Manage
  Actions access* de cada paquete.
- **El shell del runner Windows**: un `shell:` con la ruta de Git Bash entre comillas no se parsea.
  Lo resolví con la ruta corta sin espacios (`C:/PROGRA~1/Git/bin/bash.exe`).
- **CRLF**: Git en Windows convertía `smoke.sh` a CRLF y bash lo rompía. `.gitattributes` con
  `*.sh text eol=lf`.
- **El Docker Desktop de la notebook no puede hacer `pull` de ghcr.io** (cualquier imagen, incluso
  públicas ajenas, da `denied`, mientras que desde un contenedor ghcr.io responde normal). Probé
  pasar la imagen como artefacto (`docker save`/`load`), pero 250 MB tardaban más de 15 minutos en
  bajar. Lo resolví publicando **el mismo build** con dos etiquetas: `ghcr.io/…` y
  `docker.io/facuolivam/…`. Es un solo build, así que es el mismo digest; los entornos bajan de
  Docker Hub.

### 12. Declaración de uso de IA

Usé **Claude (Claude Code)**. Decidí yo: plan C, Delivery y no Deployment, los criterios del gate,
el motivo del rechazo y blue-green. Delegué: los compose, el workflow, el smoke, el registro del
runner y los environments por API, y los borradores de esta sección. Lo verifiqué con las corridas
de arriba: el PR que no publica, el `main` que publica al final, la pausa de revisión, el rechazo, y
el smoke contra los dos entornos.

---

## TP7 — Contenedores en el pipeline + integración y e2e

Los enlaces de este TP están [arriba de todo](#enlaces-de-los-tps-6-y-7).

### 1. Build once, deploy many: los entornos ejecutan LA imagen

`compose.qa.yml` y `compose.prod.yml` usan `image: docker.io/facuolivam/salas-*:${TAG}` —no
`build:`—, y el pipeline les pasa `TAG: sha-${{ github.sha }}`. El log de cada deploy muestra el
`pull` de esa etiqueta y su `RepoDigest`; `deploy-prod` usa la **misma** `TAG` que QA, así que PROD
recibe la imagen que QA verificó, no otra construcción. Problema que resuelve: en el TP6 en la nube,
QA y PROD serían dos reconstrucciones del mismo commit, y las e2e de QA no dirían nada sobre lo que
corre en PROD (una dependencia que se resolvió distinto, una capa base que cambió entre builds).

**Etiquetas:** `sha-<commit>` en el registry garantiza **identidad** (este binario salió de este
código); `v7.0.0` en git le pone **nombre** al commit que está en PROD. Del tag a la imagen, en un
paso: `git rev-list -n1 v7.0.0` da el commit, y `sha-<ese commit>` es la imagen.

**Por qué Docker Hub y no ghcr.io para el pull:** el Docker Desktop de la notebook no puede leer
ghcr.io (TP6 §11). El mismo build se publica en los dos con las dos etiquetas.

**Cómo se comprueba desde afuera:** en el log del deploy, `Desplegando sha-…` + el `RepoDigest`
impreso, que coincide con el digest del package de esa etiqueta; y `docker inspect` de los
contenedores muestra esa imagen. El smoke sólo dice que **contesta**, no **qué** contesta.

### 2. Las dos suites

**Integración** (`frontend/e2e/api.spec.js`, fixture `request`, sin navegador, contra la api de QA
`http://localhost:8001`):
1. alta → `GET` filtrado por sala la encuentra → `DELETE` → `GET` ya no la encuentra;
2. título vacío → **400** y la cantidad de reservas de la sala no cambió. FastAPI contesta 422 por
   defecto; agregué un `exception_handler` que lo convierte en 400 (pedido mal formado), y dejo el
   409 para «bien formado, pero choca con una regla»;
3. **la que elegí:** dos reservas solapadas en la misma sala → la segunda **409** con «ya está
   reservada». Es la regla 5 contra la base real: el unit test con mock no puede probar que la
   consulta de confirmadas trae lo que hay en Postgres. Si se rompe, me escribe el que encontró a
   otro equipo en su sala.

**E2E** (`frontend/e2e/app.spec.js`, Chromium contra el front de QA `http://localhost:8081`):
1. **creación:** llenar el formulario → *Reservar* → «Reserva confirmada.» y la fila con su título →
   *Cancelar* → «cancelada» → se borra → al recargar ya no está;
2. **error:** turno ocupado → el usuario ve «ya esta reservada» y su reserva no aparece;
3. **la de todos los días:** reservo, recargo, y mi reserva sigue ahí; y aparece al filtrar por su
   sala. Si mañana no anda, me escribe toda la oficina.

Cada test fabrica un título con la hora y un turno en un día hábil futuro al azar (QA es uno solo y
lo comparten todas las corridas), y **borra lo que creó, comprobándolo** (`DELETE` → 204). Para eso
agregué `DELETE /api/reservas/{id}` al backend, con sus unit tests.

**Qué NO puse:** en integración, nada de UI; en e2e, nada que ya cubra un unit test (cada borde de
duración, cada mensaje de validación): la e2e es cara y lenta, va en la punta de la pirámide.

### 3. El par verde/rojo que diagnosticó la rotura

En la corrida 40429673414 cambié el texto del botón a «Confirmar reserva». **Integración verde, e2e
roja**: la api y la base andaban perfecto; lo roto estaba **entre el usuario y la api** —la UI—. Si
hubiera sido al revés (integración roja), el problema estaría en la api o en la base, y la e2e
fallaría como consecuencia. Los unit tests del front no lo vieron porque no miran el botón.

### 4. La integración es la amplia

Corre contra la api **ya desplegada** en QA, con su Postgres de verdad: prueba la imagen, la red de
Compose, el driver y el esquema reales. Pierde velocidad y aislamiento (depende de QA vivo y
compartido) y no puede simular fallas raras de la base. La estrecha (api levantada en el job con una
base efímera) sería más rápida pero no probaría lo que se despliega.

### 5. Timeouts y flaky

`timeout: 30_000` por test, `expect` de 10 s, y **un** reintento (`retries: 1`) que absorbe un
tropiezo de red; un test que falla dos veces seguidas es un bug, no mala suerte. Un test **flaky** es
el que con el mismo código a veces pasa y a veces no (datos compartidos, carreras, tiempos): por eso
datos únicos por corrida y `workers: 1` contra un QA compartido. Nada de `test.skip`.

### 6. Problemas y cómo los resolví

- `getByLabel('Sala')` encontraba dos selects; usé `.first()` para el del formulario.
- Vitest tomaba los `*.spec.js` de Playwright como unit tests: `test.include: ['src/**/*.test.js']`.
- El pull desde ghcr.io (TP6 §11).

### 7. Declaración de uso de IA

Usé **Claude (Claude Code)** para escribir las suites, el `DELETE`, los jobs y estos borradores.
Elegí yo qué tercera prueba va en cada suite y qué romper. Lo verifiqué con la corrida roja (el
fallo es por el botón, no por el test: el diff del PR #24 sólo toca `App.jsx`) y con la verde
posterior hasta PROD.

## TP8 — Infraestructura como Código

### 1. Riel y versiones

- **Plan C: Terraform + provider Docker, 100 % local.** QA y PROD ya corren en esta notebook con
  `compose.qa.yml` / `compose.prod.yml` sobre el self-hosted runner (TP6/TP7), no tengo cuentas de
  nube, y el Docker Desktop de esta máquina no puede bajar de `ghcr.io` — por eso las imágenes del
  TP7 se leen de Docker Hub (`docker.io/facuolivam/salas-*`).
- **Versiones fijadas:** Terraform `required_version = ">= 1.5"` (uso 1.9.8) y
  `kreuzwerker/docker` `~> 3.0`; el `.terraform.lock.hcl` versionado fija la exacta (**3.9.0**).
- **Qué declara `infra/`:** un entorno nuevo, `preprod`, con 8 recursos — red
  `salas-preprod-net`, volumen `salas-preprod-db-data`, las tres imágenes y los contenedores
  `salas-preprod-db` (postgres:16-alpine), `salas-preprod-api` (host 8003) y `salas-preprod-web`
  (host 8083). Los puertos no chocan con QA (8001/8081) ni PROD (8002/8082), y los nombres tampoco.

### 2. Qué es variable y qué se deriva

- **Variables:** `api_tag` (sin default: el `sha-<commit>` que publicó el pipeline) y `db_password`
  (`sensitive`, sin default). La contraseña la paso con `TF_VAR_db_password` en la terminal; nunca
  está en el HCL.
- **Derivado:** el `POSTGRES_HOST` de la api es `docker_container.db.name`, y el `BACKEND_URL` del
  front es `http://${docker_container.api.name}:${docker_container.api.ports[0].internal}`. Si
  renombro un contenedor, la referencia se actualiza sola, y además esas referencias le dan a
  Terraform el orden: red/volumen/imágenes → db → api → web al crear, y al revés al destruir.
- **El estado vive fuera del repo y del workspace**: `backend "local"` con
  `-backend-config="path=$HOME/tfstate/salas-preprod.tfstate"`. El `infra/.gitignore` (creado antes
  del primer apply) cubre `*.tfstate*`, `.terraform/`, `*.tfvars` y los planes guardados.

### 3. Lo que probé

- **Nace:** `init` → `plan` (8 to add) → `apply`. Respondieron `GET /api/health`, `GET /api/salas`
  (toca la base: devuelve las salas sembradas), el front en `:8083/` y `:8083/api/salas` (el nginx
  de preprod hablando con *su* api, no con la de QA).
- **Idempotencia:** el segundo `plan` dijo «No changes».
- **Drift:** `docker rm -f salas-preprod-api` → el `plan` lo vio (`docker_container.api will be
  created`, 1 to add) → `apply` lo recreó, las URLs volvieron a responder y el `plan` siguiente dio
  «No changes».
- **Ciclo de vida:** `destroy` (8 destroyed; quedaron sólo los contenedores, volúmenes y redes de
  `salas-qa` y `salas-prod`) → `apply` (8 added) → las cuatro URLs respondieron de nuevo → `destroy`
  otra vez. **Preprod queda destruido**: tiene que poder nacer, no estar vivo.
- **El estado por dentro:** la contraseña está en claro en el `.tfstate` (dentro del `env` de los
  contenedores). `sensitive` sólo la oculta en la salida del plan; por eso el estado no va al repo.

### 4. Problemas y cómo los resolví

- **«Arrancó ≠ está listo» otra vez:** `depends_on` espera que se *cree* el contenedor de la base,
  no que postgres acepte conexiones. En el primer apply la api se cayó una vez y Docker la levantó
  sola gracias a `restart = "unless-stopped"` (RestartCount 1). El provider no tiene el
  `service_healthy` de Compose; por eso los curls van con reintentos.
- **El `destroy` y las imágenes compartidas:** `postgres:16-alpine` también la usan QA y PROD. Puse
  `keep_locally = true` en los `docker_image` para que el destroy no intente borrarlas del Docker
  local.
- **El host del provider en Windows:** el daemon de Docker Desktop está en
  `npipe:////./pipe/dockerDesktopLinuxEngine`; quedó como default de la variable `docker_host`.
- **Riesgo conocido, no resuelto:** nginx resuelve `salas-preprod-api` al arrancar. Si la api se
  recrea sola (drift) y toma otra IP, el front seguiría apuntando a la vieja hasta reiniciarlo. En
  mi prueba de drift siguió respondiendo, pero no lo forcé.
- **Lo que sigue siendo artesanal:** QA y PROD siguen siendo Compose; preprod es el único entorno
  declarado con Terraform. Y el estado es un archivo de una sola máquina: si hubiera una segunda,
  haría falta un backend compartido.

### 5. Declaración de uso de IA

Usé **Claude (Claude Code)** con acceso a la terminal, a Docker y a `gh`. **Escribió el HCL** de
`infra/` y **corrió el ciclo** completo (init, plan, apply, idempotencia, drift, destroy/apply) y los
curls de verificación. **Yo** elegí el riel y los puertos, y revisé que nada tocara `salas-qa` ni
`salas-prod`. Para la defensa tengo que poder leer el plan en voz alta, explicar de dónde sale cada
dirección derivada y por qué el destroy va web → api → db; si no puedo explicarlo, no lo entrego.

---

## TP9 — DevSecOps + Observabilidad + Continuous Feedback

### Enlaces

| Lo que prueba | Enlace |
|---|---|
| `dependabot.yml` (pip, npm, actions, Docker) | https://github.com/facuolivamar/ingsoft3-tp01/blob/main/.github/dependabot.yml |
| PR de Dependabot **mergeado**, con el pipeline en verde | https://github.com/facuolivamar/ingsoft3-tp01/pull/35 |
| Code scanning (CodeQL, configuración por defecto) | https://github.com/facuolivamar/ingsoft3-tp01/security/code-scanning |
| Sentry en el código | `backend/app/observabilidad.py`, `frontend/src/main.jsx` (PR #45) |
| Tarjeta del tablero nacida de un dato | https://github.com/facuolivamar/ingsoft3-tp01/issues/49 (en https://github.com/users/facuolivamar/projects/2) |

Activado en *Settings → Advanced Security*: alertas de Dependabot, **actualizaciones de seguridad**
de Dependabot, secret scanning y **push protection**.

### 1. El PR de Dependabot que mergeé

**#35: `psycopg2` 2.9.10 → 2.9.13** (backend). Me animé porque: es un **patch** (sólo arreglos según
SemVer); el driver es exactamente lo que verifica mi suite de **integración** contra el Postgres de
QA (TP7), y pasó 3/3; y el pipeline completo quedó en verde hasta PROD (corrida
https://github.com/facuolivamar/ingsoft3-tp01/actions/runs/40432667913, aprobada).

Los que **no** mergeé y por qué: `vite` 6→8, `vitest` 3→5, `react` 18→19 y `@vitejs/plugin-react`
4→6 son **mayores** y sus PRs ya están en rojo en el pipeline (rompen el build o los tests): el gate
los frenó, que es justo lo que tiene que hacer. `fastapi` 0.115→0.162 pasó, pero es un salto grande
en una librería pre-1.0; lo dejo para revisarlo con tiempo.

### 2. Producción observada (monitor externo)

Mi PROD vive en `localhost:8082` (plan C), y UptimeRobot es un servicio externo: no la puede ver.
Por eso abrí un **túnel público temporal** con `cloudflared` (quick tunnel, sin cuenta) **sólo hacia
la api de PROD** (`http://localhost:8002`), y el monitor HTTP(s) de UptimeRobot pregunta cada 5 min
por `https://<túnel>.trycloudflare.com/api/health`. Antes comprobé que el endpoint contesta **HEAD**
(el plan gratuito pregunta así): 200 por el túnel.

**La caída provocada** (26/10, hora local):

| Hora | Qué pasó |
|---|---|
| 23:02:47 | `docker stop salas-prod-backend-1` (la caída) |
| 23:04 | UptimeRobot marca **DOWN** y manda el mail |
| 23:05:08 | `docker start salas-prod-backend-1`; `/api/health` vuelve a dar 200 |
| 23:09 | UptimeRobot marca **UP** |

**Tiempo de detección: ~1 minuto** (me enteré por el monitor, no por un usuario). La vuelta a UP
tardó ~4 min porque el monitor recién vuelve a preguntar en su siguiente intervalo de 5 min.
Al terminar, el monitor quedó **pausado**.

**La letra chica del plan C:** la URL `*.trycloudflare.com` cambia cada vez que se abre el túnel, y
el túnel vive mientras corre `cloudflared` en la notebook. Para mostrarlo en la defensa: abro el
túnel (`C:\cloudflared\cloudflared.exe tunnel --url http://localhost:8002`), edito la URL del
monitor y lo reanudo. Lo que pierdo frente a la nube: un monitor que mira PROD de verdad desde afuera
todo el tiempo; acá, si la notebook se apaga, se cae «todo» y el monitor no distingue eso de una
caída de la app.

### 3. Sentry: errores, demoras y uso

Backend con `sentry-sdk[fastapi]` (`app/observabilidad.py`, se prende sólo si hay `SENTRY_DSN`: los
unit tests no mandan nada) y frontend con `@sentry/react` + `browserTracingIntegration`. Cada entorno
manda su `environment` (`qa` / `production`) y el backend manda como `release` la etiqueta
`sha-<commit>` que está corriendo. Los dos con `tracesSampleRate: 1.0`: con este tráfico sobra la
cuota gratis y cada pedido aparece en la tabla de uso y demoras.

Errores provocados: `GET /api/debug-sentry` (un `RuntimeError` a propósito, en PROD) y
`window.errorDePruebaSentry()` en el navegador. El endpoint de prueba **se saca** en un PR después
de mostrar el error en la defensa (si pasaron 30 días, se vuelve a subir por PR, como pide §3.5).

**Operación más usada y más lenta:** en mi tráfico, la más usada es **`GET /api/reservas`** (la
llama cada carga de la página y cada cambio de filtro) y la más lenta **`POST /api/reservas`** (es la
única que hace dos consultas —sala y reservas confirmadas— más la escritura). Medido contra QA con
`curl`: `/api/health` ~5 ms, `/api/salas` ~7 ms, `/api/reservas` ~8 ms. La tabla de Sentry con el
uso real se muestra en la defensa.

**Tarjeta del tablero (#49):** el error de JavaScript llegó a Sentry, pero en el navegador no pasó
nada visible: la app no tiene ninguna barrera ante un error no capturado. La tarjeta pide un
`Sentry.ErrorBoundary` con pantalla de recuperación.

### 4. Problemas y cómo los resolví

- **El DSN del backend daba `403 … rejected with_reason: ProjectId`**: el primero que copié era de
  un proyecto que ya no existía. Lo detecté mandando un evento con `debug=True` desde el contenedor
  de QA, y lo reemplacé por el DSN correcto, que verifiqué igual antes de subirlo.
- **Dependabot abrió 17 PRs de golpe** (los cinco ecosistemas a la vez). No los mergeo en bloque: el
  pipeline frena los mayores, y los patch van de a uno.

### 5. DORA (práctica, medido sobre este repo)

- **Frecuencia de deploy a PROD:** 4 deploys el 26/10 (incluido el rollback de práctica).
- **Lead time** (merge → PROD): ~8 min de pipeline + lo que tarda la aprobación.
- **Tasa de falla de cambios:** 1 de 4 cambios a `main` frenado antes de PROD (el botón, TP7).
- **Tiempo de restauración:** **60 s**, medido (TP6, rollback).

### 6. Declaración de uso de IA

Usé **Claude (Claude Code)**: escribió la integración de Sentry, el `dependabot.yml`, activó la
seguridad del repo por API y redactó estos borradores. Yo creé las cuentas y los proyectos de Sentry
y UptimeRobot y el monitor, elegí qué PR de Dependabot mergear y la tarjeta. Claude abrió el túnel
y provocó la caída; las horas de DOWN y UP las leí yo en UptimeRobot. Lo verifiqué viendo llegar los
errores a Sentry y con el pipeline en verde del PR #35.
