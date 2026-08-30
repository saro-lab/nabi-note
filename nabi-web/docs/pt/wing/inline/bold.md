---
title: Negrito
description: Exibe o texto selecionado em negrito.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Negrito

Deixa o texto selecionado em negrito. Aplicar novamente ao mesmo intervalo remove a formatação. A marca permanece com o texto nos documentos salvos.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
