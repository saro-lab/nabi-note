---
title: Introdução
description: NABI NOTE é um editor WYSIWYG de código aberto que roda no navegador.
---

# O que é o NABI NOTE?

NABI NOTE é um **editor WYSIWYG de código aberto** que roda no navegador.


## Árvore nabi

Processar HTML diretamente tem um problema: não dá para fazer isso do lado do servidor, onde não
há DOM. Por isso o valor é tratado como um objeto JavaScript chamado **árvore nabi**, que se
serializa nos dois sentidos para JSON e para HTML. A conversão entre a árvore nabi e o HTML
também é o ponto onde elementos de XSS são removidos.

> Todo wing que o NABI NOTE oferece oficialmente já filtra XSS, mas para um `wing personalizado
> (plugin externo)` é preciso confirmar com quem o desenvolveu se essa proteção existe.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## Suporte a SSR sem DOM (lado do servidor)

Uma árvore nabi salva pode ser **lida direto no servidor (Node.js)** para montar o HTML que será
enviado. As únicas partes que precisam de DOM são a **entrada** (`setHtml()`) e os `mount*` que
se prendem à tela.

Um lugar que só exibe o documento não precisa nem montar um editor — basta uma única função. Ela
recebe o valor salvo e o `registry` (a lista de wings registrados), e devolve uma string de HTML.

**No servidor, a importação é `nabi-note/ssr`** — é o ponto de entrada que só carrega o
necessário para desenhar, então a superfície de edição e as ferramentas de tela não são
carregadas de jeito nenhum.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// a lista de wings é montada uma única vez, quando o servidor sobe — qualquer quantidade de valores salvos reaproveita este único registry
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['uma linha de comentário'] }]   // árvore nabi lida do banco
renderStoredHtml(saved, registry)
// '<p>uma linha de comentário</p>'
```

**Se não for uma árvore nabi, a resposta é `null`** — a mesma regra de rejeição de `setJson()`.
O valor que passa **não difere em nenhum caractere** do `getHtml()` que o editor produz — porque
passa pelo mesmo caminho (normalização → montagem), o lugar onde o XSS é filtrado também é o
mesmo.

Para pré-renderizar o próprio editor no servidor, existe a porta correspondente — a única coisa
que ela acrescenta é `data-key`.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">uma linha de comentário</p>'
```

O mesmo valor salvo sempre recebe o mesmo `data-key`, então basta enviar esse HTML como está e,
no navegador, retomar com `mountSurface({ nabi, registry, root, hydrate: true })` — a tela não é
redesenhada. **A demo da página inicial deste site funciona exatamente assim** — o documento da
primeira tela é o que o servidor já enviou pronto, e o editor apenas desperta em cima dele.

### Três pontos de entrada

| Importação | O que carrega | Quando usar |
|---|---|---|
| `nabi-note` | o editor inteiro — montagem, superfície, ferramentas de tela | onde a pessoa **escreve** |
| `nabi-note/ssr` | só o que desenha o valor salvo em HTML | no servidor, ou numa página só de leitura |
| `nabi-note/viewer` | o comportamento do lado da leitura (ordenar tabela, colorir código) | onde o HTML publicado é **exibido** |

`nabi-note/ssr` **não carrega nenhum arquivo** da superfície de edição (`surface`) nem das
ferramentas de tela (`ui`) — uma rede varre o código-fonte para garantir isso. Por isso não há
caminho para código de DOM se misturar ao pacote do servidor.

## Formatação é sempre um wing

A unidade que outros editores chamam de "plugin" aqui se chama **wing (asa)**. O que o núcleo
conhece diretamente é o parágrafo (`p`), a linha (`br`) e texto puro — título, lista, tabela e
negrito são todos wings.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>negrito</b> <i>itálico</i></p>')
bare.getHtml()
// '<p>negrito itálico</p>'                    — sem nenhum wing declarado, tudo vira texto puro.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>negrito</b> <i>itálico</i></p>')
bold.getHtml()
// '<p><b>negrito</b> itálico</p>'              — só boldWing foi declarado, então só ele sobrevive e o resto vira texto puro.
```

Marcação não registrada como wing **é convertida para texto puro.** Por isso o HTML não
declarado é excluído, e todo wing oficialmente suportado pelo nabi remove script malicioso.


## Interface

O documento só pode ser alterado através de `applyCommand()`.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // Negrito
nabi.applyCommand('setHeading', { value: 2 })   // H2
nabi.undo()
nabi.redo()
```
Os comandos **respondem se tiveram sucesso com um `boolean`.** Se nada muda, respondem `false`
sem gravar histórico nem alterar o documento.


