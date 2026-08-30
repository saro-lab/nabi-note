---
title: Lista com marcadores
description: Liste vários itens sem numeração.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lista com marcadores

Transforma vários parágrafos em uma lista sem ordem. Tab e Shift+Tab mudam a profundidade do item, e Enter cria o próximo item. Em um parágrafo vazio, digitar `-` e pressionar Espaço também cria uma lista com marcadores.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
