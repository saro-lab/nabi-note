---
title: Tabela
---

# Tabela

## Descrição

`tableWings` (nome `table`, atalho `T`) é dono da estrutura `table > tr > td`.

Linha (`tr`) e célula (`td`) não se registram à parte — o wing de tabela os traz junto via
`parts`, então desligar a tabela desliga linha e célula junto.

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

É o `singleParagraph` da célula que preserva a grade — apertar <kbd>Enter</kbd> dentro de uma
célula não divide o parágrafo em dois, e apagar uma seleção que atravessa duas células não as
funde.

Pressionar o botão não é uma alternância: abre-se uma grade de tamanho linhas × colunas (até
8 × 8), a tabela do tamanho escolhido entra na posição do cursor e o cursor se muda para a
primeira célula.

Os comandos só aparecem na linha de contexto quando o cursor está dentro da tabela.

| Grupo | Campos |
|---|---|
| Linha | Inserir linha acima · Inserir linha abaixo · Excluir linha |
| Coluna | Inserir coluna à esquerda · Inserir coluna à direita · Excluir coluna |
| Mesclagem | Mesclar (uma única alternância) |
| Cabeçalho | Esta linha como cabeçalho · Esta coluna como cabeçalho (viram `<th>`) |
| Ordenação | Ligar/desligar ordenação (ordena as colunas do lado de quem lê) |
| Exclusão | Excluir tabela |

**Mesclar é uma única alternância** — não há botão por direção. Selecionar várias células e
apertar as funde numa só; com o cursor na célula fundida, apertar de novo desfaz.

**Não há campo nesta linha para colocar a caixa da tabela à esquerda, ao centro ou à direita.**
O lugar da tabela não é responsabilidade da tabela, e sim do parágrafo wrapper que a envolve, e
esse trabalho é feito pelo botão de alinhamento da barra de ferramentas.

::: warning A marca de ordenação e a mesclagem
Ordenação é só **uma única marca.** O editor a coloca até numa tabela com células mescladas, e
mesclar também não arranca uma marca já colocada.

Só que **o lado da leitura recusa** — `attachTableSort` simplesmente não se prende numa tabela
onde aparecem células mescladas. Isso porque as linhas fundidas estão amarradas, e reordenar
quebraria a grade. Por isso, numa tabela mesclada, a marca existe mas nada acontece.
:::

## A largura quem define é o conteúdo

A tabela não tem configuração de largura. Ela se alarga **só até onde o conteúdo pede**, e, se
passar do espaço disponível, ela **rola lateralmente** ali mesmo — a página não é empurrada.
Também não há uma `<div>` de envoltório. O que sai no valor salvo é uma `<table>` só, e os
únicos atributos que grudam nela são o alinhamento (`data-nabi-align`) e o marcador de
ordenação.

## Deslocamento e seleção

`Tab`/`Shift+Tab` movem entre as células (na borda da tabela o cursor fica onde está). A célula
só abriga conteúdo inline, então o Enter não parte a célula: **ele quebra a linha dentro dela**
— parti-la exigiria inventar um bloco que a grade não pode abrigar. As setas se movem pela
grade, não pela tela.

Dá para selecionar várias células arrastando o mouse. Essa seleção por arrasto também é algo
que o wing carrega via `attach` — **não há nada separado para montar**, `mountSurface` prende
junto.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e os montadores — isso é o `registry`
const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
