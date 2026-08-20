---
title: Código
---

# Código

## Descrição

`codeWing` (nome `code`) é uma **constante** dona do bloco de código (`<pre>`) — não se chama
com parênteses.

É um container `holds: 'inline'`, e o `repair` mantém o interior como texto puro — marks ou
outros wings não podem se intrometer ali. Não é um campo separado do contrato; é o wing que
apara o próprio interior sozinho.

Digitar ` ``` ` numa linha vazia e pressionar espaço ou Enter cria um bloco de código — e, se
você emendar a linguagem, como em ` ```ts `, ela também é capturada. `Tab`/`Shift+Tab` recuam e
desrecuam a linha (de uma vez, se você selecionar várias). O Enter herda o recuo da linha
anterior.

A linha de contexto só aparece quando o cursor está dentro do código — nela há um campo para
digitar a linguagem à mão, um "Sem linguagem" e os campos das linguagens mais usadas.

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Essa lista é apenas um **atalho** — não é a lista de linguagens que o núcleo conhece. Uma
linguagem que não esteja aqui basta ser digitada no primeiro campo, e esse valor é repassado ao
realçador tal e qual.

## Colorir se encaixa no wing

`highlight` é **um hook que devolve o tipo, não a cor** — a forma é
`(fonte, linguagem) => {text, type?}[]`, e `type` é fixo em um destes catorze valores:
`keyword`, `string`, `number`, `comment`, `function`, `class`, `variable`, `operator`,
`punctuation`, `tag`, `attribute`, `literal`, `regexp`, `meta` (`CODE_TOKEN_TYPES`).

A cor quem define diretamente é a folha de estilo do núcleo, com o seletor
`[data-nabi-token="…"]` — **só cinco têm cor** (`comment`, `string`, `keyword`, `number`,
`literal`). Os demais tipos só recebem a marca, sem regra de cor, então saem na cor do texto
normal. Como o valor é uma cor fixa, não uma variável CSS, para usar outra cor ou uma variante
escura, sobrescreva esse seletor diretamente.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

O dicionário de sintaxe em si não vem no pacote — você precisa acoplar algo como Prism,
highlight.js ou Shiki.

Quem pinta **se encaixa no wing** — não se monta à parte. Construa um `attach` com
`makeCodeAttach` e o encaixe no wing de código; `mountSurface` o prende. A demo deste site é um
exemplo de Shiki acoplado assim (`.vitepress/src/highlight.ts`).

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// o wing é uma constante — só se troca o que se anexa (`attach`)
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

Passar `version` junto faz repintar **quando o documento continua igual mas o lado que pinta
mudou.** É o caso de um realçador que busca a gramática de forma assíncrona (o Shiki faz isso ao
encontrar uma linguagem pela primeira vez) — quando a gramática chega, o documento não mudou,
então `onChange` não dispara, e sem isso seria preciso digitar mais um caractere qualquer para a
cor entrar.

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// quando a gramática chega atrasada — subir o número repinta
grammarAge += 1
```

O valor salvo segue a convenção de fora — `<pre data-nabi-lang="ts"><code class="language-ts">`
— e as cores saem pelo atributo `data-nabi-token` (não por `style` inline).

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e os montadores — isso é o `registry`
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
