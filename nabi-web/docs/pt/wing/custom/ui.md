---
title: UI e comportamento
description: Botão da barra de ferramentas (button), linha de contexto (context), folha de estilo (styles) — os três lugares onde um wing fica diante de uma pessoa.
---

# UI e comportamento

Há três lugares onde um wing fica diante de uma pessoa.

| Campo | Onde |
|---|---|
| `button` · `buttons` | a **barra de ferramentas**, no topo — o lugar sempre visível |
| `context` | a **linha de contexto** — o lugar que só aparece para o que o cursor está tocando agora |
| `styles` | o **CSS** que este wing carrega |

---

## Botões da barra de ferramentas

```ts
button: {
  group: 'emphasis',                   // em que grupo fica — obrigatório
  svg: '<path d="…"/>',                // o interior num grid 16×16. Sem isso, fica como texto
  label: { pt: 'Negrito' },
  shortcut: 'B',                       // essa letra no modo de dicas
  accelerator: 'mod+b',                // a combinação com Ctrl/⌘
  action: { kind: 'mark' },
}
```

Para vários botões, escreva um array em `buttons` — é assim que um único wing de alinhamento se
apresenta como esquerda, centro e direita. Nesse caso, `name` os distingue entre si, e `value`
diz qual valor cada um representa.

### `group` — o grupo decide a ordem

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

**Essa ordem é fixa.** Onde quer que você coloque um wing no array, seu botão fica no lugar do
seu grupo. A ordem de registro só decide o posicionamento **dentro** de um grupo. Usar um nome
fora dessa lista faz um novo grupo aparecer bem no final.

Quando um grupo esvazia por completo (todos os seus botões escondidos), esse grupo desaparece
da tela — nenhum separador vazio fica para trás.

### `action` — o que acontece ao pressionar

| `kind` | O que faz | O que vem junto |
|---|---|---|
| `'mark'` | vai para o alternador de mark do núcleo. **Você não precisa escrever um comando** | — |
| `'command'` | executa um comando | `command` · `args?` |
| `'menu'` | abre uma lista de valores como painel | `command` · `argKey` · `values` |
| `'grid'` | abre um grid linhas×colunas (inserir uma tabela) | `command` · `rowsKey` · `colsKey` · `max?` |
| `'prompt'` | levanta campos de entrada e passa o que voltar para o comando | `command` · `fields` |
| `'file'` | abre a seleção de arquivo | `accept?` · `multiple?` |
| `'host'` | repassa para o host (`onHost` de `mountToolbar`) | — |

Sem declarar `action`, pressionar o botão não faz nada.

### `shortcut` e `accelerator`

| | Forma | Regra |
|---|---|---|
| `shortcut` | `'B'` | **uma única letra maiúscula latina ou um dígito** |
| `accelerator` | `'mod+b'` | `mod+` seguido de **uma única letra minúscula** |

Os dois **morrem no registro se colidirem entre wings.** Nenhum dos dois para de funcionar
silenciosamente mais tarde.

Escrever um `accelerated` à parte faz o acelerador agir diferente — o botão abre um painel,
enquanto <kbd>Ctrl</kbd>+tecla aplica o valor padrão na hora, por exemplo.

---

## Como um botão aparece pressionado

Só existe uma base para pintar um botão como "ligado agora".

| `place` | O que lê |
|---|---|
| `'mark'` | se esse mark está no cursor |
| `'attr'` | o `currentValue` do parágrafo onde o cursor está |
| `'container'`·`'void'` | se o cursor está dentro ou sobre esse bloco |
| `'tool'` | **sempre desligado** |

Um wing com vários valores (alinhamento, títulos) escreve um `value` em cada botão, e só o
botão que bate com o que `currentValue` do wing responde é pintado.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

**`currentValue` responde com uma string** — mesmo um valor numérico volta convertido por
`String()`. `undefined` significa "este nó não carrega nenhum dos meus valores".

---

## Botões se escondem sozinhos onde não podem existir

| `place` | Quando se esconde |
|---|---|
| `'mark'` | num lugar onde só vive texto (dentro de uma caixa de código, por exemplo), quando ela é a dona desse lugar |
| `'attr'` | quando o cursor está sobre um parágrafo wrapper que carrega um bloco. **Alinhamento (`a`) é a única exceção** |
| `'void'`·`'container'` | num lugar onde só vive texto, ou quando o `allows` do container atual não o aceita |
| `'tool'` | nunca se esconde |

Alinhamento é a exceção pelo mesmo motivo visto antes — o alinhamento de um bloco não é
carregado pelo bloco, mas pelo parágrafo wrapper ao redor. É preciso poder pressionar
"centralizar" enquanto se está sobre uma imagem.

