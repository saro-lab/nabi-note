---
title: Cambiar el estilo
description: Los colores y las formas se sobrescriben con variables CSS.
---

# Cambiar el estilo

La hoja de estilos **la conecta el host** — con un bundler basta una línea,
`import 'nabi-note/nabi.css'`; con un CDN, una línea de `<link>`. Después de eso, solo
hay que sobrescribir variables.

Las reglas de los componentes **no llevan ni un solo color literal.** Todo está pintado
con variables `--nabi-*`, así que al sobrescribir la variable el resto la sigue.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

La razón de repetir la clase tres veces está más abajo en
[Sin toparse con la especificidad](#sin-toparse-con-la-especificidad).

::: tip La premisa grande de este documento — el valor guardado no se sostiene solo
El HTML de salida (`getHtml()`) **no lleva ni un solo `style` en línea.** El valor
guardado solo dice el *qué* con atributos (`data-nabi-align="center"`), y el *cómo se
ve* lo dice esta hoja de estilos. Por eso, incluso donde se lea el HTML guardado para
dibujarlo, hace falta hacerlo **dentro de un `.nabi-content` con esta hoja conectada**
para que se vea igual que en el editor — vea más abajo
[Al dibujar el HTML guardado fuera del editor](#al-dibujar-el-html-guardado-fuera-del-editor).
:::

::: tip El modo oscuro y el claro ya vienen incluidos
No hay **ningún** token que el host deba sobrescribir para el tema. La hoja del núcleo
trae consigo los tres: los valores por defecto del modo claro, la redefinición de
`.dark` y la redefinición explícita de `.light`. Este mismo sitio, dentro del editor, no
sobrescribe nada salvo los cuatro tokens de tipografía.
:::

## Tokens de color y forma

| Token | Sentido | Valor por defecto (claro) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | Fondo · superficie ligeramente hundida | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | Texto · texto apagado · texto sobre el color de acento | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | Línea · color de acento | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | Peligro · texto sobre él | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | Sombra de caja · fondo de la vista previa | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | Bordes redondeados | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | Borde redondeado de las capas (panel, vista previa, lightbox) | `.25rem` |
| `--nabi-z-sticky` | Índice de capa de la fila que queda pegada | `20` |
| `--nabi-grid-cell` | Tamaño de celda de la rejilla de tamaño de tabla | `1.125rem` |
| `--nabi-hl-yellow` · `green` · `cyan` · `pink` · `purple` · `orange` | Los seis colores de resaltado | Colores translúcidos |
| `--nabi-tc-green` · `coral` · `violet` · `amber` · `blue` | Los cinco colores de texto | Colores intensos |

Esta tabla solo recoge lo que la hoja del núcleo (`nabi.css`) **declara directamente.**
El lugar de la declaración no es solo `.nabi`, sino tres a la vez —
`:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`. Es porque el overlay de
vista previa es hijo de `body` y no le llega la herencia desde `.nabi`, y porque un
`.nabi-content` que se para solo fuera del editor también necesita recibir los tokens
directamente.

La misma lista aparece escrita tres veces (el valor por defecto claro, `.dark` y el
`.light` explícito). **Quien sobrescribe no necesita ver las tres** — con solo ganar en
especificidad, un valor sobrescrito una vez se aplica en los tres casos. Solo si se
quiere un valor distinto en modo oscuro hace falta añadir uno mismo la condición
`.dark`.

## Tokens que solo se referencian, sin valor propio

Abajo están las variables que el núcleo **solo referencia, sin declararlas.** Si el host
no da un valor, se aplica el resguardo entre paréntesis. Como no hay ningún lugar donde
estén declaradas, **basta con escribirlas en `:root`** para que se apliquen tal cual —
aquí es donde se diferencian de los tokens de color y forma de arriba (esos sí están
declarados en `.nabi`, así que la herencia no los puede vencer).

| Token | Sentido | Resguardo |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | La tipografía real que se conecta a las cuatro variantes del wing de tipografía | Tipografía del sistema |
| `--nabi-cursive-adjust` | El `font-size-adjust` de la manuscrita. Las fuentes de mano tienen una x-height baja, así que con el mismo tamaño en px se ven más pequeñas — este valor las vuelve a ajustar según la x-height | `0.4` |
| `--nabi-sticky-top` | Cuánto baja la fila pegada. Si el sitio tiene una barra fija arriba, esa altura | `0px` |
| `--nabi-preview-width` | El ancho de la tarjeta de vista previa. **Como `openPreview` mide el ancho del área de edición al abrirse y lo escribe directamente en la tarjeta**, aunque el host lo sobrescriba desde fuera, gana ese valor en línea | `720px` |

`--nabi-typeface-base` no pertenece a este grupo — **lo declara el núcleo** (por defecto
sigue a `--nabi-font`). El wing de tipografía no tiene ninguna opción para fijar este
valor, así que para cambiarlo hay que sobrescribir este token.

`--nabi-keyboard-top` y `--nabi-keyboard-bottom` también viven en este mismo lugar, pero
estas las **usa el núcleo** — `mountSticky()` mide cuánto empujó el teclado móvil a la
pantalla, lo escribe aquí, y la fila pegada y la pantalla completa leen ese valor. No son
valores para escribir a mano.

## Lugares sin token — se sobrescribe la regla

Los tres de abajo **no tienen variable.** El núcleo dejó el valor fijo en la regla, así
que para cambiarlo hay que sobrescribir ese selector.

**Los cuatro niveles de tamaño de letra** — usan `em`, así que siguen el tamaño del
padre.

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**El tamaño de la letra capital** — no es un valor que fije cuántas líneas envuelve,
sino un solo tamaño de letra. Cuántas líneas cubra en realidad lo decide la altura de
línea de ese párrafo.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**El color de los tokens de código** — la hoja del wing de código escribe el color
directamente sobre `[data-nabi-token]`. Ahora mismo son **cinco** los grupos que reciben
color.

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

El `type` que responde el resaltador es texto libre — si responde un nombre fuera de
estos cinco, se dibuja sin color, así que si se quiere usar otro grupo, el host solo
tiene que añadir una regla con la misma forma. Si se quiere un color distinto en modo
oscuro, hay que añadir uno mismo la condición `.dark` — el núcleo no trae una variante
oscura para estos cinco.

La animación de progreso del wing de subida (`--nabi-per`, `--nabi-t`, `--nabi-span`,
`--nabi-clear`, `--nabi-blur-max`) es **de uso interno del wing** — el nombre empieza
con `--nabi-`, pero no es un lugar abierto para que el host lo sobrescriba.

---

## Las medidas externas están en `rem`

La mayoría de las medidas externas — botones, márgenes, chips de la barra de
herramientas — usan `rem`, así que **crecen siguiendo el tamaño de letra de la raíz
(`html`).** Si la persona agranda la letra en el navegador o el sistema, el marco del
editor crece con ella. Para cambiar el tamaño, cambie el `font-size` de la raíz. Los
bordes (`border`) no son una medida sino una **línea**, así que en algunos lugares
siguen en `px`.

---

## Sin toparse con la especificidad

Para sobrescribir los tokens de color y forma, repita **la clase tres veces**.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--mi-color-de-acento);
}
```

Contando queda así. La regla del valor por defecto claro, `:is(.nabi, …)`, tiene
especificidad **(0,1,0)** porque `:is()` toma la más alta de sus argumentos; la regla
oscura, `:where(html, body).dark :is(.nabi, …)`, tiene **(0,2,0)** porque `:where()`
vale 0 y `.dark` más `:is()` aportan una clase cada uno. Así que con `.nabi.nabi`
**se empata** con la oscura — y en un empate gana el que se cargó después, y la hoja del
núcleo bien puede cargarse después que la del host. Hay que subir a (0,3,0) repitiendo
la clase tres veces para no depender del orden.

El overlay de vista previa se para fuera de `.nabi` (es hijo de `body`), así que hay que
añadir también ese selector para que tenga el mismo color.

**Los tokens que el núcleo no declara, como la tipografía, no necesitan esta pelea** —
como no hay ningún lugar donde estén declarados, con la sola herencia ya llegan, así que
basta una línea en `:root`.

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

---

## Claro · Oscuro

Si `html` o `body` — **cualquiera de los dos** — tiene la clase `dark`, es oscuro; si
tiene `light`, es claro. Sin ninguna clase, el claro es el que se aplica por defecto, y
si están las dos, gana el `light` explícito (la regla `.light` se carga después de la
`.dark`).

```html
<html class="dark"><!-- o <body class="dark"> --></html>
```

Al alternar la clase, el CSS reacciona solo. No hay ninguna API que llamar. Lo único que
cambia el tema son las variables de color; las reglas de los componentes quedan igual —
incluso un estilo propio, con solo usar variables `--nabi-*`, sigue el modo oscuro.

---

## Dos formas de conectar la hoja

**① Un solo archivo** — la vía más común. Trae el CSS de todos los wings.

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**② Inyectar solo lo registrado** — para cuando solo se quiere la hoja de los wings que
de verdad están encendidos.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// llamar a drop() retira solo lo que metió esta llamada
```

