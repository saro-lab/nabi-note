---
title: Fusión
description: Combine la versión inicial, su versión y la guardada entretanto, y edite los conflictos restantes para resolverlos.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Fusión

Si se guardaron otros cambios mientras editaba, combine ambos lados tomando como base la versión inicial. Todo lo fusionable automáticamente se aplica desde el principio; solo los cambios superpuestos quedan como conflictos. Es una vista independiente de `nabi-note/merge`, no una wing.

| Izquierda | Centro | Derecha |
| --- | --- | --- |
| Versión al empezar a editar | Su documento actual con la fusión automática | Versión guardada durante su edición |
| Solo lectura | Editable directamente | Solo lectura |

En el centro puede editar texto, formato, tablas, listas e imágenes como en un editor normal. Las wings proporcionadas determinan las funciones. Las marcas y el estado de los conflictos no se mezclan con el contenido guardado.

## Ejemplo de fusión totalmente automática

Usted cambió la hora a las **11:00** y otra persona el lugar a la **sala de reuniones de la tercera planta**. Al afectar a párrafos distintos, ambas modificaciones aparecen en el centro.

Sin conflictos restantes puede pulsar **Confirmar** inmediatamente, o retocar antes el texto central. El documento final mostrado debajo es el resultado real recibido por el callback de confirmación.

<MergeDemo />

## Ejemplo de fusión parcialmente automática

Esta vez cambió la hora a las **11:00** y otra persona a las **14:00**. Los cambios distintos del mismo párrafo dejan la hora en conflicto. Su cambio de responsables a **Jimin y Seoyeon** y el cambio de lugar a la **sala de reuniones de la tercera planta** se aplican automáticamente.

Resuelva el conflicto de una de estas formas:

- Izquierda **&gt;&gt;**: adopta el contenido correspondiente de la versión inicial.
- Derecha **&lt;&lt;**: adopta el contenido de la versión recién guardada.
- **Resolver con el contenido actual**: conserva o edita el centro y lo marca como resuelto.

Cambie la frase de la hora en el centro y pulse **Resolver con el contenido actual**. Solo puede confirmar cuando todos los conflictos estén resueltos.

<MergeDemo partial />

Editar de nuevo una zona resuelta conserva su estado. Deshacer la resolución también revierte el estado; rehacer lo restaura. Borrar o editar texto no resuelve por sí solo un conflicto pendiente.

## Reglas de fusión automática y conflictos

Se comparan los cambios desde el documento inicial al suyo y desde ese mismo inicio a la nueva versión. Los cambios de un solo lado o idénticos en ambos se aplican automáticamente, al igual que los cambios en párrafos o líneas diferentes.

Como en la fusión de texto de Git, el solapamiento se decide por párrafos y líneas. Cambiar palabras distintas de la misma línea sigue siendo un conflicto. Insertar contenido distinto en la misma posición o editar contenido eliminado por el otro lado también requiere decidir.

Si ambos lados modifican de forma distinta una tabla, lista o región flotante, toda esa estructura queda en conflicto. No se mezclan arbitrariamente celdas ni elementos: seleccione el contenido o edite el centro. Tampoco se aplican automáticamente movimientos y ediciones superpuestos cuya posición sea incierta.

## Conectar una vista de fusión independiente

Pase NABI TREE JSON guardado o cadenas HTML en `base`, `local` e `incoming`. Use las mismas wings y opciones del editor original. `mountMerge()` crea el editor central, la barra, ambas fuentes, los controles de conflictos y el botón de confirmación.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'es',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` recibe JSON, HTML publicable, revisión de edición e `incomingVersion` del resultado actual con todos los conflictos resueltos. Devolver `false` no completa la confirmación. Mientras su Promise está pendiente se bloquean edición, selección de conflictos y confirmaciones duplicadas. Desmontar cancela el `signal` del resultado. La composición IME coreana debe terminar antes de confirmar.

Conecte acciones propias como selección de imágenes o cargas igual que en un editor normal. `toolbarOptions` recibe paneles y acciones del host, y `surfaceOptions` las opciones de la superficie de edición.

`incomingVersion` devuelve intacto el valor proporcionado por el servicio. Este debe compararlo con la última versión del servidor al guardar. Si se guardó otra versión durante la fusión, obtenga el documento más reciente e inicie otra fusión, sin sobrescribirlo con un resultado antiguo.

También puede consultar el estado o confirmar desde fuera de la vista.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Lea el resultado con `merge.nabi.getJson()` y `merge.nabi.getHtml()`. No guarde el DOM de edición ni `getEditorHtml()`. Para aplicar solo contenido anterior seleccionado entre dos versiones, use la fusión por clic de [Comparación](./compare).

## Confirmar tras finalizar las cargas

Conecte la wing `upload` y `mountUpload()` para el botón de archivo, pegado y arrastrar y soltar. `sendUpload` envía archivos al servidor y devuelve `{ uri }`. Consulte [Carga de archivos](../wing/etc/upload) para el ejemplo completo de conexión y progreso.

Use `merge.session.hold()` para posponer confirmación y selección de conflictos durante tareas asíncronas, como cargas, aún no reflejadas en el documento. Llame a la función devuelta al completar, cancelar o desmontar. Libere **después de insertar en el documento**, no justo tras cargar al servidor, para incluir el archivo en el resultado final.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'es',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'es',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` es el DOM central; `merge.surface` y `merge.toolbar` ya están montados. No cree otra superficie ni barra en el mismo lugar. Desmonte primero las cargas o indicadores adicionales y llame a `merge.unmount()` al final.
