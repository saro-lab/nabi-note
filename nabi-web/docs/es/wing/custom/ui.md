---
title: UI y comportamiento
description: El botón de la barra de herramientas (button), la barra contextual (context), la hoja de estilos (styles) — los tres lugares donde un wing se para frente a la persona.
---

# UI y comportamiento

Hay tres lugares donde un wing se para frente a la persona.

| Casilla | Dónde |
|---|---|
| `button` · `buttons` | La **barra de herramientas** de arriba — un lugar siempre visible |
| `context` | La **barra contextual** — aparece solo cuando el cursor toca algo |
| `styles` | El **CSS** que trae este wing |

---

## Botón de la barra de herramientas

```ts
button: {
  group: 'emphasis',                   // en qué grupo se para — obligatorio
  svg: '<path d="…"/>',                // el interior en coordenadas 16×16. Sin esto, se para como texto
  label: { en: 'Bold' },
  shortcut: 'B',                       // la letra en el modo de pistas
  accelerator: 'mod+b',                // combinación Ctrl/⌘
  action: { kind: 'mark' },
}
```

Si son varios botones, se escriben como arreglo en `buttons` — así hace un solo wing de
alineación para levantar izquierda, centro y derecha. Ahí se distinguen entre sí con
`name`, y cada uno escribe el valor que representa en `value`.

### `group` — el orden lo decide el grupo

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

**Este orden está fijo.** Sin importar en qué parte del arreglo se ponga el wing, el
botón se para en el lugar de su grupo. Solo dentro de un mismo grupo se ordenan según el
orden de registro. Si se usa un nombre fuera de la lista, se levanta un grupo nuevo al
final.

Cuando un grupo entero queda vacío (todos sus botones ocultos), ese grupo desaparece de
la pantalla — no queda un separador vacío.

### `action` — qué pasa al pulsarlo

| `kind` | Qué hace | Qué se escribe junto |
|---|---|---|
| `'mark'` | Va al interruptor de marca del núcleo. **No hace falta un comando** | — |
| `'command'` | Ejecuta un comando | `command` · `args?` |
| `'menu'` | Despliega una lista de valores como panel | `command` · `argKey` · `values` |
| `'grid'` | Despliega una rejilla de filas × columnas (insertar tabla) | `command` · `rowsKey` · `colsKey` · `max?` |
| `'prompt'` | Abre una casilla de entrada y pasa el valor recibido al comando | `command` · `fields` |
| `'file'` | Abre la ventana de selección de archivo | `accept?` · `multiple?` |
| `'host'` | Se lo pasa al host (`onHost` de `mountToolbar`) | — |

Sin `action`, ese botón no hace nada al pulsarlo.

### `shortcut` y `accelerator`

| | Forma | Regla |
|---|---|---|
| `shortcut` | `'B'` | Una sola letra **mayúscula latina o dígito** |
| `accelerator` | `'mod+b'` | Una sola letra minúscula después de `mod+` |

Ambos **hacen morir el registro si chocan entre wings.** No hay caso de que uno deje de
funcionar en silencio más adelante.

Si se escribe `accelerated` aparte, con el acelerador se ejecuta un comportamiento
distinto — al pulsar el botón se abre un panel, pero con <kbd>Ctrl</kbd>+tecla se aplica
directamente el valor por defecto.

---

## Cómo se ve que está pulsado

Solo hay una base para pintar un botón como "está activo ahora".

| `place` | Qué se mira |
|---|---|
| `'mark'` | Si esa marca está en el lugar del cursor |
| `'attr'` | El `currentValue` del párrafo donde está el cursor |
| `'container'` · `'void'` | Si el cursor está dentro o sobre ese objeto |
| `'tool'` | **Siempre apagado** |

Un wing con varios valores (alineación, encabezado) escribe `value` en cada botón, y
solo se pinta el botón cuyo valor coincide con lo que responde el `currentValue` del
wing.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

**`currentValue` responde texto** — incluso un valor numérico se traduce con `String()`
antes de responderlo. `undefined` significa "este nodo no tiene mi valor".

---

## El botón se oculta solo donde no puede pararse

| `place` | Cuándo se oculta |
|---|---|
| `'mark'` | En un lugar donde solo vive texto (como dentro de una caja de código), cuando es el dueño de ese lugar |
| `'attr'` | Cuando el cursor está sobre un párrafo envoltorio que contiene un objeto. **Solo la alineación (`a`) es la excepción** |
| `'void'` · `'container'` | En un lugar donde solo vive texto, o cuando el `allows` del contenedor actual no me admite |
| `'tool'` | No se oculta |

La razón de que solo la alineación sea excepción es la misma vista antes — la
alineación de un objeto no la lleva el objeto, sino el párrafo envoltorio que lo
contiene. Hace falta poder pulsar "centrar" estando sobre una imagen.

Si se escribe `allows`, **la barra de herramientas lo sigue por su cuenta.** Que el
botón de tabla desaparezca dentro de una caja de código no es una regla escrita aparte,
sino algo que sale de un solo `allows`.

