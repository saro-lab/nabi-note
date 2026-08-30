---
title: YouTube
description: Incorpore um vídeo do YouTube ao documento e ajuste sua largura.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Cole um endereço do YouTube ou use o botão do YouTube para inserir um vídeo. O documento guarda apenas o ID de 11 caracteres do vídeo e a largura, não a URL completa, e um novo vídeo começa centralizado com 70% de largura.

A largura é escolhida em passos fixos, e o alinhamento é salvo no parágrafo que envolve o vídeo. No editor, o primeiro clique seleciona o vídeo; depois de selecionado, outro clique pode reproduzi-lo. Para mudar o endereço, apague o vídeo e insira um novo.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## Estilos CSS

Use `.nabi-content iframe` para alterar borda ou cantos do vídeo. Não altere a largura nem o alinhamento salvos.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

O pacote usa `aspect-ratio`, largura e margens de alinhamento para manter o vídeo no tamanho correto, portanto não os sobrescreva.
