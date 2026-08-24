---
title: Subscrito
---

# Subscrito

## Descrição

`subscriptWing` é um wing de marca inline que trata a formatação em subscrito
(`<sub>`). Use para fórmulas químicas, números de nota de rodapé e afins.

- Reconhece a tag `<sub>` na entrada e a devolve do mesmo jeito na saída.
- Fica no grupo `script` da barra de ferramentas, ao lado do sobrescrito.
- Com o texto selecionado, pressionar o botão alterna a marca.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
