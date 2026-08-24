---
title: Personalizar o estilo
description: Como personalizar cores, fontes, espaçamento e outros estilos do NABI NOTE usando variáveis CSS.
---

# Personalizar o estilo

**A própria aplicação host prende a folha de estilo** — num bundler, com `import 'nabi-note/nabi.css'`; via CDN, com uma tag `<link>`. Depois disso, basta sobrescrever as variáveis CSS necessárias para mudar todo o tema do editor de forma consistente.

Todo componente de interface do NABI NOTE é **estilizado só com variáveis CSS `--nabi-*`, sem nenhuma cor escrita direto no código** — então sobrescrever as variáveis já basta para ajustar sua marca.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

Por que o seletor de classe se repete três vezes, veja a seção [Guia de especificidade CSS](#guia-de-especificidade-css) abaixo.

::: tip O HTML salvo não tem estilos em linha
O HTML que o editor produz (`getHtml()`) **não tem nenhum atributo `style` em linha.** O marcado só traz a estrutura semântica e os atributos (como `data-nabi-align="center"`), enquanto a folha de estilo cuida da aparência visual. Por isso, ao renderizar HTML salvo numa página externa, ainda é preciso colocá-lo **dentro de um contêiner `.nabi-content` com `nabi.css` aplicado** para ficar igual ao editor.

Veja [Desenhando HTML salvo em outro lugar](#desenhando-html-salvo-em-outro-lugar) abaixo para mais detalhes.
:::

::: tip Os temas claro e escuro já vêm prontos
O host não precisa definir nenhuma variável extra para o tema padrão. A folha de estilo do núcleo já traz os valores padrão do claro, um tema `.dark` e um tema `.light` explícito.
:::

## Tokens de cor e tema

| Token | Significado | Padrão (claro) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | Fundo base · fundo de hover/leve | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | Texto base · texto secundário apagado · texto sobre a cor de destaque | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | Borda/divisor · cor de destaque principal (foco/ativo) | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | Cor de perigo/alerta · texto sobre essa cor | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | Sombra de menus suspensos · fundo escurecido de modal/prévia | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | Arredondamento de cantos (padrão · pequeno · mínimo) | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | Arredondamento de cantos de painéis/modais em camada | `.25rem` |
| `--nabi-z-sticky` | z-index do cabeçalho fixo | `20` |
| `--nabi-grid-cell` | Tamanho de célula de grades, como a de inserir tabela | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | As seis cores de marca-texto | cores semitransparentes |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | As cinco cores de texto | cores fortes |

As variáveis da tabela acima são tokens que a folha de estilo do núcleo (`nabi.css`) **declara diretamente.** Elas estão vinculadas não só a `.nabi`, mas a três seletores — `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))` — para permitir renderização independente.

## Tokens só referenciados (podem ser declarados em :root)

As variáveis abaixo são tokens que o núcleo **não declara, só referencia** — como `var(--token, valor de reserva)`. Se o host não der um valor, vale o valor de reserva indicado. Como não são declaradas no nível do núcleo, **você pode declará-las em `:root` para aplicá-las globalmente.**

| Token | Significado | Valor de reserva padrão |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | A fonte do editor e de cada ramo do wing de tipo de letra | fontes do sistema |
| `--nabi-cursive-adjust` | A proporção de `font-size-adjust` da fonte cursiva | `0.4` |
| `--nabi-sticky-top` | O deslocamento superior da barra de ferramentas fixa (ajuste para a altura de um cabeçalho fixo do site, se houver) | `0px` |
| `--nabi-preview-width` | A largura padrão do cartão de prévia | `720px` |
| `--nabi-placeholder` | O texto de exemplo exibido num editor vazio | nenhum |
| `--nabi-placeholder-color` | A cor desse texto de exemplo (sem valor, usa uma cor de reserva específica do tema) | `--nabi-placeholder-color-fallback` |
| `--nabi-content-min-height` | A altura mínima de uma superfície de edição vazia (aplica-se só à superfície de edição `.nabi-editing`) | `12.5rem` |
| `--nabi-touch-font-size` | O tamanho de letra dos campos de formulário (`.nabi-input`) em dispositivos de toque (`pointer: coarse` ou largura ≤ 40rem) — evita o zoom automático do Safari no iOS | `16px` |

`--nabi-typeface-base` não é só referenciado — **o núcleo o declara diretamente** (por padrão referencia `--nabi-font`). Para mudar a fonte padrão, sobrescreva `--nabi-font`.

`--nabi-keyboard-top` e `--nabi-keyboard-bottom` são variáveis internas que **`mountSticky()` mede e escreve dinamicamente** a partir da altura do teclado móvel.

`--nabi-bar-height` é, do mesmo modo, uma variável interna que **`mountSticky()` mede e escreve** a partir da altura real da barra de ferramentas. É usada como `scroll-margin-block-start` em elementos `.nabi-content > *` para que não fiquem escondidos sob a barra de ferramentas ao rolar até eles.

## Sobrescrevendo estilos fixos sem variável

As três propriedades abaixo são definidas como regras CSS fixas em vez de variáveis — para mudá-las, sobrescreva diretamente o seletor de classe.

**Os quatro tamanhos de texto** (em `em`, relativos ao tamanho do elemento pai):

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**O tamanho da letra capitular**:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**As cores dos tokens de código**:

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

---

## Convenções de unidade

A maioria das medidas de interface — tamanho de botão, espaçamento, altura da barra de ferramentas e assim por diante — está definida em `rem`, então **escala proporcionalmente ao tamanho de letra da raiz (`html`).** Se a pessoa aumentar o tamanho de letra padrão no navegador ou no sistema, a interface do editor cresce naturalmente junto.

---

## Guia de especificidade CSS

Ao sobrescrever uma variável de cor de tema declarada pelo núcleo, recomendamos **empilhar três classes** para elevar a prioridade do estilo de forma confiável.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: #7c3aed;
}
```

- A regra do padrão claro `:is(.nabi, …)` tem especificidade **(0, 1, 0)**.
- A regra do modo escuro `:where(html, body).dark :is(.nabi, …)` tem especificidade **(0, 2, 0)**.
- Por isso, empilhar três classes como em `.nabi.nabi.nabi` dá especificidade **(0, 3, 0)**, que sempre vence, independentemente da ordem de carregamento do CSS.

O modal de prévia é montado como filho direto de `body`, então também é preciso especificar o seletor `.nabi-scrim.nabi-scrim.nabi-scrim` para que a mesma cor de tema se aplique ali.
Tokens só referenciados que o núcleo não declara — como os de fonte — já funcionam corretamente com uma única declaração em `:root`.

---

## Tema claro / escuro

O tema escuro se aplica quando o elemento `html` ou `body` tem a classe `dark`, e o claro quando tem a classe `light`. Sem classe, vale o tema claro padrão, e se as duas classes estiverem presentes, a `light` explícita vence.

```html
<html class="dark"><!-- ou <body class="dark"> --></html>
```

Trocar de tema só exige alternar a classe — não há uma API JavaScript separada para chamar. Ao escrever estilos próprios, usar variáveis `--nabi-*` faz com que suas cores acompanhem automaticamente as trocas de tema.

---

## Formas de prender a folha de estilo

**1. Importar o arquivo CSS completo** (a forma mais comum e recomendada)

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**2. Injetar dinamicamente só o estilo dos wings registrados**

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// chamar drop() remove do DOM os estilos injetados
```

Um mesmo conteúdo de folha de estilo nunca é injetado duas vezes — é gerenciado como uma única tag.
Num ambiente de renderização no servidor (SSR), é melhor carregar o arquivo CSS estático em vez de injetá-lo, para evitar um lampejo de conteúdo sem estilo (FOUC) antes do JS do cliente executar.

---

## Classes CSS e elementos de interface personalizáveis

| Seletor | O que é | Criado por |
|---|---|---|
| `.nabi` | O contêiner de nível mais alto que envolve todo o editor (barra de ferramentas + área de edição) | o host |
| `.nabi-content[contenteditable]` | A própria área de edição | o host |
| `.nabi-toolbar` | O contêiner de cabeçalho fixo que envolve a barra de ferramentas e a barra de contexto | o host |
| `.nabi-toolbar-row` | A linha de botões da barra de ferramentas principal | `mountToolbar()` |
| `.nabi-context` | O contêiner da barra de ferramentas de contexto dinâmica | `mountContextToolbar()` |
| `.nabi-tools` | O envoltório dos botões de prévia e tela cheia | `mountViewTools()` |
| `.nabi-hints [data-hint]` | O selo de atalho exibido ao apertar Shift duas vezes rápido | `mountHints()` |
| `[data-nabi-tip]` | O tooltip de um botão (desenhado com `::after` em CSS) | componentes do núcleo |
| `.nabi-content.nabi-dropping` | A área de edição enquanto um arquivo é arrastado sobre ela | `mountUpload()` |

### Modais e popups

| Seletor | O que é | Criado por |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > `.nabi-content.nabi-preview-body` | O modal de prévia do documento | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | O popup de lightbox de imagem | `openLightbox()` |
| `.nabi-scrim` > `.nabi-card.nabi-choose` | O popup de escolha do formato de colar | `openChoosePanel()` |
| `.nabi-scrim` > `.nabi-card.nabi-save` | O popup de salvar arquivo (campo de nome e escolha de formato) | `openSavePanel()` |
| `.nabi.is-fullscreen` | A classe que ativa o modo de tela cheia do editor | `setFullscreen()` |

---

## Desenhando HTML salvo em outro lugar

A string HTML extraída com `getHtml()` é composta só de marcado semântico e atributos `data-nabi-*`, sem nenhum `style` em linha.
Para desenhá-la numa página externa com a mesma aparência do editor, envolva o conteúdo numa classe `.nabi-content` e carregue `nabi.css`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">

<div class="nabi-content">
  <!-- conteúdo HTML salvo via nabi.getHtml() -->
</div>
```

Mesmo sem envolver com `.nabi`, os tokens de tema e fonte se aplicam diretamente a `.nabi-content`, então é possível reproduzir exatamente o estilo visto no editor.

### Ativando a ordenação de tabelas somente leitura

Para ativar a ordenação de colunas de tabela numa página HTML publicada, prenda a função `attachTableSort`.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'pt' })
```

Ela detecta tabelas com o atributo `data-nabi-sortable` e adiciona botões de ordenação nas células de cabeçalho. Chamar a função `detach()` retornada remove os botões adicionados ao DOM e restaura a ordem original das linhas.

::: warning Não aplique attachTableSort a um DOM em edição
`attachTableSort()` manipula a estrutura do DOM diretamente. Aplicá-la a uma área de editor ainda em edição pode gravar permanentemente a interface dos botões de ordenação no corpo do documento. Use-a somente numa tela de visualização somente leitura.
:::

---

## A seguir

- [{{ t('menu_wing_custom') }}](../wing/custom) — construir você mesmo um wing de formatação personalizado
- [{{ t('menu_intro_index') }}](../intro) — introdução ao NABI NOTE e sua arquitetura

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
