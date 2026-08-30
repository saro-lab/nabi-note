---
title: Borrar formato
description: Quita formato de texto y formato de párrafo de la selección.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Borrar formato

Quita de una vez el formato de texto del rango seleccionado. Incluye las marcas predeterminadas registradas, como negrita, color y tipo de letra, además de atributos de párrafo como encabezado, alineación y drop cap. Pulsar Esc dos veces rápido ejecuta la misma acción.

No convierte estructuras del documento como listas, tablas, citas o imágenes en texto plano. La alineación exterior de imágenes y vídeos, y los enlaces de adjunto creados por subidas, se mantienen.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Los wings de formato que quieras borrar también deben estar seleccionados; si no, su formato no podrá eliminarse.
