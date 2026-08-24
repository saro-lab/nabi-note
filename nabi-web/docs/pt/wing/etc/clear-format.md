---
title: Limpar formatação
---

# Limpar formatação

## Descrição

`clearFormatWing` é um wing de ferramenta (`place: 'tool'`) que remove a formatação aplicada e volta o texto para texto puro.

- **O que remove**: 11 marks inline (`b`, `i`, `u`, `s`, `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) e 3 atributos de parágrafo (`h` título, `a` alinhamento, `dc` capitular).
- **Com um trecho selecionado**, todos os marks inline e atributos de parágrafo daquele trecho são removidos de uma vez.
- **Com só o cursor**, remove uma camada por vez, começando pelo mark mais interno na posição do cursor — quando não resta mais mark, os atributos de parágrafo são reiniciados.
- **Links de anexo (`data-nabi-file`) são protegidos** — diferente de um link web comum, um link de anexo de arquivo é excluído da limpeza, então a informação do arquivo sobrevive.
- **O alinhamento do parágrafo wrapper de um objeto de bloco** (imagem, tabela etc.) **é mantido.**

## Duas batidas em <kbd>Esc</kbd>

Além do botão da barra de ferramentas, **apertar <kbd>Esc</kbd> duas vezes em até 350ms** dispara o comando de limpar formatação imediatamente.

- Com seleção de texto ou só com o cursor, remove a formatação em etapas, exatamente como pressionar o botão da barra de ferramentas.
- A prioridade do <kbd>Esc</kbd> é tratada como a mais baixa — mesmo que o primeiro toque tenha armado uma fuga de mark, o segundo toque ainda dispara corretamente a limpeza de formatação.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
