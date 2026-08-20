---
title: Crear un wing propio
description: Un formato que no existe se hace con un wing — con llenar un solo contrato, el núcleo hace el resto.
---

# Crear un wing propio

Un wing es **un solo objeto.** No hereda de una clase ni sigue un trámite de registro
aparte — ponerlo en el arreglo que se le pasa a `createNabiWith` ya es registrarlo.

La negrita, la tabla y la subida también están hechas llenando solo las casillas que
aparecen aquí. Un wing hecho a mano funciona en **las mismas condiciones** que los wings
por defecto — no hay ningún atajo aparte.

---

## El wing más corto

Es una sola marca en línea que conoce `<kbd>`.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // el nombre de este wing — es el `w` del valor guardado
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // el dibujo de salida
  }),
  // levanta la mano diciendo que es el dueño de `<kbd>` en el HTML que entra
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Ahora `<kbd>` se queda en el documento. Sigue ahí después de pegar, de `setHtml()`, de
guardar y de volver a cargar.

```
Registrado    <p>Pulse: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   se queda igual
Sin registrar <p>Pulse: <kbd>Ctrl</kbd></p>                →   <p>Pulse: Ctrl</p>
```

**Las dos casillas miran en direcciones distintas.** `toHtml` es la vía de salida y
`claim` la de entrada. Si no se escribe `claim`, se puede dibujar pero **no se puede
volver a leer** — en el instante de guardar y recargar, se le quita la envoltura.

`simpleMark` es un atajo para una marca sin atributos. Para una marca que lleva un
valor está `valueMark`, para un objeto está `boxObject`, para una familia de listas está
`listFamily`, y para el resto se escribe el objeto `Wing` a mano.

---

## Los wings son constantes

**La mayoría de los wings ya son constantes terminadas** — como `boldWing` o
`headingWing`, basta con ponerlos en el arreglo. Solo dos, los que necesitan opciones,
tienen aparte una función fábrica.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

Si solo quiere cambiar la "conexión" (`attach`), extienda la constante con spread — como
no está construyendo un wing nuevo sino cambiando una sola casilla, esta vía es más
simple.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Registro y orden

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**El orden del arreglo es el orden de recorrido.** Cuando hay que decidir de quién es un
marcado (`claim`), el núcleo pregunta en este orden, y se lo lleva el primer wing que
responda. Si nadie lo reclama, se le quita la envoltura.

En la barra de herramientas, **primero van los grupos** (`button.group`). El orden de
los grupos está fijo, y dentro de un mismo grupo el orden sigue este mismo arreglo.

### Muere en el mismo momento del registro

`createNabiWith` **lanza de inmediato** si un wing rompe el contrato. No revienta más
tarde.

| Lo que falla | Ejemplo |
|---|---|
| Usar una palabra reservada como nombre | `w: 'p'` · `w: 'br'` |
| Registrar el mismo nombre dos veces | `boldWing` dos veces |
| Levanta un nodo pero no tiene `toHtml` | `place: 'mark'` sin forma de dibujarse |
| El nombre del comando rompe la regla | debe ser verbo+objeto en camelCase (`insertTable`) |
| Falta el compañero necesario | la subida necesita tener junto a ella `img` o `a` (`requiresAnyOf`) |

---

## Los comandos son funciones puras

