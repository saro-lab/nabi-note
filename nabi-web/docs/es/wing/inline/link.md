---
title: Enlace
description: Conecta direcciones web seguras y muestra adjuntos subidos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Enlace

Selecciona texto y asígnale una dirección. Si introduces una dirección sin seleccionar texto, la propia dirección se inserta como texto del enlace. Escribir una dirección `http://` o `https://` y después pulsar Espacio o Enter también la convierte en enlace.

Los enlaces solo guardan `http:`, `https:` y rutas del mismo sitio que empiezan por `.` o `/`. Se rechazan direcciones cuyo origen no pueda identificarse claramente, como `javascript:` o `//example.com`. Los enlaces de adjuntos creados por subidas también guardan información de archivo y no pueden crearse manualmente como enlaces normales.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Estilos CSS

Da estilo a los enlaces normales con `.nabi-content a`, y a los enlaces de adjunto por separado con `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Las partes `::before` y `::after` de los enlaces de adjunto se usan para mostrar el icono de archivo y la extensión, así que normalmente conviene no reemplazar ni quitar su `content`.
