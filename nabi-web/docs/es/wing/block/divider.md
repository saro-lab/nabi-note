---
title: Separador
description: Inserta una línea horizontal que separa el flujo del documento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Separador

Una línea horizontal que separa el flujo del documento. Escribe tres o más guiones en un párrafo vacío y pulsa Intro, o insértala desde la barra de herramientas.

Un separador es un bloque independiente sin texto, por lo que no contiene formatos como títulos o colores. Se usa solo para separar los párrafos anteriores y posteriores.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
