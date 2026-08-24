---
title: Teclas, conversão automática, colagem
description: Intercepte teclas com onKey, construa formatação só de digitar com inputRules, e toque a tela com attach.
---

# Teclas, conversão automática, colagem

Um wing tem três portas para o que uma pessoa faz — **teclas** (`onKey`), **digitação**
(`inputRules`) e **a tela** (`attach`).

---

## O caminho que uma tecla percorre

Ao pressionar <kbd>Enter</kbd> uma vez, a pergunta segue esta ordem. Quem pegar primeiro
encerra o percurso.

```
① Atalho da barra de ferramentas   ouvido em qualquer lugar (coisas como Ctrl+B)
② Conversão automática             inputRules — só Enter e espaço
③ O onKey do wing                  para o dono do lugar onde o cursor está
④ Mirar num bloco                  backspace bem no início de um parágrafo → seleciona o bloco anterior por inteiro
⑤ Regras do núcleo                  dividir parágrafo, apagar, mover o cursor
⑥ O navegador                       só se ninguém tiver pegado até aqui
```

---

## `onKey` — interceptando uma tecla

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // não é da minha conta — devolve ao núcleo
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // backspace bem no início da primeira célula — desfaz a nota
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
  commands: { toggleNote },
  onKey: noteKeys,
}
```

| Argumento | O que é |
|---|---|
| `intent` | `{ key, dir? }` — qual tecla |
| `doc` · `sel` · `env` | os mesmos três que um comando recebe |
| `owner` | `{ path, node }` — **o nó do qual eu fui escolhido dono** |

A resposta é o mesmo `{ doc, selection }` que um comando devolve, ou **`null`**. `null`
significa "não pego isso", e o núcleo assume — quando suas condições não batem, você precisa
responder `null`.

### Quais teclas chegam

| `intent.key` | Quando |
|---|---|
| `'enter'` | <kbd>Enter</kbd> **e** <kbd>Shift</kbd>+<kbd>Enter</kbd>, os dois |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | as duas teclas de apagar |
| `'arrow'` | setas. A direção vem em `intent.dir` (`'left'`·`'right'`·`'up'`·`'down'`) |

Teclas de caractere nunca chegam aqui. O navegador digita o caractere, e o núcleo o registra.

### Só existe um dono

Suba o caminho do cursor **para cima**; o primeiro nó que não é parágrafo, e o wing dono desse
nó, é o dono.

```
Cursor no caminho [1, 0, 0]                  candidato a dono
  [1, 0, 0]  →  p        é parágrafo, então é pulado
  [1, 0]     →  note     ← o dono
  [1]        →  p (wrapper)  nunca se chega até aqui
```

Então **o container mais interno vence** — numa lista dentro de uma tabela, <kbd>Tab</kbd> vai
para a lista. Uma parte (`parts`) também pode ser dona, e quando é, `owner.node` é o nó da parte,
mas o `onKey` chamado é o do wing que a declarou. Por isso é convenção verificar primeiro
`owner.node.w` para saber qual foi escolhido.

---

## `inputRules` — construindo só a partir da digitação

É isso que faz `# ` virar título e `> ` virar citação.

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| Campo | |
|---|---|
| `trigger` | `'space'` ou `'enter'` — medido no **instante** em que essa tecla é batida |
| `pattern` | uma expressão regular. `run` recebe o resultado do match |
| `run` | `{ name, args? }` — o comando a executar |
| `scope` | `'block'` (padrão) ou `'word'` |

### `'block'` — troca o começo da linha

Olha para o **começo da linha** antes do cursor. Ao dar match, apaga esse prefixo (e o
caractere gatilho) e roda o comando.

Só dispara na **primeira linha** de um parágrafo. Numa linha alcançada com
<kbd>Shift</kbd>+<kbd>Enter</kbd>, não dispara — isso impede que formatação irrompa no meio de
um texto que já se está escrevendo.

### `'word'` — coloca sobre uma única palavra

Olha para a **única palavra** antes do cursor. Ao dar match, seleciona essa palavra, roda o
comando e devolve o cursor ao lugar. Nenhum texto é apagado — é essa a forma para regras que
aplicam um mark.

---

## `attach` — tocando a tela

Às vezes a tarefa não é mudar o documento, mas escutar **o que acontece na tela** — selecionar
células de tabela arrastando, colorir código, clicar no triângulo de um bloco recolhível.

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // responda com uma função de desligar
}
```

`host` dá a você três coisas.

| | |
|---|---|
| `host.root` | o elemento da superfície de edição |
| `host.nabi` | o editor. Mudar o documento se faz **via comandos** |
| `host.pathOfKey(id)` | transforma um `data-key` da tela num caminho dentro do documento |

`mountSurface` prende junto o `attach` de cada wing registrado, e chama as funções de desligar
que você devolveu quando é desmontado.

::: tip Encontrando o documento via `data-key`
A montagem do editor (`getEditorHtml()`) marca cada nó com um `data-key`. Encontre o
`[data-key]` mais próximo a partir do elemento clicado e passe para `host.pathOfKey()` para
obter o lugar dentro do documento.
:::

---

## Colagem e o pipeline de parsing de HTML

Colar, `setHtml()` e o carregamento do HTML inicial passam todos pelo mesmo pipeline de parsing
e normalização.

```
Colar          ─→ Filtros de E/S ─→ pop-up de escolha de formato (com dois candidatos ou mais) ─┐
setHtml        ──────────────────────────────────────────────────────────────────────────────────┼→ parsing HTML → o claim dos wings → mapeamento de tags padrão do núcleo → repair → cocoon → árvore nabi
HTML inicial   ──────────────────────────────────────────────────────────────────────────────────┘
```

- **`setHtml()` e o carregamento do HTML inicial não passam pelo pop-up de escolha** — vão direto
  para o pipeline de parsing.
- Ao colar da área de transferência, o pop-up de escolha de formato só aparece quando há dois ou
  mais candidatos; o parsing real (`claim`) só ocorre depois que a pessoa escolhe um formato.
- Uma tag estranha para a qual nenhum wing define `claim` é removida com segurança — só o texto
  de dentro é preservado.

---

## Próximas páginas

- [UI e comportamento](../custom/ui) — botões da barra de ferramentas e a linha de contexto
- [Plugando um filtro de E/S](../custom#plugando-um-filtro-de-e-s) — o ponto de extensão para colar, salvar e abrir
- [Marks inline](../custom/inline) · [Blocos e atributos de parágrafo](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
