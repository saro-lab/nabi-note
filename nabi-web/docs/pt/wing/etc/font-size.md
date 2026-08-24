---
title: Tamanho da letra
---

# Tamanho da letra

## Descrição

`fontSizeWing` (identificador `fs`) é um wing de marca inline baseado em valor que ajusta o tamanho da fonte de um trecho de texto (`<span data-nabi-size="lg">`).

Ele suporta quatro níveis — `xs`, `sm`, `lg`, `xl` — e o tamanho padrão é simplesmente a ausência do atributo, não um quinto valor.

- Clicar no botão da barra de ferramentas principal aplica **`lg` (Grande)** por padrão.
- Com o cursor dentro de uma marca de tamanho de fonte, a barra de ferramentas contextual dinâmica mostra um controle deslizante (`range`) que permite escolher facilmente entre Padrão, Muito pequeno, Pequeno, Grande e Muito grande. Mover o controle para Padrão remove a marca.
- Escolher um tamanho apenas com o cursor — sem nenhum texto selecionado — aplica a formatação a todo o parágrafo.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
