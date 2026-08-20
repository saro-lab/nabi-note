---
title: Personalizar o estilo
description: Cor e formato se trocam por variáveis CSS.
---

# Personalizar o estilo

A folha de estilo é **o host quem prende** — com um bundler, uma linha
`import 'nabi-note/nabi.css'`; via CDN, uma linha `<link>`. Depois disso, basta sobrescrever
variáveis.

As regras dos componentes **não têm um único literal de cor.** Tudo é desenhado com variáveis
`--nabi-*`, então sobrescrever a variável basta para o resto seguir junto.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

A classe aparece três vezes de propósito — o motivo está em
[Para não esbarrar na especificidade](#para-nao-esbarrar-na-especificidade), mais abaixo.

::: tip A premissa maior deste documento — o valor salvo não fica de pé sozinho
O HTML de saída (`getHtml()`) **não tem um único `style` inline.** O valor salvo só diz *o quê*
como atributo (`data-nabi-align="center"`), e *como aparece* é assunto desta folha de estilo.
Por isso, ao desenhar o HTML salvo em outro lugar, também precisa estar **dentro de um
`.nabi-content` com esta folha de estilo presa** para ficar igual ao editor — veja
[Ao desenhar o HTML salvo fora daqui](#ao-desenhar-o-html-salvo-fora-daqui), mais abaixo.
:::

::: tip Claro e escuro já vêm prontos
**Não há** nenhum token que o host precise sobrescrever por causa do tema. A folha de estilo do
núcleo já traz os três: o padrão claro, a redefinição `.dark` e a redefinição explícita
`.light`. Nem este site sobrescreve algo além dos quatro tokens de fonte, dentro do editor.
:::

## Tokens de cor e formato

| Token | Significado | Padrão (claro) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | fundo · superfície levemente pressionada | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | texto · texto apagado · texto sobre o destaque | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | linha · cor de destaque | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | perigo · texto sobre ele | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | sombra de caixa · fundo da prévia | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | cantos | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | canto das camadas (painel, prévia, lightbox) | `.25rem` |
| `--nabi-z-sticky` | número de camada da linha fixa | `20` |
| `--nabi-grid-cell` | tamanho da célula da grade de tamanho de tabela | `1.125rem` |
| `--nabi-hl-yellow` · `green` · `cyan` · `pink` · `purple` · `orange` | as seis cores do marca-texto | cores semitransparentes |
| `--nabi-tc-green` · `coral` · `violet` · `amber` · `blue` | as cinco cores de texto | cores fortes |

Esta tabela traz só o que a folha de estilo do núcleo (`nabi.css`) **declara diretamente.** O
lugar da declaração não é só `.nabi`, são três:
`:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`. Isso porque a sobreposição da
prévia é filha direta de `body` e a herança de `.nabi` não a alcança, e um `.nabi-content` que
existe sozinho, fora do editor, também precisa receber os tokens diretamente.

A mesma lista aparece três vezes (padrão claro · `.dark` · `.light` explícito). **Quem
sobrescreve não precisa olhar para as três** — ganhando na especificidade, um valor
sobrescrito uma vez vale para os três casos. Só se quiser um valor diferente no escuro é preciso
acrescentar a própria condição `.dark`.

## Tokens que só são referenciados, sem valor

Abaixo estão as variáveis que o núcleo **só referencia, sem declarar.** Se o host não der um
valor, vale o fallback entre parênteses. Como não há lugar de declaração, **escrever em
`:root` já basta** — é aqui que este grupo se separa dos tokens de cor e formato acima (aqueles
estão declarados em `.nabi`, e a herança não consegue vencer isso).

| Token | Significado | Fallback |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | a fonte de verdade que se prende a cada uma das quatro variantes do wing de tipo de letra | fonte do sistema |
| `--nabi-cursive-adjust` | o `font-size-adjust` da cursiva. Fontes manuscritas têm x-height baixo e por isso parecem menores no mesmo px; este valor reajusta com base no x-height | `0.4` |
| `--nabi-sticky-top` | o quanto a linha fixa desce ao se assentar. Se o site tem um cabeçalho fixo, use a altura dele | `0px` |
| `--nabi-preview-width` | a largura do cartão de prévia. **Como `openPreview` mede a largura da área de edição ao abrir e a escreve direto no cartão**, mesmo que o host sobrescreva por fora, esse valor inline vence | `720px` |

`--nabi-typeface-base` não é deste grupo — **o núcleo o declara** (o padrão segue
`--nabi-font`). O wing de tipo de letra não tem uma opção para definir esse valor, então, para
mudá-lo, sobrescreva este token.

`--nabi-keyboard-top` · `--nabi-keyboard-bottom` também vivem no mesmo lugar, mas **o núcleo
quem escreve** — `mountSticky()` mede o quanto o teclado do celular empurrou a tela e escreve
aqui, e a linha fixa e a tela cheia leem esse valor. Não é um valor para escrever à mão.

## Onde não há token — sobrescreva a regra

Os três abaixo **não têm variável.** O núcleo já cravou o valor na regra, então, para mudar,
sobrescreva o próprio seletor.

**Os quatro níveis de tamanho de letra** — em `em`, então acompanham o tamanho do elemento pai.

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**O tamanho da capitular** — não é um valor que define quantas linhas envolver, é só um tamanho
de letra. Quantas linhas de fato cobre é decidido pela altura de linha daquele parágrafo.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**As cores dos tokens de código** — a folha de estilo do wing de código escreve a cor
diretamente em `[data-nabi-token]`. Hoje há **cinco** categorias com cor.

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

O `type` que o realçador responde é um texto livre — um nome fora dessas cinco é desenhado sem
cor, então, para usar uma categoria própria, o host acrescenta uma regra no mesmo formato. Para
usar uma cor diferente no escuro, acrescente você mesmo a condição `.dark` — o núcleo não
carrega uma variante escura para essas cinco.

A animação de progresso do wing de envio (`--nabi-per` · `--nabi-t` · `--nabi-span` ·
`--nabi-clear` · `--nabi-blur-max`) é **de uso interno do wing** — o nome começa com `--nabi-`,
mas não é um lugar aberto para o host sobrescrever.

---

## As medidas externas são em `rem`

A maioria das medidas externas — botão, espaçamento, chip da barra de ferramentas — está em
`rem`, então **cresce junto com o tamanho de letra da raiz (`html`).** Se a pessoa aumentar a
letra no navegador ou no sistema, a moldura do editor cresce junto. Para mudar o tamanho, mude
o `font-size` da raiz. A borda (`border`) não é uma medida, é uma **linha**, então em alguns
lugares continua em `px`.

---

## Para não esbarrar na especificidade

Para sobrescrever os tokens de cor e formato, **repita a classe três vezes.**

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--minha-cor-de-destaque);
}
```

Contando, fica assim. A regra do padrão claro `:is(.nabi, …)` é **(0,1,0)**, pois `:is()` segue
o argumento de maior peso; a regra do escuro `:where(html, body).dark :is(.nabi, …)` é
**(0,2,0)**, pois `:where()` vale 0 e `.dark` e `:is()` valem uma classe cada. Então
`.nabi.nabi` empataria com o escuro — e em empate, ganha quem carregou por último, e a folha de
estilo do núcleo pode carregar depois da folha do host. Repetir três vezes sobe para (0,3,0) e
tira a dependência da ordem.

A sobreposição da prévia fica fora de `.nabi` (é filha de `body`), então esse seletor também
precisa ser escrito junto para dar a mesma cor.

**Tokens que o núcleo não declara, como os de fonte, não precisam desse esforço** — como não há
lugar de declaração, a herança já alcança sozinha, e uma linha em `:root` basta.

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

---

## Claro · Escuro

Se `html` ou `body` — **qualquer um dos dois** — tiver a classe `dark`, é escuro; se tiver
`light`, é claro. Sem nenhuma classe, o padrão é claro; com as duas, o `light` explícito vence
(a regra `.light` carrega depois da regra `.dark`).

```html
<html class="dark"><!-- ou <body class="dark"> --></html>
```

Alternar a classe já faz o CSS reagir. Não há uma API para chamar. O tema só troca as variáveis
de cor, as regras dos componentes continuam as mesmas — até um estilo próprio, se usar só
variáveis `--nabi-*`, acompanha o escuro.

---

## Dois caminhos para prender a folha de estilo

**① Um único arquivo** — o caminho mais comum. Traz o CSS de todos os wings.

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**② Injetar só o registrado** — para quando você quer só a folha de estilo dos wings que de
fato ligou.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// chamar drop() remove só o que esta chamada colocou
```

