---
title: Crear bloques y atributos de párrafo
description: void · container · attr — se crea lo que ocupa un lugar. El objeto siempre vive dentro de un párrafo envoltorio.
---

# Crear bloques y atributos de párrafo

Lo que ocupa un lugar se divide en tres grupos.

| `place` | Qué es | Ejemplo |
|---|---|---|
| `'void'` | **Un objeto sin contenido.** El cursor no puede entrar dentro | línea horizontal, imagen, YouTube |
| `'container'` | **Un objeto con texto dentro** | cita, plegable, tabla, lista, código |
| `'attr'` | Un valor que se pega al párrafo mismo. No levanta ningún nodo | encabezado, alineación, letra capital |

---

## El objeto vive dentro de un párrafo envoltorio

El documento es un **arreglo de bloques**, y lo único que puede pararse en el nivel más
alto es un párrafo (`p`). El objeto no se para directamente ahí, sino envuelto en un
párrafo **que solo lo contiene a él**.

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

Este párrafo es el **párrafo envoltorio**, y en pantalla se dibuja como
`<div data-nabi-p>`.

Hay dos razones para hacerlo así. Siempre hay un lugar donde el cursor se puede parar
antes y después del objeto (porque siempre hay un párrafo ahí), y **el objeto recibe tal
cual los atributos de párrafo, como la alineación** — "una imagen centrada" es
justamente "una imagen dentro de un párrafo centrado".

---

## Crear un objeto sin contenido

```ts
import { boxObject, createNabiWith, insertLump, type Command, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const insertStar: Command = (doc, sel, _args, env) => {
  const r = insertLump(doc, sel.focus, { w: 'star', ch: [] }, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const starWing: Wing = {
  ...boxObject({
    w: 'star',
    toHtml: (_node, _children, ctx) => ctx.element('hr', '', { 'data-nabi-star': '' }),
  }),
  commands: { insertStar },
  button: {
    group: 'insert',
    label: { en: 'Star' },
    action: { kind: 'command', command: 'insertStar' },
  },
}
```

`insertLump` viste el párrafo envoltorio por su cuenta.

```
<div data-nabi-p><hr data-nabi-star/></div>
```

Si se llama sobre un párrafo vacío, **ese mismo párrafo se reemplaza** — así no queda
una línea vacía nueva cada vez que se inserta algo. Y la alineación que ya llevaba ese
párrafo sobrevive tal cual.

Lo que `boxObject` llena por su cuenta es `place: 'void'` y **el validador de
atributos.**

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // un valor fuera de la lista se descarta
  requires: ['c'],                                                 // sin él, este objeto no se levanta
  toHtml: /* … */,
})
```

Un atributo que no está en `attrs` **es una casilla desconocida, así que se descarta
entero.** No existe ningún lugar por donde un valor fuera del contrato se cuele en el
valor guardado.

---

## Crear un objeto con contenido

`place: 'container'` obliga a escribir `holds` junto con él — si no se escribe, el
registro muere.

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // dentro vive un párrafo ('inline' sería solo texto)
  allows: ['p'],                    // lo que puede entrar aquí dentro
  toHtml: (_node, children, ctx) => ctx.element('aside', children(), { 'data-nabi-note': '' }),
  claim: (el, inner) => (el.tag === 'aside' ? [{ w: 'note', ch: inner(true) }] : null),
  commands: { toggleNote },
  inputRules: [{ trigger: 'space', pattern: /^!$/, run: () => ({ name: 'toggleNote' }) }],
  button: {
    group: 'container',
    label: { en: 'Note' },
    action: { kind: 'command', command: 'toggleNote' },
  },
}
```

`toggleWrap` es un **interruptor**. Envuelve en este contenedor los bloques de primer
nivel que abarca la selección, y si ya están todos envueltos, extiende el contenido en
su lugar.

```
Antes de envolver  [p"primera línea", p"segunda"]
Después de envolver [p[ note[ p"primera línea", p"segunda" ] ]]
Al pulsar de nuevo  [p"primera línea", p"segunda"]
```

### `holds`

| | Lo que vive dentro | Ejemplo |
|---|---|---|
| `'blocks'` | Párrafos y otros objetos | cita, plegable, celda de tabla |
| `'inline'` | Solo texto y marcas | línea de resumen de un plegable, código |

### `allows`

Si se escribe, **lo que quede fuera no puede entrar.** El núcleo pone automáticamente un
saneador encima, así que tanto al pegar como en el valor guardado, lo que esté fuera de
la lista se despoja y solo su texto interior cae como párrafo.

Sin escribirlo, se permite todo. Si `allows` lleva un nombre desconocido,
**el registro muere en ese mismo momento.**

---

## `parts` — estructura interna sin botón

