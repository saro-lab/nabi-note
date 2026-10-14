---
title: Título
description: Transforme um parágrafo em título e escolha seu nível.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Título

Transforme um parágrafo em título e defina seu nível. Ative o título na barra e escolha de H1 a H6, ou digite de `#` a `######` seguido de Space em um parágrafo vazio.

O título é um atributo salvo no parágrafo, não um tipo de bloco separado. Pressionar o título novamente restaura um parágrafo comum, permitindo alterar apenas o nível sem mudar a estrutura do conteúdo.

Em células comuns, você pode transformar os parágrafos internos em títulos. Títulos não se aplicam a células de cabeçalho, e converter uma célula em cabeçalho também remove a formatação de título existente. Ao selecionar vários parágrafos, a barra mostra um único valor ativo somente se todos tiverem o mesmo nível de título.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
