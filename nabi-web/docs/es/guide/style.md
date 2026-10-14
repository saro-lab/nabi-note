---
title: Temas CSS
description: Configura colores, fuentes, tamaños y modo oscuro para el editor y el contenido publicado con variables CSS.
---

# Temas CSS

NABI NOTE aplica el mismo CSS al editor y a la pantalla publicada. La forma más segura es cargar una vez el CSS del paquete y sobrescribir solo las variables CSS necesarias en el contenedor de tu servicio.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Asigna la misma clase de tema al `.nabi` del editor y al `.nabi-content` de la vista publicada para aplicarles las mismas variables. Carga el CSS del servicio después del CSS del paquete e indica el tema actual con `data-nabi-theme`.

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Variables que se cambian con frecuencia

| Uso | Variables |
| --- | --- |
| Texto y fondo | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Líneas y color de énfasis | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Bordes redondeados y sombras | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Fuente base | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Área de edición | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Barra fija y vista previa | `--nabi-sticky-top`, `--nabi-preview-width` |
| Entorno táctil | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Ancho de activación del modo móvil | `--nabi-mobile-breakpoint` |

El resaltado y el color del texto usan `--nabi-hl-<name>` y `--nabi-tc-<name>`. Los fondos de celda usan `--nabi-cell-<name>` con `yellow`, `green`, `cyan`, `pink`, `purple` y `orange`. Las variables solo cambian el color mostrado, no el nombre guardado.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

El tema predeterminado muestra fondos de celda suaves. El modo oscuro conserva los nombres, pero usa colores propios más claros y menos saturados para distinguirlos mejor sobre superficies oscuras. Son translúcidos y dejan ver el fondo; al personalizarlos, comprueba el contraste del texto sobre el fondo real de la página. Para sobrescribir las variables de color predeterminadas, aplica la clase de tema al elemento real del editor o del contenido publicado, como arriba, y no a un padre exterior arbitrario.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Umbral del modo móvil

La barra predeterminada `layout: 'compact'` pasa a una fila móvil cuando la pantalla mide menos de `36rem`. Con exactamente `36rem` conserva la disposición de escritorio. En escritorio, todas las herramientas se distribuyen en varias filas aunque el editor sea estrecho. Las propiedades de objetos también se ajustan debajo; ambas filas ocupan espacio sobre el texto. En pantalla completa se despliegan todas las herramientas independientemente del ancho.

En móvil permanecen en la barra principal las herramientas rápidas, el botón de todas las herramientas y los botones conectados de vista previa/pantalla completa. Siguen disponibles cuando aparecen las propiedades. La paleta mantiene el mismo orden de grupos y separadores que el escritorio. `layout: 'wrap'` siempre muestra todas las herramientas con ajuste de línea.

Los paneles móviles se abren en el espacio disponible alrededor de la barra y las propiedades. El selector de tamaño de tabla es una excepción: se abre centrado sobre un fondo translúcido con una cuadrícula táctil de 5×5. No espera a que se cierre el teclado; elegir un tamaño inserta una tabla y cierra el selector.

Define `--nabi-mobile-breakpoint` en `:root`, un ancestro o un `.nabi` individual para cambiar el umbral. Usa longitudes CSS no negativas como `rem`, `px` o `calc()`. Los cambios del valor CSS, el tamaño de fuente raíz o el ancho de pantalla actualizan automáticamente los paneles abiertos. Los paneles de entrada movidos bajo `body` conservan el umbral de su editor original.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Las regiones flotantes tienen un umbral independiente para pasar a una columna: el contenedor del texto, no la pantalla, debe medir menos de `36rem`. La impresión usa la misma disposición.

## Modo oscuro

El modo claro es el predeterminado. Si añades `.dark` al `html` o al `body`, o si pones `data-nabi-theme="dark"` en un editor o pantalla publicada concretos, se aplica el modo oscuro.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Usa `data-nabi-theme="light"` si quieres cortar la influencia de un `.dark` superior. El cambio de tema lo gestiona el servicio; el paquete no sigue automáticamente `prefers-color-scheme`.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Aplica CSS también a la pantalla publicada

El HTML publicado necesita `.nabi-content` y el mismo CSS. Sin JavaScript también se aplican los estilos de tablas, código, imágenes, checklists y letras capitulares. Añade `nabi-note/viewer` solo cuando necesites comportamiento, como ordenación de tablas o coloreado de código.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

Define en la clase de tu servicio el layout que no pertenece al paquete, como el ancho del cuerpo y la altura de línea.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Lo que no debes cambiar en la pantalla de edición

No cambies `display` ni `white-space` en nodos `[data-key]` durante la edición. Evita también añadir pseudo-elementos dentro del texto editable o bloquear el comportamiento de puntero en wrappers de objetos. Estos cambios pueden desalinear la posición del cursor y la posición del documento en el DOM.

Las letras capitulares se muestran con `::first-letter` en la pantalla publicada, pero en la pantalla de edición usan un elemento real `[data-nabi-dropcap-letter]`. No añadas otra regla `::first-letter` dentro de `.nabi-editing` ni sustituyas ese elemento.
