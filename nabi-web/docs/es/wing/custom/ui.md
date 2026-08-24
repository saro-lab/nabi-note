---
title: UI e interacción
description: Cómo integrar los botones de la barra de herramientas (button), la barra contextual (context) y la hoja de estilos propia del wing (styles).
---

# UI e interacción

Hay tres lugares donde un wing puede ofrecer interfaz de usuario (UI): la **barra de herramientas principal** (`button`/`buttons`), la **barra contextual** (`context`) y su **propio CSS** (`styles`).

---

## Botones de la barra de herramientas (`button` / `buttons`)

```ts
button: {
  group: 'emphasis',                   // grupo al que pertenece (obligatorio)
  svg: '<path d="…"/>',                // cadena de path SVG dentro de un viewBox de 16×16
  label: { es: 'Negrita' },
  shortcut: 'B',                       // letra mostrada en el modo de pistas (doble Shift)
  accelerator: 'mod+b',                // combinación de teclado (Ctrl/⌘)
  action: { kind: 'mark' },            // alterna una marca en línea
}
```

Cuando un mismo wing ofrece varios botones, se definen como un arreglo `buttons` — por ejemplo, un wing de alineación de texto que ofrece los tres botones izquierda/centro/derecha. Cada botón se distingue por su `name`, y `value` indica el valor que representa.

### Orden de los grupos de botones (`group`)

El orden en que se renderizan los grupos de botones de la barra de herramientas está fijo:

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

Sin importar en qué posición del arreglo se declare un wing, su botón se ubica automáticamente en el lugar de su grupo — solo dentro de un mismo grupo se ordena según el orden de registro. Si se indica un nombre de grupo nuevo que no está en la lista, se agrega un grupo nuevo al final de la barra.

Cuando todos los botones de un grupo quedan ocultos en el estado actual, ese grupo y su separador se ocultan automáticamente.

### Tipos de `action` de botón

| `kind` | Qué hace | Propiedades adicionales |
|---|---|---|
| `'mark'` | Alterna una marca en línea (con la lógica por defecto del núcleo) | — |
| `'command'` | Ejecuta el comando indicado | `command`, `args?` |
| `'menu'` | Muestra un menú desplegable de selección de valor | `command`, `argKey`, `values` |
| `'grid'` | Muestra un selector de rejilla filas×columnas para insertar una tabla | `command`, `rowsKey`, `colsKey`, `max?` |
| `'prompt'` | Abre una ventana de entrada y pasa el valor al comando | `command`, `fields` |
| `'file'` | Abre el diálogo de selección de archivo | `accept?`, `multiple?` |
| `'host'` | Se lo pasa al callback del host (`onHost` de `mountToolbar`) | — |

Un botón sin `action` definido no hace nada al hacer clic.

### Atajos (`shortcut` y `accelerator`)

| Campo | Forma | Regla |
|---|---|---|
| `shortcut` | `'B'` | Una sola letra **mayúscula latina o dígito** |
| `accelerator` | `'mod+b'` | El prefijo `mod+` seguido de **una letra minúscula** |

Si dos wings declaran el mismo atajo, se lanza una excepción de inmediato al inicializar.

Con la opción `accelerated` se puede ejecutar una acción distinta solo cuando se dispara por el atajo de teclado — por ejemplo, un clic en el botón abre un modal de opciones, mientras que el atajo aplica el valor por defecto directamente.

::: warning Los atajos solo funcionan dentro del área de edición indicada
Los eventos de atajo solo detectan las teclas presionadas dentro del área de edición pasada a `mountToolbar({ surface })`. Cuando hay varios editores en una misma página, hay que indicar la opción `surface` para evitar que los atajos interfieran entre ellos.
:::

---

## Reglas para mostrar un botón como pulsado (Pressed)

El criterio para pintar un botón de la barra de herramientas como "activo ahora" depende del tipo de wing (`place`):

| `place` | Criterio de activación |
|---|---|
| `'mark'` | Si esa marca en línea se aplica en la posición actual del cursor |
| `'attr'` | Si el valor devuelto por `currentValue` del párrafo actual coincide con el `value` del botón |
| `'container'` · `'void'` | Si el cursor está dentro o sobre ese objeto de bloque |
| `'tool'` | Siempre se mantiene sin activar |

