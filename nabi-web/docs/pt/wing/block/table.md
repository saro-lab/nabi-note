---
title: Tabela
description: Coloque vários parágrafos e blocos nas células e edite fundos, mesclagens e alinhamento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabela

Escolha linhas e colunas na barra de ferramentas para criar uma tabela. As células podem conter vários parágrafos, imagens, listas, citações, código, seções recolhíveis e vídeos. Coloque o cursor em uma célula para editar linhas, colunas, mesclagens, cabeçalhos e cores de fundo com as ferramentas de propriedades abaixo.

Experimente editar os parágrafos e as listas nas células do exemplo abaixo e arraste sobre várias células para mudar seus fundos em conjunto. Clique em **Selecionar tabela** nas ferramentas de propriedades para alinhar a própria tabela pela barra de ferramentas principal.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Registre também as asas que deseja usar dentro das células. Para um editor com todas as asas básicas, monte-o com `wings().allBasic()`.

## Escrever nas células

| Entrada | Comportamento |
| --- | --- |
| Enter em um parágrafo normal | Cria um novo parágrafo na mesma célula. |
| Shift+Enter | Insere uma quebra de linha no parágrafo ou item de lista atual. |
| Tab / Shift+Tab em um parágrafo normal | Vai para a próxima / a célula anterior. |
| Tab / Shift+Tab em uma lista ou código | Usa o aumento / a redução de recuo do bloco. |

Enter em listas e código segue as regras de entrada de cada bloco. Mesmo quando não é possível reduzir mais o recuo do código, Shift+Tab não vai para a célula anterior. Backspace ou Delete no início ou no fim de uma célula não a mescla com uma célula vizinha nem com um parágrafo fora da tabela.

Colar e inserir imagens ou blocos mantém o conteúdo na célula em que a operação começou. Não é possível inserir blocos ou colar em seleções que atravessam limites de células. Tabelas e [áreas flutuantes](./float) não podem ser aninhadas dentro de células; ao importar ou colar essas estruturas, seus conteúdos são desembrulhados na ordem.

Células normais podem conter títulos, mas a formatação de título não se aplica às células de cabeçalho. Ao converter uma célula em cabeçalho, seus títulos viram parágrafos normais, preservando o texto e as outras formatações.

## Cores de fundo das células

A cor de fundo se aplica a uma célula ou a um intervalo retangular selecionado por arraste. Mesmo que apenas parte do texto esteja selecionada, o fundo de toda a célula que o contém muda. As cores suaves se adaptam aos temas claro e escuro. Quando as células selecionadas têm cores diferentes, nenhuma cor única é mostrada como selecionada.

Você também pode mudar a cor por comando, mantendo a seleção atual de células.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

Os valores permitidos são `yellow`, `green`, `cyan`, `pink`, `purple` e `orange`. Para restaurar o fundo padrão, escolha **Padrão** nas ferramentas de propriedades ou passe uma string vazia.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

Excluir conteúdo, recortar e limpar a formatação não apaga as cores de fundo. A mesclagem usa a cor da célula superior esquerda; a divisão dá a mesma cor às células recém-criadas. Novas linhas e colunas começam com o fundo padrão. Alterações de cor de fundo permitem desfazer e refazer.

## Alinhar o conteúdo das células e a tabela

Com o cursor em uma célula, o alinhamento se aplica aos parágrafos ou imagens internos. Ao selecionar várias células, ele se aplica a todos os parágrafos e objetos alinháveis dentro delas, exceto código. O estado das ferramentas de título, alinhamento e capitular também segue os parágrafos internos realmente selecionados. Valores diferentes entre os parágrafos selecionados não são exibidos como um único valor.

Para alinhar a própria tabela, clique em **Selecionar tabela** nas ferramentas de propriedades e use os botões de alinhamento da barra principal. O mesmo alinhamento fica disponível quando o cursor está antes ou depois do parágrafo que envolve a tabela e aparece uma borda tracejada. Essa borda apenas indica o alvo; não transforma o cursor em uma seleção da tabela inteira.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

Adicionar e excluir linhas e colunas, mesclar e dividir atuam sobre as células selecionadas. A mesclagem mantém os blocos de cada célula na ordem das linhas. A divisão mantém o conteúdo na célula original e deixa as demais vazias.

## Copiar e salvar

Copiar várias células selecionadas copia o intervalo retangular visível até a última célula, inclusive. O HTML e o formato interno da área de transferência preservam células vazias, mesclagens, blocos, formatação de texto e cores de fundo. O texto simples separa as células por tabulações e quebras de linha, preservando as quebras entre blocos dentro de uma célula e os endereços de imagens e vídeos. Recortar esvazia apenas o conteúdo das células selecionadas e pode ser revertido com uma única ação de desfazer.

Quando o cursor está antes ou depois de uma tabela e a borda tracejada aparece, copiar e recortar se aplicam a todo o parágrafo que a envolve. Recortar remove o parágrafo e a tabela depois que a gravação na área de transferência é concluída com sucesso. Recortar ou excluir uma tabela dentro de uma área flutuante mantém a área flutuante externa.

Salvar em JSON ou HTML preserva os blocos e as cores de fundo das células. Tabelas simples são exportadas como tabelas Markdown; tabelas com vários blocos ou cores de fundo permanecem em HTML para preservar o conteúdo. Em HTML, o nome da cor fica no atributo `data-nabi-cell-color` de `td` ou `th`. Estilos arbitrários de cor de fundo de HTML externo não são importados como cores de fundo de célula.

Para ordenar colunas na visualização publicada, salve a tabela como ordenável e conecte `attachViewer()` de `nabi-note/viewer`. Tabelas com células mescladas ficam fora da ordenação por colunas.

## Estilos CSS

Estilize as tabelas com `.nabi-content table` e as células com `.nabi-content :is(th, td)`. Aplique listras e fundos de cabeçalho apenas às células sem cor, para não sobrescrever as cores de fundo definidas.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Altere as próprias cores de fundo com variáveis CSS que incluem o nome da cor, como `--nabi-cell-yellow`. Carregue o CSS abaixo depois do CSS do pacote e atribua a classe `table-note` e o valor `data-nabi-theme` do tema atual diretamente ao elemento `.nabi` do editor ou ao elemento `.nabi-content` da visualização publicada.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Se o viewer estiver conectado, mantenha o botão `.nabi-sort`. Sobrescrever à força o `position` ou o padding direito das células pode causar sobreposição com o botão de ordenação.
