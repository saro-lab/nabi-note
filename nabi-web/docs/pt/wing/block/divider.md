---
title: Divisor
description: Insere uma linha horizontal que separa o fluxo do documento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Divisor

Uma linha horizontal que separa o fluxo do documento. Digite três ou mais hífens em um parágrafo vazio e pressione Enter, ou insira pela barra de ferramentas.

O separador é um bloco independente sem texto, portanto não contém formatos como títulos ou cores. Use-o apenas para separar os parágrafos anteriores e posteriores.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
