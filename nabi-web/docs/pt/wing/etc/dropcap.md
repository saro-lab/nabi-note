---
title: Capitular
---

# Capitular

## Descrição

O `dropCapWing` é um wing de atributo de parágrafo que exibe a primeira letra de um parágrafo
como uma grande letra decorativa (`data-nabi-dropcap="1"`).

- Funciona como um único alternador ligado/desligado.
- O tamanho da primeira letra é fixado por uma regra `::first-letter` na folha de estilo do
  núcleo (`font-size: 5.9em; line-height: .83`).
- Se você dividir o parágrafo com Enter durante a digitação, o atributo de capitular não é
  duplicado para os dois lados — ele permanece só com a letra original.

Para personalizar o tamanho, sobrescreva a regra abaixo:

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
