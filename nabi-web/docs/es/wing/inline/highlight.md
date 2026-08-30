---
title: Resaltado
description: Aplica un color de resaltado permitido detrás del texto seleccionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Resaltado

Aplica un color de resaltado detrás del texto seleccionado. Los datos guardados conservan solo nombres de color permitidos, no valores CSS arbitrarios, para que los datos del documento y el estilo visual sigan separados.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

Si se omite `values`, se usa la paleta predeterminada: `yellow`, `green`, `cyan`, `pink`, `purple` y `orange`. Si reduces la lista, los colores no registrados no se conservan ni siquiera al cargar un documento existente.

## Estilos CSS

El documento guarda solo nombres de color. Cambia los colores del editor y de la vista publicada mediante variables CSS.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Cambiar varios colores a la vez permite mantener los nombres de color del documento y adaptar solo el tono visual del producto.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
