---
title: Limpar formatação
description: Remove formatação de texto e de parágrafo da seleção.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Limpar formatação

Remove de uma vez a formatação de texto do intervalo selecionado. Marcas padrão registradas, como negrito, cor e tipo de letra, e atributos de parágrafo, como título, alinhamento e capitular, estão incluídos. Pressionar Esc duas vezes rapidamente executa a mesma ação.

Ela não transforma estruturas do documento, como listas, tabelas, citações ou imagens, em texto simples. O alinhamento externo de imagens e vídeos, e links de anexo criados por uploads, permanecem como estão.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Os wings de formatação que você quer limpar também precisam estar selecionados; caso contrário, sua formatação não pode ser removida.
