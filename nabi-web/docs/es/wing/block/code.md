---
title: Código
description: Guarda código de varias líneas junto con el idioma usado para el resaltado de sintaxis.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Código

Inserta código de varias líneas separado del texto normal. Escribe tres acentos graves en un párrafo vacío y pulsa Espacio o Enter, o cambia a bloque de código desde la barra de herramientas. Si añades un nombre de idioma después de los acentos graves, como `ts`, ese nombre también se guarda.

El nombre de idioma es un identificador usado para el resaltado de sintaxis, y también se pueden escribir manualmente nombres que no estén en la lista registrada. Como el contenido del código y la indentación deben conservarse, los bloques de código no aceptan alineación de párrafo.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Conectar un resaltador de código

Registrar el bloque de código usa el coloreado predeterminado dentro del editor. Para colorear código también en la vista publicada, conecta `nabi-note/viewer`. El viewer busca `pre > code` y lee el valor `data-nabi-lang` del elemento padre como nombre de idioma. Si ese valor no existe, revisa la clase `language-...` del elemento `code`.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'en',
})

// Después de reemplazar el HTML publicado
viewer.refresh()

// Al cerrar la pantalla
viewer.unmount()
```

Si no hay un resaltador separado, o si ese resaltador no puede manejar el idioma, se usa en su lugar el tokenizador integrado sin dependencias. Los `span` de tokens que inserta el resaltador existen solo en pantalla y no se escriben de vuelta en el JSON guardado ni en el HTML publicado original. `refresh()` y `unmount()` quitan esos `span` y se reconectan desde el código original actual.

### Cómo conecta Shiki el sitio web de NABI

El sitio web de NABI carga el resaltador dinámicamente para que Shiki no entre en el bundle de SSR ni de primera pantalla. `loadCodeHighlighting()` en `nabi-web/docs/.vitepress/src/highlight.ts` crea el núcleo de Shiki y luego descarga una gramática de idioma solo cuando realmente se necesita código de ese idioma. El ejemplo siguiente usa la misma conexión en la vista publicada.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'en',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// Al cerrar la pantalla
stop?.()
viewer.unmount()
```

Cuando aparece un idioma por primera vez, empieza la descarga de su gramática. Hasta entonces, el bloque se muestra con el tokenizador integrado o como texto plano. Cuando llega la gramática, `onGrammarLoaded()` llama a `viewer.refresh()` y colorea el bloque de nuevo. Así solo se descargan los idiomas necesarios, y una gramática que llega tarde se aplica sin navegar otra vez por la página.

El lado del editor usa la misma función `highlight`. La demo del sitio NABI sustituye solo el `attach` predeterminado de `codeWing` por `makeCodeAttach({ highlight, version })`. `version` cambia cada vez que llega una gramática y actúa como señal para volver a pintar el código ya dibujado. Un servicio independiente puede implementar primero la conexión de la vista publicada y añadir este enfoque solo si también necesita coloreado de Shiki durante la edición.

## Estilos CSS

Da estilo a los bloques de código con `.nabi-content pre`, y al código con `.nabi-content pre > code`. No cambies `white-space`, porque afecta a los saltos de línea y a la edición. Los colores de tokens se pueden cambiar con selectores `[data-nabi-token]`.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
