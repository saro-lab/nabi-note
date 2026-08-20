---
title: Tamanho da letra
---

# Tamanho da letra

## Descrição

`fontSizeWing` (nome `fs`) é um **mark de valor inline.** É uma formatação colocada sobre
caracteres, não um atributo de parágrafo. Ao sair, é desenhado como
`<span data-nabi-size="lg">`.

Os valores são quatro — `xs`, `sm`, `lg`, `xl` — e o tamanho padrão não é um quinto valor, é
**o atributo simplesmente não existir.**

- Faz par com o tipo de letra (`tf`) — um único wing carrega todos os valores, e o lugar de
  escolha é a linha de contexto. Só que o tipo de letra enfileira quatro campos, e o tamanho usa
  uma única escala.
- **A linha de contexto é uma escala (`range`).** Como tamanho é um valor com ordem (pequeno →
  grande), em vez de enfileirar campos, empurra-se com um único cursor. O valor ativo agora
  aparece na posição do cursor, e o rótulo mostra junto o nome desse valor.
- **O primeiro campo da escala é "padrão".** O motivo de ser o primeiro, e não o do meio, é que
  a lista vai do menor ao maior, e o lugar antes de tudo é "nenhum valor aplicado". Mover para
  esse campo não escreve um valor como `base`: **remove o próprio mark.**
- **O rótulo dos campos segue a localidade** — em português, "Padrão · Muito pequeno · Pequeno
  · Grande · Muito grande".
- Pressionar o botão da barra de ferramentas aplica **`lg`(grande)**. Como a escala começa do
  menor, deixado como está aplicaria o primeiro campo, `xs`, e ninguém pressiona um botão de
  tamanho esperando que a letra encolha.
- **Com só o cursor, aplica-se ao parágrafo inteiro.** É raro aumentar o tamanho de uma única
  palavra, então, sem um intervalo selecionado, mira o parágrafo (diferente de marca-texto e cor
  de texto, que miram só o trecho atual do mark).
- Pressionado num parágrafo sem nenhum caractere, fica **armado** — o próximo caractere digitado
  já sai com esse tamanho.
- Aplicar o mesmo valor de novo remove.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e os montadores — isso é o `registry`
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
