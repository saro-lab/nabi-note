---
title: Sublinhado
---

# Sublinhado

## Descrição

`underlineWing` é o dono (claim) de `<u>`.

- A única tag aceita é `<u>`. Na saída também é sempre `<u>` e nenhum atributo
  sobrevive. **`<ins>` não é aceito** — perde a casca e sobra só o texto. Não é
  uma marca que aceita um par de tags juntas, como negrito (`<b>`·`<strong>`) ou
  tachado (`<s>`·`<strike>`·`<del>`).
- O atalho no modo de dicas é `U`, e o acelerador é `Ctrl`/`⌘`+`U` (`mod+u`).
- Pressionar com o texto selecionado é uma alternância.
- Se você não registrar o wing, `<u>` perde a casca e cai como texto puro.
- Sublinhado e link podem se confundir na tela, mas são marcas distintas, cada
  uma de um wing diferente (`a`) — as duas podem incidir sobre o mesmo texto.

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
