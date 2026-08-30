---
title: Lista numerada
description: Transforme itens ordenados em uma lista numerada.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lista numerada

Transforma parágrafos em uma lista em que a ordem importa. Os números são recalculados automaticamente quando você insere, remove ou move itens. Em um parágrafo vazio, digitar `1.` e pressionar Espaço também cria uma lista numerada.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
