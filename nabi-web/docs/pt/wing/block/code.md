---
title: Código
---

# Código

## Descrição

`codeWing` (id `code`) é um objeto wing constante que trata o bloco de código (`<pre><code>`).

É um container `holds: 'inline'`, e o texto interno é normalizado para texto puro na etapa `repair`, de modo que nenhuma outra marca inline ou bloco pode ficar aninhado ali dentro.

Digite ` ``` ` numa linha vazia e pressione espaço ou Enter para transformá-la num bloco de código (emende um identificador de linguagem, como em ` ```ts `, e essa linguagem é definida automaticamente). `Tab` e `Shift+Tab` recuam e desrecuam linhas de código, inclusive em bloco quando várias linhas estão selecionadas. Pressionar Enter mantém automaticamente a profundidade de recuo da linha anterior.

Enquanto o cursor está dentro de um bloco de código, a barra de contexto dinâmica fica ativa, oferecendo um campo para digitar a linguagem diretamente, um botão "Sem linguagem" e botões de atalho para as linguagens mais usadas:

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Mesmo uma linguagem que não esteja nessa lista pode ser digitada diretamente no campo de entrada — o valor digitado é passado tal e qual para o realçador de sintaxe.

## Colorir se encaixa no wing

`highlight` é uma função de hook que recebe o código-fonte e a linguagem e devolve um array de tokens: `(source, lang) => { text: string, type?: string }[]`.

O `type` de um token retorna um dos 14 tipos padrão definidos em `CODE_TOKEN_TYPES` (`keyword`, `string`, `number`, `comment`, `function`, `class`, `variable`, `operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`, `meta`).

A folha de estilo do núcleo aplica cores de tema a cinco tipos de token padrão (`comment`, `string`, `keyword`, `number`, `literal`) através do seletor `[data-nabi-token="…"]`. Para aplicar modo escuro ou cores personalizadas, basta sobrescrever esse seletor CSS.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Para conectar um realçador externo como Shiki ou Prism, use `makeCodeAttach` para montar o hook `attach`.

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

Se, como o Shiki, seu realçador carrega pacotes de gramática de forma assíncrona, passe a opção `version` para repintar a tela do editor quando o carregamento da gramática terminar:

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight: myHighlighter, version: () => grammarAge }),
}

// quando o carregamento assíncrono da gramática da linguagem terminar
grammarAge += 1
```

A estrutura HTML salva segue o formato padrão: `<pre data-nabi-lang="ts"><code class="language-ts">`. Cada token é marcado de forma segura com o atributo `data-nabi-token`.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
