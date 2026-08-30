---
title: Divisor
description: Insere uma linha horizontal que separa o fluxo do documento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Divisor

Insere uma linha horizontal entre blocos. Digitar `---` em uma linha vazia e pressionar Enter também cria um divisor. É um bloco sem conteúdo de texto.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
