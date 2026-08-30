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

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
