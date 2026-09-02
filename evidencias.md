# Evidencias — TP1

Las cuatro capturas marcadas 📸 en la guía, tomadas en el momento en que ocurrió cada hecho. Tres de
las cuatro son irrepetibles: el aviso de conflicto y los marcadores dejan de existir apenas se
resuelve el conflicto, y la release se publica una sola vez.

Repositorio: https://github.com/facuolivamar/ingsoft3-tp01

---

## 1. Push directo a `main` rechazado

![push directo a main rechazado](img/01-push-rechazado.png)

Terminal real, con `main` ya protegida. Se agregó una línea al README, se commiteó localmente
(`5adf3c2`) y se intentó `git push`. Los objetos **viajaron** —se ven `Enumerating objects`,
`Compressing objects` y `Writing objects: 100% (3/3), 349 bytes`— y recién ahí llegó el rechazo,
**del lado del servidor**:

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: - Changes must be made through a pull request.
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/facuolivamar/ingsoft3-tp01.git'
```

Ese detalle importa: Git local nunca me frenó. El commit se creó sin problema y los datos se
subieron; quien dijo que no fue GitHub, aplicando la regla. La protección no vive en mi máquina,
vive en el servidor — que es exactamente donde tiene que vivir para que valga para todo el equipo.

Y lo central no es que rechazó, sino **a quién** rechazó: el que empujó es el dueño del repositorio.
La regla se creó con *Do not allow bypassing the above settings*, así que me alcanza igual. Una
protección que el administrador puede saltear no protege: solo protege mientras nadie tenga apuro.

Después de la captura el commit local se descartó con `git reset --hard HEAD~1`. Nunca existió en el
remoto.

---

## 2. El PR de la rama B no se puede mergear: conflicto

![aviso de conflicto en el PR #3](img/02-conflicto-en-pr.png)

Pull Request [#3](https://github.com/facuolivamar/ingsoft3-tp01/pull/3) (`feature/titulo-b` →
`main`), inmediatamente después de mergear el PR
[#2](https://github.com/facuolivamar/ingsoft3-tp01/pull/2) (`feature/titulo-a`). Se ven:

- el badge rojo **Merge conflicts** arriba a la derecha,
- el cartel *This branch has conflicts that must be resolved*, con **`README.md`** como único archivo
  afectado,
- el botón **Squash and merge** **deshabilitado** (gris), y al lado el botón **Resolve conflicts**.

El detalle que vale la pena entender: **este mismo PR figuraba como mergeable un minuto antes.** Las
dos ramas nacieron del mismo commit de `main` y escribieron la misma línea, pero mientras ninguna
estaba integrada no había nada contra qué chocar. El conflicto no nace cuando se escribe el cambio:
nace cuando se lo intenta integrar contra un `main` que ya se movió.

---

## 3. Los marcadores del conflicto

![marcadores del conflicto en el editor web](img/03-marcadores-conflicto.png)

Editor de conflictos de GitHub (`/pull/3/conflicts`), antes de tocar nada. Ahí están las tres
fronteras que deja Git cuando no puede decidir:

```
<<<<<<< feature/titulo-b   (Current change)
# rama b _ eDICION EJERCICIO
=======
# RAMA A - Edicion ejercicio
>>>>>>> main               (Incoming change)
```

Arriba de `=======` está la versión de la rama actual; abajo, la que ya está en `main`. Arriba a la
derecha se lee **1 conflict**, y **Mark as resolved** está deshabilitado: GitHub no deja marcar el
archivo como resuelto mientras quede un solo marcador en el texto.

Lo que **no** está en conflicto es igual de informativo. Las líneas 6 a 12 —`# ingsoft3-tp01`, la
descripción, y la sección `## Instalación` que venía del PR #1— aparecen limpias, sin marcadores.
Ninguna de las dos ramas las tocó, así que Git las fusionó solo, sin preguntar. El conflicto es
quirúrgico: cae sobre la línea disputada, no sobre el archivo entero. Git no razona por archivo,
razona por línea.

Esta captura es la más frágil de las cuatro, porque el paso inmediatamente siguiente es borrar esos
marcadores.

---

## 4. La release `v1.0.0` publicada

![release v1.0.0 publicada](img/04-release-publicada.png)

Release `v1.0.0` con el badge **Latest**, apuntando al tag `v1.0.0` sobre el commit `f9eef5d` — la
punta de `main` después de mergear los tres PRs, es decir el estado exacto en el que quedó cerrado
el TP1.

El tag se creó **anotado** desde la máquina y después se subió:

```bash
git tag -a v1.0.0 -m "TP1 cerrado: flujo de Pull Requests con main protegida y conflicto resuelto"
git push origin v1.0.0
```

Un tag anotado es un objeto de Git con autor, fecha y mensaje propios; un tag liviano sería apenas un
puntero sin metadatos. Para marcar una entrega corresponde el anotado. La release se publicó desde la
web **sobre ese tag ya existente**: el tag congela el commit, la release le agrega la comunicación
para una persona.