Declarar `allows` faz **a barra de ferramentas seguir sozinha.** O botão de tabela sumir dentro
de uma caixa de código não é uma regra escrita à parte; ele cai direto desse único campo.

---

## A linha de contexto

A linha que só aparece para o que o cursor está tocando agora. Clicar numa imagem, aparece o
controle de tamanho; colocar o cursor num link, aparece o campo de endereço.

```ts
context: {
  title: { pt: 'Nota' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { pt: 'Tom' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // o campo de atributo de onde se lê o valor atual
      values: [
        { value: 'info', label: { pt: 'Aviso' } },
        { value: 'warn', label: { pt: 'Alerta' } },
      ],
    },
  ],
}
```

### Quando aparece

**Tudo o que o cursor toca** abre sua própria linha.

- os containers no caminho do cursor (o mais interno primeiro, o mais externo por último)
- o bloco mirado (uma imagem selecionada enquanto se está sobre seu parágrafo wrapper, por exemplo)
- os **marks** no cursor — diferente dos botões da barra de ferramentas, marks também têm linha
  de contexto
- um wing de **atributo de parágrafo** cujo valor o parágrafo do cursor carrega agora

Colocar o cursor num link dentro de uma tabela faz a linha do link e a linha da tabela
aparecerem juntas.

### As sete variedades de `ContextControl`

| `kind` | O quê | O que vem junto |
|---|---|---|
| `'button'` | um clique, um comando | `command` · `args?` |
| `'toggle'` | dois estados, ligado e desligado | `command` · `token` |
| `'select'` | um dentre uma lista | `command` · `argKey` · `values` · `attr?` |
| `'range'` | mover uma escala (redimensionar) | `command` · `argKey` · `values` · `rest?` · `readout?` |
| `'text'` | um único campo de texto (endereço de link) | `command` · `argKey` · `initial?` · `placeholder?` · `validate?` |
| `'prompt'` | vários campos como painel | `command` · `fields` |
| `'lightbox'` | ver ampliado | `src` · `alt?` |

As sete compartilham `name` (obrigatório) · `label?` · `svg?` · `tip?` · `visible?`.

`visible: (node) => boolean` é a porta para **esconder um controle dentro do mesmo wing** —
mostrar "desfazer mesclagem" só em células já mescladas, por exemplo.

Declarar `attr` faz o valor atual ser lido direto desse campo de atributo para pintar. O
`'toggle'` compara com `token` contra a string que `currentValue` respondeu.

---

## `styles` — o CSS que um wing carrega

```ts
styles: `
.nabi-content aside[data-nabi-note] {
  border-inline-start: 3px solid var(--nabi-accent);
  padding: .6rem .9rem;
  background: color-mix(in srgb, var(--nabi-accent) 8%, transparent);
}
`
```

Quatro regras.

- **Limite tudo sob `.nabi-content`.** Não deve vazar para o resto da página do host.
- **Tamanhos de letra em `rem` ou `em`.**
- **Reconheça o escuro só pela classe `.dark`.** Fazer isso com uma media query deixa só o
  editor escuro num host que escolheu claro.
- **Meça largo e estreito com uma container query.** A referência é a largura do lugar onde o
  editor está sentado, não a largura da tela.

Para reunir e injetar só o que você registrou, faça isso você mesmo.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const detach = injectSheets(document, collectSheets(registry))
```

Uma folha de estilo com o mesmo texto carrega **uma única vez** — vários wings podem
compartilhar o mesmo CSS, e só uma cópia entra no documento. A resposta é uma função de
remover, e ela remove **só o que esta chamada acrescentou.**

---

## Perguntando à pessoa

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

`confirm` aceita um `boolean` ou um `Promise<boolean>` — encaixe o `confirm` do próprio
navegador, ou levante um painel próprio e responda depois.

::: warning Sem isso, a resposta é sempre "não"
Sem fornecer `ask`, entra um padrão silencioso. `message` não vai para lugar nenhum, e
`confirm` responde `false`. A lógica é que é melhor **um perguntar-e-então-apagar falhar
silenciosamente** do que acontecer silenciosamente. O "apagar mesmo?" do histórico local passa
por essa porta.
:::

::: tip Comandos não podem perguntar
Um comando é uma função pura; não conhece nem a tela nem o tempo. Pergunte fora do comando e
chame o comando **assim que a resposta chegar.** Dentro de um wing, o lugar para isso é
`attach`, onde se alcança via `host.nabi.$ask`.
:::

---

## Próximas páginas

- [Marks inline](../custom/inline) · [Blocos e atributos de parágrafo](../custom/block) ·
  [Teclas, conversão automática, colagem](../custom/input)
- [Tema e variáveis CSS](../../style/custom) — os nomes de variável em que a folha de estilo se apoia

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
