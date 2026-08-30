---
title: Tachado
description: Risca o texto selecionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tachado

Risca o texto selecionado. Aplicar novamente ao mesmo intervalo remove a formatação, e a marca é preservada nos documentos salvos.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
