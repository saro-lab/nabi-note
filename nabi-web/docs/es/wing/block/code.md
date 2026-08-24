---
title: Código
---

# Código

## Descripción

`codeWing` (id `code`) es un objeto wing constante que gestiona el bloque de código (`<pre><code>`).

Es un contenedor con `holds: 'inline'`, y por dentro el texto se normaliza a texto plano en la fase de `repair`, de modo que no se anidan otras marcas en línea ni otros bloques.

En una línea vacía, escriba ` ``` ` y pulse espacio o Enter para convertirla en un bloque de código (si escribe el identificador del lenguaje a continuación, como en ` ```ts `, ese lenguaje queda configurado automáticamente). Con `Tab` y `Shift+Tab` se sangra o se quita la sangría de las líneas de código, y esto se aplica en bloque cuando hay varias líneas seleccionadas. Al pulsar Enter se conserva automáticamente la profundidad de sangría de la línea anterior.

Cuando el cursor está dentro de un bloque de código se activa la barra contextual dinámica, que ofrece un campo para escribir el lenguaje directamente, un botón "Sin lenguaje" y botones de acceso rápido para los lenguajes más usados:

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Incluso un lenguaje que no esté en la lista anterior se puede escribir directamente en el campo, y el valor introducido se pasa tal cual al resaltador de sintaxis.

## El coloreado se enchufa al wing

`highlight` es una función gancho que recibe el código fuente y el lenguaje, y devuelve un array de tokens: `(source, lang) => { text: string, type?: string }[]`.

El `type` de un token devuelve uno de los 14 tipos estándar definidos en `CODE_TOKEN_TYPES` (`keyword`, `string`, `number`, `comment`, `function`, `class`, `variable`, `operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`, `meta`).

La hoja de estilos del núcleo asigna colores de tema a cinco tipos de token por defecto (`comment`, `string`, `keyword`, `number`, `literal`) mediante el selector `[data-nabi-token="…"]`. Para aplicar modo oscuro o colores personalizados, puede sobrescribir ese selector CSS.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Al conectar un resaltador externo como Shiki o Prism, use `makeCodeAttach` para construir el hook `attach`.

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

Si, como Shiki, su resaltador carga los paquetes de gramática de forma asíncrona, puede pasar la opción `version` para volver a resaltar la pantalla del editor cuando termine de cargarse la gramática:

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight: myHighlighter, version: () => grammarAge }),
}

// cuando termina la carga asíncrona de la gramática del lenguaje
grammarAge += 1
```

La estructura HTML guardada sigue el formato estándar: `<pre data-nabi-lang="ts"><code class="language-ts">`. Cada token queda marcado de forma segura con un atributo `data-nabi-token`.

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
