---
title: Encabezado
---

# Encabezado

## Descripción

`headingWing` (id `h`) es **un solo** wing que lleva los seis niveles. El encabezado no
es un nodo aparte, sino **un atributo del párrafo** — se guarda como
`{"w":"p","a":{"h":2}}` y al salir se convierte en `<h2>`.

Como el párrafo mismo pasa a ser el encabezado, se combina con otros atributos de
párrafo como la alineación o la letra capital (`<h2 data-nabi-align="c">`).

## Un solo botón en la barra, el nivel en la barra contextual

**En la barra de herramientas hay un único botón, `H`.** Si lo pulsa desde un párrafo,
este se convierte en encabezado 1; y si el cursor está dentro de un encabezado, en la
barra contextual aparecen las casillas `Encabezado` y `H1`~`H6` — el nivel actual se ve
como la casilla pulsada, y al pulsar otra casilla el encabezado pasa a ese nivel. Al
pulsar la casilla `Encabezado`, vuelve a párrafo.

Si en una línea vacía escribe tantos `#` como el nivel (`##` para el nivel 2) y pulsa el
espacio, la línea se convierte automáticamente en un encabezado de ese nivel — los `#`
escritos y el espacio se borran.

## Ejemplo de uso

El selector de nivel lo dibuja `mountContextToolbar`.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings arma juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

También puede aplicarse directamente con un comando.

```ts
nabi.applyCommand('setHeading', { value: 2 })  // pasa a encabezado de nivel 2
nabi.applyCommand('setHeading', { value: 2 })  // el mismo nivel de nuevo — vuelve a párrafo
```

Si selecciona varios párrafos y lo aplica, se aplica a **todos los párrafos
seleccionados**. Los bloques que ocupan el lugar de un párrafo, como una tabla o una
lista, se omiten — porque el encabezado es un atributo del párrafo de texto.

## Demo

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
