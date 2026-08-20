---
title: Suporte a SSR
description: Pré-renderize o valor salvo no servidor e retome o editor e a barra de ferramentas com hydrate.
---

# Suporte a SSR

## Só desenhando o valor salvo — sem montar um editor

Um lugar que só **exibe**, como uma lista de comentários, não precisa de editor. A única coisa
necessária para desenhar o documento é a lista de wings registrados (`registry`), então existe
uma porta separada que recebe só isso.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// uma vez, quando o servidor sobe — qualquer quantidade de valores salvos reaproveita este único registry
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['uma linha de comentário'] }]   // árvore nabi lida do banco

renderStoredHtml(saved, registry)        // '<p>uma linha de comentário</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">uma linha de comentário</p>'
```

**`nabi-note/ssr` é o ponto de entrada que só carrega o necessário para desenhar.** Não carrega
nenhum arquivo da superfície de edição (`surface`) nem das ferramentas de tela (`ui`) — uma rede
garante isso —, então nenhum código de DOM se mistura ao pacote do servidor. A mesma porta existe
em `nabi-note` também, então uma página que já carrega o editor pode usar essa mesma importação.

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | o HTML que se salva e publica — o mesmo valor de `getHtml()` |
| `renderStoredEditorHtml(json, registry, options?)` | o HTML do editor — o mesmo valor de `getEditorHtml()` (com `data-key`) |

- **Nenhuma das duas usa DOM** — rodam do mesmo jeito no servidor.
- **Se não for uma árvore nabi, a resposta é `null`** — a mesma regra de rejeição de
  `setJson()` (o documento inteiro precisa ser um array). Não lança exceção.
- **Não difere em nenhum caractere do valor que o editor produz.** Passa pelo mesmo caminho
  (normalização → montagem), então o lugar onde o XSS é filtrado também é o mesmo — o lado
  exibido não fica menos protegido.
- `options` é só `{ allowLocalUrls }` — o mesmo sentido daquela opção em `createNabiWith`.

**O mesmo valor salvo sempre recebe o mesmo `data-key`.** Por isso, quando o servidor
pré-renderiza o editor com `renderStoredEditorHtml` e o navegador retoma com `hydrate`, a tela
não é redesenhada.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

Se houver qualquer diferença, a tela é redesenhada ali mesmo — basta que a lista de wings do
servidor e do cliente seja a mesma.

::: tip A página inicial deste site é essa própria amostra
O documento da demo da página inicial é **pré-renderizado com `renderStoredEditorHtml` no
momento do build** e fica gravado na página, e o editor desperta em cima dele via `hydrate`.
Por isso o texto já pode ser lido antes mesmo do código do editor chegar — não existe aquele
intervalo em que o espaço fica vazio e de repente se preenche.
:::

---

## A barra de ferramentas também pode ser pré-renderizada

A linha de botões **não olha para o documento.** Ela só depende da lista de wings registrados,
dos textos e da ordem dos grupos, então o texto que sai dela é uma **constante** — chamada uma
vez quando o servidor sobe, e reaproveitada depois. Não é preciso chamar de novo a cada
requisição.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'pt' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Enviando esse texto já dentro do recipiente da barra de ferramentas, no navegador o
`mountToolbar` desenha com **a mesma função.** Se a mesma linha já estiver de pé, **ele não
redesenha, só liga a fiação.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Escreva `class="nabi-toolbar-row"` junto no recipiente
Ao enviar uma linha pré-renderizada, essa classe precisa estar presente **desde o primeiro
desenho.** Se ela não existir, o núcleo a acrescenta sozinho ao montar — e aí as margens laterais
chegam nesse momento, **deslocando a linha de botões de lado uma vez.** Se o host já a escreve
antes, o núcleo não mexe nela (só remove o que ele mesmo prendeu).

```html
<div class="nabi-toolbar-row">linha pré-renderizada</div>
```
:::

- **Uma diferença não quebra nada** — se a linha de pé for diferente da lista de wings atual, ela
  é redesenhada ali mesmo. O que se perde é só o valor pré-renderizado; a tela sempre fica
  correta.
- **A linha pré-renderizada começa "sem nada pressionado, sem nada escondido".** Pressionado
  (`aria-pressed`) e escondido são coisas que o cursor decide, e o servidor não sabe disso. Numa
  configuração em que botões se escondem conforme o cursor, alguns podem sumir depois do mount e
  a linha pode se reorganizar.
- **Use isso só onde um editor será montado.** Uma página só de leitura não tem barra de
  ferramentas, então não há motivo para receber esse texto.

**Os dois botões de prévia e tela cheia seguem o mesmo caminho.** Como não são wings, e sim peças
da sobreposição, eles não entram no texto da barra de ferramentas acima — são desenhados à parte
e colocados no recipiente onde `mountViewTools` se instala.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'pt' })
// '<span class="nabi-tools">…</span>'
```

::: tip A página inicial deste site é essa própria amostra
A barra de ferramentas da demo da página inicial é **pré-renderizada no momento do build com
`renderToolbarHtml` e `renderViewToolsHtml`** e fica gravada na página, e `mountToolbar` ·
`mountViewTools` reconhecem essa linha e só ligam a fiação. Por isso não existe aquele intervalo
em que os trinta e cinco ícones aparecem tarde demais.
:::

---

## Próximas páginas

- [{{ t('menu_intro_usage') }}](./usage) — o caminho instalando via npm, montagem, entrada e saída
- [{{ t('menu_intro_cdn') }}](./cdn) — sem ferramenta de build, com um único `<script>`

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
