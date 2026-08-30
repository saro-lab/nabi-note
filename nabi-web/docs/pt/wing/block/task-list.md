---
title: Checklist
description: Uma lista que salva o estado de conclusão junto com o documento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Checklist

Transforma itens em uma lista com caixas de seleção. O estado marcado ou desmarcado é salvo no documento, por isso volta igual ao carregar. Em um parágrafo vazio, digitar `[ ]` ou `[x]` e pressionar Espaço também cria uma checklist.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
