---
title: Envio de arquivo
---

# Envio de arquivo

## Descrição

O envio de arquivo funciona pela integração de três módulos:

1. **`uploadWing`**: adiciona à barra de ferramentas um botão para anexar arquivo. Como o resultado do envio é inserido no documento como um nó de imagem ou de link de arquivo, **`imageWing` ou `linkWing` precisa estar registrado junto**. Se nenhum dos dois estiver presente, uma exceção é lançada na inicialização.
2. **`mountUpload({ … })`**: recebe os arquivos que chegam por arrastar-e-soltar, colar da área de transferência ou seleção pela barra de ferramentas, e os passa para a função `uploader` do host.
3. **`mountUploadView({ … })`**: renderiza na tela a interface de espaço reservado para o progresso do envio.

::: warning Regra de tratamento do envio de arquivo ao colar da área de transferência
Se os dados da área de transferência **contiverem texto ou HTML** (`text/html` ou `text/plain`), o colar segue o fluxo normal de texto/Markdown em vez do envio. O fluxo de envio só é chamado quando o colar da área de transferência traz apenas dados de arquivo. (Um anexo via arrastar-e-soltar sempre segue o fluxo de envio.)
:::

A função `uploader` tem a assinatura `(task) => Promise<{ uri: string } | null>`. Ela retorna um objeto `{ uri }` quando o envio ao servidor é bem-sucedido, e `null` em caso de falha. O progresso é reportado pelo callback `task.onProgress(0~100)`, e o cancelamento é tratado por `task.signal`.

Opções de limite de extensão e tamanho: `extensions`, `maxFileSize`, `maxTotalSize` (sem limite se omitidas). Arquivos inválidos são passados para o callback `onReject`.

## O que o documento renderiza depois do envio

- **Arquivos de imagem** são inseridos como um bloco `<img>` do `imageWing`.
- **Outros anexos** são inseridos como um link de download de arquivo do `linkWing` (`<a data-nabi-file="pdf" href="...">`). O texto exibido do anexo é gerado conforme a locale como "Anexo", e pode ser livremente alterado posicionando o cursor no link e usando a barra de contexto.

## Exemplo de uso

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// O wing de envio precisa do wing de imagem ou de link registrado junto
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// Monta a view de interface do progresso do envio
const view = mountUploadView({ nabi, surface, locale: 'pt' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'pt',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
  maxFileSize: 10 * 1024 * 1024,   // 10MB
  uploader: async (task) => {
    // Implemente aqui a lógica real de envio do arquivo ao servidor backend
    // const uri = await myUploadApi(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi,
  registry,
  surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  onFiles: (files) => upload.take(files),
})
```

## Demo

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