La hoja del mismo texto se mete **una sola vez** — la clave de deduplicación es el
**contenido** de la hoja, así que aunque se levanten varios editores en un mismo
documento no se apilan, y aunque se mezclen configuraciones de wings distintas, se
reúnen en una sola unión.

:::: tip Dos diferencias entre las dos — qué carga, y cuándo se conecta
**Qué carga.** El archivo no puede saber qué wings se registraron, así que carga
**todo.** La inyección mira el `registry` y carga **solo lo registrado.** Una página que
solo muestra el HTML guardado no tiene editor, así que tampoco tiene `registry` — para
esa, use el archivo.

**Cuándo se conecta.** El archivo llega como `<link>` en la cabecera y **bloquea el
dibujo** mientras carga. La inyección solo se conecta **después de que llega el
JavaScript del editor**. Por eso una página cuyo documento se dibuja de antemano en el
servidor y se envía debe usar la vía del archivo — con la inyección, ese documento
renderizado en el servidor se pintaría primero sin estilos y luego se reajustaría el
diseño al llegar la hoja.
::::

La hoja de un wing registrado se carga **después** de la hoja del núcleo, así que con la
misma prioridad, gana el wing.

---

## Lugares donde se puede enganchar

Lo que no se puede lograr con variables se apunta directamente a una clase que existe de
verdad.