Una estructura como la fila y celda de una tabla, o la línea de resumen de un plegable,
que **no puede pararse sola y no tiene botón propio en la barra de herramientas**, se
declara como pieza.

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // atributo con único valor 1 — si está desplegado
  parts: { summary: { holds: 'inline' } },            // la línea de resumen
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // cada pieza debe tener su propio ensamblaje
  repair: repairDetails,
}
```

Cuatro reglas.

- Una pieza solo puede ser **contenedor.** Si se escribe con otro `place`, el registro
  muere.
- Cada pieza debe tener su `partHtml`. Sin él, el registro muere.
- El nombre de una pieza no puede repetir el nombre de un wing ni el de otra pieza.
- Si hace falta pulir una pieza, se escribe en `partRepair` bajo el nombre de la pieza.

`StructureDecl` acepta tres campos — `holds`, `singleParagraph`, `boolAttrs`.

### `singleParagraph`

Su contenido **queda fijo en un solo párrafo.** La celda de una tabla es así — al pulsar
<kbd>Enter</kbd> dentro de una celda el párrafo no se parte en dos, y al borrar una
selección que abarca dos celdas, las celdas no se fusionan entre sí. Esta única casilla
es la que mantiene la rejilla.

### `boolAttrs`

Un atributo cuyo único valor posible es `1` — la `o` (desplegado) de un plegable, la
`ck` (marcado) de una lista de tareas, la `dc` (letra capital) de un párrafo. El estado
apagado no es `0`, sino **que la casilla directamente no existe.**

---

## `repair` — la última puerta a la entrada del valor guardado

`repair` pule este nodo una vez, **justo antes de que el JSON se convierta en
documento.**

```ts
repair: (node) => {
  if (!esValido(node)) return null    // null — este nodo se retira junto con su envoltura
  return nodoPulido                   // puede quedarse igual (si se responde el mismo objeto, no cambia nada)
}
```

Un valor guardado corregido a mano, un documento venido de otra versión, un JSON escrito
por otra persona — todos pasan por esta puerta. Solo lo que la atraviesa se convierte en
documento, así que este es **el único lugar donde un wing puede garantizar por sí mismo
la forma de su propio nodo.**

Si se escriben `allows` y `repair` juntos, primero corre el saneado de `allows` y
**después** su resultado pasa a `repair`.

---

## `requiresAnyOf` — un wing que necesita un compañero para pararse

```ts
requiresAnyOf: ['img', 'a']
```

Si ninguno de estos está registrado junto con él, **el registro muere en ese mismo
momento.** El wing de subida usa esto — lo que se sube tiene que levantarse como imagen
o como enlace, y si no está ninguno de los dos, se sube y no se puede hacer nada con
ello.

---

## Atributo de párrafo (`place: 'attr'`)

Un atributo de párrafo no levanta ningún nodo. Solo pega un valor en la `a` del párrafo.

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["Encabezado 2 centrado"] }
```

::: warning Las casillas están cerradas en tres
`attrKey` debe ser una de estas tres — **`h` (encabezado) · `a` (alineación) ·
`dc` (letra capital)** — y si se escribe otro nombre, el registro muere. En esta versión
**no se pueden crear atributos de párrafo nuevos** — la casilla de atributos del párrafo
está cerrada a las tres que el núcleo conoce.

Por la misma razón, estas tres ya las ocupan `headingWing`, `alignWing` y
`dropCapWing`, así que en la práctica no queda lugar para escribir un wing nuevo con
`place: 'attr'`. Si se quiere pegar un valor por párrafo, por ahora conviene envolverlo
en un contenedor.
:::

Dos casillas manejan el valor.

| | |
|---|---|
| `attrValues` | La lista de valores que puede recibir (para el encabezado, `[1,2,3,4,5,6]`) |
| `currentValue` | El valor que lleva este párrafo ahora mismo. Con esta respuesta la barra de herramientas y la contextual pintan la casilla pulsada |

---

## Ayudantes de documento públicos

Esta versión expone hacia afuera cuatro ayudantes de edición.

| | Qué hace |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | Levanta un objeto junto con su párrafo envoltorio |
| `removeLump(doc, topIndex, env)` | Retira entero un párrafo envoltorio de primer nivel |
| `toggleWrap(doc, sel, containerW, env)` | Envuelve o extiende los bloques que abarca en un contenedor |
| `topNodeAt(doc, path)` | El nodo de primer nivel al que pertenece esta ruta |

Los cuatro responden `{ doc, caret }`, así que hay que trasladarlo una vez a la forma
que espera un comando.

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

::: tip Si hace falta una edición más fina que esto
Los ayudantes internos que cortan y unen a nivel de carácter (poner una marca, escribir
un atributo de párrafo, etc.) todavía no son una API pública. Hasta entonces, se puede
construir a mano el arreglo `doc` nuevo y devolverlo — el documento devuelto vuelve a
pasar por `cocoon`, así que nunca queda un documento que rompa las reglas.
:::

---

## Próximos documentos

- [Teclas, conversión automática y pegado](../custom/input) — `onKey` · `inputRules` · `attach`
- [UI y comportamiento](../custom/ui) — botones de barra de herramientas y barra contextual

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
