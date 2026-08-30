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
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Si pones los mismos tokens en un padre común del editor y de la pantalla publicada, ambos mantienen el mismo tono visual.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
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

El resaltado y el color de texto se cambian con `--nabi-hl-<name>` y `--nabi-tc-<name>`. Por ejemplo, si cambias `--nabi-hl-yellow`, solo cambia el color visible del resaltado `yellow` guardado en el documento.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Modo oscuro

El modo claro es el predeterminado. Si añades `.dark` al `html` o al `body`, o si pones `data-nabi-theme="dark"` en un editor o pantalla publicada concretos, se aplica el modo oscuro.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Usa `data-nabi-theme="light"` si quieres cortar la influencia de un `.dark` superior. El cambio de tema lo gestiona el servicio; el paquete no sigue automáticamente `prefers-color-scheme`.

```css
.dark .brand-note {
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
  --nabi-font: "Source Serif 4", Georgia, serif;
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
