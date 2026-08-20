---
title: Separador
---

# Separador

## Descripción

`dividerWing` (id `hr`) posee una sola etiqueta, `<hr>`. **`place: 'void'`** — es un
objeto sin interior, así que el cursor no tiene dónde entrar. Si pulsa Retroceso o
Suprimir justo antes o justo después del separador, ese bloque desaparece entero, y el
resultado es el mismo si lo selecciona por tramo.

Al pulsar el botón, el separador se sitúa **con su propio párrafo envoltorio**. No se
crea a la vez un párrafo vacío aparte — el cursor se posa encima de ese párrafo
envoltorio, justo detrás del separador.

Dónde se sitúa depende de si el párrafo donde estaba el cursor tenía texto.

| Dónde estaba el cursor | Resultado |
|---|---|
| Un párrafo con texto | Se sitúa **detrás** de ese párrafo |
| Un párrafo vacío | **Sustituye** a ese párrafo — no queda una línea vacía de más |

Al sustituir un párrafo vacío, la alineación que llevara ese párrafo sobrevive.

Escribir tres guiones o más (`---`) en una línea vacía y pulsar Enter da el mismo
resultado — en esta conversión automática **el disparador es Enter**.

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
