---
title: Tipo de letra
---

# Tipo de letra

## Descrição

`typefaceWing` (nome `tf`) é um **mark de valor inline.** É uma constante pronta, então basta
colocá-la no array — não há opção para passar. Ao sair, é desenhado como
`<span data-nabi-typeface="serif">`.

Os valores são quatro (`TYPEFACES`) — `sans`, `serif`, `mono`, `cursive`.

- **Não carrega nenhum nome de fonte.** O que se escolhe é a **categoria**, e qual fonte sai de
  fato é decidido pelos valores que o host coloca nos quatro tokens `--nabi-font`,
  `--nabi-font-serif`, `--nabi-font-mono` e `--nabi-font-cursive`.
- As quatro categorias são carregadas por **um único wing.** Os campos de escolha ficam na
  linha de contexto, com quatro campos (`select`), e há um botão na barra de ferramentas como
  caminho de entrada. Pressionar o botão aplica `serif`.
- **Texto sem nada aplicado veste o `--nabi-typeface-base`.** Esse token é a fonte de fundo do
  editor inteiro, e, se não for tocado, segue `--nabi-font`. Não existe um campo separado para
  escolher "padrão" — **escolher de novo a categoria já aplicada a remove**, voltando a esse
  lugar.
- Os campos de escolha são desenhados **com a própria fonte que representam.** O campo de
  serifa é escrito com serifa, o de largura fixa com largura fixa, então dá para ver o que se
  escolhe mesmo sem saber o nome.
- **Com só o cursor, aplica-se ao parágrafo inteiro.** Num parágrafo sem nenhum caractere, fica
  armado, e o próximo caractere digitado já sai com esse tipo de letra.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e os montadores — isso é o `registry`
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

A fonte que o host coloca cabe num só lugar no CSS. Se você empilhar várias fontes numa
categoria, o navegador percorre a lista letra a letra, do começo, e desenha com a primeira
fonte que tenha aquela letra — então a forma daquela categoria se mantém, seja qual for o
idioma escrito.

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## Demo

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
