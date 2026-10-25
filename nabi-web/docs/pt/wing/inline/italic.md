---
title: Itálico
description: Inclina o texto selecionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Itálico

Mostra o texto selecionado em itálico. É útil para diferenciar discretamente do corpo do texto os títulos de obras ou palavras estrangeiras. Clique novamente em um trecho que já esteja em itálico para remover o formato.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
