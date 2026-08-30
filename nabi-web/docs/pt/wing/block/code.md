---
title: Código
description: Salve código de várias linhas junto com o idioma usado para realce de sintaxe.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Código

Insira código de várias linhas separado do texto comum. Digite três crases em um parágrafo vazio e pressione Espaço ou Enter, ou mude para um bloco de código pela barra de ferramentas. Se você adicionar um nome de idioma depois das crases, como `ts`, esse nome também é salvo.

O nome do idioma é um identificador usado para realce de sintaxe, e nomes fora da lista registrada também podem ser digitados manualmente. Como o conteúdo do código e a indentação devem ser preservados, blocos de código não aceitam alinhamento de parágrafo.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Conectar um realçador de código

Registrar o bloco de código usa a coloração padrão dentro do editor. Para colorir código também na vista publicada, conecte `nabi-note/viewer`. O viewer encontra `pre > code` e lê o valor `data-nabi-lang` do elemento pai como nome do idioma. Se esse valor não existir, ele verifica a classe `language-...` do elemento `code`.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'en',
})

// Depois de substituir o HTML publicado
viewer.refresh()

// Ao fechar a tela
viewer.unmount()
```

Se não houver um realçador separado, ou se esse realçador não conseguir lidar com o idioma, o tokenizador integrado sem dependências colore no lugar. Os `span` de tokens inseridos pelo realçador existem apenas na tela e não são gravados de volta no JSON salvo nem no HTML publicado original. `refresh()` e `unmount()` removem esses `span` e reconectam a partir do código original atual.

### Como o site NABI conecta Shiki

O site NABI carrega o realçador dinamicamente para que Shiki não entre no bundle de SSR nem da primeira tela. `loadCodeHighlighting()` em `nabi-web/docs/.vitepress/src/highlight.ts` cria o núcleo do Shiki e depois busca uma gramática de idioma apenas quando código daquele idioma é realmente necessário. O exemplo abaixo usa a mesma conexão na vista publicada.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'en',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// Ao fechar a tela
stop?.()
viewer.unmount()
```

Quando um idioma aparece pela primeira vez, o download da gramática começa. Até lá, o bloco aparece com o tokenizador integrado ou como texto simples. Quando a gramática chega, `onGrammarLoaded()` chama `viewer.refresh()` e colore o bloco novamente. Assim, só os idiomas necessários são baixados, e uma gramática que chega tarde é aplicada sem nova navegação de página.

O lado do editor usa a mesma função `highlight`. A demonstração do site NABI substitui apenas o `attach` padrão de `codeWing` por `makeCodeAttach({ highlight, version })`. `version` muda sempre que uma gramática chega e serve como sinal para repintar código que já foi desenhado. Um serviço independente pode implementar primeiro a conexão da vista publicada e só depois adicionar essa abordagem se a coloração do Shiki também for necessária durante a edição.

## Estilos CSS

Estilize blocos de código com `.nabi-content pre`, e o código com `.nabi-content pre > code`. Não altere `white-space`, porque isso afeta quebras de linha do código e a edição. As cores dos tokens podem ser alteradas com seletores `[data-nabi-token]`.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
