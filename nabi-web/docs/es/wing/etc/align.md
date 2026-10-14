---
title: Alineación
description: Cambia la alineación horizontal de párrafos y bloques de objeto.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Alineación

Alinea el párrafo actual, o los párrafos del rango seleccionado, a la izquierda, al centro o a la derecha. Los objetos que viven dentro de un párrafo, como imágenes, vídeos y tablas, se alinean mediante el párrafo que los envuelve.

La alineación se guarda como atributo de párrafo, no como formato de texto. Los bloques de código se excluyen de la alineación porque la indentación tiene significado propio.

Dentro de una celda, se alinea el párrafo interno o la imagen donde está el cursor. Al arrastrar para seleccionar varias celdas, se aplica a todos los párrafos e imágenes que admitan alineación en ellas. Si la selección combina alineaciones distintas, ningún botón de alineación aparece seleccionado.

Para alinear la propia tabla, pulsa **Seleccionar tabla** en sus herramientas contextuales o coloca el cursor antes o después de la tabla dentro del párrafo que la contiene, y usa los botones de alineación de la barra principal. La posición izquierda o derecha de un área flotante se cambia desde sus herramientas contextuales, no con los botones de alineación.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Para aplicar un comando a la selección actual, usa `l` para izquierda, `c` para centro y `r` para derecha.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
