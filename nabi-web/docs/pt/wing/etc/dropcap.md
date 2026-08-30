---
title: Capitular
description: Comece o texto do corpo com uma primeira letra grande.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Capitular

Coloca a primeira letra de um parágrafo em tamanho maior e permite que as linhas seguintes fluam ao lado dela. É uma formatação de nível de parágrafo, portanto não é aplicada apenas a parte de uma palavra selecionada.

A vista publicada e a vista de edição mantêm a mesma forma. Durante a edição, a primeira letra é envolvida por um elemento real para que posições de cursor e apagar não se desloquem; esse elemento não é incluído no conteúdo salvo do documento.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## Estilos CSS

A vista publicada e a vista de edição usam seletores diferentes para a primeira letra. A vista publicada usa `[data-nabi-dropcap="1"]::first-letter`, enquanto a vista de edição usa o elemento real `[data-nabi-dropcap-letter]`. Ao alterar valores visíveis como cor, fonte ou tamanho, escreva os dois seletores juntos para que edição e saída publicada tenham a mesma aparência.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Se você alterar tamanho e altura de linha, aplique os mesmos valores aos dois seletores.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Capitulares calculam o fluxo das linhas ao redor da primeira letra, portanto mudar apenas um lado ou usar valores grandes demais pode quebrar a forma WYSIWYG. Ainda assim, evite adicionar uma nova regra `::first-letter` ao editor. No editor, estilize apenas o `[data-nabi-dropcap-letter]` existente.
