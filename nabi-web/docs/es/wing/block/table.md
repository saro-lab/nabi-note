---
title: Tabla
description: Crea filas y columnas, edita celdas y admite ordenación de columnas.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabla

Inserta una tabla y edita filas, columnas y celdas. Las operaciones de añadir o eliminar filas y columnas, fusionar celdas y alternar celdas de encabezado actúan alrededor de las celdas seleccionadas. Para usar la ordenación de columnas en la vista publicada después de guardar una tabla como ordenable, conecta `attachViewer()` de `nabi-note/viewer`. Las tablas con celdas fusionadas no se ordenan.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## Estilos CSS

Da estilo a la tabla con `.nabi-content table`, y a las celdas con `.nabi-content :is(th, td)`. No cambies la estructura de las celdas ni el botón de ordenación que inserta el viewer.

```css
.article-body table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.article-body :is(th, td) {
  border: 1px solid var(--nabi-line);
  padding: .55rem .7rem;
}
```

Si el viewer está conectado, conserva el botón `.nabi-sort`. Si fuerzas `position` o el padding derecho de las celdas, puede superponerse con el botón de ordenación.
