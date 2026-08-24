---
title: Sublinhado
---

# Sublinhado

## Descrição

`underlineWing` é o dono (claim) de `<u>`.

- Reconhece `<u>` na entrada e sempre volta como `<u>` padrão na saída.
- Suporta o modo de dicas (Shift duas vezes, depois `U`) e o acelerador (`Ctrl`/`⌘`+`U`).
- Executar com o texto selecionado funciona como alternância.
- Sublinhado e link (`<a>`) podem parecer iguais na tela, mas são wings independentes — o
  mesmo texto pode carregar sublinhado e link ao mesmo tempo.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
