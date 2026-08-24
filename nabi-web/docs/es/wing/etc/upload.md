---
title: Subir archivo
---

# Subir archivo

## Descripción

La subida de archivos se compone de la integración de tres módulos:

1. **`uploadWing`**: agrega un botón de adjuntar archivo en la barra de herramientas. Como el resultado subido se inserta en el documento como un nodo de imagen o de enlace de archivo, **hay que registrar junto a él `imageWing` o `linkWing`**. Si faltan ambos, se produce una excepción en el momento de la inicialización.
2. **`mountUpload({ … })`**: recibe los archivos que llegan por arrastrar y soltar, pegado desde el portapapeles o selección desde la barra de herramientas, y los pasa a la función `uploader` del host.
3. **`mountUploadView({ … })`**: dibuja en pantalla la interfaz de marcador de progreso de la subida.

::: warning Cómo se enruta un pegado del portapapeles a la subida
Si los datos del portapapeles **contienen texto o HTML** (`text/html` o `text/plain`), se procesan mediante el flujo normal de pegado de texto/Markdown, no como subida de archivo. El flujo de subida solo se activa cuando el pegado del portapapeles trae únicamente datos de archivo. (Un adjunto por arrastrar y soltar siempre se procesa mediante el flujo de subida.)
:::

La función `uploader` tiene la firma `(task) => Promise<{ uri: string } | null>`. Devuelve un objeto `{ uri }` cuando la subida al servidor tiene éxito, y `null` si falla. El progreso se informa mediante el callback `task.onProgress(0~100)`, y la cancelación se maneja mediante `task.signal`.

Opciones de límite de extensión y tamaño de archivo: `extensions`, `maxFileSize`, `maxTotalSize` (sin límite si se omiten). Los archivos que no cumplen se pasan al callback `onReject`.

## Cómo se renderiza el documento tras la subida

- **Los archivos de imagen** se insertan como un bloque `<img>` de `imageWing`.
- **Los demás adjuntos** se insertan como un enlace de descarga de archivo (`<a data-nabi-file="pdf" href="...">`) de `linkWing`. El texto que se muestra del adjunto se genera según el idioma como "Adjunto", y se puede cambiar libremente colocando el cursor en el enlace y usando la barra contextual.

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

// El wing de subida necesita tener registrado junto a él el wing de imagen o de enlace
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// Montar la vista de la UI de progreso de subida
const view = mountUploadView({ nabi, surface, locale: 'es' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'es',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
  maxFileSize: 10 * 1024 * 1024,   // 10MB
  uploader: async (task) => {
    // Implementa aquí la lógica que realmente sube el archivo a tu servidor backend
    // const uri = await myUploadApi(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi,
  registry,
  surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  onFiles: (files) => upload.take(files),
})
```

## Demo

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
