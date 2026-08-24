---
title: Separador
---

# Separador

## Descripción

`dividerWing` (id `hr`) gestiona la línea divisoria horizontal (`<hr>`). Es un objeto
`place: 'void'`, sin texto en su interior — pulsar Retroceso o Suprimir justo antes o
justo después del separador borra el bloque completo.

Al hacer clic en el botón, el separador se inserta **envuelto en un párrafo contenedor
propio (`<div data-nabi-p>`)**. El cursor queda justo detrás del separador.

Dónde se inserta depende del estado del párrafo en el que estaba el cursor:

| Dónde estaba el cursor | Resultado de la inserción |
|---|---|
| Un párrafo con texto | El nuevo separador se inserta **detrás** de ese párrafo |
| Un párrafo vacío | Ese párrafo vacío **se sustituye** por el separador (evita una línea vacía de más) |

Al sustituir un párrafo vacío, la alineación de texto que llevaba se conserva.

Escribir tres o más guiones en una línea vacía y pulsar Enter (`---` + Enter) lo convierte
automáticamente en un separador.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
