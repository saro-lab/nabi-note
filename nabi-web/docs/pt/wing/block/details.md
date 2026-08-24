---
title: Bloco recolhível
---

# Bloco recolhível

## Descrição

`detailsWing` (id `details`, atalho `D`) é dono da caixa recolhível
(`<details>` + `<summary>`). A linha de resumo já vem embutida pelo atributo
`parts`, então não precisa ser registrada separadamente.

```ts
parts: { summary: { holds: 'inline' } }
```

Pressionar o botão envolve os blocos abrangidos pelo cursor numa nova caixa
recolhível, com uma linha de resumo vazia à frente. Pressionar Enter na linha de
resumo desce para o conteúdo (uma quebra de linha dentro da linha de resumo
nunca a divide).

**A tela desenha exatamente o que está realmente salvo.** Um bloco salvo
recolhido (`open` não definido) carrega recolhido também no editor, e clicar no
ícone de seta à esquerda abre ou fecha a qualquer momento (esse clique muda
imediatamente o atributo `o` da árvore nabi). Se o cursor estava dentro do
conteúdo ao recolher o bloco, ele se move com segurança para fora do bloco.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
