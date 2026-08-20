---
title: Código
---

# Código

## Descripción

`codeWing` (id `code`) es una **constante** propietaria del bloque de código
(`<pre>`) — no se llama con paréntesis.

Es un contenedor con `holds: 'inline'`, y por dentro `repair` lo mantiene siempre en
texto plano — ni las marcas ni otros wings pueden entrometerse. No es que exista una
casilla aparte en el contrato para eso: es el propio wing el que arregla su interior.

En una línea vacía, si escribe ` ``` ` y pulsa el espacio o Enter, se convierte en un
bloque de código — y si escribe el lenguaje a continuación, como en ` ```ts `, ese
lenguaje queda recogido también. Con `Tab` y `Shift+Tab` se sangra y se quita la
sangría de la línea (si selecciona varias, todas a la vez). Enter hereda la sangría de
la línea anterior.

La barra contextual solo aparece cuando el cursor está dentro del código — con un campo
para escribir el lenguaje a mano, "Sin lenguaje" y las casillas de los lenguajes de uso
frecuente.

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Esta lista es solo un **atajo** — no es el catálogo de lenguajes que conoce el núcleo.
Un lenguaje que no esté aquí se escribe a mano en el primer campo, y ese valor se le
pasa tal cual al resaltador.

## El coloreado se enchufa al wing

`highlight` es un **gancho que devuelve tipos, no colores** — tiene la forma
`(fuente, lenguaje) => {text, type?}[]`, y `type` está fijado a uno de estos catorce:
`keyword`·`string`·`number`·`comment`·`function`·`class`·`variable`·`operator`·
`punctuation`·`tag`·`attribute`·`literal`·`regexp`·`meta` (`CODE_TOKEN_TYPES`).

El color lo fija directamente la hoja de estilos del núcleo con el selector
`[data-nabi-token="…"]` — **solo cinco tienen color** (`comment`·`string`·`keyword`·
`number`·`literal`). Los demás tipos solo llevan la marca, sin regla de color, así que
salen con el color del texto normal. Como el valor es un color fijo y no una variable
CSS, para usar otro color o un tema oscuro hay que sobrescribir ese mismo selector.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

El diccionario de sintaxis en sí no viene en el paquete — hay que enchufar uno a mano,
como Prism, highlight.js o Shiki.

El coloreado se **enchufa al wing** — no se monta aparte. Con `makeCodeAttach` se
construye un `attach` y se lo cambia al wing de código; `mountSurface` lo engancha por
usted. La demo de este sitio hace exactamente eso con Shiki
(`.vitepress/src/highlight.ts`).

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// el wing es una constante — solo se le cambia el `attach`
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

Si además le pasa `version`, se vuelve a colorear **cuando el documento sigue igual
pero lo que lo colorea ha cambiado**. Es el caso de los resaltadores que traen la
sintaxis de forma asíncrona (Shiki lo hace la primera vez que se encuentra con un
lenguaje) — aunque llegue la sintaxis, el documento no ha cambiado, así que `onChange`
no suena, y sin esto habría que teclear una letra cualquiera de más para que entrara el
color.

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// cuando la sintaxis llega tarde — se sube el número y se vuelve a colorear
grammarAge += 1
```

El valor guardado sigue las convenciones de fuera —
`<pre data-nabi-lang="ts"><code class="language-ts">` — y los colores salen mediante el
atributo `data-nabi-token` (no con `style` en línea).

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
