---
title: Tipo de letra
description: Aplica una familia tipográfica al texto seleccionado o a un párrafo.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tipo de letra

Aplica una familia tipográfica al texto seleccionado. Si hay un rango seleccionado, solo cambia ese rango; si solo hay cursor, se aplica al texto del párrafo actual. Los archivos de fuente reales y los valores `font-family` se definen en el CSS del servicio.

Las familias predeterminadas son `sans`, `serif`, `mono` y `cursive`. Especialmente en servicios que incluyen coreano u otro contenido multilingüe, conviene decidir explícitamente qué fuentes usará cada familia.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

Si se omite `values`, se usan todas las familias predeterminadas. En los documentos solo se permiten los valores incluidos en `values`.

## Estilos CSS

El documento guarda solo el nombre de la familia, y el CSS elige los archivos de fuente. Cambia las variables en el mismo contenedor para el editor y la vista publicada.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Si usas fuentes web, carga primero esos archivos de fuente. `cursive` suele tener poca cobertura para muchos idiomas, así que es mejor ofrecerlo solo después de elegir la fuente real que usará tu servicio.