---

## Barra contextual

Es la fila que aparece solo cuando el cursor toca algo. Es el lugar donde, al pulsar una
imagen, aparece el ajuste de tamaño, y al poner el cursor en un enlace, aparece la
casilla de dirección.

```ts
context: {
  title: { en: 'Note' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { en: 'Tone' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // la casilla de atributo de donde leer el valor actual
      values: [
        { value: 'info', label: { en: 'Info' } },
        { value: 'warn', label: { en: 'Warning' } },
      ],
    },
  ],
}
```

### Cuándo aparece

**Todo lo que toca** el lugar del cursor despliega su propia fila.

- Los contenedores que están en la ruta del cursor (primero los internos, después los
  externos)
- El objeto apuntado (una imagen seleccionada sobre su párrafo envoltorio, por ejemplo)
- Las **marcas** que llevan el lugar del cursor — a diferencia del botón de la barra de
  herramientas, una marca también tiene barra contextual
- El wing de **atributo de párrafo** cuyo valor lleva el párrafo donde está el cursor

Al poner el cursor en un enlace dentro de una tabla, aparecen juntas la fila del enlace
y la de la tabla.

### Los siete tipos de `ContextControl`

| `kind` | Qué es | Qué se escribe junto |
|---|---|---|
| `'button'` | Un comando de un solo pulso | `command` · `args?` |
| `'toggle'` | Dos estados, encendido/apagado | `command` · `token` |
| `'select'` | Uno de una lista | `command` · `argKey` · `values` · `attr?` |
| `'range'` | Deslizar una marca (ajuste de tamaño) | `command` · `argKey` · `values` · `rest?` · `readout?` |
| `'text'` | Una sola casilla de texto (dirección de un enlace) | `command` · `argKey` · `initial?` · `placeholder?` · `validate?` |
| `'prompt'` | Varias casillas en un panel | `command` · `fields` |
| `'lightbox'` | Ver en grande | `src` · `alt?` |

Los siete comparten `name` (obligatorio), `label?`, `svg?`, `tip?`, `visible?`.

`visible: (node) => boolean` es la puerta para **ocultar una casilla dentro del mismo
wing** — por ejemplo, mostrar "deshacer combinación" solo en una celda ya combinada.

Si se escribe `attr`, el valor actual se lee y se pinta directamente desde esa casilla
de atributo. `'toggle'` compara con `token` frente al texto que responde
`currentValue`.

---

## `styles` — el CSS que trae el wing

```ts
styles: `
.nabi-content aside[data-nabi-note] {
  border-inline-start: 3px solid var(--nabi-accent);
  padding: .6rem .9rem;
  background: color-mix(in srgb, var(--nabi-accent) 8%, transparent);
}
`
```

Cuatro reglas.

- **Se limita a bajo `.nabi-content`.** No debe extenderse a otro texto de la página del
  host.
- **El tamaño de letra se escribe en `rem` o `em`.**
- **Una variante oscura se aparta solo con la clase `.dark`.** Si se aparta con una media
  query, el editor se oscurece incluso en una pantalla clara que el host encendió a
  propósito.
- **El ancho y el estrecho se miden con container queries.** La base no es el ancho de
  la pantalla, sino el ancho del lugar donde está puesto el editor.

Si se quiere incluir solo lo registrado, se reúne y se conecta a mano.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const detach = injectSheets(document, collectSheets(registry))
```

La hoja del mismo texto se carga **una sola vez** — aunque varios wings compartan el
mismo CSS, en el documento solo queda pegado uno. La respuesta es la función de retiro,
y **solo retira lo que esta llamada acaba de pegar.**

---

## Preguntarle a la persona

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

`confirm` acepta tanto `boolean` como `Promise<boolean>` — se puede enchufar tal cual el
`confirm` del navegador, o abrir un panel propio y dar la respuesta más tarde.

::: warning Si no se da, la respuesta es siempre "no"
Si no se conecta `ask`, entra un valor por defecto silencioso. `message` no va a
ninguna parte y `confirm` responde `false`. La idea es que **es mejor que preguntar y
borrar quede en silencio sin hacer nada**, a que quede hecho en silencio. El "¿de verdad
quiere borrar?" del historial local pasa por esta misma puerta.
:::

::: tip Un comando no puede preguntar
Un comando es una función pura, así que no conoce ni la pantalla ni el tiempo. Lo que
haya que preguntar se pregunta fuera del comando, y **después de tener la respuesta** se
llama al comando. El lugar dentro de un wing para eso es `attach`, y ahí se llega con
`host.nabi.$ask`.
:::

---

## Próximos documentos

- [Marca en línea](../custom/inline) · [Bloque y atributo de párrafo](../custom/block) ·
  [Teclas, conversión automática y pegado](../custom/input)
- [Tema y variables CSS](../../style/custom) — los nombres de variable de los que depende la hoja de estilos

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