Todo camino que cambia el documento pasa por un comando. El comando **no conoce ni el
DOM ni la pantalla.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // viene de fuera, así que se valida — si no encaja, no se hace nada
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { en: 'Stamp' },
    action: { kind: 'command', command: 'insertStamp', args: { text: 'Ok' } },
  },
}
```

| Argumento | Qué es |
|---|---|
| `doc` | El documento actual (un arreglo de bloques). **No se modifica, se responde uno nuevo** |
| `sel` | La selección actual |
| `args` | El valor que pasó un botón o la barra contextual. **Viene de fuera, así que hay que validarlo** |
| `env` | El conocimiento de tipos — qué contiene a qué, qué es un objeto |

La respuesta es `{ doc, selection }` o **`null`**. **Si no cambia nada, responda
`null`** — así `applyCommand` responde `false` y no se apila un punto de deshacer. El
documento devuelto vuelve a pasar por `cocoon`, así que ningún comando puede dejar un
documento que rompa las reglas.

Quien lo llama siempre usa el nombre.

```ts
nabi.applyCommand('insertStamp', { text: 'Ok' })   // boolean
```

---

## Todas las casillas que se pueden llenar

`Wing` tiene veinticinco casillas y **solo dos son obligatorias** (`w` y `place`).

### Qué es

| Casilla | Sentido |
|---|---|
| `w` | El nombre de este wing. Se convierte en el `w` del valor guardado. No se pueden usar las palabras reservadas (`p`, `br`) |
| `place` | `'mark'` sobre el texto · `'void'` un objeto sin contenido · `'container'` un objeto con texto dentro · `'attr'` un atributo de párrafo · `'tool'` una herramienta que no deja huella en el documento |
| `holds` | Cómo alberga su contenido — `'blocks'` o `'inline'` |
| `singleParagraph` | Su contenido queda fijo en **un solo** párrafo (la celda de una tabla) |
| `boolAttrs` | Los nombres de atributos booleanos cuyo único valor es `1` |
| `allows` | Los nombres de los wings que pueden entrar aquí dentro. Sin escribirlo, entran todos |
| `requiresAnyOf` | Al menos uno de estos debe registrarse junto con él |
| `parts` | La estructura sin botón que trae consigo — la fila y la celda de una tabla, la línea de resumen de un plegable |

### Valor

| Casilla | Sentido |
|---|---|
| `attrKey` · `attrValues` | El nombre de la casilla que usa un atributo de párrafo y la lista de valores que puede recibir |
| `currentValue` | Si está pulsado ahora mismo — con esta respuesta la barra de herramientas y la contextual pintan la casilla |

### Vías de ida y vuelta

| Casilla | Sentido |
|---|---|
| `toHtml` · `partHtml` | El dibujo de salida |
| `claim` | Decide de quién es esta etiqueta en el HTML que entra |
| `repair` · `partRepair` | Pule este nodo en la entrada de JSON. Si responde `null`, se retira junto con su envoltura |

### Manos y teclas

| Casilla | Sentido |
|---|---|
| `commands` | Los comandos que aporta este wing |
| `onKey` | Intercepta primero la tecla cuando el cursor está dentro del nodo de este wing |
| `escapeKeys` | Las teclas que hacen que el próximo carácter escrito salga de esta marca |
| `inputRules` | Conversiones automáticas que ocurren solo con escribir |
| `attach` | Para cuando hay que tocar la pantalla — arrastrar celdas de una tabla, colorear código, eso es esto |

### Aspecto

| Casilla | Sentido |
|---|---|
| `button` · `buttons` | Uno o varios botones de la barra de herramientas |
| `context` | La declaración de la barra contextual |
| `styles` | El CSS que trae este wing |

---

## `w` — cómo nombrarlo

`w` es **la cadena que se repite en cada nodo del valor guardado.** Cuanto más corta,
mejor — por eso los wings por defecto usan nombres cortos como `b`, `hl`, `tf`. Pero si
coincide con el nombre de otro, el registro muere, así que para uno hecho a mano conviene
usar un nombre algo más largo con tal de que no choque.

No hace falta que coincida con el nombre de la etiqueta HTML — la etiqueta de salida la
decide `toHtml`.

::: warning Si el nombre se cambia después
El `w` del valor guardado es justamente ese nombre, así que cambiarlo hace que
**los documentos ya guardados no se puedan volver a leer.** Si hay que cambiarlo, deje
un período de transición aceptando también el nombre viejo con `claim`.
:::

---

## Próximos documentos

- [Marca en línea](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Bloque y atributo de párrafo](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Teclas, conversión automática y pegado](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI y comportamiento](./custom/ui) — `button` · `context` · `styles`, y cómo preguntarle a la persona

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
