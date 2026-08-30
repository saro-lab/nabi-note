---
title: Citação
description: Agrupe texto citado ou contexto separado em vários parágrafos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Citação

Agrupe uma frase de outro texto, ou conteúdo que você quer separar do fluxo principal, como uma citação. Uma citação pode conter vários parágrafos e blocos. Em uma linha vazia, digitar `>` e pressionar Espaço também cria uma citação.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Estilos CSS

Use `.nabi-content blockquote` para alterar a aparência da citação. Mantenha espaço interno suficiente para que vários parágrafos não fiquem colados.

```css
.article-body blockquote {
  border-inline-start: 4px solid var(--nabi-accent);
  padding: .5rem 1rem;
  background: var(--nabi-soft);
}
```
