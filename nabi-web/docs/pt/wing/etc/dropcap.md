---
title: Capitular
---

# Capitular

## Descrição

`dropCapWing` é um atributo de parágrafo de valor único, que pendura no
parágrafo `data-nabi-dropcap="1"`. Ele não cria bloco novo: apenas põe uma
marcação sobre o parágrafo que já existe.

- O valor é um só, ligado ou desligado — pressionar o botão de novo faz o
  atributo cair.
- **Não há opção nem variável para decidir quantas linhas ele abraça.** Uma única
  regra da folha de estilo do núcleo fixa o tamanho — `font-size: 5.9em;
  line-height: .83`. Quantas linhas a letra vai realmente cobrir depende da
  altura de linha daquele parágrafo.
- Como ele só toca a primeira letra, o Enter trata esse atributo como se fosse
  uma marca — ao partir o parágrafo em dois, ele não se duplica para os dois
  lados: acompanha aquela letra.

Para mudar o tamanho, sobrescreva essa regra.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
