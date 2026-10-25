---
title: Cita
description: Agrupa texto citado o un contexto separado en varios párrafos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Cita

Agrupa texto citado o un contexto separado en varios párrafos. Escribe `>` seguido de Espacio en un párrafo vacío, o convierte los párrafos seleccionados en una cita desde la barra de herramientas.

Una cita puede contener párrafos normales y bloques como listas e imágenes. Volver a convertir el mismo rango lo devuelve a párrafos fuera de la cita.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Estilos CSS

Puedes cambiar los bordes y el espaciado de las citas con `.nabi-content blockquote`.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Mantén la estructura de los párrafos dentro de `blockquote` y cambia solo la presentación, como los márgenes exteriores, los bordes y los colores.
