---
title: Bloco recolhível
---

# Bloco recolhível

## Descrição

`detailsWing` (id `details`, atalho `D`) é dono da caixa recolhível
(`<details>` + `<summary>`). A linha de resumo vem junto por `parts`, então não
é registrada à parte — não é um array, é um registro.

```ts
parts: { summary: { holds: 'inline' } }
```

Pressionar o botão envolve os blocos abrangidos pelo cursor numa nova caixa
recolhível, com uma linha de resumo vazia à frente. Pressionar Enter na linha de
resumo desce para o conteúdo (a própria linha de resumo não se parte).

**O editor desenha exatamente o que será salvo.** Uma caixa salva recolhida
aparece recolhida também no editor, e clicar no triângulo abre e fecha ali
mesmo — esse clique já é o que muda o valor salvo (`o`). Se o cursor estava
dentro ao recolher, ele sai para fora da caixa.

::: tip Não há linha de contexto
Antes existiam dois botões — **Salvar aberto** e **Salvar recolhido**. Na época
em que a tela sempre desenhava tudo aberto, essa era a única forma de dizer com
qual estado salvar. Agora que a tela desenha exatamente o valor salvo e o
triângulo já o muda, seria dizer a mesma coisa duas vezes — por isso foram
retirados.
:::

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
