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

## Esc 2連打

Además del botón de la barra de herramientas, hay **una vía por teclado** — pulsar <kbd>Esc</kbd>
dos veces seguidas. Ni una pista de una letra ni un atajo <kbd>⌘</kbd> podían contener este gesto, así
que entró en la declaración de 2連打 (`doubleKeys`).

- **Hace exactamente lo mismo que pulsar el botón.** Con un tramo seleccionado, ese tramo; **con
  solo cursor**, una capa en ese lugar — el comando ya sabe qué despojar, así que el lado de la tecla
  no se ramifica según el estado del cursor.
- **Se dispara en la segunda pulsación, exactamente.** Cuatro pulsaciones siguen siendo un disparo, y si pasan más de 350ms
  entre dos pulsaciones el contador se reinicia. Las repeticiones de mantener presionada la tecla (`repeat`) y
  las pulsaciones durante la composición de IME no se cuentan.
- **Su prioridad es la más baja.** Solo toma su turno después de que todo lo demás en <kbd>Esc</kbd>
  haya pasado (deshacer un armado, salir de una marca) — pulsa <kbd>Esc</kbd> en medio de un
  resaltado y la primera pulsación arma la salida de marca, y la segunda aún se lleva a cabo en borrar formato.
- **Hay solo cinco lugares donde no funciona** — un panel abierto, una superposición, pantalla completa, las
  insignias de pistas, y un bloqueo de subida.
- El tooltip del botón lo dice — **«Quitar formato (Esc Esc)»**, el mismo patrón que las insignias de Shift.

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