| Selector | Qué es | Quién lo conecta |
|---|---|---|
| `.nabi` | La envoltura del editor entero (chrome + área de edición). Aquí cuelgan los tokens de color y forma | El host |
| `.nabi-content[contenteditable]` | El área de edición misma | El host |
| `.nabi-toolbar` | El lugar que envuelve la fila de herramientas + la contextual. Esta clase es justamente lo que "queda pegado arriba" | El host |
| `.nabi-toolbar-row` | El recipiente donde se aloja la barra de herramientas | `mountToolbar()` |
| `.nabi-context` | El recipiente donde se aloja la barra contextual | `mountContextToolbar()` |
| `.nabi-tools` | El lugar de los dos botones de vista previa y pantalla completa — el núcleo los flota arriba a la derecha | `mountViewTools()` |
| `.nabi-tool` | Esos dos botones mismos | `mountViewTools()` |
| `.tb-group` | El grupo de botones de la barra de herramientas | `mountToolbar()` |
| `.ctb-group` · `.ctb-button` · `.ctb-swatch` · `.ctb-input` | Grupo, botón, muestra de color y casilla de texto de la barra contextual | `mountContextToolbar()` |
| `.tb-picker` · `.tb-picker-grid` · `.tb-picker-cell` | La caja que aparece bajo un botón, como la rejilla de tamaño de tabla | `mountToolbar()` |
| `.tb-prompt` · `.tb-prompt-input` | La capa de entrada de dirección que aparece al insertar algo nuevo | `mountToolbar()` |
| `.nabi-hints [data-hint]` | La insignia de atajos que aparece al pulsar Shift dos veces seguidas — la insignia es `::before` y la etiqueta `::after`, así que se ven juntas | `mountHints()` |
| `[data-nabi-tip]` | La etiqueta (tooltip) — se dibuja solo con `::after` de CSS | El núcleo en general |
| `.nabi-content.nabi-dropping` | El área de edición mientras se arrastra un archivo encima. El texto de aviso viaja en el atributo `data-nabi-drop` | `mountUpload()` |

