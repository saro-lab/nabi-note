---
title: Construindo blocos e atributos de parágrafo
description: void, container, attr — construir as coisas que ocupam um lugar. Um bloco sempre vive dentro de um parágrafo wrapper.
---

# Construindo blocos e atributos de parágrafo

Coisas que ocupam um lugar vêm em três variedades.

| `place` | O quê | Exemplo |
|---|---|---|
| `'void'` | **Um bloco sem interior.** O cursor não entra | linha divisória, imagem, YouTube |
| `'container'` | **Um bloco com texto dentro** | citação, bloco recolhível, tabela, lista, código |
| `'attr'` | Um valor colocado sobre o próprio parágrafo. Não constrói nó | título, alinhamento, capitular |

---

## Um bloco vive dentro de um parágrafo wrapper

O documento é **um array de blocos**, e a única coisa que pode ficar no nível mais alto é um
parágrafo (`p`). Um bloco nunca fica direto no nível mais alto — ele veste **um parágrafo que só
o contém a ele** e fica dentro dele.

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

Esse parágrafo é o **parágrafo wrapper**, e na tela é desenhado como `<div data-nabi-p>`.

Há dois motivos para isso. Sempre existe um lugar onde o cursor pode ficar antes e depois do
bloco (porque sempre há um parágrafo ali), e **o bloco recebe atributos de parágrafo como o
alinhamento tal e qual** — "uma imagem centralizada" é exatamente "uma imagem dentro de um
parágrafo centralizado".

---

## Construindo um bloco sem interior

```ts
import { boxObject, createNabiWith, insertLump, type Command, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const insertStar: Command = (doc, sel, _args, env) => {
  const r = insertLump(doc, sel.focus, { w: 'star', ch: [] }, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const starWing: Wing = {
  ...boxObject({
    w: 'star',
    toHtml: (_node, _children, ctx) => ctx.element('hr', '', { 'data-nabi-star': '' }),
  }),
  commands: { insertStar },
  button: {
    group: 'insert',
    label: { pt: 'Estrela' },
    action: { kind: 'command', command: 'insertStar' },
  },
}
```

`insertLump` veste o parágrafo wrapper sozinho.

```
<div data-nabi-p><hr data-nabi-star/></div>
```

Chamado sobre um parágrafo vazio, **ele assume esse mesmo parágrafo** — não sobra uma linha
vazia a cada inserção. E qualquer alinhamento que esse parágrafo já carregava sobrevive intacto.

O que `boxObject` preenche para você é `place: 'void'` e **os verificadores de atributo**.

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // valores fora da lista caem
  requires: ['c'],                                                 // sem isso, este bloco não existe
  toHtml: /* … */,
})
```

Um atributo que você não listou em `attrs` é **um campo desconhecido e cai por completo.** Não
existe um lugar por onde um valor fora do contrato consiga se infiltrar no valor salvo.

---

## Construindo um bloco com interior

`place: 'container'` sempre precisa vir com `holds` junto — sem ele, o registro morre.

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // parágrafos vivem dentro ('inline' significa só texto)
  allows: ['p'],                    // o que pode entrar aqui dentro
  toHtml: (_node, children, ctx) => ctx.element('aside', children(), { 'data-nabi-note': '' }),
  claim: (el, inner) => (el.tag === 'aside' ? [{ w: 'note', ch: inner(true) }] : null),
  commands: { toggleNote },
  inputRules: [{ trigger: 'space', pattern: /^!$/, run: () => ({ name: 'toggleNote' }) }],
  button: {
    group: 'container',
    label: { pt: 'Nota' },
    action: { kind: 'command', command: 'toggleNote' },
  },
}
```

`toggleWrap` é uma **alternância.** Envolve os blocos de nível superior que a seleção atravessa
com este container, e, se já estiverem todos envolvidos, estende o interior de volta ao lugar.

```
antes de envolver   [p"primeira linha", p"segunda"]
depois de envolver  [p[ note[ p"primeira linha", p"segunda" ] ]]
pressionado de novo [p"primeira linha", p"segunda"]
```

### `holds`

| | O que vive dentro | Exemplo |
|---|---|---|
| `'blocks'` | Parágrafos e outros blocos | citação, bloco recolhível, a célula de uma tabela |
| `'inline'` | Só texto e marks | a linha de resumo de um bloco recolhível, código |

### `allows`

Se declarado, **nada fora dele pode entrar.** O núcleo acrescenta sozinho um limpador, então,
venha por colagem ou de um valor salvo, tudo fora da lista tem a casca retirada e seu texto se
assenta como parágrafo.

Sem declarar, tudo é permitido. Colocar um nome desconhecido em `allows` **morre já no próprio
registro.**

---

## `parts` — estrutura interna sem botão

