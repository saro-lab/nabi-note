---
title: Mesclagem
description: Combine a versão inicial, sua versão e a salva nesse intervalo, editando os conflitos restantes para resolvê-los.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Mesclagem

Se outras alterações foram salvas enquanto você editava, combine os dois lados usando a versão inicial como base. Tudo que puder ser mesclado automaticamente já é aplicado; apenas sobreposições ficam em conflito. É uma tela independente de `nabi-note/merge`, não uma wing.

| Esquerda | Centro | Direita |
| --- | --- | --- |
| Versão no início da edição | Seu documento atual com mesclagem automática | Versão salva durante sua edição |
| Somente leitura | Editável diretamente | Somente leitura |

No centro, edite texto, formatação, tabelas, listas e imagens como no editor normal. As wings fornecidas determinam os recursos. Marcas e estados dos conflitos não entram no conteúdo salvo.

## Exemplo totalmente automático

Você mudou a reunião para **11h**, e outra pessoa o local para a **sala de reuniões do 3º andar**. Como são parágrafos diferentes, ambas as alterações aparecem no resultado central.

Sem conflitos restantes, pode clicar em **Confirmar** imediatamente ou ajustar o texto central antes. O documento final exibido abaixo é o resultado real recebido pelo callback de confirmação.

<MergeDemo />

## Exemplo parcialmente automático

Agora você mudou o horário para **11h**, e outra pessoa para **14h**. Alterações diferentes no mesmo parágrafo deixam o horário em conflito. Sua mudança dos responsáveis para **Jimin e Seoyeon** e o novo local, **sala de reuniões do 3º andar**, são aplicados automaticamente.

Resolva o conflito de uma destas formas:

- À esquerda, **&gt;&gt;**: adota o conteúdo correspondente da versão inicial.
- À direita, **&lt;&lt;**: adota o conteúdo da versão recém-salva.
- **Resolver com o conteúdo atual**: mantém ou edita o centro e marca como resolvido.

Altere a frase do horário no centro e clique em **Resolver com o conteúdo atual**. Só é possível confirmar depois de resolver todos os conflitos.

<MergeDemo partial />

Editar novamente uma região resolvida mantém o estado. Desfazer a resolução também reverte o estado; refazer o restaura. Apagar ou editar texto não resolve automaticamente conflitos pendentes.

## Regras de mesclagem automática e conflitos

São comparadas as mudanças do documento inicial para o seu e desse mesmo início para a nova versão. Mudanças de um lado só e mudanças idênticas nos dois lados são aplicadas automaticamente, assim como alterações em parágrafos ou linhas distintos.

Como na mesclagem textual do Git, sobreposições são avaliadas por parágrafos e linhas. Mesmo palavras diferentes alteradas na mesma linha ficam em conflito. Inserções diferentes na mesma posição ou edição de conteúdo excluído pelo outro lado também exigem decisão.

Se ambos os lados alterarem diferentemente um bloco estruturado, como tabela, lista ou região flutuante, toda a estrutura fica em conflito. Células e itens não são misturados arbitrariamente: escolha o conteúdo ou edite no centro. Movimentos e edições sobrepostos cuja posição não seja segura também não são aplicados automaticamente.

## Conectar uma tela de mesclagem independente

Passe NABI TREE JSON salvo ou strings HTML em `base`, `local` e `incoming`. Use as mesmas wings e opções do editor original. `mountMerge()` cria editor central, barra, fontes laterais, controles de conflito e botão de confirmação.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'pt',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` recebe JSON, HTML publicável, revisão de edição e `incomingVersion` do resultado atual totalmente resolvido. Retornar `false` não conclui a confirmação. Durante a Promise, edição, seleção de conflitos e confirmação duplicada ficam bloqueadas. Desmontar aborta o `signal` do resultado. A composição IME coreana deve terminar antes de confirmar.

Conecte ações próprias, como seletor de imagens ou uploads, como num editor normal. `toolbarOptions` recebe painéis e ações do host; `surfaceOptions`, opções da superfície de edição.

`incomingVersion` devolve o valor fornecido sem alterações. O serviço deve compará-lo com a versão mais recente do servidor ao salvar. Se outra versão foi salva durante a mesclagem, busque o documento atual e inicie nova mesclagem, sem sobrescrevê-lo com resultado antigo.

Também é possível ler o estado ou confirmar fora da tela.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Leia o resultado com `merge.nabi.getJson()` e `merge.nabi.getHtml()`. Não salve o DOM de edição nem `getEditorHtml()`. Para aplicar apenas conteúdo anterior selecionado entre duas versões, use a mesclagem por clique em [Comparação](./compare).

## Confirmar após os uploads

Conecte a wing `upload` e `mountUpload()` para botão de arquivo, colagem e arrastar e soltar. `sendUpload` envia arquivos ao servidor e retorna `{ uri }`. Veja [Upload de arquivos](../wing/etc/upload) para o exemplo completo de conexão e progresso.

Use `merge.session.hold()` para adiar confirmação e seleção de conflitos durante tarefas assíncronas, como uploads, ainda não refletidas no documento. Chame a função retornada ao concluir, cancelar ou desmontar. Libere **após inserir no documento**, não logo após enviar ao servidor, para não omitir o arquivo do resultado final.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'pt',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'pt',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` é o DOM central; `merge.surface` e `merge.toolbar` já estão montados. Não recrie superfície ou barra nesse lugar. Desmonte primeiro uploads e indicadores adicionais e, por último, chame `merge.unmount()`.
