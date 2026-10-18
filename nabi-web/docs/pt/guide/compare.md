---
title: Comparação
description: Compare dois documentos lado a lado e aplique conteúdo anterior selecionado ao documento atual.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Comparação

Compare dois documentos salvos lado a lado para ver as alterações. A comparação abre sem editor; conecte um callback para aplicar conteúdo anterior selecionado ao documento atual.

## Aplicar conteúdo anterior selecionado

À esquerda está o documento anterior; à direita, o atual. Clique em **&gt;&gt;** junto de uma alteração para aplicar o conteúdo anterior daquele parágrafo ou grupo de linhas. A seleção não é caractere por caractere. Também pode restaurar conteúdo excluído ou remover conteúdo recém-adicionado.

Experimente restaurar apenas o horário ou os itens a levar. Abra **Documento atual atualizado pelo callback** para ver o resultado. **Recomeçar** restaura o exemplo original.

<CompareDemo />

## Comparação independente

Importe de `nabi-note/diff`. Passe NABI TREE JSON salvo ou strings HTML em `before` e `after`. Monte o registry com as mesmas wings do editor original para ler e exibir integralmente tabelas, listas, imagens e outros conteúdos.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'pt',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Por padrão aparecem apenas alterações e contexto. O botão de recolher permite expandir os documentos inteiros; anterior/próximo percorrem as alterações. Sem alterações, o conteúdo completo aparece. Sem `onMerge`, a comparação é somente leitura.

## Conectar mesclagem por clique a um callback

O clique entrega uma proposta de resultado a `onMerge`. Apenas conectar o callback não salva automaticamente. O serviço precisa aceitar a proposta e chamar `update()` para mudar também a comparação.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'pt',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` é NABI TREE JSON apenas com a alteração selecionada. `before` e `after` são os documentos no instante do clique; `changeId` identifica a alteração e `revision` o estado da comparação. Passe essa `revision` como terceiro argumento de `update()`: se a comparação já mudou, retorna `false` sem aplicar a proposta.

Cliques duplicados são bloqueados enquanto o callback assíncrono aguarda. Atualizar com outros documentos ou desmontar aborta `signal`. Ao salvar no servidor, verifique o sinal e a versão do documento para não sobrescrever uma versão nova com resultado antigo.

## Abrir a comparação no editor

Conecte a wing `diff` e `mountDiffWing()` para abrir a comparação pela barra de ferramentas. A base é o último documento carregado. Edição comum e desfazer não alteram essa base.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'pt',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

Com `merge: true`, o conteúdo anterior selecionado é aplicado ao editor. É possível desfazer, mantendo a base. Alterações no editor original com a comparação aberta provocam novo cálculo. Omitir `merge` mantém a comparação somente leitura.

Ao remover a tela, chame `toolbar.unmount()` e `comparison.unmount()`. Para incluir a versão inicial da edição e combinar automaticamente os dois lados, use [Mesclagem](./merge).