Estrutura que **não pode existir sozinha e não tem botão de barra de ferramentas** — linhas e
células de uma tabela, a linha de resumo de um bloco recolhível — se declara como uma parte
(part).

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // um atributo cujo único valor é 1 — se está aberto
  parts: { summary: { holds: 'inline' } },            // a linha de resumo
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // cada parte precisa de uma montagem
  repair: repairDetails,
}
```

São quatro regras.

- Uma parte só existe em **container.** Declará-la em outro `place` derruba o registro.
- Cada parte precisa de um `partHtml`. Sem ele, o registro morre.
- O nome de uma parte não pode colidir com o nome de um wing nem com o de outra parte.
- Se uma parte precisa de reparo, declare-o em `partRepair` sob o nome dessa parte.

`StructureDecl` aceita três coisas — `holds`, `singleParagraph` e `boolAttrs`.

### `singleParagraph`

O interior é **fixado a um único parágrafo.** É isso que faz uma célula de tabela — apertar
<kbd>Enter</kbd> dentro de uma célula não divide o parágrafo em dois, e apagar uma seleção que
atravessa duas células não as funde. É este único campo que preserva a grade.

### `boolAttrs`

Um atributo cujo único valor é `1` — o `o` (aberto) de um bloco recolhível, o `ck` (marcado) de
uma lista de tarefas, o `dc` (capitular) de um parágrafo. O estado desligado não é `0`, é **o
campo simplesmente não existir.**

---

## `repair` — a última porta na entrada do valor salvo

`repair` apara este nó uma vez, **bem antes de o JSON virar documento.**

```ts
repair: (node) => {
  if (!éVálido(node)) return null    // null — este nó é removido, casca incluída
  return nóAparado                   // devolvê-lo sem mudança também vale (o mesmo objeto significa que nada mudou)
}
```

Um valor salvo editado à mão, um documento vindo de outro build, um JSON construído por outra
pessoa — tudo isso passa por esta porta. Só o que atravessa aqui vira documento, o que faz deste
**o único lugar onde um wing pode garantir sozinho a forma do seu próprio nó.**

Declarando `allows` e `repair` juntos, a limpeza de `allows` roda **primeiro**, e o resultado é
repassado para `repair`.

---

## `requiresAnyOf` — um wing que precisa de um parceiro para existir

```ts
requiresAnyOf: ['img', 'a']
```

Se nenhum destes estiver registrado junto, **morre já no próprio registro.** O wing de envio usa
isto — o que ele envia precisa ser construído como imagem ou link, e sem nenhum dos dois, ele
consegue enviar mas depois não faz mais nada.

---

## Atributo de parágrafo (`place: 'attr'`)

Um atributo de parágrafo não constrói nó. Só coloca um valor no `a` do parágrafo.

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["Um título 2 centralizado"] }
```

::: warning Os campos estão fixados em três
`attrKey` precisa ser um entre **`h` (título) · `a` (alinhamento) · `dc` (capitular)**; qualquer
outro nome derruba o registro. Nesta versão **não é possível criar um novo atributo de
parágrafo** — os campos de atributo de um parágrafo estão fechados nos três que o núcleo
conhece.

Pelo mesmo motivo, esses três já são ocupados por `headingWing`, `alignWing` e `dropCapWing`, o
que na prática não deixa espaço para escrever um novo wing `place: 'attr'`. Se quiser colocar um
valor em cada parágrafo, por ora o caminho é envolver com um container.
:::

Há dois campos para lidar com o valor.

| | |
|---|---|
| `attrValues` | A lista de valores que aceita (para título, `[1,2,3,4,5,6]`) |
| `currentValue` | O valor que este parágrafo carrega agora. A barra de ferramentas e a linha de contexto pintam o campo pressionado com base nessa resposta |

---

## Os auxiliares de documento expostos publicamente

Esta versão expõe quatro auxiliares de edição.

| | O que faz |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | Constrói um bloco, parágrafo wrapper e tudo |
| `removeLump(doc, topIndex, env)` | Remove por completo um parágrafo wrapper de nível superior |
| `toggleWrap(doc, sel, containerW, env)` | Envolve os blocos atravessados com um container ou os estende de volta |
| `topNodeAt(doc, path)` | O nó de nível superior a que este caminho pertence |

As quatro respondem com `{ doc, caret }`, então você converte uma vez para a forma com que um
comando responde.

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

::: tip Precisa de uma edição mais fina que essa
Os auxiliares internos que cortam e unem caractere por caractere (aplicar um mark, escrever um
atributo de parágrafo, etc.) ainda não são API pública. Até lá, você pode construir o array
`doc` você mesmo e responder com ele — o documento com o qual você responde ainda é aparado mais
uma vez pelo `cocoon`, então um documento que quebre as regras nunca sobrevive assim.
:::

---

## Próximas páginas

- [Teclas, conversão automática, colagem](../custom/input) — `onKey` · `inputRules` · `attach`
- [UI e comportamento](../custom/ui) — o botão da barra de ferramentas e a linha de contexto

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
