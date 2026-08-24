---
title: Enlace
---

# Enlace

## Descripción

`linkWing` (id `a`) es el wing de marca en línea que gestiona los hiperenlaces (`<a href>`).

Al hacer clic en el botón de la barra de herramientas aparece una ventana emergente para introducir la URL del enlace. Solo se puede introducir una URL segura que empiece por `http:` o `https:`; una URL de script malicioso como `javascript:` se filtra automáticamente según la política de seguridad contra XSS.

En esa ventana emergente se pueden introducir juntos la **URL del enlace** y el **texto mostrado**. Si deja vacío el campo de texto, la propia URL pasa a ser el texto mostrado.

## Editar un enlace desde la barra contextual

Cuando el cursor ya está dentro de un enlace existente, la barra contextual dinámica muestra campos de texto en línea para corregirlo al instante:

| Campo | Descripción |
|---|---|
| Dirección del enlace (`href`) | Cambia solo la URL de destino del enlace (el texto mostrado se conserva) |
| Nombre a mostrar | Cambia solo el texto que se ve en el cuerpo (la URL se conserva) |

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
