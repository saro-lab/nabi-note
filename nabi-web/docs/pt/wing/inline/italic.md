---
title: Itálico
---

# Itálico

## Descrição

`italicWing` é o dono (claim) de `<i>`. Use-o em palavras estrangeiras ou em
citações — texto que precisa de outra textura.

- Na entrada, `<i>` e `<em>` são aceitos juntos; na saída, tudo se recolhe a um
  `<i>` só. Nenhum atributo sobrevive.
- O atalho no modo de dicas (dois toques em Shift) é `I` — capturado pela tecla
  física (`KeyI`), então funciona também em teclados não latinos. O acelerador é
  `Ctrl`/`⌘`+`I` (`mod+i`).
- Pressionar com o texto selecionado é uma alternância.
- Se você não registrar o wing, `<i>` perde a casca e cai como texto puro.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
