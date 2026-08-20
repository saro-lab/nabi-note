---
title: Teclas, conversión automática, pegado
description: onKey intercepta la tecla, inputRules crea formato solo con escribir, attach toca la pantalla.
---

# Teclas, conversión automática, pegado

Un wing recibe el gesto de la persona por tres puertas — la **tecla** (`onKey`), el
**texto** (`inputRules`) y la **pantalla** (`attach`).

---

## El camino que recorre una tecla

Al pulsar, por ejemplo, <kbd>Enter</kbd>, se pregunta en este orden. Si algo lo procesa
antes, lo siguiente no llega.

```
① Atajo de la barra de herramientas   se escucha en cualquier lugar (algo como Ctrl+B)
② Conversión automática               inputRules — solo Enter y Espacio
③ El onKey del wing                   al dueño del lugar donde está el cursor
④ Apuntar a un objeto                 backspace al principio del párrafo → selecciona entero el objeto de antes
⑤ Regla del núcleo                    dividir párrafo, borrar, desplazar el cursor
⑥ Navegador                           solo si nadie se lo llevó hasta aquí
```

---

## `onKey` — interceptar la tecla

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // no es asunto mío — se lo paso al núcleo
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // backspace al principio de la primera celda — extiende la nota
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
  commands: { toggleNote },
  onKey: noteKeys,
}
```

| Argumento | Qué es |
|---|---|
| `intent` | `{ key, dir? }` — qué tecla es |
| `doc` · `sel` · `env` | Los mismos que recibe un comando |
| `owner` | `{ path, node }` — **el nodo del que fui elegido dueño** |

La respuesta es el mismo `{ doc, selection }` de un comando, o **`null`**. `null`
significa "no me lo llevo", así que el núcleo continúa desde ahí — cuando no se cumple
la condición, hay que responder `null` sin falta.

### Teclas que llegan

| `intent.key` | Cuándo |
|---|---|
| `'enter'` | Tanto <kbd>Enter</kbd> **como** <kbd>Shift</kbd>+<kbd>Enter</kbd> |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | Las dos teclas de borrar |
| `'arrow'` | Las flechas. La dirección va en `intent.dir` (`'left'`, `'right'`, `'up'`, `'down'`) |

Las teclas de carácter no llegan aquí. El carácter lo escribe el navegador y el núcleo
lo recoge.

### El dueño es uno solo

Se recorre la ruta del cursor **hacia arriba y se toma el primer nodo que no sea un
párrafo**; el wing dueño de ese nodo es el dueño.

```
Cursor en la ruta [1, 0, 0]                Candidatos a dueño
  [1, 0, 0]  →  p        es un párrafo, se salta
  [1, 0]     →  note     ← es el dueño
  [1]        →  p(envoltorio)  no llega hasta aquí
```

Por eso **gana el contenedor más interno** — en una lista dentro de una tabla,
<kbd>Tab</kbd> lo recibe la lista. Una pieza (`parts`) también puede ser dueña, y en ese
caso `owner.node` es el nodo de la pieza, pero al `onKey` se llama el del wing que la
declaró. Por eso es costumbre distinguir primero qué salió elegido con `owner.node.w`.

Una marca no puede ser dueña — [la razón está en el documento de marca en
línea](./inline#una-marca-no-puede-tener-tecla-propia).

---

## `inputRules` — crear con solo escribir

Esto es lo que hace que escribir `# ` se convierta en encabezado y `> ` en cita.

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| Casilla | |
|---|---|
| `trigger` | `'space'` o `'enter'` — se dispara en el **instante** en que se pulsa esta tecla |
| `pattern` | Una expresión regular. `run` recibe esa coincidencia |
| `run` | `{ name, args? }` — el comando que se va a ejecutar |
| `scope` | `'block'` (por defecto) o `'word'` |

### `'block'` — reemplaza el inicio de la línea

Mira el **inicio de línea** que está antes del cursor. Si coincide, borra ese inicio (y
el carácter disparador) y ejecuta el comando.

```
Se escribe "> "   →   se borra "> " y corre toggleQuote
```

Solo se dispara en la **primera línea** del párrafo. En una línea siguiente creada con
<kbd>Shift</kbd>+<kbd>Enter</kbd> no se dispara — así se evita que salte formato en
medio de un texto que ya se está escribiendo.

### `'word'` — se aplica a una sola palabra

Mira **una sola palabra** antes del cursor. Si coincide, selecciona esa palabra, ejecuta
el comando y devuelve el cursor a su lugar. El texto no se borra — esta es la vía para
poner una marca.

Si esa palabra **ya lleva la marca de este wing, se salta.** No se dispara dos veces en
el mismo lugar.

### Reglas comunes

- Solo actúa cuando el cursor está **colapsado.** Si hay un rango seleccionado y se
  pulsa espacio, no se dispara.
- Solo actúa en un párrafo normal — no se dispara en un párrafo envoltorio que contiene
  un objeto.
- Se recorren en el orden del arreglo de wings, y **gana la primera regla que tenga
  éxito.**
- Si el comando responde `null` (= no hay nada que hacer), **se revierte y se pasa a la
  siguiente regla.** El intento fallido de conversión automática no deja huella en el
  documento.

---

## `attach` — tocar la pantalla

A veces hay que escuchar no un cambio del documento sino **algo que ocurre en la
pantalla** — elegir celdas de una tabla arrastrando, colorear código, pulsar el
triángulo de un plegable.

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // se responde la función de desconexión
}
```

`host` da tres cosas.

| | |
|---|---|
| `host.root` | El elemento de la superficie de edición |
| `host.nabi` | El editor. Para cambiar el documento se usa **un comando** |
| `host.pathOfKey(id)` | Traduce el `data-key` de la pantalla a la ruta del documento |

`mountSurface` conecta juntos los `attach` de todos los wings registrados, y al
desmontar llama a las funciones de desconexión que respondieron. **Es el único lugar
donde puede vivir código que conoce el DOM** — dentro de un comando, de `toHtml` o de
`repair` no se debe tocar `document`.

::: tip El documento se ubica con `data-key`
El ensamblaje para el editor (`getEditorHtml()`) pone un `data-key` en cada nodo.
Buscando el `[data-key]` más cercano al elemento pulsado y pasándolo a
`host.pathOfKey()`, se obtiene el lugar dentro del documento.
:::

---

## Pegado y HTML inicial

Pegar, `setHtml()` y cargar un valor guardado **pasan todos por la misma puerta.** Lo
único que el wing tiene que hacer aquí es `claim` — está descrito en
[el `claim` del documento de marca en línea](./inline#claim).

```
Pegar     ─┐
setHtml   ─┼→ análisis → claim del wing → correspondencia de etiquetas básicas del núcleo → repair → cocoon → documento
HTML inicial ─┘
```

Sin `claim`, **esa etiqueta se despoja y solo queda el texto de dentro.** Gracias a esta
regla, un marcado desconocido copiado de otro editor no se clava tal cual en el
documento.

La vía de entrada por JSON (`setJson()`) no trata etiquetas sino nodos, así que el
guardián no es `claim` sino `repair`.

---

## Próximos documentos

- [UI y comportamiento](../custom/ui) — botones de barra de herramientas y barra contextual
- [Marca en línea](../custom/inline) · [Bloque y atributo de párrafo](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
