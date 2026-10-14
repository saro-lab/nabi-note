---
title: Lista numerada
description: Transforme itens ordenados em uma lista numerada.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lista numerada

Crie uma lista numerada para itens cuja ordem importa. Em um parágrafo vazio, digite um número e um ponto, como `1.`, seguido de Space, ou converta os parágrafos selecionados pela barra.

Os números exibidos são calculados pela posição dos itens, então a sequência continua automaticamente ao adicionar itens ou alterar o recuo. O número inicial digitado não é salvo para começar a contagem em um valor arbitrário.

Enter cria o próximo item e Shift+Enter apenas insere uma quebra de linha no item atual. Tab e Shift+Tab aumentam e reduzem o recuo; nas células, o recuo da lista também tem prioridade sobre a navegação entre células.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
