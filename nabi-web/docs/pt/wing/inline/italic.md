---
title: Itálico
description: Inclina o texto selecionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Itálico

Inclina o texto selecionado. Aplicar novamente ao mesmo intervalo remove a formatação, e a marca é preservada nos documentos salvos.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