## Camadas do código

**Isso não quer dizer que o valor flui nessa ordem.** É a **direção de dependência**, empilhada
de baixo para cima, e a regra é uma só — **a camada de baixo não conhece a de cima.** Por isso as
camadas mais baixas (`schema` · `doc` · `html`) não tocam DOM, e é por isso que rodam do mesmo
jeito no servidor. O caminho por onde o valor entra e sai é o diagrama da árvore nabi, acima.

<LayerStack
  :layers="layers"
  caption=""
/>

Essa direção não é uma promessa escrita, **uma rede garante isso por código** — se um único
import for contra a camada, o teste quebra ali mesmo.


## Termos

| Palavra | Significado |
|---|-------------------------------------------------------|
| **mark** | formatação de texto, ex.: `<b>` · `<i>` · `<a>` |
| **block (bloco)** | ex.: parágrafo · título · lista · tabela · imagem |
| **atributo de parágrafo (paragraph attribute)** | um atributo do parágrafo, ex.: alinhamento · capitular |
| **parágrafo wrapper** | o parágrafo que envolve objetos de parágrafo único como tabela, lista, imagem |
| **claim (posse)** | a decisão de a qual wing pertence uma marcação |
| **parts (partes)** | funcionalidades internas do wing, ex.: linha/célula da tabela, linha de resumo do bloco recolhível |

### Tela de edição

| Palavra                      | Significado                                                                                                              |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| **caret (cursor)**            | o cursor de seleção dentro do editor                                                                                     |
| **linha de contexto (context row)** | a barra que controla o que está selecionado sob o cursor no momento, ex.: comandos de linha/coluna da tabela, campo de linguagem do código, campos de endereço/nome do link, H1 a H6 do título |

### Núcleo

| Palavra | Significado                                                                                                                                                              |
|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **cocoon** | a etapa de normalização da árvore nabi. Roda **depois de todo comando**, então nenhum comando pode deixar um documento que quebre as regras                                                      |
| **attach (prender)** | o hook que um wing declara quando precisa tocar a tela. Ex.: arrastar célula de tabela, colorir código, alternar checkbox são tudo isso. `mountSurface` prende junto o dos wings registrados |
| **input rule (conversão automática)** | uma conversão que acontece só de digitar. Ex.: hífen e espaço viram lista, `#` e espaço viram título                                                                 |


## Próximas páginas

- [{{ t('menu_intro_usage') }}](./intro/usage) — montagem, entrada e saída por completo
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — sem ferramenta de build, com um único `<script>`
- [{{ t('menu_wing_custom') }}](./wing/custom) — construir você mesmo uma formatação que falta

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import LayerStack from '../.vitepress/ui/LayerStack.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: 'digitação direta · colar · carregar', kind: 'in' },
  { label: 'setHtml() · setJson()', note: 'entrada via função', kind: 'gate' },
];

const hubCore = { label: 'árvore nabi', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: 'HTML para o editor', kind: 'out' },
];

const layers = [
  { name: 'locale', what: 'idioma' },
  { name: 'code', what: 'o tokenizador puro que a tela de edição e o lado da leitura compartilham' },
  { name: 'schema', what: 'a forma da árvore nabi e a definição do Cocoon' },
  { name: 'doc', what: 'inserir · apagar · dividir · intervalo, sem DOM' },
  { name: 'caret', what: 'posição, seleção e fronteiras do cursor' },
  { name: 'html', what: 'árvore nabi ↔ HTML' },
  { name: 'editor', what: 'a instância com a interface de comandos' },
  { name: 'wing', what: 'verificação dos Wings no momento do registro' },
  { name: 'wings', what: 'os wings oficiais (bold, italic ... table, upload...)' },
  { name: 'surface', what: 'ajusta cursor, IME e entrada à árvore' },
  { name: 'ui', what: 'a camada de interface' },
  { name: 'viewer', what: 'somente leitura' },
]
</script>
