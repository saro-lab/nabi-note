---
title: Alinhamento
---

# Alinhamento

## Descrição

`alignWing` (id `align`) é um wing de atributo de parágrafo que trata do alinhamento do texto — esquerda, centro, direita — para parágrafos e blocos.

- Ele aplica o atributo `data-nabi-align` ao bloco (`<p data-nabi-align="center">`).
- **Aplica-se não só a parágrafos, mas também a títulos (`h1`–`h6`)** (`<h2 data-nabi-align="c">`).
- Só um valor de alinhamento vale por vez. Clique de novo num botão já ativo e o atributo cai, voltando ao alinhamento padrão.
- Divida um parágrafo com Enter e as duas metades mantêm o mesmo alinhamento.
- **Este wing também cuida do alinhamento de objetos de bloco**, como imagens, tabelas e vídeos do YouTube. Um objeto de bloco fica dentro do parágrafo-invólucro (`<div data-nabi-p>`) que o contém, então os botões de alinhamento da barra de ferramentas controlam, através desse invólucro, se o objeto fica à esquerda, à direita ou ao centro.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
