---
title: Lista con viñetas
---

# Lista con viñetas

## Descripción

`bulletListWing` (identificador `ul`, atajo `L`) gestiona las listas no ordenadas (`<ul>`). Los elementos de lista (`<li>`) están incorporados mediante el atributo `parts`, así que no es necesario registrar `li` por separado.

```ts
parts: { li: { holds: 'blocks' } }
```

Al hacer clic en el botón de la barra de herramientas, el bloque donde está el cursor (o todos los bloques seleccionados) se convierte en una lista con viñetas; al pulsarlo de nuevo, vuelve a ser un párrafo normal. Al pulsar otro botón de lista (numerada, lista de tareas, etc.) cambia directamente a ese tipo.

Escribir `- ` (un guion y un espacio) al principio de un párrafo también lo convierte automáticamente en lista. Como solo se comprueba el patrón de caracteres justo antes del cursor, escribir el espacio después de `- texto` también convierte correctamente, y el texto ya escrito se conserva como contenido del elemento de lista (esto solo ocurre en la **primera línea** del párrafo).

### Atajos y comportamiento de edición

- <kbd>Tab</kbd>: sangra el elemento actual un nivel, colocándolo bajo el elemento justo de arriba. En el primer elemento no hay nada bajo lo cual anidarlo, así que no ocurre nada — y dentro de una lista, <kbd>Tab</kbd> nunca inserta un espacio.
- <kbd>Shift</kbd>+<kbd>Tab</kbd>: quita un nivel de sangría al elemento actual. Si se quita la sangría de un elemento de nivel superior, sale de la lista y se convierte en un párrafo normal. Con varios elementos seleccionados, toda la selección se mueve junta.
- **Pulsar <kbd>Enter</kbd> en un elemento vacío**: le quita la sangría. Si era un elemento vacío de nivel superior, la lista termina ahí y aparece un nuevo párrafo debajo.
- **Pulsar <kbd>Retroceso</kbd> al principio de un elemento**: fusiona su contenido con el final del elemento anterior. Si no hay un elemento anterior con el que fusionarse, se le quita la sangría en su lugar. Por el contrario, pulsar <kbd>Suprimir</kbd> al final de un elemento trae el siguiente elemento a la línea actual.
- Como un elemento (`li`) es un contenedor de bloques, contiene un párrafo (`p`), y cualquier formato en línea — negrita, cursiva y demás — se puede usar libremente dentro de él.
- Los atributos no estándar de la etiqueta se eliminan durante la normalización, y cualquier cosa que no sea un `li` encontrada dentro de una lista se envuelve automáticamente en un elemento `li` para corregirlo.
- Las listas de tareas comparten la misma etiqueta `<ul>`, pero ambos wings se distinguen por la presencia del atributo `data-nabi-list="task"`.

## Estructura de marcado y anidamiento

La estructura anidada del árbol de Nabi se traslada directamente al HTML. Como un elemento de lista (`li`) contiene bloques y no texto, el texto dentro de un elemento se envuelve en un párrafo `<p>`, y una sublista anidada se coloca de forma segura dentro de un párrafo envoltorio (`<div data-nabi-p>`).

```html
<li><p>Elemento superior</p><div data-nabi-p><ul><li><p>Elemento hijo</p></li></ul></div></li>
```

## Uso

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Construye el registry y la instancia de nabi a partir de la lista de wings registrados.
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` se registra automáticamente a través de `parts`, así que nunca se pasa directamente al arreglo.

## Demo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
