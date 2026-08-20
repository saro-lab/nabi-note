---
title: Realce
---

# Realce

## Descrição

`highlightWing` (id `hl`) é o dono (claim) de `<mark data-color="...">`. Por ser
uma marca inline que carrega um valor, não é uma alternância de liga/desliga, e
sim uma escolha de cor — mesma linhagem da cor do texto.

- **O botão da barra de ferramentas (atalho `H`) aplica amarelo** — ele chama
  `setHighlight` levando `{ c: 'yellow' }`. Não é um botão que roda sem
  argumento.
- Por isso a alternância deste botão é **uma alternância sobre o amarelo**. Ela
  só tira a marca quando o trecho selecionado está **inteiro em amarelo** — num
  trecho todo em verde, pressionar não tira, troca para amarelo, e é preciso
  pressionar de novo para tirar.
- Quando o cursor está dentro de uma marca de realce, a barra de ferramentas de
  contexto exibe seis amostras de cor — pressionar uma troca só a cor, ali
  mesmo. Este wing não tem um campo "limpar" próprio. Pressionar de novo a
  mesma cor tira a marca; limpar formatação é papel do `clearFormatWing` (que
  precisa ser registrado à parte).
- **Escolher só com o cursor, sem seleção, tem dois caminhos.** Se o cursor já
  estiver dentro de uma marca de realce, todo o texto coberto por aquela marca
  vira o alvo (não é preciso selecionar de novo). Fora da marca não há texto
  para aplicar, então fica **reservado**: o próximo caractere digitado já nasce
  com aquela cor.
- No valor salvo fica só o nome da cor — algo como `data-color="yellow"`.
  Nenhum `style` inline sai. A cor de fundo de verdade é desenhada pela folha de
  estilo que este wing carrega em `styles` (compartilhada com a cor do texto), e
  o valor da cor em si vem dos tokens do núcleo `--nabi-hl-*` — o host os
  sobrescreve para trocar as cores.
- **Um valor fora da lista não sobrevive em lugar nenhum.** O comando nem roda; e
  no HTML de entrada, um `<mark>` com `data-color` fora da lista perde a casca e
  **sobra só o texto.** O mesmo vale para um `<mark>` sem `data-color` nenhum —
  como a cor é o próprio valor, um realce sem valor não tem onde existir.
- O mesmo vale para um valor salvo corrigido à mão — quando o `repair` encontra
  um valor fora da lista, ele remove o nó inteiro, casca e tudo.

| Nome da cor | Valor salvo |
|---|---|
| Amarelo | `yellow` |
| Verde | `green` |
| Ciano | `cyan` |
| Rosa | `pink` |
| Roxo | `purple` |
| Laranja | `orange` |

Essas seis são exportadas como `HIGHLIGHT_COLORS` — não são os valores de cor, e
sim o **array de nomes** (`readonly string[]`). O valor de cor em si vive na
folha de estilo.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
