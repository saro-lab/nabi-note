---
title: UI e comportamento
description: Guia para integrar botões da barra de ferramentas (button), linha de contexto (context), folhas de estilo (styles) e diálogos com a pessoa (ask).
---

# UI e comportamento

Um wing oferece sua interface em três lugares fixos: a **barra de ferramentas principal** (`button`/`buttons`), a **linha de contexto** (`context`) e o **CSS próprio do wing** (`styles`).

---

## Botões da barra de ferramentas (`button` / `buttons`)

```ts
button: {
  group: 'emphasis',                   // em que grupo fica — obrigatório
  svg: '<path d="…"/>',                // string do path SVG dentro de um viewBox 16×16
  label: { pt: 'Negrito' },
  shortcut: 'B',                       // essa letra mostrada no modo de dica (Shift pressionado duas vezes)
  accelerator: 'mod+b',                // a combinação com Ctrl/⌘
  action: { kind: 'mark' },            // alterna uma mark inline
}
```

Quando um wing oferece vários botões, defina-os como um array em `buttons` (por exemplo, um wing de alinhamento de texto que oferece três botões: esquerda, centro e direita). Cada botão é distinguido por `name`, e `value` indica o valor que aquele botão representa.

### Ordem dos grupos de botões (`group`)

A ordem de exibição dos grupos da barra de ferramentas é fixa, assim:

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

Não importa onde você declare um wing no array, seu botão é posicionado automaticamente no lugar do seu grupo, e dentro do mesmo grupo a ordenação segue apenas a ordem de registro dos wings. Ao indicar um nome de grupo novo, fora dessa lista, um novo grupo é adicionado no final da barra de ferramentas.

Quando todos os botões de um determinado grupo estão escondidos no estado atual, esse grupo e seu separador também são escondidos automaticamente.

### Tipos de ação de botão (`action`)

| `kind` | O que faz | Propriedades adicionais |
|---|---|---|
| `'mark'` | alterna uma mark inline (funciona pela lógica padrão do núcleo) | — |
| `'command'` | executa o comando indicado | `command`, `args?` |
| `'menu'` | mostra um menu suspenso de seleção de valor | `command`, `argKey`, `values` |
| `'grid'` | mostra um seletor de grade linhas×colunas para inserir uma tabela | `command`, `rowsKey`, `colsKey`, `max?` |
| `'prompt'` | levanta um popup de entrada e passa o valor digitado ao comando | `command`, `fields` |
| `'file'` | abre a caixa de diálogo de seleção de arquivo | `accept?`, `multiple?` |
| `'host'` | é repassado ao callback do host (`onHost` de `mountToolbar`) | — |

Um botão sem `action` definida não faz nada ao ser clicado.

### Atalhos (`shortcut` e `accelerator`)

| Campo | Formato | Regra |
|---|---|---|
| `shortcut` | `'B'` | **uma única letra latina maiúscula ou um dígito** |
| `accelerator` | `'mod+b'` | prefixo `mod+` seguido de **uma única letra minúscula** |

Se dois wings diferentes declararem o mesmo atalho, uma exceção é lançada imediatamente na inicialização.

A opção `accelerated` permite ramificar para executar uma ação diferente apenas quando disparada pelo atalho de teclado (por exemplo: clicar no botão abre um modal de opções, enquanto o atalho aplica o valor padrão diretamente).

::: warning Atalhos só funcionam dentro da área do editor designada
Os eventos de atalho só detectam teclas pressionadas dentro da área de edição passada a `mountToolbar({ surface })`. Quando existem vários editores em uma mesma página, a opção `surface` deve obrigatoriamente ser especificada para evitar interferência entre os eventos de tecla.
:::

---

## Regra de exibição do estado ativo (Pressed) dos botões

O critério pelo qual um botão da barra de ferramentas é exibido como "ativado agora (Pressed)" depende do tipo de wing (`place`):

| `place` | Critério de ativação |
|---|---|
| `'mark'` | se essa mark inline está aplicada na posição atual do cursor |
| `'attr'` | se o valor retornado por `currentValue` do nó de parágrafo atual coincide com o `value` do botão |
| `'container'` · `'void'` | se o cursor está dentro ou sobre esse bloco |
| `'tool'` | permanece sempre inativo |

