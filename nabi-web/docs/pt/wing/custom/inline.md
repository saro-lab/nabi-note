---
title: Escrevendo um mark inline
description: place 'mark' — uma formatação colocada sobre caracteres. Você escreve o caminho de saída (toHtml) e o de entrada (claim) juntos.
---

# Escrevendo um mark inline

`place: 'mark'` é **uma formatação colocada sobre caracteres.** Não ocupa lugar próprio, não
quebra o fluxo do texto, e marks podem se sobrepor — negrito, itálico e marca-texto são todos
desta variedade.

---

## Um mark com tudo preenchido

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { pt: 'Tecla' },
      shortcut: 'K',
      action: { kind: 'mark' },        // o núcleo cuida da alternância — sem precisar de comando
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

O que `simpleMark` preenche para você são duas coisas: `place: 'mark'` e
`escapeKeys: ['Escape']`. O resto passa direto, sem mudança.

---

## As duas direções se escrevem separadas

| | Direção | Sem isso |
|---|---|---|
| `toHtml` | Documento → HTML | **O registro morre.** Um wing que constrói nó precisa ter um caminho para desenhá-lo |
| `claim` | HTML → Documento | Ainda desenha, mas **não dá para ler de volta.** Salvar e reabrir retira a casca |

Os seis marks básicos (`b`, `i`, `u`, `s`, `sub`, `sup`) e os quatro marks de valor (`hl`, `tc`,
`fs`, `tf`) são tags que **o núcleo já conhece.** Por isso `boldWing` não carrega nem `toHtml`
nem `claim`. Um nome inventado por você o núcleo não conhece, então você escreve os dois.

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| Argumento | O que é |
|---|---|
| `node` | O nó como está agora. Atributos saem de `node.a?.['chave']` |
| `children()` | O texto desenhado do interior. **Ele se desenha quando é chamado**, então, sem chamá-lo, o interior nunca sai |
| `ctx` | As ferramentas para construir com segurança |

O que `ctx` dá a você:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | Constrói um bloco. Valores são escapados por você |
| `ctx.escape(text)` | Escapa só o texto |
| `ctx.url(raw)` · `ctx.src(raw)` | Filtra um endereço. Um endereço em que não se pode confiar vira **`null`** |
| `ctx.keys` | Se esta montagem é a do **editor** (`getEditorHtml()`) |

::: warning Nunca concatene a string você mesmo
Escrever `` `<kbd>${node.a?.['t']}</kbd>` `` faz o texto do documento virar marcação tal e qual.
Passe sempre por `ctx.element` ou `ctx.escape`.
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — o elemento exatamente como chegou |
| `inner(block)` | Lê o interior. Para um mark, `false` (um lugar para caracteres); para um bloco, `true` |
| Resposta | Um array de nós, ou **`null`** (não é meu → passa para o próximo wing) |

Os wings são perguntados na ordem do array, e **o primeiro a levantar a mão** o leva.

Há dois lugares onde se responde `null` — quando não é a sua tag, e **quando é a sua tag, mas o
valor está fora da lista.** No segundo caso, responder `inner(false)` só retira a casca e
mantém o texto vivo.

---

## Um mark que carrega um valor

Para um mark que **escolhe um entre uma lista fixa**, como uma cor ou um tamanho, use
`valueMark`.

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // o campo de atributo onde o valor vive
    values: [...LEVELS],             // nada fora disto é aceito
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // fora da lista — mantém só o texto
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

Duas coisas que `valueMark` acrescenta para você:

- **`currentValue`** — o valor no lugar onde o cursor está agora. A barra de ferramentas e a
  linha de contexto pintam, com base nessa resposta, qual campo está ativo.
- **`repair`** — verifica o valor de novo na porta do JSON. Fora da lista ou ausente, responde
  `null` e **remove o nó, casca e tudo.** Um valor salvo editado à mão é pego bem aqui.

::: tip Um comando que muda o valor
Para o comando "mude para este valor" de um mark de valor, ainda não existe um auxiliar
público. O `action: { kind: 'mark' }`, que só alterna via um botão da barra de ferramentas,
funciona como mostrado, e se precisar de escolha de valor, use por ora os quatro marks de valor
padrão (marca-texto, cor de texto, tamanho de letra, tipo de letra) ou espalhe suas
declarações.
:::

---

## `escapeKeys` — saindo de um mark

Com o cursor no fim de um mark, só a pessoa sabe se o próximo caractere pertence a dentro ou
fora dele. `escapeKeys` é essa porta.

```ts
escapeKeys: ['Escape']    // o valor padrão de simpleMark e valueMark
```

**O cursor não se move.** Pressionar essa tecla arma "o próximo caractere digitado sai deste
mark". Digitar um caractere consome a armação e ela some.

```
<kbd>Ctrl</kbd>(cursor)  →  Escape  →  digitar "+"  →  <kbd>Ctrl</kbd>+
```

Vários wings podem reivindicar a mesma tecla — a armação só se ativa enquanto o cursor está de
fato dentro daquele mark, então, entre marks sobrepostos ali, só os que se aplicam saem juntos.
<kbd>Escape</kbd> também serve para **desarmar** uma armação já colocada.

---

## Marks não podem ter teclas

Escrever `onKey` **nunca chega a um mark.** A posição do cursor é `{ path, offset }`, e o fim de
`path` é **o suporte que carrega os caracteres** — um mark é um nó inline dentro desse suporte,
então nunca aparece no caminho. O núcleo sobe esse caminho para decidir a quem pertence uma
tecla, então nunca encontra um mark.

O motivo é sobreposição. Pressionar <kbd>Enter</kbd> dentro de um link dentro de um itálico
dentro de um negrito não deixa como decidir a qual dos três pertence. A única porta que um mark
tem para teclas é `escapeKeys`.

---

## Próximas páginas

- [Blocos e atributos de parágrafo](../custom/block) — as coisas que ocupam um lugar
- [Teclas, conversão automática, colagem](../custom/input) — `onKey` e `inputRules`
- [UI e comportamento](../custom/ui) — o botão da barra de ferramentas e a linha de contexto

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
