---
title: Negrito
---

# Negrito

## Descrição

`boldWing` é o dono (claim) de `<b>`. Selecione o texto e pressione **B** na barra
de ferramentas, ou use o modo de dicas (dois toques em Shift seguidos de `B`), e
aquele trecho fica em negrito.

- Na entrada, `<b>` e `<strong>` são aceitos juntos; na saída, sempre sai um
  `<b>` só. Nenhum atributo sobrevive — `class`, `style` e `data-*` caem e só a
  tag permanece.
- O atalho no modo de dicas é `B`, e o acelerador é `Ctrl`/`⌘`+`B` (`mod+b`).
- Pressionar com o texto selecionado é uma alternância (`toggleMark`) — se tudo
  já estiver em negrito, tira; caso contrário, aplica. Este wing não tem comando
  próprio — o botão usa `action: { kind: 'mark' }`, que vai direto ao
  `toggleMark` do núcleo.
- Se você não registrar o wing, `<b>` perde a casca e cai como texto puro (é o
  que acontece com toda tag não registrada — regra geral do nabi).

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
