---
title: Crie o seu próprio wing
description: Um guia para escrever o contrato de interface Wing do NABI NOTE, para criar novas formatações e funcionalidades personalizadas.
---

# Crie o seu próprio wing

Um wing é **um único objeto JavaScript puro.** Não há classe para herdar nem procedimento de
registro separado num framework — colocar o objeto no array passado a `createNabiWith` já o
registra imediatamente.

Todo wing oficial que acompanha o NABI NOTE — negrito, tabelas, envio de arquivo, todos — é
escrito seguindo exatamente a mesma interface `Wing`. Um wing escrito por você mesmo funciona
**exatamente nas mesmas condições** que um wing embutido.

---

## O exemplo de wing mais simples

Um wing de mark inline que reconhece a tag de teclado `<kbd>`.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // o identificador único deste wing (a chave salva no nabi-tree)
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // função de saída em HTML
  }),
  // detecta tags <kbd> no HTML recebido e as converte num nó do nabi-tree
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Agora a tag `<kbd>` é preservada no editor — ela sobrevive a colar da área de transferência, a
`setHtml()`, e a salvar e reabrir.

```
registrado      <p>Atalho: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   tag <kbd> preservada
não registrado  <p>Atalho: <kbd>Ctrl</kbd></p>                →   <p>Atalho: Ctrl</p> (convertido para texto simples)
```

`toHtml` é a função de serialização que exporta um nó do nabi-tree para HTML, e `claim` é a
regra de desserialização que lê HTML externo de volta para um nó do nabi-tree. Sem `claim`, a
saída em HTML ainda funciona, mas ao salvar e reabrir a tag é convertida em texto simples.

Use `simpleMark()` para um mark sem atributos, `valueMark()` para um mark que carrega um valor,
`boxObject()` para um bloco independente, e `listFamily()` para uma estrutura de lista — todos
reduzem código repetitivo.

---

## Módulos de wing e funções de fábrica

**A maioria dos wings embutidos são constantes predefinidas e imutáveis** (`boldWing`,
`headingWing`, etc.). Só os wings que precisam de opções de configuração extras são oferecidos
como funções de fábrica.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

Para mudar apenas o comportamento de um wing embutido específico (um realce de sintaxe, por
exemplo), espalhe o objeto wing existente com o operador de espalhamento e sobrescreva só os
campos desejados.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Ordem de registro e validação

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**A ordem dos wings no array é a prioridade de varredura do HTML.** Ao analisar HTML externo
(`claim`), os wings são verificados na ordem de registro, e o wing que primeiro reivindicar a
posse processa aquela tag. Uma tag que nenhum wing reivindica tem sua tag removida, preservando
só o texto interno.

O posicionamento dos botões da barra de ferramentas obedece **primeiro à ordem do grupo
(`button.group`)**; só dentro do mesmo grupo a ordem de registro dos wings decide o
posicionamento.

### Validação e tratamento de exceções (validação estrita)

`createNabiWith` não adia um erro de execução quando um wing registrado viola o contrato — ele
**lança uma exceção imediatamente, no momento da inicialização.**

| O que é verificado | Exemplo de violação |
|---|---|
| Uso de um identificador reservado | `w: 'p'`, `w: 'br'` |
| Registro duplicado de um identificador (`w`) | Passar o mesmo `boldWing` duas vezes |
| Função de renderização ausente | `place: 'mark'` sem `toHtml` definido |
| Violação da convenção de nomes de comando | Não seguir verbo+substantivo em camelCase (ex. `insertTable`) |
| Wing dependente obrigatório ausente | Falta o wing de imagem/link exigido pelo wing de envio via `requiresAnyOf` |

---

## Comandos — funções puras

