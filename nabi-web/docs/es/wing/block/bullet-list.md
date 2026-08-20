---
title: Lista con viñetas
---

# Lista con viñetas

## Descripción

`bulletListWing` (id `ul`, atajo `L`) es el propietario de `<ul>`. Los elementos se
traen junto con él mediante `parts`, así que `li` no se registra aparte — no es un
arreglo, es un registro.

```ts
parts: { li: { holds: 'blocks' } }
```

Al pulsar el botón, el bloque donde está el cursor (o los bloques que abarque la
selección) queda envuelto en una lista; al pulsarlo de nuevo se deshace y vuelve a ser
párrafo. Si pulsa el botón de otra lista, cambia a ese tipo.

Escribir un guion y un espacio (`- `) al principio de una línea da el mismo resultado.
**No hace falta que la línea esté vacía** — solo se mide el principio de línea antes del
cursor, así que si escribe el espacio en `- texto`, también se activa y el texto que
sigue queda dentro del elemento. Pero solo se activa en la **primera línea** del
párrafo.

- `Tab` sangra un nivel, colocando el elemento bajo el hermano de justo arriba. En el
  primer elemento no hay dónde meterlo, así que no pasa nada — dentro de una lista,
  `Tab` no inserta espacios.
- `Shift+Tab` lo saca al siguiente hermano del padre — si lo saca desde el primer
  nivel, sale de la lista y se convierte en párrafo. Si tiene una selección que abarca
  varios elementos, todos se mueven juntos.
- **Pulsar Enter en un elemento vacío quita la sangría.** Si estaba en el primer nivel,
  la lista termina ahí y el cursor pasa a un párrafo nuevo debajo. Así es como se
  termina una lista.
- **Al pulsar Retroceso al principio de un elemento, se fusiona con el elemento
  anterior.** Si no hay elemento anterior con el que fusionarse, cae a quitar la
  sangría. Suprimir al final de un elemento hace lo contrario: trae el elemento
  siguiente.
- El interior de un elemento es un bloque, así que lleva un párrafo dentro. Las marcas
  (negrita, etc.) y los demás wings en línea se usan con normalidad dentro de ese
  párrafo.
- Atributos que llevara la etiqueta, como `type`, no sobreviven. Si algo que no es un
  elemento entra dentro de la lista, no se descarta: se envuelve en un elemento.
- La lista de tareas comparte la etiqueta (`<ul>`), pero son wings distintos — se
  separan por un atributo distintivo (si lleva `data-nabi-list="task"`, es una lista de
  tareas).

## El anidamiento es marcado real

La estructura queda tal cual en el valor guardado. Pero, como **el elemento contiene
bloques y no texto suelto**, el texto lleva un párrafo puesto encima, y una lista
anidada va dentro de un párrafo envoltorio.

```html
<li><p>a</p><div data-nabi-p><ul><li><p>b</p></li></ul></div></li>
```

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` llega solo a través de `parts`, así que no se pone directamente en el arreglo.

## Demo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
