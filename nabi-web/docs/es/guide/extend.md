---
title: Wings personalizados
description: El contrato y la secuencia de implementación para añadir una nueva función de documento persistente.
---

# Wings personalizados

Un wing personalizado es más que un botón de la barra de herramientas. Es una extensión declarativa que mantiene juntos la estructura que se guarda en el documento, los comandos, la conversión a HTML y Markdown, las reglas de importación y el comportamiento en pantalla. El registry valida la declaración antes de que exista el editor, así evita que estructuras inválidas entren en los documentos.

## Empieza por la factory más pequeña

La mayoría de formatos no necesitan una declaración completa desde cero. Usa `simpleMark()` para una marca inline sin valor, `valueMark()` para una marca con un conjunto limitado de valores, `boxObject()` para un bloque sin hijos y `listFamily()` para una lista.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Construir varios tipos de wing

Cada ejemplo de abajo tiene una forma guardada distinta. Registra primero uno, y revisa el resultado de `getJson()` y `getHtml()`. Añade comandos y botones solo después de comprobar que la estructura funciona.

### 1. Marca inline sin valor: énfasis

Usa `simpleMark()` cuando una función solo envuelve texto. Este ejemplo guarda `exStrong` y lo renderiza como `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

Con `clearable: true`, Borrar formato también elimina esta marca. Antes de añadir un botón, aplícala con `nabi.applyCommand()` u otro comando personalizado. El mismo selector `.nabi-content strong` da estilo tanto al editor como al contenido publicado.

### 2. Marca inline con valor: tono de estado

Usa `valueMark()` para colores, tamaños o estados que deben elegirse de un conjunto permitido. El valor se guarda en `a.v`; los valores fuera de la lista se eliminan durante `repair()`.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

La forma guardada es `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. El CSS apunta al valor guardado, así que también cambia el contenido publicado. No elimines valores de una lista existente sin pensarlo: documentos guardados anteriormente podrían perderlos al leerse.

### 3. Bloque sin hijos: separador

Usa `boxObject()` para un objeto independiente sin hijos, como una imagen, un vídeo o un separador.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Para un objeto con valores como URL o anchura, declara la validación en `attrs` y coloca los valores obligatorios en `requires`. Rechaza un valor que no se pueda verificar con `null` en lugar de sustituir silenciosamente un valor predeterminado.

### 4. Bloque con varios párrafos: callout

Para un bloque que contiene contenido del documento, declara un `container`. `holds: 'blocks'` permite hijos de tipo párrafo, lista y bloque de objeto.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Esta declaración por sí sola no crea una forma de envolver los párrafos seleccionados. Añade un comando puro en `commands` y un `button` que lo invoque antes de exponer la función en la UI del editor.

### 5. Un par de lista y elemento que siempre van juntos

