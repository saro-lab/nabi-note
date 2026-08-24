---
title: Itálico
---

# Itálico

## Descrição

O `italicWing` é o wing de marca em linha que trata a formatação em itálico (`<i>`). Use-o para destacar o tom do texto — ênfase, uma palavra estrangeira, e assim por diante.

- Na entrada, reconhece tanto `<i>` quanto `<em>`; na saída, sempre produz a tag padrão `<i>`.
- Compatível com o modo de dicas (Shift duas vezes, depois `I`) e o atalho `Ctrl`/`⌘`+`I`.
- Aplicado com o texto selecionado, funciona como alternância.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
