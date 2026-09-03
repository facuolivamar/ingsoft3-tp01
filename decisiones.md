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
