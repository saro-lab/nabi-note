---
title: Área flutuante
description: Posicione texto, imagens e tabelas ao lado do corpo do texto e deixe os parágrafos seguintes fluírem ao redor.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Área flutuante

Posicione uma breve descrição, imagem ou pequena tabela à esquerda ou à direita e deixe o corpo do texto fluir ao lado. O conteúdo da região pode ser editado diretamente no mesmo editor. A borda tracejada aparece apenas durante a edição; a prévia e a visualização publicada mostram somente o conteúdo e a disposição.

Coloque o cursor na região do exemplo abaixo e use as ferramentas de propriedades para mudar o lado e a largura máxima. Na prévia, veja como o texto flui sem a borda tracejada.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

As áreas flutuantes fazem parte das asas básicas. Se montar apenas as asas necessárias, use `wings().use('float')` ou registre `floatWing` diretamente. Registre também as asas de imagens, tabelas, listas e outros conteúdos usados dentro da região.

## Criar e posicionar

Coloque o cursor no corpo do texto e clique em **Área flutuante** para criar uma região vazia. O padrão é o lado direito, com largura máxima de 40%. Se selecionar vários parágrafos antes de clicar, todos os parágrafos tocados pela seleção serão envolvidos inteiramente em uma região. Não é possível envolver novamente uma área flutuante existente nem criar outra dentro dela.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

Com o cursor dentro da região, use as ferramentas de propriedades para mudar o lado e a largura máxima. Escolha entre 20%, 30%, 40% e 50%. O percentual é relativo à largura do corpo do texto, não à tela inteira; um conteúdo curto pode deixar a região mais estreita.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Colar texto, imagens e tabelas, converter blocos e fazer uploads mantém o conteúdo dentro da região. Excluir uma tabela interna remove apenas aquela tabela. Não é possível inserir ou converter blocos internos quando a seleção abrange simultaneamente o interior e o exterior da região.

O botão **Desfazer área flutuante**, ao lado do valor da largura, devolve o conteúdo ao corpo do texto sem excluí-lo. A criação, as mudanças de disposição e a remoção do envoltório permitem desfazer e refazer.

```ts
nabi.applyCommand('unwrapFloat')
```

## Como o texto flui ao redor

Os parágrafos seguintes fluem ao lado da região e voltam a ocupar toda a largura do texto quando ela termina. O próximo título, tabela, bloco de código, divisor ou nova área flutuante começa abaixo da região anterior.

Quando a largura do texto é menor que `36rem`, a região e o corpo do texto ficam em uma única coluna. A impressão também usa uma coluna e preserva o lado e a largura máxima salvos. A comparação de documentos mantém o lado e a largura máxima de cada região, mas exibe o próximo bloco separadamente abaixo para facilitar a leitura das alterações.

## Salvar e carregar

O JSON salva `a.side` e `a.w` do nó `float`, junto com os blocos internos. O HTML usa os atributos `data-nabi-float` e `data-nabi-float-width` em um `div` dentro de um parágrafo de objeto normal.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Uma descrição para colocar ao lado do corpo do texto.</p>
  </div>
</div>
<p>Este parágrafo continua ao lado da região.</p>
```

A exportação para Markdown preserva a região como HTML. Estilos CSS `float` arbitrários não são importados, portanto use JSON ou HTML gerado pelo NABI NOTE para salvar e restaurar. Conecte as mesmas asas e o mesmo CSS no editor, SSR, prévia e visualização publicada para manter o lado e a largura.

## Estilos CSS

Personalize cores e espaçamentos da região com o seletor `[data-nabi-float]`. O parágrafo externo controla a disposição e a largura máxima, portanto não sobrescreva diretamente `float`, `display` ou a largura.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
