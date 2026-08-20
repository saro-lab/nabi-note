---
title: Tipografía
---

# Tipografía

## Descripción

`typefaceWing` (nombre `tf`) es una **marca de valor en línea.** Es una constante ya
terminada, así que basta con ponerla en el arreglo — no tiene ninguna opción que
pasarle. Al salir se dibuja como `<span data-nabi-typeface="serif">`.

Los valores son cuatro (`TYPEFACES`): `sans`, `serif`, `mono` y `cursive`.

- **No lleva dentro ni un solo nombre de fuente.** Lo que se elige es la **familia**, y
  qué fuente sale realmente lo deciden los valores que el host haya puesto en los
  cuatro tokens `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono` y
  `--nabi-font-cursive`.
- **Un solo wing** lleva las cuatro familias. El lugar para elegir son las cuatro
  casillas (`select`) de la barra contextual, y como puerta de entrada hay un botón en
  la barra de herramientas. Al pulsar el botón se aplica `serif`.
- **El texto sin nada puesto lleva `--nabi-typeface-base`.** Este token es la tipografía
  de fondo de todo el editor, y si no se toca, sigue a `--nabi-font`. No hay una casilla
  aparte para elegir "predeterminado" — al **volver a elegir** la familia que ya está
  puesta, **se le quita** y vuelve a ese lugar.
- Las casillas de elección se dibujan **con la misma tipografía que representan.** La
  casilla de serif está escrita en serif, la de monoespaciada en monoespaciada, así que
  aunque no se conozca el nombre, se ve qué se está eligiendo.
- **Con solo cursor, se aplica a todo el párrafo.** En un párrafo sin ni una letra
  queda como reserva, y el próximo carácter que se escriba sale ya con esa tipografía.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings arma juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

La fuente que pone el host ocupa un solo lugar del CSS. Si se apilan varias fuentes en
una misma familia, el navegador las recorre por orden para cada carácter y lo dibuja con
la primera que lo tenga, de modo que sin importar en qué idioma se escriba, se mantiene
el aspecto de esa familia.

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## Demo

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
