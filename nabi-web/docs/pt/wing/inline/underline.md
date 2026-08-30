---
title: Sublinhado
description: Sublinha o texto selecionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Sublinhado

Sublinha o texto selecionado. Aplicar novamente ao mesmo intervalo remove a formatação, e a marca é preservada nos documentos salvos.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
