---
title: Imagen
---

# Imagen

## Descripción

`imageWing` (nombre `img`) posee la imagen (`<img>`). Es, como `hr` y `youtube`, **un
objeto sin interior.** Al pulsar el botón se abre un panel de entrada de dirección.

**La dirección se filtra por esquema, no por extensión.** Solo pasan `http:`, `https:`
y las rutas relativas; una dirección relativa al protocolo como `//example.com/a.png` se
rechaza. **A nadie le importa si termina en `.png`** — porque es común que una dirección
entregue una imagen sin ninguna extensión.

El cursor no entra dentro de la imagen, así que al hacer clic en ella se selecciona
entera y aparece la barra contextual.

| Grupo | Casillas |
|---|---|
| Ancho | Ocho casillas de diez en diez, de `30` a `100` (predeterminado `60`) — es una escala, y se muestra junto el valor actual |
| Ver | Solo la imagen, en grande — no modifica el documento |

**La barra contextual solo tiene estas dos.** Aquí no están las casillas de izquierda,
centro y derecha — el lugar de la imagen no lo lleva la imagen, sino **el párrafo
envoltorio que la contiene**, así que ese trabajo lo hace el botón de alineación de la
barra de herramientas.

**Una imagen recién insertada queda centrada** — porque `insertLump` viste el párrafo
envoltorio con la alineación `c` al levantarlo.

Al salir, el ancho se pega a la imagen, y la alineación al párrafo que la envuelve.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Los valores de alineación son `l`, `c`, `r`. No sale ningún `style` en línea — el
aspecto real lo dibuja la hoja de estilos que lee ese atributo dentro de un
`.nabi-content` con `nabi.css` aplicado.

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Al activar `allowLocalUrls` se permiten también las direcciones `blob:` y
`data:image/...` — actívelo solo en escenarios de demostración o de subida en los que se
muestra el archivo sin servidor. Por omisión está desactivado.

Cuando la imagen está rota (porque la dirección ha muerto, ha caducado o el blob ha
desaparecido), el marcador de posición aparece por sí solo — el wing lleva eso consigo
con `attach`, y `mountSurface` conecta junto con el resto el `attach` de los wings
registrados. **No hay nada que montar aparte.** Esta marca es solo de pantalla y jamás
queda en el valor guardado.

`allowLocalUrls` se puede activar en dos lugares — para todo el editor
(`createNabiWith(wings, { allowLocalUrls: true })`), o solo para el wing de imagen
(`makeImageWing({ allowLocalUrls: true })`).

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings arma juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Para dejar abierto tal cual un archivo recibido por subida (dirección `blob:`):

```ts
makeImageWing({ allowLocalUrls: true })
```

## Demo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