Para um wing com vários valores (título, alinhamento etc.), apenas o botão cujo `value` coincide com a string retornada por `currentValue` é pintado como ativo.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

---

## Regra de ocultação automática de botões

O núcleo do editor desativa ou esconde automaticamente os botões da barra de ferramentas relacionados quando a formatação não pode ser aplicada:

- Em **áreas onde a formatação é restrita**, como dentro de um bloco de código, marks inline e outros botões de criação de bloco são escondidos automaticamente.
- No parágrafo wrapper de um bloco (imagem, tabela etc.), atributos de parágrafo como título são escondidos (o alinhamento de texto (`a`) permanece como exceção, para permitir o alinhamento do objeto).
- Botões de wings que não estão na lista `allows` do container superior são escondidos automaticamente.

---

## Linha de contexto dinâmica (`context`)

Uma barra de ferramentas auxiliar que oferece ferramentas de configuração especializadas para o elemento onde o cursor está (por exemplo: controle deslizante de tamanho ao clicar numa imagem, formulário de entrada de URL ao clicar num link, botões de adicionar linha/coluna quando o cursor está dentro de uma tabela).

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
      attr: 't',                                    // chave de atributo do nó de onde ler o valor atual
      values: [
        { value: 'info', label: { pt: 'Aviso' } },
        { value: 'warn', label: { pt: 'Alerta' } },
      ],
    },
  ],
}
```

### Tipos de controles da linha de contexto (`ContextControl`)

| `kind` | Forma do controle | Propriedades principais |
|---|---|---|
| `'button'` | clique simples de botão | `command`, `args?` |
| `'toggle'` | interruptor (ON/OFF) | `command`, `token` |
| `'select'` | menu suspenso de seleção | `command`, `argKey`, `values`, `attr?` |
| `'range'` | barra deslizante (ajuste de largura etc.) | `command`, `argKey`, `values`, `rest?`, `readout?` |
| `'text'` | campo de texto (URL de link etc.) | `command`, `argKey`, `initial?`, `placeholder?`, `validate?` |
| `'prompt'` | popup de formulário composto | `command`, `fields` |
| `'lightbox'` | popup de imagem ampliada | `src`, `alt?` |

Todos os controles compartilham em comum `name` (obrigatório), `label?`, `svg?`, `tip?`, `visible?`. Por meio da função `visible(node)`, é possível controlar dinamicamente se um controle é exibido conforme uma condição específica (por exemplo, mostrar o botão "desfazer mesclagem" apenas quando há células mescladas).

---

## Estilos próprios do wing (`styles`)

Um wing pode embutir o CSS que precisar.

```ts
styles: `
  .nabi-content aside[data-nabi-note] {
    border-left: 3px solid var(--nabi-accent);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
  }
`
```

Por meio de `collectSheets(registry)` e `injectSheets(document, sheets)`, é possível injetar dinamicamente no documento apenas os estilos dos wings registrados; a mesma string de estilo nunca é injetada duas vezes.

---

## Integração de diálogos com a pessoa (`ask`)

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

- `message`: mostra um aviso simples (`(text: string) => void`)
- `confirm`: janela de escolha confirmar/cancelar (`(text: string) => boolean | Promise<boolean>`)
- `choose`: janela de escolha com múltiplas opções (`(question: string, options: ChooseOption[]) => number | Promise<number>`)

A estrutura `ChooseOption` é `{ label: string, icon?: string }`, e o valor retornado é o índice de base 0 da opção escolhida (`-1` ao cancelar).

::: warning Comportamento padrão sem um handler ask
Se nenhum handler `ask` for passado, o valor de retorno padrão de `confirm` é `false` (cancelar), por segurança.
Para `choose`, sem handler, a primeira candidata (índice `0`) é escolhida por padrão. A UI de escolha de formato ao colar, por exemplo, é automaticamente vinculada à UI dedicada embutida no núcleo quando `mountToolbar` é montado — num ambiente comum, portanto, normalmente não é necessário implementar `choose` diretamente.
:::

---

## Próximos documentos

- [Criar uma mark inline](../custom/inline) · [Criar blocos e atributos de parágrafo](../custom/block) · [Teclas, conversão automática, colagem](../custom/input)
- [Personalizar o tema](../../style/custom) — guia de variáveis CSS e temas

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
