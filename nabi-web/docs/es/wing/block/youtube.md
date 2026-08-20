---
title: YouTube
---

# YouTube

## Descripción

`youtubeWing` (id `youtube`, sin atajo) posee la incrustación de YouTube (`<iframe>`).
Es un **objeto sin interior** (`place: 'void'`), como `hr` e `img`. Al pulsar el botón
se abre una capa de entrada de dirección, y solo pasan las direcciones de YouTube con
la forma `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/v/` o `/live/` (incluidos los
prefijos `www.`, `m.` y `music.`, y `youtube-nocookie.com`) — como la comprobación no es
de contenido de cadena sino de análisis con `URL()`, una dirección como
`youtube.com.evil.test` no cuela.

En lugar de fiarse de la dirección recibida tal cual, se extrae únicamente el **id de
vídeo de 11 caracteres** y solo eso se guarda. La dirección no queda en el valor
guardado — lo único que queda es `{"w":"youtube","a":{"v":"<id>","w":"70"}}`, y al
salir se vuelve a ensamblar siempre con una sola forma:
`https://www.youtube-nocookie.com/embed/<id>`.

Por la misma razón que en `hr`, el cursor no entra dentro, y si pulsa Retroceso o
Suprimir justo antes o justo después, desaparece entero. Una incrustación que no sea de
YouTube se **descarta entera** al importarla — no se levanta un documento ajeno dentro
del nuestro.

## Barra contextual

Al hacer clic en el vídeo aparecen dos casillas.

| Tipo | Casilla |
|---|---|
| Ancho | Seis escalones, `50` `60` `70` `80` `90` `100` (60 por omisión) — es una regla graduada y muestra el valor actual |
| Dirección | Una capa de entrada rellena con el id del vídeo actual |

**Aquí no hay casillas de izquierda, centro o derecha.** El lugar del vídeo no lo lleva
el vídeo, sino el **párrafo envoltorio que lo contiene**, así que ese trabajo lo hace el
botón de alineación de la barra de herramientas. Un vídeo recién insertado entra con su
párrafo envoltorio alineado al centro (`c`).

Por eso, al salir, el ancho queda pegado al vídeo y la alineación al párrafo que lo
envuelve.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

No sale ningún `style` en línea. Si el anfitrión quiere insertarlo desde su propia
interfaz, llama al comando directamente —
`applyCommand('insertYoutube', { v: dirección, w: '80' })`, y para cambiar solo el
ancho, `applyCommand('setYoutubeWidth', { w: '80' })`. Un ancho fuera de la lista se
rechaza.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