A folha do mesmo texto entra **uma única vez** — a chave de dedução é o **conteúdo** da folha,
então, mesmo com vários editores na mesma página, não se acumula, e composições diferentes de
wings se juntam numa única união.

:::: tip Duas diferenças entre os dois — o que carrega, e quando prende
**O que carrega.** O arquivo não tem como saber quais wings você registrou, então carrega
**todos**. A injeção olha o `registry` e traz **só o que foi registrado**. Uma página que só
exibe HTML salvo, sem editor, não tem `registry`, então usa o caminho do arquivo.

**Quando prende.** O arquivo chega como `<link>` na `<head>` e **bloqueia a renderização** até
carregar. A injeção só prende **depois que o JavaScript do editor chega**. Por isso, uma página
cujo documento é renderizado antes no servidor e enviado pronto deve usar o caminho do arquivo —
pela injeção, o documento enviado pelo servidor pintaria primeiro sem estilo e só depois seria
reformatado e reorganizado quando a folha chegasse.
::::

A folha de estilo de um wing registrado entra **depois** da folha do núcleo, então, na mesma
prioridade, o wing vence.

---

## Onde dá para prender algo

O que não se resolve por variável, mira direto numa classe que de fato existe.

| Seletor | O que é | Quem prende |
|---|---|---|
| `.nabi` | a casca que envolve o editor inteiro (chrome + área de edição). Os tokens de cor e formato ficam aqui | o host |
| `.nabi-content[contenteditable]` | a própria área de edição | o host |
| `.nabi-toolbar` | o lugar que envolve a linha da barra de ferramentas + a linha de contexto. Essa classe é o que faz "ficar fixo ao rolar" | o host |
| `.nabi-toolbar-row` | o recipiente onde a barra de ferramentas se assenta | `mountToolbar()` |
| `.nabi-context` | o recipiente onde a linha de contexto se assenta | `mountContextToolbar()` |
| `.nabi-tools` | o lugar dos dois botões de prévia e tela cheia — o núcleo os flutua no canto superior direito | `mountViewTools()` |
| `.nabi-tool` | os dois botões em si | `mountViewTools()` |
| `.tb-group` | o agrupamento de botões da barra de ferramentas | `mountToolbar()` |
| `.ctb-group` · `.ctb-button` · `.ctb-swatch` · `.ctb-input` | agrupamento, botão, amostra de cor e campo de texto da linha de contexto | `mountContextToolbar()` |
| `.tb-picker` · `.tb-picker-grid` · `.tb-picker-cell` | a caixa que aparece sob o botão, como a grade de tamanho de tabela | `mountToolbar()` |
| `.tb-prompt` · `.tb-prompt-input` | a camada de entrada de endereço que aparece ao inserir algo novo | `mountToolbar()` |
| `.nabi-hints [data-hint]` | o selo de atalhos que aparece ao apertar Shift duas vezes seguidas — o selo é `::before`, o rótulo é `::after`, e os dois aparecem juntos | `mountHints()` |
| `[data-nabi-tip]` | o rótulo (tooltip) — desenhado só com `::after` em CSS | o núcleo, de forma geral |
| `.nabi-content.nabi-dropping` | a área de edição enquanto um arquivo é arrastado sobre ela. O texto de aviso vai no atributo `data-nabi-drop` | `mountUpload()` |

