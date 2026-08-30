---
title: Imagem
description: Insira uma URL de imagem e ajuste largura e alinhamento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Imagem

Insira uma URL de imagem e ajuste sua largura e alinhamento. Por padrão, endereços são limitados a `http:`, `https:` ou caminhos do mesmo site, e uma nova imagem começa centralizada com 60% de largura.

A largura é salva apenas em passos fixos, e o alinhamento é salvo no parágrafo que envolve a imagem. Para usar prévias `blob:` ou `data:image/...`, permita URLs locais explicitamente tanto no wing de imagem quanto na montagem do editor. URLs de dados SVG não são permitidas.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Este wing insere um endereço no documento; ele não faz upload de arquivos. Para enviar arquivos a um servidor, conecte o [wing de upload](/pt/wing/etc/upload).

## Estilos CSS

Estilize imagens com `.nabi-content img`. Mantenha intactos a largura e o alinhamento salvos, e altere apenas detalhes visuais como bordas ou sombras.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Mantenha as regras padrão de `max-inline-size`, `block-size`, largura e alinhamento. O tamanho da imagem é salvo no documento, então forçar uma largura CSS fixa pode conflitar com a largura escolhida pelo autor.
