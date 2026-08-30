---
title: Separador
description: Inserta una línea horizontal que separa el flujo del documento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Separador

Inserta una línea horizontal entre bloques. Escribir `---` en una línea vacía y pulsar Enter también crea un separador. Es un bloque sin contenido de texto.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
