---
title: Introdução
description: NABI NOTE é um editor WYSIWYG de código aberto que roda no navegador.
---

# O que é o NABI NOTE?

NABI NOTE é um **editor WYSIWYG de código aberto** que roda no navegador.


## Árvore nabi

Processar HTML diretamente tem um problema: do lado do servidor (Node.js e afins) não existe DOM
para trabalhar. Por isso o NABI NOTE trata o documento como um objeto JavaScript puro chamado
**árvore nabi**, que se serializa nos dois sentidos, para JSON e para HTML. Na conversão entre a
árvore nabi e o HTML, conteúdo malicioso capaz de disparar XSS também é removido automaticamente.

> Todo wing padrão que o NABI NOTE suporta oficialmente já cuida da prevenção contra XSS. Porém,
> ao escrever ou trazer um `wing personalizado (um plugin de terceiros)`, confirme com o próprio
> autor dele se faz o mesmo.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## Suporte a SSR sem DOM (renderização no servidor)

Uma árvore nabi salva num banco de dados ou em outro lugar pode ser **lida como está no servidor
(Node.js e afins)** para montar o HTML enviado ao cliente. As únicas partes que precisam de uma
API de DOM são a **entrada** a partir de uma string HTML externa (`setHtml()`) e as funções
`mount*` que renderizam o editor na tela.

Uma tela que só exibe um documento em modo leitura não precisa montar editor nenhum — basta chamar
a única função de renderização (`renderStoredHtml`). Ela recebe como argumentos os dados da árvore
nabi salva e o `registry` (a lista de wings registrados), e devolve uma string de HTML segura.

**Em ambiente de servidor, use o ponto de entrada `nabi-note/ssr`** — um ponto de entrada leve que
carrega só a lógica essencial para renderizar, de modo que o código da superfície de edição
(`surface`) ou das ferramentas de interface (`ui`) nunca entra no bundle do servidor.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// monte a lista de wings uma única vez, quando o servidor sobe, e reaproveite-a em cada requisição
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['uma linha de comentário'] }]   // uma árvore nabi lida do banco
renderStoredHtml(saved, registry)
// '<p>uma linha de comentário</p>'
```

**Qualquer coisa que não seja uma árvore nabi válida recebe `null` de volta** — a regra de
validação é idêntica à de `setJson()`. Um valor que passa a validação **corresponde exatamente**
ao resultado de `getHtml()` chamado numa instância do editor, porque passa pelo mesmo pipeline de
normalização seguida de montagem — logo o filtro de XSS também é aplicado no mesmo ponto.

Para pré-renderizar (SSR) a própria tela de edição do editor no servidor, use a função
`renderStoredEditorHtml`. Ela produz HTML com um atributo `data-key` adicionado a cada nó.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">uma linha de comentário</p>'
```

Os mesmos dados salvos sempre geram o mesmo `data-key`. Assim você pode enviar o HTML renderizado
no servidor e, no navegador, hidratá-lo com `mountSurface({ nabi, registry, root, hydrate: true })`
— o editor assume sem redesenhar a tela. **A demo da página inicial deste site funciona exatamente
assim.** O documento exibido na primeira tela foi pré-renderizado pelo servidor, e no cliente o
editor é ativado diretamente sobre esse DOM.

### Pontos de entrada do pacote

| Ponto de entrada | O que carrega | Quando |
|---|---|---|
| `nabi-note` | o editor completo (o modelo do documento, a superfície de edição, a barra de ferramentas e as ferramentas de interface) | uma tela para **escrever/editar** um documento |
| `nabi-note/ssr` | um módulo leve, exclusivo para SSR, que renderiza uma árvore nabi em HTML | um ambiente de servidor ou uma página somente leitura |
| `nabi-note/viewer` | comportamento somente leitura (ordenar colunas de tabela, colorir código, etc.) | uma tela para **exibir** HTML publicado |

`nabi-note/ssr` **nunca referencia** a superfície de edição (`surface`) nem as ferramentas de
interface (`ui`). Um teste unitário no nível da arquitetura verifica isso rigorosamente, então não
há risco de código dependente de DOM se infiltrar no bundle do servidor.

## Toda formatação é um wing

O que outros editores chamam de "plugin", o NABI NOTE chama de **wing**. O núcleo do editor trata
diretamente apenas do parágrafo básico (`p`), da quebra de linha (`br`) e de texto puro — toda
formatação e extensão, de títulos e listas até tabelas e negrito, é fornecida como um wing
independente.

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

Marcação não registrada como wing **é automaticamente convertida para texto puro.** Por isso
qualquer elemento HTML não declarado é excluído com segurança, e todo wing oficialmente suportado
pelo NABI NOTE filtra minuciosamente scripts maliciosos.


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

A estrutura abaixo não representa a ordem de execução dos dados — mostra as **quatorze camadas
(layers)** organizadas dentro do diretório `src/`. O princípio central é que **uma camada de baixo
nunca referencia uma de cima.** Por isso as camadas mais baixas (`schema`, `doc`, `html` etc.) não
dependem do DOM em nada, e rodam sem alteração também num ambiente de servidor (Node.js).

```
src/
├── style/     a folha do núcleo — o CSS que a tela de edição e o texto publicado compartilham
├── locale/    idioma
├── code/      o tokenizador puro que a tela de edição e o lado da leitura compartilham
├── schema/    a forma da árvore nabi e a definição do cocoon
├── doc/       inserir · apagar · dividir · intervalo — sem DOM
├── caret/     posição, seleção e fronteiras do cursor
├── html/      árvore nabi ↔ HTML
├── io/        as portas dentro e fora — candidatos a colar, salvar, abrir, markdown
├── editor/    a instância com a interface de comandos
├── wing/      verificações dos wings no momento do registro
├── wings/     os wings oficiais (negrito · itálico … tabela · upload)
├── surface/   encaixa o cursor, IME e entrada na árvore
├── ui/        a camada de interface
├── viewer/    somente leitura
├── index.ts   a entrada do núcleo — `nabi-note`
└── ssr.ts     a entrada de SSR — `nabi-note/ssr` (não toca em nenhum arquivo de surface ou ui)
```

**A ordem das linhas é a ordem das camadas** — não alfabética mas **de baixo para cima.** `style` é o piso e `viewer` é o topo.

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
| **IO filter (filtro de E/S)** | o ponto de extensão que trata de colar (a porta de entrada) e salvar e abrir (a porta de saída) como um conjunto. Fica **fora do contrato wing**, então não estabelece nó próprio no documento |

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

</script>
