---
title: Tabla
---

# Tabla

## Descripción

`tableWings` (nombre `table`, atajo `T`) posee la estructura `table > tr > td`.

La fila (`tr`) y la celda (`td`) no se registran aparte — el wing de tabla se las trae
consigo mediante `parts`, así que si se quita la tabla, la fila y la celda se van con
ella.

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

Que la celda sea `singleParagraph` es lo que mantiene la rejilla — al pulsar
<kbd>Enter</kbd> dentro de una celda el párrafo no se parte en dos, y al borrar una
selección que abarca dos celdas, las celdas no se fusionan entre sí.

Al pulsar el botón no hay interruptor: aparece una rejilla de tamaño filas × columnas
(hasta 8 × 8), la tabla del tamaño elegido entra en el lugar del cursor y el cursor pasa
a la primera celda.

Los comandos solo aparecen en la barra contextual cuando el cursor está dentro de la
tabla.

| Grupo | Casillas |
|---|---|
| Filas | Insertar fila arriba · Insertar fila debajo · Eliminar fila |
| Columnas | Insertar columna a la izquierda · Insertar columna a la derecha · Eliminar columna |
| Combinar | Combinar (un solo interruptor) |
| Encabezado | Esta fila como encabezado · Esta columna como encabezado (pasan a ser `<th>`) |
| Ordenación | Activar/desactivar ordenación (ordena las columnas del lado del lector) |
| Borrar | Eliminar tabla |

**Combinar es un solo interruptor** — no hay un botón por dirección. Si selecciona
varias celdas y lo pulsa, se combinan en una; si pone el cursor en la celda combinada y
lo vuelve a pulsar, se separa.

**En esta fila no hay una casilla para colocar la caja de la tabla a la izquierda, al
centro o a la derecha.** El lugar de la tabla no lo decide la tabla, sino el párrafo
envoltorio que la contiene, así que ese trabajo lo hace el botón de alineación de la
barra de herramientas.

::: warning El distintivo de ordenación y la combinación
Ordenar es solo **un distintivo.** El editor le pone este distintivo incluso a una
tabla con celdas combinadas, y combinar celdas tampoco retira un distintivo que ya
estuviera puesto.

Sin embargo, **el lado de lectura lo rechaza** — `attachTableSort` directamente no se
conecta a una tabla donde se vean celdas combinadas. Es porque las filas fusionadas
quedan atadas entre sí, y reordenar rompería la rejilla. Por eso, en una tabla combinada,
aunque el distintivo esté puesto, no pasa nada.
:::

## El ancho lo decide el contenido

La tabla no tiene ajuste de ancho. Se ensancha **solo lo que pida su contenido**, y si
resulta más ancha que su hueco, se **desplaza lateralmente** allí mismo — la página no
se descuadra. Tampoco hay un `<div>` que la envuelva. Lo que sale en el valor guardado
es un único `<table>`, y los únicos atributos que se le pegan son la alineación
(`data-nabi-align`) y el distintivo de ordenado.

## Movimiento y selección

Con `Tab` y `Shift+Tab` se mueve entre celdas (en el extremo de la tabla se queda donde
está). Como la celda solo alberga contenido en línea, Enter no parte la celda sino que
**cambia de línea dentro de ella** — porque partirla exigiría fabricar un bloque que la
rejilla no puede albergar. Las teclas de dirección se mueven siguiendo la rejilla, no la
pantalla.

Se pueden seleccionar varias celdas arrastrando con el ratón. Esta selección por
arrastre también la trae el wing con `attach`, así que **no hay que montarla aparte** —
`mountSurface` la conecta junto con el resto.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings arma juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