En un wing con varios valores (encabezados, alineación), solo se pinta como activo el botón cuyo `value` coincide con la cadena devuelta por la función `currentValue`.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

---

## Reglas de ocultamiento automático de botones

El núcleo del editor deshabilita u oculta automáticamente los botones de la barra de herramientas en situaciones donde no se puede aplicar el formato:

- **En zonas donde el formato está restringido** (como dentro de un bloque de código), las marcas en línea y otros botones que crean bloques se ocultan automáticamente.
- En el párrafo envoltorio de un objeto de bloque (una imagen, una tabla), se ocultan los atributos de párrafo como el encabezado (pero **la alineación de texto (`a`) se mantiene como excepción**, para poder alinear el objeto mismo).
- El botón de un wing que no está en la lista `allows` del contenedor superior se oculta automáticamente.

---

## Barra contextual dinámica (`context`)

Una barra de herramientas secundaria que ofrece controles de configuración específicos del elemento donde está el cursor — por ejemplo, un control deslizante de tamaño al hacer clic en una imagen, un formulario de URL al hacer clic en un enlace, o botones para agregar filas/columnas cuando el cursor está dentro de una tabla.

```ts
context: {
  title: { es: 'Nota' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { es: 'Tono' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // la casilla de atributo del nodo de donde leer el valor actual
      values: [
        { value: 'info', label: { es: 'Info' } },
        { value: 'warn', label: { es: 'Aviso' } },
      ],
    },
  ],
}
```

### Tipos de control de la barra contextual (`ContextControl`)

| `kind` | Forma del control | Propiedades principales |
|---|---|---|
| `'button'` | Un clic simple | `command`, `args?` |
| `'toggle'` | Interruptor de encendido/apagado | `command`, `token` |
| `'select'` | Menú desplegable | `command`, `argKey`, `values`, `attr?` |
| `'range'` | Barra deslizante (ajuste de ancho, etc.) | `command`, `argKey`, `values`, `rest?`, `readout?` |
| `'text'` | Campo de texto (dirección de un enlace, etc.) | `command`, `argKey`, `initial?`, `placeholder?`, `validate?` |
| `'prompt'` | Ventana con varios campos de formulario | `command`, `fields` |
| `'lightbox'` | Ventana de imagen ampliada | `src`, `alt?` |

Todos los controles admiten en común `name` (obligatorio), `label?`, `svg?`, `tip?` y `visible?`. Con la función `visible(node)` se puede controlar dinámicamente si un control se muestra según ciertas condiciones (por ejemplo, mostrar el botón "deshacer combinación" solo cuando la celda ya está combinada).

---

## Estilos propios del wing (`styles`)

Un wing puede llevar incorporado el CSS que necesite.

```ts
styles: `
  .nabi-content aside[data-nabi-note] {
    border-left: 3px solid var(--nabi-accent);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
  }
`
```

Con `collectSheets(registry)` e `injectSheets(document, sheets)` se pueden inyectar dinámicamente en el documento solo los estilos de los wings registrados, y la misma cadena de estilos nunca se inyecta dos veces.

---

## Integración con diálogos del usuario (`ask`)

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

- `message`: muestra un aviso simple (`(text: string) => void`)
- `confirm`: una elección de confirmar/cancelar (`(text: string) => boolean | Promise<boolean>`)
- `choose`: una elección entre varias opciones (`(question: string, options: ChooseOption[]) => number | Promise<number>`)

`ChooseOption` tiene la forma `{ label: string, icon?: string }`, y el valor de retorno es el índice (base 0) de la opción elegida (`-1` si se cancela).

::: warning Comportamiento por defecto sin un handler de ask
Sin un handler de `ask`, `confirm` responde `false` (cancelar) por defecto, por seguridad. Sin un handler de `choose`, se elige por defecto la primera opción (índice `0`) — interfaces como el selector de formato al pegar conectan automáticamente su propio panel integrado en el núcleo en cuanto se monta `mountToolbar`, así que en la mayoría de los casos no hace falta implementar `choose` a mano.
:::

---

## Próximos documentos

- [Crear una marca en línea](../custom/inline) · [Crear bloques y atributos de párrafo](../custom/block) · [Teclas, autoconversión y pegado](../custom/input)
- [Personalización de estilos](../../style/custom) — variables CSS y guía de temas

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
