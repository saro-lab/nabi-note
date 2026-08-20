---
title: Limpar formatação
---

# Limpar formatação

## Descrição

`clearFormatWing` é uma **constante pronta.** Basta colocá-la no array — não há opção para
passar.

Como `place: 'tool'`, ele não constrói seu próprio nó no documento. É só um comando
(`clearFormat`) e um botão na barra de ferramentas.

- **A lista do que se remove está fixada no núcleo.** Onze marks inline (`b`, `i`, `u`, `s`,
  `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) e três atributos de parágrafo (`h` título, `a`
  alinhamento, `dc` capitular). O host não precisa administrar lista nenhuma, e o mark de um
  wing feito por você **não é removido aqui.**
- **Selecionar um trecho e pressionar** remove de uma vez os marks daquele intervalo e os
  atributos dos parágrafos atravessados.
- **Com só o cursor, remove uma camada por vez** — a partir do lugar onde o cursor está, o
  **mark mais interno** primeiro, só pelo trecho em que aquele mark continua. Sem mark para
  remover, aí sim os atributos de parágrafo saem.
- **Links de anexo nunca são removidos** — um link (`a`) com o atributo `file` é inviolável em
  qualquer lugar. Tirar a casca deixaria o anexo como texto puro morto.
- **O alinhamento do parágrafo que carrega um bloco permanece.** Num parágrafo wrapper que
  carrega imagem ou tabela, só o alinhamento (`a`) não é removido — isso impede que a imagem
  salte para a esquerda ao tentar limpar a formatação.
- Sem nada para remover, o comando responde `null`. Nenhum ponto de desfazer se acumula.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e os montadores — isso é o `registry`
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
