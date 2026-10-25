---
title: Subscrito
description: Abaixa o texto selecionado abaixo da linha de base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subscrito

Mostra o texto selecionado em tamanho menor abaixo da linha de base. É adequado para notações que precisam de subscritos, como a fórmula química `H₂O`. Esse formato não adiciona cálculo de fórmulas; use-o para preservar a própria notação.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
