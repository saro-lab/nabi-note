---
title: Alinhamento
description: Altere o alinhamento horizontal de parágrafos e blocos de objeto.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Alinhamento

Alinhe o parágrafo atual, ou os parágrafos no intervalo selecionado, à esquerda, ao centro ou à direita. Objetos que vivem dentro de um parágrafo, como imagens, vídeos e tabelas, são alinhados pelo parágrafo que os envolve.

O alinhamento é salvo como atributo de parágrafo, não como formatação de texto. Blocos de código são excluídos do alinhamento porque a indentação tem significado próprio.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
