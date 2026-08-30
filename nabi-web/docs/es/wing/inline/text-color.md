---
title: Color de texto
description: Aplica un nombre de color permitido al texto seleccionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Color de texto

Aplica un nombre de color al texto seleccionado. El valor guardado no es una cadena de color CSS: es un nombre permitido, y el color real se define con la variable CSS `--nabi-tc-<name>`. Así el mismo documento puede seguir siendo legible en temas claros y oscuros.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

Si se omite `values`, la paleta predeterminada es `green`, `coral`, `violet`, `amber` y `blue`. Si reduces la lista, los demás colores se rechazan en los comandos y al cargar documentos.

## Estilos CSS

El documento guarda solo nombres de color. Define los colores reales del editor y de la vista publicada con variables CSS.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Comprueba el contraste junto con el color de fondo. En un tema oscuro, el mismo nombre de color puede recibir otro valor.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
