---
title: Crear un wing propio
description: Una guía para escribir el contrato de la interfaz Wing de NABI NOTE y así crear nuevos formatos y funciones personalizados.
---

# Crear un wing propio

Un wing es **un solo objeto JavaScript puro.** No hereda de una clase compleja ni sigue un
trámite de registro de framework aparte — con solo poner el objeto en el arreglo que se le
pasa a `createNabiWith` queda registrado de inmediato.

Todos los wings oficiales que vienen con NABI NOTE — negrita, tabla, subida de archivos,
todos — están escritos bajo esa misma especificación de la interfaz `Wing`. Un wing
personalizado hecho a mano corre en **exactamente el mismo entorno y bajo las mismas
condiciones** que uno incorporado.

---

## El ejemplo de wing más simple

Un wing de marca en línea que admite la etiqueta de teclado `<kbd>`.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // el identificador propio de este wing (la clave guardada en el árbol nabi)
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // función de salida a HTML
  }),
  // detecta etiquetas <kbd> en el HTML que entra y las convierte en un nodo del árbol nabi
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Ahora el editor conserva la etiqueta `<kbd>` — el marcado se mantiene al pegar desde el
portapapeles, con `setHtml()`, y al guardar y volver a abrir.

```
Registrado:     <p>Atajo: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   conserva la etiqueta <kbd>
Sin registrar:  <p>Atajo: <kbd>Ctrl</kbd></p>                →   <p>Atajo: Ctrl</p> (se vuelve texto plano)
```

`toHtml` es la función de serialización que exporta un nodo del árbol nabi a HTML, y `claim`
es la regla de deserialización que lee el HTML externo y lo convierte de vuelta en un nodo
del árbol nabi. Sin `claim`, la salida a HTML sigue funcionando, pero al guardar y volver a
abrir, la etiqueta se convierte en texto plano.

Use `simpleMark()` para una marca sin atributos, `valueMark()` para una marca que lleva un
valor, `boxObject()` para un objeto independiente, y `listFamily()` para una estructura de
lista — todos reducen el código repetitivo.

---

## Módulos de wing y funciones fábrica

**La mayoría de los wings incorporados son objetos constantes, inmutables y predefinidos**
(`boldWing`, `headingWing`, etc.). Solo los wings que necesitan opciones de configuración
adicionales se ofrecen como funciones fábrica.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

Si solo quiere cambiar el comportamiento de un wing incorporado específico (un resaltador de
sintaxis, por ejemplo), puede extender el objeto existente con el operador spread y
sobrescribir solo las propiedades que necesite.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Orden de registro y validación

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**El orden del arreglo es la prioridad de recorrido del HTML.** Al analizar HTML externo
(`claim`), se revisan los wings en el orden en que fueron registrados, y el primero que
reclama la propiedad de una etiqueta es quien la procesa. A una etiqueta que ningún wing
reclama se le quita la etiqueta y solo queda el texto interior.

La colocación de los botones en la barra de herramientas la decide **primero el orden del
grupo de botones (`button.group`)**, y solo dentro de un mismo grupo decide el orden de
registro del wing.

### Validación y manejo de excepciones (validación estricta)

`createNabiWith` no aplaza a un error en tiempo de ejecución cuando se registra un wing que
viola la especificación — **lanza una excepción de inmediato, en el momento de la
inicialización.**

| Qué se valida | Ejemplo de violación |
|---|---|
| Usar un identificador reservado | `w: 'p'`, `w: 'br'` |
| Registrar un identificador (w) duplicado | Pasar el mismo `boldWing` dos veces |
| Falta la función de renderizado | `place: 'mark'` sin `toHtml` definido |
| Viola la convención de nombres de comando | No es camelCase de verbo+sustantivo (p. ej. `insertTable`) |
| Falta un wing dependiente requerido | Un wing de subida sin el wing de imagen/enlace indicado en `requiresAnyOf` |

---

## Los comandos — funciones puras

