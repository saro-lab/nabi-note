---
title: Citação
---

# Citação

## Descrição

O `quoteWing` (id `quote`) cuida do bloco de citação (`<blockquote>`). Ele tem `place: 'container'`
e `holds: 'blocks'`, então, além de parágrafos comuns, também pode conter outros elementos de
bloco, como uma tabela ou uma imagem.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["texto citado"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Clique no botão da barra de ferramentas e os blocos da seleção são envolvidos em uma citação. Se a
seleção já for uma citação, o mesmo botão a desfaz.

Digite `>` seguido de um espaço no início de um parágrafo, e ele se converte automaticamente em
citação.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
