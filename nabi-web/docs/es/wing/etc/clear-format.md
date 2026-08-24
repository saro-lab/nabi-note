---
title: Borrar formato
---

# Borrar formato

## Descripción

`clearFormatWing` es un wing de herramienta (`place: 'tool'`) que elimina el formato aplicado y restablece el texto a texto sin formato.

- **Formato que elimina**: 11 marcas en línea (`b`, `i`, `u`, `s`, `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) y 3 atributos de párrafo (`h` encabezado, `a` alineación, `dc` letra capital).
- **Al ejecutarlo con un tramo de texto seleccionado**, se eliminan de una vez todas las marcas en línea y los atributos de párrafo del tramo seleccionado.
- **Al ejecutarlo con solo el cursor**, se retiran una a una empezando por la marca más interior en la posición del cursor, y cuando ya no queda ninguna marca que retirar, se restablecen los atributos de párrafo.
- **Los enlaces de adjunto (`data-nabi-file`) están protegidos**: a diferencia de un enlace web normal, el enlace de archivo adjunto queda excluido de la limpieza, de modo que se conserva la información del archivo.
- **La alineación del párrafo envoltorio de un objeto de bloque** (una imagen, una tabla, etc.) **se conserva.**

## Dos pulsaciones de <kbd>Esc</kbd>

Además del botón de la barra de herramientas, pulsar <kbd>Esc</kbd> **dos veces en menos de 350ms** ejecuta el comando de borrar formato de inmediato.

- Tanto si hay una selección de texto como si solo hay cursor, borra el formato por etapas exactamente igual que al pulsar el botón de la barra de herramientas.
- La prioridad de <kbd>Esc</kbd> se procesa como la más baja: aunque la primera pulsación haya activado una reserva de escape de marca, la segunda pulsación sigue disparando correctamente el borrado de formato.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
