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
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Atribua a mesma classe de tema ao `.nabi` do editor e ao `.nabi-content` da visualização publicada para aplicar as mesmas variáveis aos dois. Carregue o CSS do serviço depois do CSS do pacote e informe o tema atual em `data-nabi-theme`.

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
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

O realce e a cor do texto usam `--nabi-hl-<name>` e `--nabi-tc-<name>`, respectivamente. Fundos de células usam `--nabi-cell-<name>` com `yellow`, `green`, `cyan`, `pink`, `purple` e `orange`. As variáveis alteram apenas a cor exibida, não o nome salvo.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

O tema padrão usa fundos de célula suaves. No modo escuro, os nomes permanecem, mas há cores próprias, mais claras e menos saturadas, para facilitar a distinção sobre fundos escuros. Essas cores translúcidas deixam o fundo aparecer; ao personalizá-las, verifique o contraste do texto sobre o fundo real da página. Para sobrescrever as variáveis de cor padrão, aplique a classe de tema ao elemento real do editor ou do conteúdo publicado, como acima, e não a um pai externo qualquer.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Limite do modo móvel

A barra padrão `layout: 'compact'` passa para uma linha no celular quando a tela tem menos de `36rem`. Exatamente `36rem` mantém a disposição de desktop. No desktop, todas as ferramentas quebram em linhas mesmo quando o editor é estreito. As propriedades de objetos também quebram abaixo; ambas as linhas ocupam espaço acima do texto. A tela cheia expande todas as ferramentas independentemente da largura.

No celular, as ferramentas rápidas, o botão de todas as ferramentas e os botões conectados de prévia/tela cheia permanecem na barra principal. Continuam disponíveis quando as propriedades aparecem. A paleta mantém a mesma ordem de grupos e os separadores do desktop. `layout: 'wrap'` sempre mostra todas as ferramentas com quebra de linha.

Os painéis móveis abrem no espaço disponível ao redor da barra e das propriedades. O seletor de tamanho de tabela é uma exceção: abre centralizado sobre um fundo translúcido com uma grade de 5×5 fácil de tocar. Não espera o teclado fechar; escolher um tamanho insere uma tabela e fecha o seletor.

Defina `--nabi-mobile-breakpoint` em `:root`, em um ancestral ou em um `.nabi` específico para mudar o limite. Use comprimentos CSS não negativos, como `rem`, `px` ou `calc()`. Alterações no valor CSS, no tamanho de fonte raiz ou na largura da tela atualizam automaticamente os painéis abertos. Painéis de entrada movidos para baixo de `body` mantêm o limite do editor original.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Regiões flutuantes têm um limite separado para passar a uma coluna: o contêiner do texto, e não a tela, deve ter menos de `36rem`. A impressão usa a mesma disposição.

## Modo escuro

O modo claro é o padrão. Se você adicionar `.dark` ao `html` ou ao `body`, ou definir `data-nabi-theme="dark"` em um editor ou tela publicada específicos, o modo escuro é aplicado.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Use `data-nabi-theme="light"` para cortar a influência de um `.dark` ancestral. A troca de tema é gerenciada pelo serviço; o pacote não segue automaticamente `prefers-color-scheme`.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
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
  --nabi-font: "Noto Serif KR", serif;
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
