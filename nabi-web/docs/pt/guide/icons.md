---
title: "Temas de ícones"
description: "Use variáveis CSS para substituir ícones de wings, pré-visualização, tela cheia, painéis, diferenças e ordenação de tabelas. Misture SVG, WebP e PNG; ícones não definidos usam os arquivos padrão."
---

# Temas de ícones

Use variáveis CSS para substituir ícones de wings, pré-visualização, tela cheia, painéis, diferenças e ordenação de tabelas. Misture SVG, WebP e PNG; ícones não definidos usam os arquivos padrão.

## Escolher arquivos

Carregue o CSS e adicione uma classe de tema ao editor ou a um elemento pai comum. As imagens mantêm cores, transparência e proporções originais.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

Use caminhos a partir da raiz, como `/icons/...`, ou URLs HTTPS completas. Caminhos relativos não são necessariamente resolvidos junto ao arquivo do tema. Ao hospedar o CSS, copie a mesma versão de `dist/icons/` ao lado de `nabi.css`. Se uma imagem falhar, o ícone fica vazio, mas nome, dica e ação do botão continuam disponíveis.

## Encontrar outros ícones

Acrescente `--nabi-icon-` antes do valor `data-nabi-icon` do elemento para obter sua variável CSS. Por exemplo, `diff-close` usa `--nabi-icon-diff-close`. O <a href="/llms/icons.md" target="_blank" rel="noopener">contrato de ícones</a> descreve as chaves de contexto, menu, salvamento, histórico e outras, incluindo a codificação de caracteres especiais.

## Modo escuro e painéis

Alterar a classe do tema ou uma variável CSS atualiza os ícones sem montar novamente. Os ícones padrão seguem o tema claro/escuro. Arquivos próprios não herdam `currentColor`; defina variantes escuras como acima quando necessário. Painéis abertos sob `body` também acompanham o tema de ícones e as mudanças de classe/estilo do editor de origem. Coloque as variáveis no editor ou em um pai comum, não apenas dentro da barra.

## Exibir botões padrão

`showPreview` e `showFullscreen` são `true` por padrão. `false` remove o botão correspondente, seu alvo de foco e seus eventos. Ambos como `false` também eliminam a área de ferramentas vazia.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Passe as mesmas opções de visibilidade ao SSR e à montagem. Para mudar a configuração, chame `tools.unmount()` e monte com novas opções. Se nenhum botão for necessário, ainda é possível omitir a montagem e a marcação SSR das ferramentas. Chamadas diretas a `openPreview()` e `setFullscreen()` continuam disponíveis.