Toda operação que altera o documento passa por uma função de comando. Um comando se comporta
como uma **função pura, que não depende da API do DOM nem da renderização na tela.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // valida o tipo do argumento externo
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { pt: 'Carimbo' },
    action: { kind: 'command', command: 'insertStamp', args: { text: 'OK' } },
  },
}
```

| Parâmetro | Descrição |
|---|---|
| `doc` | O array do documento nabi-tree atual (tratado como imutável — retorna um novo documento em vez de alterá-lo diretamente) |
| `sel` | O estado atual do cursor e da seleção (`{ anchor, focus }`) |
| `args` | O objeto de argumentos passado por um botão da barra de ferramentas ou pela interface |
| `env` | Conhecimento de esquema e contexto do ambiente |

Um comando retorna o objeto alterado `{ doc, selection }` ou **`null`**. **Se o documento não
mudar, ele deve obrigatoriamente retornar `null`.** Quando retorna `null`, `applyCommand`
retorna `false` e nenhum item desnecessário de histórico de desfazer é criado. O documento
retornado passa pelo motor `cocoon` (normalização), garantindo assim a integridade do esquema.

O host chama o comando pelo nome.

```ts
nabi.applyCommand('insertStamp', { text: 'OK' })   // retorna um booleano
```

---

## A interface `Wing` em detalhe

A interface `Wing` tem 31 propriedades no total, das quais **2 são obrigatórias** (`w`,
`place`).

### 1. Identidade e estrutura básicas

| Propriedade | Descrição |
|---|---|
| `w` | Identificador único do wing (obrigatório; palavras reservadas `p`, `br` excluídas) |
| `place` | Tipo do wing (obrigatório: `'mark'` formatação inline, `'void'` bloco vazio, `'container'` bloco contêiner, `'attr'` atributo de parágrafo, `'tool'` ferramenta não salva no documento) |
| `basic` | Se o wing funciona de fábrica, sem conexão extra de backend/host (`boolean`, padrão `false`). Usado como critério de filtro quando `wings().allBasic()` é chamado |
| `holds` | O tipo de filho que um contêiner permite dentro de si (`'blocks'` ou `'inline'`) |
| `singleParagraph` | Se o interior é fixado a um único parágrafo (por ex. uma célula de tabela) |
| `boolAttrs` | Nomes de atributos booleanos cujo único valor é `1` |
| `allows` | Lista de nomes de wings filhos permitidos dentro do contêiner (todos permitidos se não especificado) |
| `noAlign` | Se o alinhamento de texto do parágrafo wrapper é bloqueado (`boolean`, só para blocos). Usado, por exemplo, para impedir que o alinhamento quebre a tag `pre` em blocos de código |
| `requiresAnyOf` | Lista de wings dependentes que devem ser registrados junto (ao menos um deles é obrigatório) |
| `parts` | Definição de subcomponentes pertencentes ao wing (linhas/células de uma tabela, o resumo de um bloco recolhível, etc.) |

### 2. Atributos e gerenciamento de estado

| Propriedade | Descrição |
|---|---|
| `attrKey` · `attrValues` | A chave de atributo que um wing de atributo de parágrafo usa, e a lista de valores permitidos |
| `currentValue` | Função que retorna o valor do atributo na posição atual do cursor (usada para mostrar o estado ativo de um botão da barra de ferramentas) |

### 3. Serialização e entrada/saída

| Propriedade | Descrição |
|---|---|
| `toHtml` · `partHtml` | Função de serialização que converte um nó do nabi-tree em HTML |
| `toMd` | Função de serialização que converte um nó do nabi-tree em Markdown (opcional — cai para `toHtml` se não definida) |
| `partMd` | Função de serialização em Markdown para os subcomponentes (`parts`) |
| `ioFilter` | Filtro de entrada/saída de arquivo e área de transferência que o próprio wing traz |
| `claim` | Função que decide a posse de um marcador HTML recebido e o converte num nó do nabi-tree |
| `repair` · `partRepair` | Função que valida e corrige a integridade de um nó ao carregar do JSON (retornar `null` remove o nó) |

### 4. Entrada e controle de eventos

| Propriedade | Descrição |
|---|---|
| `commands` | O mapa de funções de comando que o wing fornece |
| `onKey` | Manipulador que intercepta a entrada do teclado enquanto o cursor está dentro do nó deste wing |
| `escapeKeys` | Lista de teclas que fazem o próximo caractere digitado saltar para fora desta formatação de mark |
| `doubleKeys` | Mapeamento de comandos a executar quando uma tecla é pressionada duas vezes em até 350ms (`{ nome da tecla: nome do comando }`, ex. Esc Esc → limpar formatação) |
| `inputRules` | Regras de conversão de formatação disparadas automaticamente pelo padrão de digitação |
| `attach` | Gancho para vincular ou controlar diretamente ouvintes de evento num elemento do DOM (arrastar célula de tabela, realce de código, etc.) |

### 5. Interface e estilo

| Propriedade | Descrição |
|---|---|
| `button` · `buttons` | Definição do(s) botão(ões) renderizado(s) na barra de ferramentas superior |
| `context` | Definição da barra de ferramentas de contexto que aparece de acordo com a posição do cursor |
| `styles` | String de folha de estilo CSS que o wing traz consigo |

---

## Extensão por filtros de E/S

**Um filtro de E/S (IoFilter) não cria nós de documento diretamente — é um ponto de extensão
que trata o colar da área de transferência e os formatos de salvar/abrir arquivo.**

| Campo | Descrição |
|---|---|
| `id` · `label` | Identificador único do filtro e o rótulo exibido na interface (um identificador duplicado lança uma exceção) |
| `paste` | Função que analisa os dados da área de transferência (`PasteData`) e retorna candidatos de colagem |
| `save` | Objeto de configuração de salvamento (`{ extension, write, lossy?, mime? }`) |
| `read` | Função que recebe um nome de arquivo e um texto e os interpreta como nabi-tree (retorna `null` se não houver correspondência) |

Os três métodos de um filtro de E/S são todos opcionais. O registro pode ser feito pelas opções
de montagem (`mountSurface`, `mountFile`), por `createNabiWith({ ioFilters })`, ou pela
propriedade `ioFilter` do próprio wing — o filtro registrado primeiro tem prioridade.

---

## Regra de nomeação do identificador (`w`)

`w` é **a string identificadora que se repete, salva em cada nó do nabi-tree.** Para minimizar
o tamanho da serialização, é melhor usar uma string curta (como `b`, `hl`, `tf` nos wings
oficiais).
Para evitar colisão com um wing oficial, recomenda-se que um wing personalizado use o prefixo
`ex` (ex. `exNote`, `exStamp`).

::: warning Cuidado ao renomear o identificador
Como o campo `w` do valor salvo mapeia diretamente para o identificador, renomeá-lo pode fazer
com que documentos já salvos não sejam mais reconhecidos ao carregar. Se for necessário migrar,
escreva a função `claim` para também tratar o identificador antigo.
:::

---

## Próximas páginas

- [Crie um mark inline](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Crie um bloco e um atributo de parágrafo](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Teclas, conversão automática, colagem](./custom/input) — `onKey` · `inputRules` · `attach`
- [Interface e interação](./custom/ui) — `button` · `context` · `styles`, e conexão de caixas de diálogo do usuário

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