La vista previa y la pantalla completa también **las construye el núcleo.**

| Selector | Qué es | Quién |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` · `.nabi-content.nabi-preview-body`) | El overlay de vista previa del documento | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | La caja que muestra una sola imagen en grande | `openImageLightbox()` |
| `.nabi.is-fullscreen` | Pantalla completa — fija en la pantalla la caja `.nabi` | `setFullscreen()` (el nombre de la clase es `FULLSCREEN_CLASS`) |

Si conecta `mountViewTools()`, los dos botones abren y cierran esto por sí solos. Para
abrirlos a mano, llame a `openPreview({ nabi, editor })`,
`openImageLightbox({ editor, src, alt?, locale })`, `setFullscreen(root, on)` o
`isFullscreen(root)`.

::: tip El lugar de las herramientas se levanta solo
`mountViewTools` crea la caja `.nabi-tools` por sí mismo y la mete al frente del
recipiente que recibió. El host no tiene que poner un `<span>` antes de la barra de
herramientas — si ya deja preparado ese lugar, lo único que pasa es que quedan dos
cajas.
:::

También se pueden apuntar marcas exclusivas de la pantalla de edición —
`[data-nabi-token]` (color de token de un bloque de código), `[data-nabi-lang]` (lenguaje
de un bloque de código), `[data-color]` (resaltado y color de texto — se distinguen por
la etiqueta `<mark>` o `<span>`), `data-nabi-align` · `data-nabi-typeface` ·
`data-nabi-size` · `data-nabi-dropcap` (atributos de párrafo). El nombre real de estas
marcas tiene como fuente de verdad la constante `*_ATTR` de cada archivo de wing.

---

## Al dibujar el HTML guardado fuera del editor

El valor de salida (`getHtml()`) es HTML con los atributos `data-nabi-*` puestos, y
**no lleva ni un solo `style` en línea.** Eso significa que el aspecto es enteramente
cosa de la hoja de estilos, así que si se dibuja sin ella, queda un HTML desnudo sin
alineación, sin tamaño de letra y sin líneas de tabla.

Para que se vea igual que en el editor, envuélvalo en `.nabi-content` — esta clase
recibe los tokens de color y forma directamente aunque no esté envuelta en `.nabi`
(la regla `.nabi-content:where(:not(.nabi *))` de `nabi.css`).

```html
<div class="nabi-content">HTML guardado</div>
```

La hoja se conecta tal como se vio arriba en «Dos formas de conectar la hoja» — con un
bundler, `import 'nabi-note/nabi.css'`; si no, un `<link>`. Incluso en una página que no
levanta el editor, con solo tener `.nabi-content` la hoja del núcleo declara los
tokens.

### Comportamiento que corre del lado de lectura — ordenar tablas

Por ahora, **solo ordenar tablas** sale como una función exclusiva del lado de lectura.
Todavía no existe un sistema genérico para que un wing cualquiera cuelgue su propio
comportamiento de solo lectura.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'es' })
```

Busca las tablas con `data-nabi-sortable` y les pone botones de ordenar en la fila de
título. La función de desconexión (`detach`) devuelve tanto los botones puestos como el
orden de filas cambiado.

::: danger No lo conecte al elemento que se está editando
`attachTableSort()` clava botones en el DOM y cambia el orden de las filas. Si se guarda
el DOM mientras está conectado, eso queda fijado en el valor — conéctelo solo a una
copia de solo lectura del lado de lectura.
:::

---

## Próximos documentos

- [{{ t('menu_wing_custom') }}](../wing/custom) — crear a mano un formato que no existe
- [{{ t('menu_intro_index') }}](../intro) — el vocabulario que usa este documento

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
