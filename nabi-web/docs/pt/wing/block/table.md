---
title: Tabela
description: Crie linhas e colunas, edite células e ofereça ordenação de colunas.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabela

Insira uma tabela e edite linhas, colunas e células. Adicionar e remover linhas ou colunas, mesclar células e alternar células de cabeçalho operam ao redor das células selecionadas. Para usar ordenação de colunas na vista publicada depois de salvar uma tabela como ordenável, conecte `attachViewer()` de `nabi-note/viewer`. Tabelas com células mescladas não são ordenadas.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## Estilos CSS

Estilize a tabela com `.nabi-content table`, e as células com `.nabi-content :is(th, td)`. Não altere a estrutura das células nem o botão de ordenação inserido pelo viewer.

```css
.article-body table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.article-body :is(th, td) {
  border: 1px solid var(--nabi-line);
  padding: .55rem .7rem;
}
```

Se o viewer estiver conectado, mantenha o botão `.nabi-sort`. Se você sobrescrever à força `position` ou o padding direito das células, ele pode se sobrepor ao botão de ordenação.
