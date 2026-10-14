---
title: Lista com marcadores
description: Liste vários itens sem numeração.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lista com marcadores

Uma lista com marcadores apresenta vários itens sem ordem. Digite `-` seguido de Space em um parágrafo vazio ou altere pela barra de ferramentas. Também é possível agrupar os parágrafos selecionados em uma lista de uma só vez.

Dentro da lista, Tab aumenta o recuo em um nível e Shift+Tab o reduz. Enter cria o próximo item; pressioná-lo novamente em um item vazio encerra a lista. Shift+Enter insere uma quebra de linha no item sem dividi-lo.

Listas dentro de células seguem as mesmas regras de entrada. Em uma lista, Tab aumenta o recuo em vez de passar para outra célula.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
