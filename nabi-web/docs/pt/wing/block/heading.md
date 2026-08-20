---
title: Título
---

# Título

## Descrição

**Um único** `headingWing` (id `h`) carrega todos os seis níveis. Um título não é um nó
separado, mas **um atributo do parágrafo** — o valor salvo é `{"w":"p","a":{"h":2}}`, e ao
sair vira `<h2>`.

Como o próprio parágrafo se torna o título, outros atributos de parágrafo, como alinhamento e
capitular, se aplicam ao mesmo tempo (`<h2 data-nabi-align="c">`).

## Um botão na barra de ferramentas, o nível na linha de contexto

**Há um único botão na barra de ferramentas, `H`.** Pressionado num parágrafo, vira Título 1;
com o cursor dentro de um título, a linha de contexto exibe os campos `Título` e `H1`~`H6` — o
nível atual aparece como o campo pressionado, e pressionar outro campo muda para aquele nível.
Pressionar `Título` devolve o parágrafo.

Numa linha vazia, digitar tantos `#` quanto o nível (`##` para o nível 2) e pressionar espaço
converte automaticamente a linha num título daquele nível — os `#` digitados e o espaço em si
somem.

## Exemplo de uso

Quem desenha o seletor de nível é o `mountContextToolbar`.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// A lista de wings monta junto o conhecimento de tipos, os comandos e os montadores — isso é o `registry`
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Também é possível aplicar diretamente por um comando.

```ts
nabi.applyCommand('setHeading', { value: 2 })  // vira título de nível 2
nabi.applyCommand('setHeading', { value: 2 })  // o mesmo nível de novo — volta a ser parágrafo
```

Aplicado a uma seleção com vários parágrafos, atinge **todos os parágrafos** selecionados.
Blocos que ocupam o lugar de um parágrafo, como tabela e lista, são ignorados — título é um
atributo de um parágrafo de texto.

## Demo

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
