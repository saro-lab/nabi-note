---
title: Encabezado
description: Convierte un párrafo en encabezado y elige su nivel.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Encabezado

Convierte el párrafo actual en un encabezado de nivel 1 a 6. Escribir `#` y pulsar Espacio en un párrafo vacío también lo convierte en encabezado. El nivel se guarda como atributo de párrafo, no como formato de texto.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
