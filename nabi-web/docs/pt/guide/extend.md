---
title: Wings personalizadas
description: O contrato e a sequência de implementação para adicionar um recurso de documento durável.
---

# Wings personalizadas

Uma wing personalizada é mais do que um botão de barra de ferramentas. Ela é uma extensão declarativa que mantém juntos a estrutura salva do documento, comandos, conversão para HTML e Markdown, regras de importação e comportamento de visualização. O registry a valida antes mesmo de um editor existir, impedindo que estruturas inválidas entrem nos documentos.

## Comece pela fábrica mais estreita

A maior parte da formatação não precisa de uma declaração completa. Use `simpleMark()` para uma marca inline sem valor, `valueMark()` para uma marca com um conjunto limitado de valores, `boxObject()` para um bloco sem filhos e `listFamily()` para uma lista.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Implemente vários tipos de wing

Cada exemplo abaixo tem um formato salvo diferente. Registre uma primeiro e inspecione `getJson()` e `getHtml()`. Adicione comandos e botões somente depois que a estrutura estiver funcionando.

### 1. Marca inline sem valor: ênfase

Use `simpleMark()` quando um recurso apenas envolve texto. Isto armazena `exStrong` e o renderiza como `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

Com `clearable: true`, Limpar formatação também remove essa marca. Antes de adicionar um botão, aplique-a com `nabi.applyCommand()` ou outro comando personalizado. O mesmo seletor `.nabi-content strong` estiliza o editor e o conteúdo publicado.

### 2. Marca inline com valor: tom de status

Use `valueMark()` para cor, tamanho ou estado escolhido de um conjunto permitido. O valor é armazenado em `a.v`; valores fora da lista são removidos durante `repair()`.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

Sua forma salva é `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. O CSS mira o valor salvo, então também altera o conteúdo publicado. Não remova valores de uma lista existente sem cuidado: documentos salvos anteriormente podem perdê-los quando forem lidos.

### 3. Bloco sem filhos: divisor

Use `boxObject()` para um objeto independente sem filhos, como uma imagem, vídeo ou divisor.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Para um objeto com valores como URL ou largura, declare a validação em `attrs` e coloque valores obrigatórios em `requires`. Rejeite um valor que não possa ser verificado com `null`, em vez de substituir silenciosamente por um padrão.

### 4. Bloco com vários parágrafos: callout

Para um bloco que contém conteúdo de documento, declare um `container`. `holds: 'blocks'` permite filhos como parágrafos, listas e blocos de objeto.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Essa declaração sozinha não cria uma forma de envolver os parágrafos selecionados. Adicione um comando puro em `commands` e um `button` que o invoque antes de expor o recurso na UI do editor.

### 5. Um par combinado de lista e item

