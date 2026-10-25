---
title: Subrayado
description: Subraya el texto seleccionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subrayado

Subraya el texto seleccionado. Aunque puede parecer un enlace, solo es un formato de texto: no añade una dirección ni una acción de navegación.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
