---
title: Cambiar el estilo
description: Cómo personalizar los colores, la tipografía, el espaciado y otros estilos de NABI NOTE mediante variables CSS.
---

# Cambiar el estilo

**La propia aplicación host conecta la hoja de estilos** — con un bundler basta la línea `import 'nabi-note/nabi.css'`; con un CDN, una etiqueta `<link>`. Después de eso, basta sobrescribir las variables CSS que se necesiten para que todo el tema del editor cambie de forma coherente.

Todos los componentes de la interfaz de NABI NOTE están **estilizados únicamente con variables CSS `--nabi-*`, sin ningún color literal escrito a mano**, así que basta con sobrescribir las variables para ajustar la marca fácilmente.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

La razón de repetir el selector de clase tres veces está en la sección [Guía de especificidad CSS](#guía-de-especificidad-css) más abajo.

::: tip El HTML guardado no lleva estilos en línea
El HTML que produce el editor (`getHtml()`) **no lleva ningún atributo `style` en línea.** El marcado solo indica la estructura semántica y los atributos (como `data-nabi-align="center"`), y la presentación visual queda a cargo de la hoja de estilos. Por eso, para renderizar el HTML guardado en una página externa con el mismo aspecto que en el editor, hay que colocarlo **dentro de un contenedor `.nabi-content` con `nabi.css` aplicado**.

Vea la sección [Al dibujar el HTML guardado fuera del editor](#al-dibujar-el-html-guardado-fuera-del-editor) más abajo para más detalles.
:::

::: tip Los temas claro y oscuro ya vienen incluidos
El host no necesita definir ninguna variable adicional para el tema por defecto. La hoja del núcleo ya incluye los valores por defecto del modo claro, el tema `.dark` y el tema explícito `.light`.
:::

## Tokens de color y tema

| Token | Sentido | Valor por defecto (claro) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | Fondo · superficie ligeramente hundida | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | Texto · texto apagado · texto sobre el color de acento | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | Línea · color de acento principal (foco/activo) | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | Peligro · texto sobre él | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | Sombra del desplegable · fondo oscuro del modal/vista previa | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | Bordes redondeados (por defecto · pequeño · mínimo) | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | Bordes redondeados de las capas emergentes (panel, vista previa, lightbox) | `.25rem` |
| `--nabi-z-sticky` | Índice de capa de la fila que queda pegada | `20` |
| `--nabi-grid-cell` | Tamaño de celda de la rejilla, por ejemplo la de insertar tabla | `1.125rem` |
| `--nabi-hl-yellow` · `green` · `cyan` · `pink` · `purple` · `orange` | Los seis colores de resaltado | Colores translúcidos |
| `--nabi-tc-green` · `coral` · `violet` · `amber` · `blue` | Los cinco colores de texto | Colores intensos |

Las variables de la tabla anterior son tokens que la hoja del núcleo (`nabi.css`) **declara directamente.** No solo se vinculan a `.nabi`, sino a tres selectores — `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))` — para permitir el renderizado independiente.

## Tokens solo de referencia (se pueden declarar en :root)

Las variables de abajo son tokens que el núcleo **no declara directamente, solo referencia** en forma de `var(--token, valor de reserva)`. Si el host no da un valor, se aplica el valor de reserva indicado. Como no están declaradas a nivel del núcleo, **se pueden declarar en `:root` para que se apliquen globalmente.**

| Token | Sentido | Valor de reserva |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | La tipografía que realmente se conecta al editor y a cada rama del wing de tipografía | Tipografía del sistema |
| `--nabi-cursive-adjust` | La proporción de `font-size-adjust` de la fuente cursiva | `0.4` |
| `--nabi-sticky-top` | El desplazamiento superior de la barra de herramientas pegada (se ajusta a la altura de una cabecera fija del sitio) | `0px` |
| `--nabi-preview-width` | El ancho por defecto de la tarjeta de vista previa | `720px` |
| `--nabi-placeholder` | El texto guía que se muestra en un editor vacío | ninguno |
| `--nabi-placeholder-color` | El color de ese texto guía (si no se indica, se usa el color de reserva de cada tema) | `--nabi-placeholder-color-fallback` |
| `--nabi-content-min-height` | La altura mínima del área de edición vacía (se aplica solo a la superficie de edición, `.nabi-editing`) | `12.5rem` |
| `--nabi-touch-font-size` | El tamaño de letra de los campos de formulario (`.nabi-input`) en dispositivos táctiles (`pointer: coarse` o ancho de 40rem o menos) — evita el zoom automático de Safari en iOS | `16px` |

`--nabi-typeface-base` no es solo de referencia — **lo declara el núcleo directamente** (por defecto referencia `--nabi-font`). Para cambiar la tipografía por defecto, sobrescriba `--nabi-font`.

`--nabi-keyboard-top` y `--nabi-keyboard-bottom` son variables internas que **`mountSticky()` mide y escribe dinámicamente** a partir de la altura del teclado móvil.

`--nabi-bar-height` es, del mismo modo, una variable interna que **`mountSticky()` mide y escribe** a partir de la altura real de la barra de herramientas. Se usa como `scroll-margin-block-start` en los elementos `.nabi-content > *` para que no queden ocultos bajo la barra al desplazarse hasta ellos.

## Lugares sin token — se sobrescribe la regla

Las tres propiedades de abajo están definidas como reglas CSS fijas en lugar de variables, así que para cambiarlas hay que sobrescribir directamente el selector de clase correspondiente.

**Los cuatro niveles de tamaño de letra** (en `em`, relativos al tamaño del padre):

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**El tamaño de la letra capital**:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**El color de los tokens del bloque de código**:

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

---

## Convenciones de unidades

La mayoría de las medidas de la interfaz — el tamaño de los botones, el espaciado, la altura de la barra de herramientas — están definidas en `rem`, así que **escalan en proporción al tamaño de letra de la raíz (`html`).** Si la persona agranda el tamaño de letra por defecto en el navegador o el sistema, la interfaz del editor crece con ella de forma natural.

---

## Guía de especificidad CSS

Al sobrescribir una variable de color del tema declarada por el núcleo, se recomienda **repetir la clase tres veces** para elevar con seguridad la prioridad del estilo.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: #7c3aed;
}
```

- La regla del valor por defecto claro, `:is(.nabi, …)`, tiene una especificidad de **(0, 1, 0)**.
- La regla del modo oscuro, `:where(html, body).dark :is(.nabi, …)`, tiene una especificidad de **(0, 2, 0)**.
- Por eso, repetir la clase tres veces como en `.nabi.nabi.nabi` da una especificidad de **(0, 3, 0)**, que siempre gana sin depender del orden de carga del CSS.

El modal de vista previa se monta como hijo directo de `body`, así que hace falta especificar también el selector `.nabi-scrim.nabi-scrim.nabi-scrim` para que se aplique ahí el mismo color del tema.
Los tokens solo de referencia que el núcleo no declara, como los de tipografía, se aplican correctamente con una sola declaración en `:root`.

---

## Tema claro / oscuro

El tema oscuro se aplica cuando el elemento `html` o `body` lleva la clase `dark`, y el claro cuando lleva la clase `light`. Sin ninguna clase, se aplica el tema claro por defecto, y si están las dos clases, gana la clase explícita `light`.

```html
<html class="dark"><!-- o <body class="dark"> --></html>
```

Cambiar de tema solo requiere alternar la clase — no hay que llamar a ninguna API de JavaScript aparte. Al escribir estilos propios, usar variables `--nabi-*` hace que sus colores también sigan automáticamente el cambio de tema.

---

## Formas de conectar la hoja de estilos

**1. Importar el archivo CSS completo** (la forma más habitual y recomendada)

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**2. Inyectar dinámicamente solo el estilo de los wings registrados**

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// al llamar a drop() se retira del DOM el estilo inyectado
```

Un mismo contenido de hoja de estilos nunca se inyecta dos veces — se gestiona como una sola etiqueta.
En un entorno de renderizado en el servidor (SSR), es mejor cargar el archivo CSS estático en lugar de inyectarlo, para evitar un destello de contenido sin estilo (FOUC) antes de que se ejecute el JS del cliente.

---

## Clases CSS y elementos de la interfaz que se pueden personalizar

| Selector | Qué es | Quién lo crea |
|---|---|---|
| `.nabi` | El contenedor de más alto nivel que envuelve todo el editor (barra de herramientas + área de edición) | el host |
| `.nabi-content[contenteditable]` | El área de edición del cuerpo propiamente dicha | el host |
| `.nabi-toolbar` | El contenedor de cabecera fija que envuelve la barra de herramientas y la barra contextual | el host |
| `.nabi-toolbar-row` | La fila de botones de la barra de herramientas principal | `mountToolbar()` |
| `.nabi-context` | El contenedor de la barra de herramientas contextual dinámica | `mountContextToolbar()` |
| `.nabi-tools` | El envoltorio de los botones de vista previa y pantalla completa | `mountViewTools()` |
| `.nabi-hints [data-hint]` | La insignia de atajos que aparece al pulsar Shift dos veces rápido | `mountHints()` |
| `[data-nabi-tip]` | El tooltip de un botón (se dibuja con `::after` de CSS) | componentes del núcleo |
| `.nabi-content.nabi-dropping` | El área de edición mientras se arrastra un archivo sobre ella | `mountUpload()` |

### Modales y elementos emergentes

| Selector | Qué es | Función que lo crea |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > `.nabi-content.nabi-preview-body` | El modal de vista previa del documento | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | El popup de lightbox de imagen | `openLightbox()` |
| `.nabi-scrim` > `.nabi-card.nabi-choose` | El popup para elegir el formato de pegado | `openChoosePanel()` |
| `.nabi-scrim` > `.nabi-card.nabi-save` | El popup de guardar archivo (nombre y selección de formato) | `openSavePanel()` |
| `.nabi.is-fullscreen` | La clase que activa el modo de pantalla completa del editor | `setFullscreen()` |

---

## Al dibujar el HTML guardado fuera del editor

El HTML extraído con `getHtml()` está compuesto solo por marcado semántico y atributos `data-nabi-*`, sin ningún `style` en línea.
Para renderizarlo en una página externa con el mismo estilo que en el editor, envuelva el cuerpo en una clase `.nabi-content` y cargue `nabi.css`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">

<div class="nabi-content">
  <!-- cuerpo HTML guardado con nabi.getHtml() -->
</div>
```

Aunque no lo envuelva en `.nabi`, los tokens de tema y tipografía se aplican al propio `.nabi-content`, así que puede reproducir exactamente el estilo que se veía en el editor.

### Activar el ordenamiento de tablas de solo lectura

Para activar el ordenamiento de columnas de tabla en una página HTML publicada, conecte la función `attachTableSort`.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'es' })
```

Detecta las tablas que llevan el atributo `data-nabi-sortable` y añade botones de ordenar en las celdas de encabezado. Al llamar a la función `detach()` devuelta, se quitan los botones del DOM añadidos y se restaura el orden original de las filas.

::: warning No aplique attachTableSort a un DOM que se está editando
`attachTableSort()` manipula directamente la estructura del DOM, así que aplicarlo a un área del editor que todavía se está editando puede grabar permanentemente la interfaz de los botones de orden en el cuerpo del documento. Úselo únicamente en una pantalla de visor de solo lectura.
:::

---

## Próximos documentos

- [{{ t('menu_wing_custom') }}](../wing/custom) — crear a mano un nuevo wing de formato personalizado
- [{{ t('menu_intro_index') }}](../intro) — introducción a NABI NOTE y su arquitectura

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
