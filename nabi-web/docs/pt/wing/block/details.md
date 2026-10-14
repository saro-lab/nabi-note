---
title: Detalhes
description: Agrupe um resumo e um corpo, e salve se começa aberto.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Detalhes

Agrupe um resumo curto e um corpo em um único bloco. Ao criá-lo pela barra, digite primeiro o resumo e continue com o conteúdo abaixo.

O estado de abertura definido pelo triângulo é salvo no documento e passa a ser o estado inicial da visualização publicada. Durante a edição, você também pode clicar no triângulo para abrir e fechar o bloco.

Dentro de uma célula ou de outro bloco, somente o bloco recolhível em questão abre ou fecha. Se o cursor ou a seleção estiver no conteúdo que está sendo fechado, ele é movido para fora; uma seleção em outro local é preservada.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Estilos CSS

Estilize o bloco com `.nabi-content details` e o título com `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

O atributo `open` é o estado inicial de abertura salvo pelo autor. CSS pode estilizar esse estado, mas é melhor não forçar o próprio estado.
