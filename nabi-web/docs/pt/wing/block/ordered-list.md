---
title: Lista numerada
---

# Lista numerada

## Descrição

`orderedListWing` (id `ol`, atalho `N`) é dono de `<ol>`. O item vem junto por
`parts`, então `oli` não é registrado à parte — não é um array, é um registro.

```ts
parts: { oli: { holds: 'blocks' } }
```

Pressionar o botão envolve numa lista numerada o bloco em que o cursor está (ou
os blocos abrangidos pela seleção), e pressionar de novo desfaz. Pressionar
outro botão de lista troca para aquele tipo.

Digitar no começo da linha um número seguido de ponto e espaço (`1. `) dá o
mesmo resultado. **Qualquer número vale como início, até nove algarismos**
(`1234567890. ` não aciona), e se algo mais vier depois do ponto, como em
`1.2 `, também não aciona. Não precisa ser uma linha vazia — só se olha o
começo da linha antes do cursor, e só funciona na primeira linha do parágrafo.

- Recuar e desrecuar com `Tab`/`Shift+Tab`, terminar a lista com Enter num item
  vazio, e o Backspace no começo do item fundindo com o anterior — tudo isso
  funciona igual à [lista com marcadores](./bullet-list).
- O número não entra no valor salvo — é o `<ol>` que o desenha, então inserir ou
  apagar um item faz o navegador renumerar sozinho.
- O aninhamento também é marcação de verdade e permanece assim no valor salvo.
  Como o item guarda blocos, o texto entra com uma camada de parágrafo, e uma
  lista aninhada fica dentro de um parágrafo-invólucro.
- Atributos como `start` e `type` não sobrevivem. Por isso uma lista que chegou
  com `start="5"` volta a contar a partir de 1.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
