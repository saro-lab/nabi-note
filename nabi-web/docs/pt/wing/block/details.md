---
title: Detalhes
description: Agrupe um resumo e um corpo, e salve se começa aberto.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Detalhes

Agrupa um resumo e um corpo que pode ser aberto e fechado. O estado aberto é salvo junto com o documento, então leitores veem o bloco como o autor deixou.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Estilos CSS

Estilize o contêiner com `.nabi-content details` e o cabeçalho com `.nabi-content summary`. Não esconda o `summary`, porque ele é o controle que abre e fecha o bloco.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: 12px;
}

.article-body summary {
  cursor: pointer;
  font-weight: 700;
}
```
