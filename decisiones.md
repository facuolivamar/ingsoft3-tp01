# Decisiones — TP1

## 1. Por qué Git no pudo resolver el conflicto solo

### Qué pasó exactamente

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

### Qué habría tenido que pasar para que nunca apareciera

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

## 2. Qué problemas encontré y cómo los solucioné

### a) La rama del primer PR nació con el nombre automático de GitHub

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

### b) El README quedó con dos títulos H1

Al fabricar el conflicto, en vez de **reemplazar** la primera línea del README agregué una línea
nueva arriba en cada rama. El conflicto salió igual —las dos ramas escribieron la misma posición—
pero el resultado del merge fue un archivo con dos encabezados de nivel 1: el título del ejercicio
(`# rama b _ eDICION EJERCICIO`) y el original (`# ingsoft3-tp01`). En Markdown eso está mal formado:
un documento tiene un solo H1.

Lo corregí en el PR de documentación, dejando un único título. La historia del conflicto no se pierde
por eso: sigue estando en los PRs #2 y #3 y en el commit `f9eef5d`, que es adonde apunta el tag
`v1.0.0`.

### c) El push rechazado no era un error a arreglar

La primera reacción al ver `[remote rejected] main -> main (protected branch hook declined)` en rojo
fue buscar qué había hecho mal. No había nada: ese mensaje **es** el resultado esperado del paso, la
prueba de que la protección funciona y de que me alcanza a mí. El commit local que había quedado
huérfano se descartó con `git reset --hard HEAD~1`.

### d) Aprobaciones obligatorias en un TP individual

Al activar *Require a pull request before merging*, GitHub tilda solo *Require approvals* con valor
1. Lo dejé en **cero**, porque GitHub no permite que el autor de un PR apruebe su propio PR: con una
aprobación obligatoria en un trabajo individual, ningún PR se podría mergear nunca. La revisión la
hice igual, a mano, leyendo el diff en *Files changed* antes de mergear cada PR. En un equipo real
ahí iría 1 o más.

## 3. Declaración de uso de IA

Usé **Claude (Claude Code)** durante todo el TP, con acceso a la terminal y al repositorio local.

### Qué hice yo

- Leer y resumir la consigna del repositorio de la cátedra, y armarme la hoja de ruta de los pasos que faltaban.
- Crear el repositorio público y configurar la protección de `main` (*Require a pull request*, cero
  aprobaciones, *Do not allow bypassing*).
- Provocar el rechazo del push directo y sacar la captura.
- Crear las ramas, editar los archivos y abrir y mergear los tres Pull Requests desde la web.
- **Resolver el conflicto**: decidir que quedara la versión B y borrar los marcadores a mano en el
  editor web, en vez de usar los botones *Accept current / incoming change*.
- Sacar las cuatro capturas.

### Qué delegué
  
- Ejecutar comandos de Git ya decididos: `git pull`, la creación y push del tag anotado `v1.0.0`, y
  el borrado de las dos ramas de feature ya mergeadas.
- Ordenar y renombrar las capturas dentro de `img/`.
- Redactar los borradores de este archivo y de `evidencias.md`.

### Cómo verifiqué lo que me devolvió

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
