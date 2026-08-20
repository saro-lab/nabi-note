---
title: Lista de tarefas
---

# Lista de tarefas

## Descrição

`taskListWing` (nome `tl`, atalho `K`) compartilha a tag (`<ul>`) com a lista com marcadores,
mas é uma implementação à parte — ao sair, marca `data-nabi-list="task"` para indicar que é uma
lista de tarefas, e cada item leva `data-nabi-checked` para o estado de marcação.

O item é trazido junto via `parts` — não um array, um registro.

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

No valor salvo, a marcação é `ck`, e seu único valor é `1` — o estado desligado não é `0`, é **o
campo simplesmente não existir.** No HTML de saída, isso se desdobra em
`data-nabi-checked="true"`/`"false"`.

Pressionar o botão envolve em lista de tarefas o bloco onde o cursor está (ou os blocos que a
seleção atravessa). Digitar `[ ] ` ou `[x] ` (maiúsculas ou minúsculas, tanto faz) no começo da
linha dá o mesmo resultado, e, conforme o que foi digitado, o item já começa marcado ou não. Não
precisa ser uma linha vazia, mas só funciona na primeira linha do parágrafo.

A caixa de seleção não é um `<input>`, e sim um marcador desenhado em CSS — colocar um input de
verdade dentro de um `contenteditable` embaralharia o cursor. A caixa marcada é um X branco
sobre um bloco na cor de destaque, e essa linha fica apagada, com um traço horizontal.

**O lugar de ligar e desligar é a própria caixa** — é preciso pressionar a faixa estreita no
começo do item (do tamanho de um caractere) para mudar; pressionar do lado do texto só move o
cursor. Em texto escrito da direita para a esquerda, essa faixa fica do outro lado. Essa tarefa
o wing carrega via `attach`, então **não há nada separado para montar.**

Recuar e desrecuar com `Tab`/`Shift+Tab`, e terminar a lista com Enter num item vazio, funciona
igual à [lista com marcadores](./bullet-list).

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e os montadores — isso é o `registry`
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
