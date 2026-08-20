---
title: Subir archivo
---

# Subir archivo

## Descripción

La subida se reparte en tres piezas — registrar el wing por sí solo no hace nada.

1. **`uploadWing`** — coloca en la barra de herramientas el botón de selección de
   archivo. Este wing no crea por sí mismo ni `img` ni `a` — el archivo subido se
   confirma como lo dibujan los wings de imagen y de enlace, así que **hay que registrar
   junto a él `imageWing` o `linkWing`** para que el resultado quede en el documento. Si
   no hay ninguno de los dos, **salta una excepción en el mismo momento del registro**
   (no revienta más tarde).
2. **`mountUpload({ … })`** — es la parte que realmente recibe los archivos y hace girar
   el `uploader`. Por aquí llega todo: arrastre, pegado y selección de archivo. **Si se
   olvida este montaje, el botón estará ahí pero no ocurrirá nada.**
3. **`mountUploadView({ … })`** — es la parte que levanta en pantalla el marcador de
   progreso. Sin él la subida funciona igual, pero mientras sube la pantalla no dice
   nada.

`uploader` tiene la forma `(task) => Promise<{ uri } | null>` — **si devuelve una
dirección es éxito, y si devuelve `null` es fallo**, y con eso se retira el marcador de
posición. Con `task.onProgress(0~100)` se informa del progreso, y si `task.signal` se
aborta, la subida se detiene.

Los límites son tres — `extensions`, `maxFileSize`, `maxTotalSize` — y los tres son
opcionales (con 0 o sin ponerlos no hay límite). Los archivos rechazados llegan por
`onReject`.

## Lo que queda después de subir

Las imágenes se confirman como bloque de `imageWing`, y los demás archivos como enlace
de adjunto de `linkWing`.

- **El nombre del adjunto no es el del archivo, sino una etiqueta i18n** — en español,
  "Adjunto". El nombre del archivo suele ser demasiado largo para dejarlo en el
  documento y, sobre todo, tiene que poder cambiarse. El nombre se cambia poniendo el
  cursor en ese enlace, desde [la casilla de nombre de la barra contextual](../inline/link).
- **La extensión queda como distintivo** — `data-nabi-file="pdf"`. Ese valor se extrae
  del nombre real del archivo, y la hoja de estilos lo dibuja como una insignia. Aunque
  cambie el nombre, el distintivo lo sigue.
- Una dirección que el enlace no admita (por ejemplo un `blob:` que llega sin haber
  activado `allowLocalUrls`) se degrada al nombre del archivo en texto plano — no se
  esquiva la lista blanca.

## Lo que se ve mientras sube

Mientras sube, en ese lugar se levanta una caja temporal — que solo existe en el DOM del
editor y no en el árbol de nabi, de modo que en el valor guardado no queda ni una letra.

- En las **imágenes**, la vista previa hecha con el archivo elegido aparece de
  inmediato, y encima se echa una rejilla. Las casillas se van retirando una a una
  conforme avanza el progreso, hasta quedar nítida. El orden en que se retiran se
  mezcla en cada archivo, así que al subir varias a la vez no se repite el mismo dibujo.
- Los **archivos que no son imagen** reciben, sin rejilla, una caja con el icono 📎 y la
  etiqueta "Adjunto", junto con la extensión como insignia en mayúsculas (`PDF`, etc.).
  Las imágenes que no se pueden previsualizar también caen aquí.
- El progreso viaja en la caja como `data-nabi-per` y lo dibuja la hoja de estilos.
  Mientras sube, cada caja lleva un botón de cancelar (×), y mientras el lote está en
  marcha la edición queda bloqueada.

## Ejemplo de uso

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la subida solo puede dejar un resultado si hay wings de imagen o enlace — si no, salta aquí mismo
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// la parte que levanta el marcador de progreso — se crea antes y se conecta abajo
const view = mountUploadView({ nabi, surface, locale: 'es' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'es',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // aquí va el código que sube realmente al servidor. Si devuelve una dirección es éxito, si devuelve null es fallo
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // aquí llegan los archivos que elige el botón de selección de la barra de herramientas
  onFiles: (files) => upload.take(files),
})
```

## Demo

Este sitio no tiene servidor al que subir, así que solo finge devolver tal cual una
dirección `blob:` creada con `URL.createObjectURL()`. El resultado queda únicamente
dentro de esta página.

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
