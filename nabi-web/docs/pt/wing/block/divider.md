---
title: Separador
---

# Separador

## Descrição

O `dividerWing` (id `hr`) cuida do separador horizontal (`<hr>`). É um objeto **`place: 'void'`**,
sem espaço para texto por dentro; pressionar Backspace ou Delete imediatamente antes ou depois do
separador apaga o bloco inteiro de uma vez.

Clicar no botão insere o separador **envolvido em seu próprio parágrafo-invólucro
(`<div data-nabi-p>`)**. O cursor fica logo depois do separador.

Onde ele é inserido depende do estado do parágrafo em que o cursor está:

| Posição do cursor | Comportamento da inserção |
|---|---|
| Parágrafo com texto | O novo separador entra **depois** desse parágrafo |
| Parágrafo vazio | Esse parágrafo vazio é **substituído pelo separador** (evita uma linha vazia desnecessária) |

Ao substituir um parágrafo vazio, o alinhamento de texto que ele tinha é mantido.

Digite três ou mais hifens em uma linha vazia e pressione Enter (`---` + Enter) para converter
automaticamente em separador.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
