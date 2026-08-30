---
title: Título
description: Transforme um parágrafo em título e escolha seu nível.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Título

Transforma o parágrafo atual em um título de nível 1 a 6. Digitar `#` e pressionar Espaço em um parágrafo vazio também o transforma em título. O nível é salvo como atributo de parágrafo, não como formatação de texto.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
