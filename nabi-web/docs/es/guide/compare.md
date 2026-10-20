---
title: Comparación
description: Compare dos documentos en paralelo y aplique contenido anterior seleccionado al documento actual.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Comparación

Compare dos documentos guardados en paralelo para ver los cambios. La vista funciona sin editor; conecte un callback para aplicar contenido anterior seleccionado al documento actual.

## Aplicar contenido anterior seleccionado

Las comparaciones independientes son de solo lectura de forma predeterminada y no muestran botones **&gt;&gt;** para aplicar cambios. Conecte un callback `onMerge` para mostrarlos.

A la izquierda está el documento anterior y a la derecha el actual. Pulse **&gt;&gt;** junto a un cambio para aplicar el contenido anterior de ese párrafo o grupo de líneas. No se selecciona carácter por carácter. También permite restaurar contenido eliminado o quitar contenido nuevo del documento actual.

El ejemplo siguiente es de solo lectura. Revise cómo han cambiado la hora de reunión y los objetos que hay que llevar. **Empezar de nuevo** restaura el ejemplo original.

<CompareDemo />

## Comparación independiente

Importe desde `nabi-note/diff`. Pase NABI TREE JSON guardado o cadenas HTML en `before` y `after`. Construya el registry con las mismas wings del editor que creó los documentos para leer y mostrar íntegramente tablas, listas, imágenes y demás contenido.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'es',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Por defecto solo aparecen los cambios y su contexto. El botón de plegado despliega los documentos completos; anterior/siguiente recorren los cambios. Sin cambios se muestra todo el documento. Omitir `onMerge` deja la comparación en solo lectura.

## Conectar la fusión por clic con un callback

Al pulsar se entrega una propuesta de resultado a `onMerge`. Conectar el callback no guarda automáticamente el documento. El servicio debe aceptar la propuesta y llamar a `update()` para actualizar también la comparación.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'es',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` es NABI TREE JSON con solo el cambio seleccionado. `before` y `after` son los documentos al pulsar; `changeId` identifica el cambio y `revision` el estado de comparación. Pase esta `revision` como tercer argumento de `update()`: si la comparación ya cambió, devuelve `false` sin aplicar la propuesta.

Los clics duplicados se bloquean mientras espera el callback asíncrono. Actualizar con otros documentos o desmontar cancela `signal`. Al guardar en un servidor, compruebe tanto esa señal como la versión del documento para evitar sobrescribir contenido nuevo con un resultado antiguo.

## Abrir la comparación desde el editor

Conecte la wing `diff` y `mountDiffWing()` para abrir la comparación desde la barra. La base es el último documento cargado. La edición normal y deshacer no cambian esa base.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'es',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge` es `true` de forma predeterminada, por lo que el contenido anterior seleccionado se puede aplicar al editor. La operación se puede deshacer y conserva la base. Los cambios del editor original mientras la vista está abierta recalculan la comparación. Use `merge: false` para una comparación de solo lectura.

Llame a `toolbar.unmount()` y `comparison.unmount()` al retirar la vista. Para incluir la versión al comenzar la edición y combinar automáticamente ambos lados, use [Fusión](./merge).
