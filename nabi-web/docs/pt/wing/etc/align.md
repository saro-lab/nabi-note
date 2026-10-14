---
title: Alinhamento
description: Altere o alinhamento horizontal de parágrafos e blocos de objeto.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Alinhamento

Alinhe o parágrafo atual, ou os parágrafos no intervalo selecionado, à esquerda, ao centro ou à direita. Objetos que vivem dentro de um parágrafo, como imagens, vídeos e tabelas, são alinhados pelo parágrafo que os envolve.

O alinhamento é salvo como atributo de parágrafo, não como formatação de texto. Blocos de código são excluídos do alinhamento porque a indentação tem significado próprio.

Dentro de uma célula, o alinhamento se aplica ao parágrafo interno ou à imagem na posição do cursor. Selecionar várias células arrastando aplica o alinhamento a todos os parágrafos e imagens compatíveis nelas. Se a seleção mistura alinhamentos diferentes, nenhum botão de alinhamento aparece selecionado.

Para alinhar a própria tabela, clique em **Selecionar tabela** nas ferramentas contextuais ou coloque o cursor antes ou depois dela no parágrafo que a envolve e use os botões de alinhamento da barra principal. A posição à esquerda ou à direita de uma área flutuante é alterada nas ferramentas contextuais da área, em vez dos botões de alinhamento.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Para aplicar um comando à seleção atual, use `l` para esquerda, `c` para centro e `r` para direita.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
