---
title: Temas CSS
description: Configure cores, fontes, tamanhos e modo escuro do editor e do conteúdo publicado com variáveis CSS.
---

# Temas CSS

NABI NOTE aplica o mesmo CSS ao editor e à tela publicada. A forma mais segura é carregar o CSS do pacote uma vez e sobrescrever apenas as variáveis CSS necessárias no contêiner do seu serviço.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Se você colocar os mesmos tokens em um pai comum do editor e da tela publicada, os dois mantêm a mesma linguagem visual.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Variáveis alteradas com frequência

| Uso | Variáveis |
| --- | --- |
| Texto e fundo | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Linhas e cor de destaque | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Cantos e sombras | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Fonte base | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Área de edição | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Barra fixa e prévia | `--nabi-sticky-top`, `--nabi-preview-width` |
| Ambiente de toque | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Largura de ativação do modo móvel | `--nabi-mobile-breakpoint` |

Realce e cor de texto são alterados com `--nabi-hl-<name>` e `--nabi-tc-<name>`. Por exemplo, alterar `--nabi-hl-yellow` muda apenas a cor visível do realce `yellow` salvo no documento.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Limite do modo móvel

O modo móvel é ativado quando a largura da barra de ferramentas, da barra contextual ou da janela é inferior a `36rem`. Com exatamente `36rem`, mantém-se o layout normal. No modo móvel, as duas barras rolam horizontalmente, os painéis ficam centralizados e o seletor de tabelas é reduzido a 5×5 células adequadas ao toque.

Defina `--nabi-mobile-breakpoint` em `:root`, em um ancestral ou em uma `.nabi` específica. Use um comprimento CSS não negativo, como `rem`, `px` ou `calc()`. Alterações no valor CSS, no tamanho da fonte raiz, na largura do contêiner ou da janela atualizam automaticamente também os painéis abertos. Painéis de entrada movidos para dentro de `body` continuam usando o limite do editor original.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Dispositivos de toque mantêm controles maiores acima desse limite.

## Modo escuro

O modo claro é o padrão. Se você adicionar `.dark` ao `html` ou ao `body`, ou definir `data-nabi-theme="dark"` em um editor ou tela publicada específicos, o modo escuro é aplicado.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Use `data-nabi-theme="light"` para cortar a influência de um `.dark` ancestral. A troca de tema é gerenciada pelo serviço; o pacote não segue automaticamente `prefers-color-scheme`.

```css
.dark .brand-note {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Aplique CSS também à tela publicada

O HTML publicado precisa de `.nabi-content` e do mesmo CSS. Mesmo sem JavaScript, os estilos de tabelas, código, imagens, checklists e capitulares são aplicados. Adicione `nabi-note/viewer` somente quando precisar de comportamento, como ordenação de tabelas ou coloração de código.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Source Serif 4", Georgia, serif;
  --nabi-bg: transparent;
}
```

Defina na classe do seu serviço o layout que não pertence ao pacote, como largura do corpo e altura de linha.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## O que não mudar na tela de edição

Não altere `display` nem `white-space` em nós `[data-key]` durante a edição. Também evite adicionar pseudo-elementos dentro do texto editável ou bloquear o comportamento de ponteiro em wrappers de objetos. Essas mudanças podem desalinhavar a posição do cursor e a posição do documento no DOM.

Capitulares usam `::first-letter` na tela publicada, mas a superfície de edição usa um elemento real `[data-nabi-dropcap-letter]`. Não adicione outra regra `::first-letter` dentro de `.nabi-editing` nem substitua esse elemento.
