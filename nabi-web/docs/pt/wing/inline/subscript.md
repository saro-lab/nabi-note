---
title: Subscrito
description: Abaixa o texto selecionado abaixo da linha de base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subscrito

Abaixa o texto selecionado abaixo da linha de base, para fórmulas químicas e índices. Aplicar novamente remove a formatação.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