Toda operación que cambia el documento pasa por una función de comando. Un comando es una
**función pura que no depende ni de la API del DOM ni del renderizado en pantalla.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // valida el tipo del argumento externo
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
    action: { kind: 'command', command: 'insertStamp', args: { text: 'Confirmar' } },
  },
}
```

| Parámetro | Descripción |
|---|---|
| `doc` | El arreglo del documento del árbol nabi actual (se trata como un objeto inmutable — se devuelve un documento nuevo en vez de modificarlo directamente) |
| `sel` | El estado actual del cursor y la selección (`{ anchor, focus }`) |
| `args` | El objeto de argumentos que pasó un botón de la barra de herramientas o la UI |
| `env` | El conocimiento del esquema y el contexto del entorno |

Un comando devuelve el objeto `{ doc, selection }` modificado, o bien **`null`**. **Si el
documento no cambia, debe devolver `null`.** Cuando devuelve `null`, `applyCommand` devuelve
`false` y no se crea una entrada innecesaria en el historial de deshacer. El documento
devuelto pasa por el motor `cocoon` (de normalización), así que la integridad del esquema
queda garantizada.

El host lo llama por su nombre.

```ts
nabi.applyCommand('insertStamp', { text: 'Confirmar' })   // devuelve un boolean
```

---

## La interfaz `Wing` en detalle

La interfaz `Wing` tiene un total de 31 propiedades, de las cuales **2 son obligatorias**
(`w`, `place`).

### 1. Identidad básica y estructura

| Propiedad | Descripción |
|---|---|
| `w` | El identificador propio del wing (obligatorio; excluye las palabras reservadas `p`, `br`) |
| `place` | El tipo del wing (obligatorio: `'mark'` formato en línea, `'void'` un objeto sin contenido, `'container'` un objeto contenedor, `'attr'` un atributo de párrafo, `'tool'` una herramienta que no se guarda en el documento) |
| `basic` | Si el wing funciona por sí mismo, sin cableado adicional de backend/host (`boolean`, por defecto `false`). Es el criterio de filtro cuando se llama a `wings().allBasic()` |
| `holds` | El tipo de hijo que un contenedor permite dentro (`'blocks'` o `'inline'`) |
| `singleParagraph` | Si el contenido queda fijo a un solo párrafo (por ejemplo, la celda de una tabla) |
| `boolAttrs` | Los nombres de atributos booleanos expresados solo como `1` |
| `allows` | La lista de nombres de wings hijos permitidos dentro del contenedor (si no se especifica, se permiten todos) |
| `noAlign` | Si bloquea la alineación de texto en el párrafo envoltorio (`boolean`, solo para objetos). Se usa para evitar que la alineación se rompa en cosas como los bloques de código con la etiqueta `pre` |
| `requiresAnyOf` | La lista de wings dependientes que deben registrarse junto con este (se requiere al menos uno) |
| `parts` | Las definiciones de subcomponentes que pertenecen al wing (las filas/celdas de una tabla, el resumen de un bloque plegable, etc.) |

### 2. Atributos y gestión de estado

| Propiedad | Descripción |
|---|---|
| `attrKey` · `attrValues` | La clave de atributo que usa un wing de atributo de párrafo, y su lista de valores permitidos |
| `currentValue` | Una función que devuelve el valor del atributo en la posición actual del cursor (usada para mostrar el estado activo de un botón de la barra de herramientas) |

### 3. Serialización y E/S

| Propiedad | Descripción |
|---|---|
| `toHtml` · `partHtml` | La función de serialización que convierte un nodo del árbol nabi a HTML |
| `toMd` | La función de serialización que convierte un nodo del árbol nabi a Markdown (opcional — si no se define, recae en `toHtml`) |
| `partMd` | La función de serialización a Markdown de los subcomponentes del wing (`parts`) |
| `ioFilter` | Un filtro de E/S de archivos y de portapapeles que el wing admite por sí mismo |
| `claim` | La función que decide la propiedad del marcado HTML que entra y lo convierte en un nodo del árbol nabi |
| `repair` · `partRepair` | La función que valida y corrige la integridad de un nodo al cargar el JSON (devolver `null` elimina el nodo) |

### 4. Entrada y control de eventos

| Propiedad | Descripción |
|---|---|
| `commands` | El mapa de funciones de comando que aporta el wing |
| `onKey` | Un manejador que intercepta la entrada de teclado mientras el cursor está dentro del nodo de este wing |
| `escapeKeys` | La lista de teclas que hacen que el próximo carácter escrito salga del formato de esta marca |
| `doubleKeys` | Un mapeo de comandos que se ejecutan al pulsar una tecla dos veces en menos de 350ms (`{ nombre de tecla: nombre de comando }`, p. ej. Esc Esc → borrar formato) |
| `inputRules` | Reglas de conversión de formato que se ejecutan automáticamente según patrones de escritura |
| `attach` | Un gancho para vincular o controlar directamente los escuchadores de eventos en un elemento del DOM (arrastre de tabla, resaltado de código, etc.) |

### 5. UI y estilo

| Propiedad | Descripción |
|---|---|
| `button` · `buttons` | La definición del botón o botones que se renderizan en la barra de herramientas superior |
| `context` | La definición de la barra contextual que aparece según la posición del cursor |
| `styles` | La hoja de estilos CSS que incluye el wing |

---

## Extender con filtros de E/S

**Un IoFilter es un punto de extensión que gestiona el pegado desde el portapapeles y los
formatos de guardado/apertura de archivos, sin crear nodos del documento directamente.**

| Campo | Descripción |
|---|---|
| `id` · `label` | El identificador propio del filtro, y la etiqueta que se muestra en la UI (un identificador duplicado lanza una excepción) |
| `paste` | Una función que examina los datos del portapapeles (`PasteData`) y devuelve candidatos para pegar |
| `save` | El objeto de configuración de guardado (`{ extension, write, lossy?, mime? }`) |
| `read` | Una función que toma un nombre de archivo y un texto, y los analiza como un árbol nabi (devuelve `null` si no hay coincidencia) |

Los tres métodos de un filtro de E/S son opcionales. Se puede registrar mediante una opción
de montaje (`mountSurface`, `mountFile`), mediante `createNabiWith({ ioFilters })`, o
mediante la propiedad `ioFilter` propia de un wing — y el filtro que se registre primero
tiene prioridad.

---

## Cómo nombrar un identificador (`w`)

`w` es **la cadena de identificador que se guarda repetida en cada nodo del árbol nabi.**
Use una cadena corta para minimizar el tamaño de la serialización (como los `b`, `hl`, `tf`,
etc. de los wings incorporados).
Para evitar chocar con un wing oficial, se recomienda que un wing personalizado use el
prefijo `ex` (por ejemplo, `exNote`, `exStamp`).

::: warning Cuidado al renombrar un identificador
Como el campo `w` de un documento guardado mapea directamente al identificador, renombrarlo
puede hacer que un documento ya guardado no se reconozca al cargarlo. Si necesita migrar,
escriba `claim` para que también acepte el identificador anterior.
:::

---

## Próximos documentos

- [Crear una marca en línea](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Crear un bloque y atributo de párrafo](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Teclas, conversión automática y pegado](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI e interacción](./custom/ui) — `button` · `context` · `styles`, y cómo enganchar los diálogos del usuario

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