Use `listFamily()` quando uma lista e seu item precisam sempre aparecer juntos.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` repara um bloco dentro da lista envolvendo-o em um item. Adicione `itemDecl` e `repairItem` para um valor no nível do item, como estado marcado.

### Registre em uma seleção ordenada

Use as mesmas declarações, na mesma ordem, no servidor e no navegador.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

## Defina nomes e estrutura de documento

Nomes que entram em um documento devem corresponder a `ex[A-Z0-9]...`. Um nome como `exCallout` impede que uma wing oficial futura altere o significado do conteúdo salvo.

`place` determina o formato salvo: `mark` envolve conteúdo inline, `void` é um bloco sem filhos, `container` mantém filhos, `attr` altera atributos de parágrafo e `tool` não cria nó de documento. Um `container` precisa de `holds: 'blocks' | 'inline'` e `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf` e `parts` declaram restrições estruturais. Uma declaração `parts` também precisa de `partHtml` para cada parte. Use `attrKey` e `attrValues` para restringir uma wing que seleciona valores.

## Todas as opções de declaração

Declare apenas o que a wing precisa. Uma fábrica já fornece alguns campos para você.

| Área | Opções | Finalidade |
| --- | --- | --- |
| Base | `w`, `place`, `basic`, `styles` | Nome, tipo estrutural, participação no catálogo básico, CSS padrão |
| Estrutura | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Tipo de filho, comportamento do Enter, atributos permitidos, atributos booleanos |
| Estrutura | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Partes internas, filhos permitidos, exclusão de alinhamento, dependência de wing |
| Valores | `attrKey`, `attrValues`, `currentValue` | Chave e lista do valor salvo, detecção do valor atual |
| Comandos e entrada | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Comandos, tratamento de teclas, comportamento de Escape/tecla dupla, regras de autoformatação |
| Comportamento da surface | `attach` | Comportamento de DOM e limpeza de recursos de uma surface |
| Conversão | `toHtml`, `partHtml`, `toMd`, `partMd` | Saída HTML e Markdown |
| Importação e reparo | `claim`, `ioFilter`, `repair`, `partRepair` | Importação HTML, tratamento de arquivos, validação e reparo de JSON |
| UI | `button`, `buttons`, `context` | Declarações de barra de ferramentas e UI de contexto |
| Limpar formatação | `clearable` | Se Limpar formatação remove essa wing |

`w` e `place` são sempre obrigatórios. Wings que produzem nós, como `mark`, `void` e `container`, também exigem `toHtml()`. Um container precisa de `holds`; cada parte declarada precisa de seu `partHtml` correspondente.

## Mantenha HTML, Markdown e JSON juntos

`toHtml()` renderiza um nó salvo para HTML, enquanto `toMd()` exporta Markdown. Sem um construtor de Markdown, o HTML gerado é preservado para que informação não seja perdida. Use `claim()` para reconhecer apenas seu próprio elemento HTML e atributos validados ao importar.

`repair()` roda quando JSON é carregado e novamente depois dos comandos. Devolva um nó corrigido para um atributo inválido, ou `null` para um nó que não pode ser mantido. Construa HTML com `ctx.element()`, `ctx.escape()` e `ctx.url()`; nunca concatene tags, atributos ou URLs por fora dessas verificações.

## Separe comandos de comportamento de visualização

Um comando é uma função pura do documento e da seleção que devolve o próximo documento e uma seleção dentro dele. Ele nunca lê nem altera o DOM, e devolve `null` quando não consegue fazer uma alteração válida. Nomeie comandos em lower camel case começando com um verbo, como `insertNote`.

Coloque comportamento exclusivamente de DOM, como seleção por arrasto em tabelas, em `attach(host)`. Registre imediatamente a limpeza de cada listener ou atributo alterado com `host.onDispose()`, para que até uma configuração que falhe ainda seja limpa. Não modifique o DOM de texto em composição nem o mapeamento de seleção da surface.

Declare controles de barra de ferramentas e de contexto com `button`, `buttons` e `context`; duplicar as regras de comando na UI da aplicação pode fazer a UI e o modelo do documento divergirem.

## Estilos CSS

Coloque o CSS básico obrigatório de uma wing em `styles`. Os estilos das wings integradas já estão incluídos em `nabi-note/nabi.css`. Um navegador que monta os estilos do registry selecionado pode usar `collectSheets()` e `injectSheets()`; SSR deve vincular o arquivo CSS.

Use as mesmas classes e atributos de dados na edição e no conteúdo publicado, mas não altere a estrutura `[data-key]`, `display` ou `white-space` da edição. O CSS deve mudar apenas a aparência, não o mapeamento do caret.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Mire apenas classes ou atributos de dados criados por `toHtml()`. Mantenha alterações específicas do serviço mais estreitas, por exemplo `.article-body .ex-callout`.

## Verifique o contrato inteiro

Verifique se um documento JSON salvo recarrega com a mesma estrutura e o mesmo HTML. Teste se o registry rejeita nomes inválidos, comandos duplicados, builders ausentes e dependências não satisfeitas. Cubra importação HTML inválida e entrada de `repair()`, tratamento de seleção em comandos, saída SSR e uma visualização publicada estilizada.

Para tipos completos e argumentos das fábricas, consulte as declarações instaladas e a [referência da API em inglês](https://nabi.saro.me/llms/api-reference.md).
