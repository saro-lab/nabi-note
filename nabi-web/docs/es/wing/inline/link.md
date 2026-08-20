---
title: Enlace
---

# Enlace

## Descripción

`linkWing` (id `a`) es el propietario de `<a href>`. Al pulsar el botón se abre una
capa de entrada de dirección junto al cursor, y la confirmación solo se activa para
direcciones que empiezan por `http` o `https` — esa comprobación por lista blanca es en
sí misma la defensa contra XSS (un esquema como `javascript:` no llega siquiera a
pasar). Un `href` que no supere la validación no se guarda, y en ese caso el texto sale
plano, sin etiqueta `<a>`.

La capa tiene dos casillas: la dirección y el texto que se verá. Si deja vacía la
casilla del texto, la dirección pasa a ser el texto; y si solo hay cursor y no hay
texto seleccionado, el objetivo pasa a ser toda la marca de enlace donde está el
cursor (la misma regla que en el resaltador y el color del texto).

## Los enlaces que ya existen se corrigen en la barra contextual

Cuando el cursor se posa dentro de un enlace, en la barra contextual aparecen **dos
casillas de texto** — no son botones que abran una capa, sino campos de entrada que se
alojan directamente en esa barra (`kind: 'text'`). Aparecen ya rellenas con el valor
actual, y se aplican al pulsar Enter o al hacer clic en otro sitio. Si el valor no ha
cambiado, no ocurre nada.

| Casilla | Qué hace |
|---|---|
| Dirección | Cambia solo la dirección. El texto visible queda igual. |
| Nombre a mostrar | Cambia solo el texto visible. La dirección y la marca de adjunto quedan igual. |

**En los adjuntos (enlaces a archivo) no aparece la casilla de dirección** — esa
dirección la fijó la subida y no es un valor que deba corregirse a mano. La casilla del
nombre aparece igual, tanto en un enlace normal como en un adjunto. No se admite un
nombre vacío — hacer un enlace sin nombre no es cambiarle el nombre, es borrarlo.

## El adjunto es un solo bloque en pantalla

El adjunto se trata como un todo. Al hacer clic, el cursor no se posa dentro: **se
apunta al enlace entero**, y si justo al lado pulsa retroceso o suprimir, **el enlace
entero desaparece.** Corregirlo es tarea de la barra contextual, no del cursor.

Esto lo lleva el wing con `attach`, y `mountSurface` lo engancha junto con los demás —
**no hay que montar nada aparte.**

## La marca de adjunto

Un enlace que ha entrado por una subida lleva la marca `data-nabi-file` (su valor es la
extensión) — es esa marca la que hace que la hoja de estilos dibuje una caja con clip en
lugar de un subrayado. Cambie el nombre o cambie la dirección, la marca lo sigue.
Borrar el formato tampoco despoja a los adjuntos: arrancarles la cáscara convertiría el
adjunto en texto plano muerto.

`linkWing` es una **constante** — no se llama con paréntesis y no recibe ninguna
opción.

::: warning `allowLocalUrls` no alcanza al enlace
El interruptor que abre las direcciones `blob:`/`data:` solo funciona **para la
imagen**. La salida es siempre estricta: la puerta que usa `getHtml()` para filtrar
direcciones (`ctx.url`) mira la lista blanca tal cual, sin importar qué haya encendido
el anfitrión.

Por eso un enlace de adjunto que lleve una dirección `blob:` **cae a texto plano en el
mismo instante en que se exporta.** Por esto la subida no debe dejar la dirección
temporal tal cual — hay que cambiarla por la dirección real recibida tras subirlo para
que quede en el documento.
:::

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
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
