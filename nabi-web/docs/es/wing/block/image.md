---
title: Imagen
---

# Imagen

## Descripción

`imageWing` (nombre `img`) posee el elemento de imagen (`<img>`). Igual que `hr` y
`youtube`, es un objeto `place: 'void'` sin nada dentro. Al pulsar el botón de la
barra de herramientas se abre un cuadro para introducir la dirección de la imagen.

**La dirección se valida por esquema, no por extensión de archivo.** Solo se
permiten `http:`, `https:` y las rutas relativas — los esquemas maliciosos como
`javascript:` y las direcciones relativas al protocolo (`//example.com/a.png`) se
filtran. Una URL de API dinámica que devuelve una imagen sin extensión de archivo
se admite sin problema.

El cursor nunca entra dentro de una imagen, así que al hacer clic en ella se
selecciona el objeto de imagen entero y aparece una barra contextual dedicada:

| Control | Descripción |
|---|---|
| Ancho | un control deslizante que ajusta el ancho de `30%` a `100%` en pasos de 10% (por omisión `60%`) |
| Ver en grande (lightbox) | amplía la imagen a su tamaño original en una ventana modal |

La alineación izquierda/centro/derecha de una imagen es una propiedad del
**párrafo envoltorio (`<div data-nabi-p>`)** que la contiene, así que se alinea
con los botones de alineación de la barra de herramientas principal.

Una imagen recién insertada queda centrada (`data-nabi-align="c"`) por omisión.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Se guarda como atributos semánticos sin `style` en línea — el tamaño y la
alineación reales los dibuja `nabi.css`.

### Permitir direcciones locales (`allowLocalUrls`)

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Active `allowLocalUrls: true` y también se permiten direcciones locales en
formato `blob:` y `data:image/...` — útil, por ejemplo, para una vista previa
local antes de subir un archivo (por omisión `false`).

Si la dirección de una imagen no es válida, o una URL `blob:` ha caducado y la
imagen no carga, el hook `attach` del wing muestra automáticamente un marcador
de posición de imagen rota. Funciona sin configuración de montaje adicional y,
al ser una interfaz solo de pantalla, no afecta a los datos guardados.

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

Para permitir direcciones `blob:`, use la función factory:

```ts
makeImageWing({ allowLocalUrls: true })
```

## Demo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
