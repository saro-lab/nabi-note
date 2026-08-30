---
title: Subida de archivos
description: Conecta la transferencia de archivos con el uploader de tu servicio.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subida de archivos

Conecta la selección de archivos, arrastrar y soltar, y operaciones de pegado que contienen solo archivos a un flujo de subida. La demo de esta página no envía archivos a un servidor; en un servicio real debes conectar un uploader que reciba un archivo y devuelva una URL.

Para insertar resultados de subida como bloques de imagen, necesitas el wing de imagen. Para insertar otros archivos como enlaces de adjunto, necesitas el wing de enlace. Si tu servicio acepta ambos formatos, selecciona ambos wings explícitamente. Mientras la subida está en curso, el editor queda bloqueado, y los archivos correctos se insertan juntos como un solo paso de deshacer.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Si seleccionas solo `upload`, suministra automáticamente la dependencia que falte entre imagen y enlace. La transferencia se conecta con `mountUpload()`, y la UI de progreso de la pantalla de edición normalmente se conecta con `mountUploadView()`. Si el servidor devuelve URL HTTPS, la opción de URL local no hace falta.

## Contrato de API del servidor

NABI NOTE no envía archivos a tu servidor por sí solo. La función `uploader` envía un archivo al servidor y, si tiene éxito, devuelve solo una URL `https:` pública o autenticada. El contrato de API más simple se ve así.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

El servidor no debe confiar solo en el nombre de archivo original, la extensión o el MIME enviados por el navegador. Comprueba primero autenticación y permisos, limita el tamaño del archivo durante el streaming e inspecciona el tipo real del archivo. Crea el nombre almacenado en el servidor. Para imágenes, re-encódalas o crea miniaturas cuando haga falta. Si los archivos subidos no deben poder descargarse por cualquiera, devuelve una ruta de descarga que requiera autenticación en lugar de una URL pública.

| Comprobación en el servidor | Motivo |
| --- | --- |
| Usuario autenticado y permiso de subida | Evita escribir en el almacenamiento de otro usuario |
| Tamaño por archivo y tamaño total de la petición | Evita agotar memoria y almacenamiento |
| MIME real y extensión permitidos | Bloquea ejecutables con extensiones renombradas |
| Nombre almacenado aleatorio y almacenamiento aislado | Evita manipulación de rutas y sobrescritura de archivos existentes |
| Política de acceso y expiración de la URL de respuesta | Evita exponer archivos privados solo por URL |

`extensions` y `maxFileSize` del cliente son solo el primer paso para dar feedback rápido al usuario. Pon los mismos límites también en el servidor.

## Conectar el uploader en el navegador

El ejemplo siguiente es la conexión real que espera NABI NOTE. Usa `XMLHttpRequest` porque el `fetch()` estándar del navegador no ofrece progreso de subida. Devuelve solo la `url` de la respuesta del servidor; las imágenes se convierten en bloques de imagen, y los demás archivos en enlaces de adjunto.

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'en' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('Upload request failed.')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'en',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'en' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'en',
})
```

Conecta `fileSink: upload.take` para que arrastrar y soltar, y las operaciones de pegado que contienen solo archivos, entren al flujo de subida. La UI del wing de subida pasa los resultados del botón de selección de archivo a `upload.take()`. Mientras la subida está en curso, el editor queda bloqueado, y los archivos correctos de cada lote se insertan como un solo paso de deshacer. `upload.cancel()` o el botón de cancelar en `uploadView` aborta las peticiones en curso mediante `AbortSignal`.

## Fallo y limpieza

Si el servidor devuelve una respuesta de error o el `uploader` devuelve `null`, ese archivo no se inserta en el documento. Los demás archivos del mismo lote siguen procesándose. Si se supera el límite de tamaño total, el lote completo no empieza. Al cerrar la pantalla, desmonta en el orden inverso al de creación.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Solo durante el desarrollo puedes usar URL `blob:` para una vista previa inmediata. En ese caso, activa `allowLocalUrls: true` al ensamblar el editor, el wing de imagen y el wing de subida. Si las subidas reales del servidor devuelven URL HTTPS, es más seguro no activar esta opción.

## Estilos CSS

Los archivos ordinarios completados se muestran mediante el wing de enlace como `a[data-nabi-file]`. Usa este selector cuando solo quieras cambiar el aspecto del adjunto en la vista publicada.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Los resultados de subida de imagen siguen el CSS del wing de imagen. El progreso de subida aparece solo en la vista de edición, así que el CSS de la vista publicada no necesita crear un estado de progreso.
