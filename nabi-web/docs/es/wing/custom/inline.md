---
title: Crear una marca en línea
description: place 'mark' — formato que se pone sobre el texto. Se escriben juntas la vía de salida (toHtml) y la de entrada (claim).
---

# Crear una marca en línea

`place: 'mark'` es **formato que se pone sobre el texto.** No ocupa un lugar propio, no
interrumpe el flujo del texto y se puede superponer — la negrita, la cursiva y el
resaltado son todos de este grupo.

---

## Una marca completa

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { en: 'Key' },
      shortcut: 'K',
      action: { kind: 'mark' },        // el interruptor lo hace el núcleo — no hace falta un comando
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Lo que `simpleMark` llena por su cuenta es `place: 'mark'` y `escapeKeys: ['Escape']`.
El resto pasa tal cual.

---

## Las dos direcciones se escriben por separado

| | Dirección | Si falta |
|---|---|---|
| `toHtml` | documento → HTML | **el registro muere.** Un wing que levanta un nodo debe tener forma de dibujarse |
| `claim` | HTML → documento | se dibuja igual, pero **no se puede volver a leer.** Al guardar y recargar se le quita la envoltura |

Las seis marcas básicas (`b`, `i`, `u`, `s`, `sub`, `sup`) y las cuatro marcas de valor
(`hl`, `tc`, `fs`, `tf`) **ya son etiquetas que el núcleo conoce.** Por eso `boldWing` no
tiene ni `toHtml` ni `claim`. Un nombre hecho a mano el núcleo no lo conoce, así que hay
que escribir los dos.

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| Argumento | Qué es |
|---|---|
| `node` | El nodo actual. Los atributos se sacan con `node.a?.['clave']` |
| `children()` | El texto ya dibujado del contenido. **Se dibuja al llamarlo**, así que si no se llama, el contenido no sale |
| `ctx` | Las herramientas para construir con seguridad |

Lo que da `ctx`:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | Construye un elemento entero. Los valores se escapan por su cuenta |
| `ctx.escape(text)` | Escapa solo el texto |
| `ctx.url(raw)` · `ctx.src(raw)` | Filtra una dirección. Una dirección de la que no se puede fiar responde **`null`** |
| `ctx.keys` | Si el ensamblaje actual es **para el editor** (`getEditorHtml()`) |

::: warning No concatene texto a mano
Si se escribe algo como `` `<kbd>${node.a?.['t']}</kbd>` ``, el texto del documento se
convierte tal cual en marcado. Siempre debe pasar por `ctx.element` o `ctx.escape`.
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — el elemento tal como llegó |
| `inner(block)` | Lee el contenido. Si es marca, `false` (posición de texto); si es bloque, `true` |
| Respuesta | Un arreglo de nodos, o **`null`** (no es mío → pasa al siguiente wing) |

Se pregunta en el orden del arreglo de wings, y **el primero que levante la mano** se lo
lleva.

Hay dos lugares donde se responde `null` — cuando no es mi etiqueta, y **cuando es mi
etiqueta pero el valor está fuera de la lista.** Si en este segundo caso se responde
`inner(false)`, solo se le quita la envoltura y el texto sobrevive.

---

## Marca que lleva un valor

Una marca como el color o el tamaño, que **elige uno de una lista fija**, usa
`valueMark`.

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // la casilla de atributo donde vive el valor
    values: [...LEVELS],             // no acepta valores fuera de esta lista
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // fuera de la lista — solo deja el texto
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

Dos cosas que aporta `valueMark`:

- **`currentValue`** — el valor en el lugar donde está el cursor ahora mismo. Con esta
  respuesta, la barra de herramientas y la contextual pintan qué casilla está pulsada.
- **`repair`** — vuelve a validar el valor en la entrada de JSON. Si está fuera de la
  lista o no existe, responde `null` y **se retira junto con su envoltura.** Un valor
  guardado corregido a mano también queda atrapado aquí.

::: tip Comando para cambiar el valor
El comando "cambia a este valor" de una marca de valor todavía no tiene un ayudante
público. El interruptor simple con `action: { kind: 'mark' }`, activado solo con el
botón de la barra de herramientas, se puede usar tal cual, y si hace falta elegir un
valor, por ahora conviene usar una de las cuatro marcas de valor por defecto
(resaltado, color de texto, tamaño de letra, tipografía) o extender su declaración.
:::

---

## `escapeKeys` — salir de la marca

Con el cursor al final de una marca, solo la persona sabe si el próximo carácter va
dentro o fuera de la marca. `escapeKeys` es esa puerta.

```ts
escapeKeys: ['Escape']    // el valor por defecto de simpleMark y valueMark
```

**El cursor no se mueve.** Al pulsar esta tecla queda la reserva "el próximo carácter
escrito sale de esta marca". Al escribir un carácter, la reserva se usa y desaparece.

```
<kbd>Ctrl</kbd>(cursor)  →  Escape  →  se escribe "+"  →  <kbd>Ctrl</kbd>+
```

Varios wings pueden usar la misma tecla — la reserva solo queda si el cursor está de
verdad dentro de esa marca en ese momento, así que entre marcas superpuestas solo se
sale de las que correspondan. <kbd>Escape</kbd> también sirve para **deshacer** una
reserva ya puesta.

---

## Una marca no puede tener tecla propia

Aunque se escriba `onKey`, **a una marca no le llega.** La posición del cursor es
`{ path, offset }`, y el final de `path` es **el contenedor que guarda el texto** — la
marca es un nodo en línea dentro de ese contenedor, así que ni siquiera aparece en la
ruta. Al decidir quién es el dueño de la tecla, el núcleo recorre esta ruta hacia
arriba, así que nunca se encuentra con una marca.

La razón es la superposición. Con negrita dentro de cursiva dentro de un enlace, al
pulsar <kbd>Enter</kbd> no hay forma de decidir cuál de las tres es la dueña. La única
puerta que tiene una marca frente a las teclas es `escapeKeys`.

---

## Próximos documentos

- [Bloque y atributo de párrafo](../custom/block) — lo que ocupa un lugar
- [Teclas, conversión automática y pegado](../custom/input) — `onKey` e `inputRules`
- [UI y comportamiento](../custom/ui) — botones de barra de herramientas y barra contextual

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
