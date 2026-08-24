---
title: Suporte a SSR
description: Pré-renderize documentos salvos no servidor e retome o editor e a barra de ferramentas instantaneamente no navegador com hydrate.
---

# Suporte a SSR (renderização no lado do servidor)

## Renderizando documentos salvos (telas somente leitura)

Uma tela que apenas **exibe** um documento — como uma lista de comentários ou a visualização de um post — não precisa de uma instância do editor. Renderizar um documento em HTML exige apenas a lista de wings registrados (`registry`), por isso existe uma função de renderização exclusiva para o servidor.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// Crie uma vez ao iniciar o servidor e reutilize entre as requisições.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['uma linha de comentário'] }]   // árvore nabi lida do banco de dados

renderStoredHtml(saved, registry)        // '<p>uma linha de comentário</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">uma linha de comentário</p>'
```

**`nabi-note/ssr` é um ponto de entrada leve que contém apenas a lógica principal de renderização.** Ele nunca referencia a superfície de edição (`surface`) nem as ferramentas de tela (`ui`), e testes de unidade de arquitetura garantem que nenhum código de DOM vaze para o pacote do servidor. Se o seu ambiente já carrega o pacote completo do editor, as mesmas funções também estão disponíveis pelo pacote `nabi-note`.

| Função | Descrição |
|---|---|
| `renderStoredHtml(json, registry, options?)` | HTML para salvar e publicar — o mesmo valor que `getHtml()` do editor |
| `renderStoredEditorHtml(json, registry, options?)` | HTML para inicializar o editor — o mesmo valor que `getEditorHtml()` (contém `data-key`) |

- **Não usa nenhuma API de DOM.** Roda diretamente em ambientes de servidor como o Node.js.
- **Retorna `null` para qualquer coisa que não seja uma árvore nabi válida.** As regras de validação são as mesmas de `setJson()`. Uma entrada inválida nunca lança exceção — a função retorna `null` e registra a causa via `console.error`.
- **É idêntico ao que a instância do editor produz.** Ambos passam pelo mesmo pipeline de normalização e montagem, então a filtragem de XSS é aplicada da mesma forma.
- O parâmetro `options` aceita `{ allowLocalUrls?: boolean }` — o mesmo papel da opção de mesmo nome em `createNabiWith`.

**Os mesmos dados de árvore nabi sempre geram o mesmo `data-key`.** Por isso, é possível pré-renderizar o HTML inicial do editor no servidor com `renderStoredEditorHtml`, enviá-lo ao cliente e montá-lo com a opção `hydrate: true` — o editor é ativado instantaneamente, sem nova renderização nem piscada de tela.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

Mesmo que o resultado da renderização no servidor e no cliente venha a diferir, o cliente cai automaticamente para uma renderização normal — basta que servidor e cliente compartilhem a mesma lista de wings (`registry`).

::: tip A própria página inicial deste site funciona assim, por hidratação SSR
O documento da demo da página inicial é **pré-renderizado no momento do build com `renderStoredEditorHtml`** e fica embutido no HTML; assim que o script do cliente carrega, o `hydrate` acorda o editor sobre ele. Por isso o texto já aparece na tela antes mesmo do JS carregar — sem deslocamento de layout (CLS).
:::

---

## Pré-renderizando a barra de ferramentas

A estrutura de botões da barra de ferramentas **nunca depende do conteúdo do documento.** Ela é gerada apenas a partir da lista de wings registrados, do idioma de exibição (locale) e da ordem dos grupos — por isso o resultado é determinístico. Renderize uma vez ao iniciar o servidor, faça cache e reutilize entre as requisições.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'pt' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Incorpore essa string HTML dentro do contêiner da barra de ferramentas e envie-a ao cliente — no navegador, `mountToolbar` reconhece a marcação já existente e **apenas vincula os ouvintes de evento, sem redesenhar.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Coloque você mesmo `class="nabi-toolbar-row"` no contêiner
Ao entregar uma barra de ferramentas pré-renderizada, a linha precisa carregar `class="nabi-toolbar-row"` desde o primeiro desenho. Se ela estiver faltando, a classe só é adicionada no momento da montagem — e o padding que vem com ela chega nesse instante, fazendo **a linha de botões deslocar visivelmente.**
:::

- **Seguro mesmo com estrutura diferente.** Se o HTML entregue diferir da lista de wings atual, o cliente redesenha imediatamente — nada fica quebrado.
- **Uma barra de ferramentas pré-renderizada começa no estado padrão** (nada pressionado, nada escondido). O estado pressionado (`aria-pressed`) e a visibilidade contextual dependem da posição do cursor, e se sincronizam automaticamente assim que o cliente monta.
- **Use isso apenas em telas que contêm um editor.** Uma página somente de leitura não precisa de barra de ferramentas.

**Os botões de pré-visualização e tela cheia podem ser pré-renderizados da mesma forma.** Como são componentes de ferramentas de visualização, e não wings, renderize-os separadamente com `renderViewToolsHtml`.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'pt' })
// '<span class="nabi-tools">…</span>'
```

::: tip A barra de ferramentas da demo da página inicial também é pré-renderizada
A barra de ferramentas da demo da página inicial é **pré-renderizada no momento do build com `renderToolbarHtml` e `renderViewToolsHtml`**, e `mountToolbar`/`mountViewTools` reconhecem essa linha e apenas ligam os eventos. Por isso você nunca vê dezenas de ícones da barra de ferramentas aparecerem com atraso.
:::

---

## Próximos documentos

- [{{ t('menu_intro_usage') }}](./usage) — instalação via npm e o guia completo de uso do editor
- [{{ t('menu_intro_cdn') }}](./cdn) — com uma única tag `<script>`, sem ferramenta de build

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
