---
title: Tachado
---

# Tachado

## Descrição

`strikeWing` é o dono (claim) de `<s>`. Use-o em valores que foram apagados mas
que você quer manter à vista.

- Na entrada, `<s>`, `<strike>` e `<del>` são todos aceitos; na saída, é sempre
  `<s>`. Nenhum atributo sobrevive — nem mesmo a data de `<del datetime="…">`.
- O atalho no modo de dicas é `S`. **Não há atalho acelerador** — diferente de
  negrito, itálico e sublinhado, do mesmo grupo `emphasis`, ele não tem combinação
  com `Ctrl`/`⌘`.
- Pressionar com o texto selecionado é uma alternância.
- Se não for registrado, `<s>` perde a casca e cai como texto puro.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
