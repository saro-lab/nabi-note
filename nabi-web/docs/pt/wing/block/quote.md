---
title: Citação
description: Agrupe texto citado ou contexto separado em vários parágrafos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Citação

Agrupa texto citado ou um contexto separado em vários parágrafos. Digite `>` seguido de Espaço em um parágrafo vazio ou transforme os parágrafos selecionados em citação pela barra de ferramentas.

Uma citação pode conter parágrafos comuns e blocos como listas e imagens. Converter o mesmo trecho novamente devolve seu conteúdo aos parágrafos externos.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Estilos CSS

Use `.nabi-content blockquote` para mudar as bordas e o espaçamento das citações.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Mantenha a estrutura dos parágrafos dentro de `blockquote` e altere apenas a apresentação, como margens externas, bordas e cores.
