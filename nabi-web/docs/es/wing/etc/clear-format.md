---
title: Borrar formato
---

# Borrar formato

## Descripción

`clearFormatWing` es una **constante ya terminada.** Basta con ponerla en el arreglo —
no tiene ninguna opción que pasarle.

Como es `place: 'tool'`, no levanta ningún nodo propio en el documento. Es solo un
comando (`clearFormat`) y un botón de barra de herramientas.

- **La lista de lo que se despoja está fija en el núcleo.** Once marcas en línea (`b`,
  `i`, `u`, `s`, `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) y tres atributos de párrafo
  (`h` encabezado, `a` alineación, `dc` letra capital). El host no tiene que gestionar
  ninguna lista, y la marca de un wing hecho a mano **no se despoja aquí.**
- **Si selecciona un tramo y lo pulsa**, despoja de una vez las marcas de ese tramo y
  los atributos de los párrafos que abarca.
- **Si solo hay cursor, despoja una capa por pulsación** — empezando por la **marca más
  interior** en el lugar donde está el cursor, tanto como se extienda esa marca. Cuando
  ya no queda marca que despojar, entonces retira los atributos de párrafo.
- **No despoja los enlaces de adjunto** — un enlace (`a`) que lleve el atributo `file`
  es intocable en cualquier lugar. Quitarle la envoltura convertiría el adjunto en texto
  plano muerto.
- **La alineación de un párrafo que contiene un objeto se conserva.** En el párrafo
  envoltorio de una imagen o una tabla, solo la alineación (`a`) no se despoja — así se
  evita que, al querer borrar formato, la imagen salte hacia la izquierda.
- Si no hay nada que despojar, el comando responde `null`. No se apila un punto de
  deshacer.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings arma juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