Usa `listFamily()` cuando una lista y sus elementos deben aparecer siempre juntos.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` repara un bloque dentro de la lista envolviéndolo en un elemento. Añade `itemDecl` y `repairItem` para un valor a nivel de elemento, como un estado marcado.

### Registrar en una única selección ordenada

Usa las mismas declaraciones y en el mismo orden en el servidor y en el navegador.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

## Definir nombres y estructura del documento

Los nombres que entran en un documento deben coincidir con `ex[A-Z0-9]...`. Un nombre como `exCallout` evita que un futuro wing oficial cambie el significado del contenido guardado.

`place` determina la forma guardada: `mark` envuelve contenido inline, `void` es un bloque sin hijos, `container` contiene hijos, `attr` cambia atributos de párrafo y `tool` no crea ningún nodo de documento. Un `container` necesita `holds: 'blocks' | 'inline'` y `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf` y `parts` declaran restricciones estructurales. Una declaración `parts` también necesita `partHtml` para cada parte. Usa `attrKey` y `attrValues` para restringir un wing que selecciona valores.

## Todas las opciones de declaración

Declara solo lo que el wing necesita. Una factory ya suministra algunos campos por ti.

| Área | Opciones | Propósito |
| --- | --- | --- |
| Base | `w`, `place`, `basic`, `styles` | Nombre, tipo estructural, pertenencia al catálogo básico, CSS predeterminado |
| Estructura | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Tipo de hijos, comportamiento de Enter, atributos permitidos, atributos booleanos |
| Estructura | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Partes internas, hijos permitidos, exclusión de alineación, dependencia de wing |
| Valores | `attrKey`, `attrValues`, `currentValue` | Clave y lista del valor guardado, detección del valor actual |
| Comandos y entrada | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Comandos, manejo de teclas, Escape/doble tecla, reglas de autoformato |
| Comportamiento de superficie | `attach` | Comportamiento DOM y limpieza de una superficie |
| Conversión | `toHtml`, `partHtml`, `toMd`, `partMd` | Salida HTML y Markdown |
| Importación y reparación | `claim`, `ioFilter`, `repair`, `partRepair` | Importación HTML, manejo de archivos, validación y reparación de JSON |
| UI | `button`, `buttons`, `context` | Declaraciones de barra de herramientas y UI contextual |
| Borrar formato | `clearable` | Si Borrar formato lo elimina |

`w` y `place` siempre son obligatorios. Los wings que producen nodos, como `mark`, `void` y `container`, también requieren `toHtml()`. Un contenedor necesita `holds`; cada parte declarada necesita su `partHtml` correspondiente.

## Mantén HTML, Markdown y JSON juntos

`toHtml()` renderiza un nodo guardado como HTML, mientras que `toMd()` exporta Markdown. Sin un constructor de Markdown, se conserva el HTML generado para que no se pierda información. Usa `claim()` para reconocer solo tu propio elemento HTML y sus atributos validados al importar.

`repair()` se ejecuta al cargar JSON y de nuevo después de los comandos. Devuelve un nodo corregido para un atributo inválido, o `null` para un nodo que no pueda conservarse. Construye HTML con `ctx.element()`, `ctx.escape()` y `ctx.url()`; nunca concatenes etiquetas, atributos o URL saltándote esas comprobaciones.

## Separa comandos y comportamiento de vista

Un comando es una función pura del documento y la selección que devuelve el siguiente documento y una selección dentro de él. Nunca lee ni cambia el DOM, y devuelve `null` cuando no puede hacer un cambio válido. Nombra los comandos en lower camel case comenzando con un verbo, como `insertNote`.

Pon el comportamiento que solo existe en el DOM, como la selección por arrastre de tablas, en `attach(host)`. Registra inmediatamente la limpieza de cada listener o atributo modificado con `host.onDispose()` para que también se limpie si la configuración falla más tarde. No modifiques el DOM de texto en composición ni el mapeo de selección de la superficie.

Declara los controles de barra y de contexto con `button`, `buttons` y `context`; duplicar sus reglas de comando en la UI de la aplicación puede hacer que la UI y el modelo de documento se desalineen.

## Estilos CSS

Pon en `styles` el CSS base que el wing necesita. Los estilos de los wings integrados ya están incluidos en `nabi-note/nabi.css`. Un navegador que ensambla los estilos del registry seleccionado puede usar `collectSheets()` e `injectSheets()`; en SSR, enlaza el archivo CSS.

Usa las mismas clases y atributos data para edición y contenido publicado, pero no cambies la estructura `[data-key]` de edición, `display` ni `white-space`. El CSS debe cambiar solo la apariencia, no el mapeo del cursor.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Apunta solo a clases o atributos data creados por `toHtml()`. Mantén los cambios específicos del servicio más acotados, por ejemplo `.article-body .ex-callout`.

## Verificar todo el contrato

Verifica que un documento JSON guardado se vuelva a cargar con la misma estructura y el mismo HTML. Comprueba que el registry rechace nombres inválidos, comandos duplicados, builders faltantes y dependencias incumplidas. Cubre importación HTML inválida, entrada de `repair()`, manejo de selección en comandos, salida SSR y una vista publicada con estilos.

Para los tipos completos y los argumentos de cada factory, revisa las declaraciones instaladas y la [referencia de API en inglés](https://nabi.saro.me/llms/api-reference.md).