Prévia e tela cheia também são **construídas pelo núcleo.**

| Seletor | O que é | Quem |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` · `.nabi-content.nabi-preview-body`) | a sobreposição de prévia do documento | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | a caixa que amplia uma única imagem | `openImageLightbox()` |
| `.nabi.is-fullscreen` | tela cheia — fixa a caixa `.nabi` na tela | `setFullscreen()` (o nome da classe é `FULLSCREEN_CLASS`) |

Ao prender `mountViewTools()`, os dois botões abrem e fecham essas camadas sozinhos. Para abrir
diretamente, chame `openPreview({ nabi, editor })` · `openImageLightbox({ editor, src, alt?,
locale })` · `setFullscreen(root, on)` · `isFullscreen(root)`.

::: tip O lugar das ferramentas se levanta sozinho
`mountViewTools` cria a caixa `.nabi-tools` sozinho e a insere no começo do recipiente
recebido. O host não precisa colocar um `<span>` antes da barra de ferramentas — preparar o
lugar de antemão só resulta em duas caixas.
:::

Também dá para mirar em marcas exclusivas da tela de edição —
`[data-nabi-token]` (cor de token do bloco de código), `[data-nabi-lang]` (linguagem do bloco de
código), `[data-color]` (marca-texto/cor de texto — distinguidos pela tag `<mark>`/`<span>`),
`data-nabi-align` · `data-nabi-typeface` · `data-nabi-size` · `data-nabi-dropcap` (atributos de
parágrafo). O nome real dessas marcas tem como fonte a constante `*_ATTR` de cada arquivo de
wing.

---

## Ao desenhar o HTML salvo fora daqui

O valor de saída (`getHtml()`) é um HTML com atributos `data-nabi-*`, e **não tem um único
`style` inline.** Isso significa que a aparência é toda responsabilidade da folha de estilo, e
por isso, desenhado sem a folha de estilo, vira um HTML nu, sem alinhamento, sem tamanho de
letra, sem linhas de tabela.

Para desenhar com a mesma aparência do editor, envolva com `.nabi-content` — essa classe recebe
os tokens de cor e formato diretamente, mesmo sem estar envolta por `.nabi` (a regra
`.nabi-content:where(:not(.nabi *))` do `nabi.css`).

```html
<div class="nabi-content">HTML salvo</div>
```

Prenda a folha de estilo como visto em "Dois caminhos para prender a folha de estilo", acima —
com bundler, `import 'nabi-note/nabi.css'`; fora disso, um `<link>`. Mesmo numa página que não
monta editor, basta ter `.nabi-content` para a folha de estilo do núcleo declarar os tokens.

### Comportamento que roda do lado da leitura — ordenação de tabela

Por ora, **só a ordenação de tabela** sai como função exclusiva do lado de leitura. Ainda não
existe um sistema genérico para qualquer wing pendurar seu próprio comportamento de leitura.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'pt' })
```

Procura tabelas com `data-nabi-sortable` e acrescenta um botão de ordenar na célula de
cabeçalho. A função de desligar (`detach`) desfaz o botão encaixado e a ordem de linhas trocada.

::: danger Não prenda num elemento alvo de edição
`attachTableSort()` encaixa botões no DOM e troca a ordem das linhas. Se o DOM enquanto está
preso for salvo, isso se torna parte do valor — prenda só numa cópia somente leitura, do lado
da exibição.
:::

---

## Próximas páginas

- [{{ t('menu_wing_custom') }}](../wing/custom) — construir você mesmo uma formatação que falta
- [{{ t('menu_intro_index') }}](../intro) — o vocabulário que este documento usa

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
