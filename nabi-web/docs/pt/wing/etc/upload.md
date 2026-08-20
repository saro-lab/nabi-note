---
title: Enviar arquivo
---

# Enviar arquivo

## Descrição

O envio se divide em três peças — só registrar o wing não faz nada acontecer.

1. **`uploadWing`** — põe na barra de ferramentas o botão de escolher arquivo. Este wing, por
   si, não cria nem `img` nem `a` — o arquivo enviado é confirmado nos blocos que os wings de
   imagem e de link desenham, então **é preciso registrar junto o `imageWing` ou o `linkWing`**
   para que o resultado permaneça no documento. Se nenhum dos dois estiver ali, **uma exceção é
   lançada já no registro** (não estoura mais tarde).
2. **`mountUpload({ … })`** — é o lado que de fato recebe os arquivos e roda o `uploader`.
   Arrastar-e-soltar, colar e o botão de escolher arquivo, tudo flui para cá. **Sem este mount,
   o botão fica ali sem que nada aconteça.**
3. **`mountUploadView({ … })`** — é o lado que exibe o marcador de progresso na tela. Sem ele o
   envio ainda funciona, mas a tela fica muda enquanto o arquivo sobe.

O `uploader` tem a forma `(task) => Promise<{ uri } | null>` — **devolver um endereço é
sucesso, `null` é falha**, e nesse caso o marcador é removido. `task.onProgress(0~100)` informa
o progresso, e se `task.signal` for abortado, o envio para.

Os limites são três: `extensions`, `maxFileSize`, `maxTotalSize`, todos opcionais (0 ou omitido
= sem limite). Arquivos filtrados chegam por `onReject`.

## O que fica depois do envio

Imagens são confirmadas como bloco do `imageWing`; os demais arquivos, como link de anexo do
`linkWing`.

- **O nome do anexo não é o nome do arquivo, e sim um rótulo de i18n** — em português, "Anexo".
  Nomes de arquivo costumam ser longos demais para ficar no documento e, acima de tudo,
  precisam poder ser trocados. O nome se troca deixando o cursor naquele link e usando o
  [campo de nome da linha de contexto](../inline/link).
- **A extensão fica como marcação** — `data-nabi-file="pdf"`. Esse valor é extraído do nome de
  arquivo verdadeiro, e a folha de estilo o desenha como um selo. Trocar o nome não desfaz a
  marcação: ela vai junto.
- Endereços que o link não aceita (um `blob:` que chega sem `allowLocalUrls` ligado, por
  exemplo) são rebaixados ao nome de arquivo em texto puro — a lista branca não é contornada.

## O que se vê durante o envio

Durante o envio, uma caixa temporária fica naquele lugar — ela existe apenas no DOM do editor,
não na árvore do nabi, então nem um caractere dela sobra no valor salvo.

- **Imagens** recebem de imediato uma pré-visualização feita do próprio arquivo escolhido, e uma
  grade cobre a figura por cima. As células vão sendo retiradas conforme o progresso, até a
  figura ficar nítida. A ordem em que as células somem é embaralhada por arquivo, então subir
  várias de uma vez não repete o mesmo padrão.
- **Arquivos que não são imagem** recebem uma caixa sem grade, com um 📎 e o rótulo "Anexo", e a
  extensão aparece junto como um selo em maiúsculas (`PDF`, etc.). Imagens que não conseguem
  gerar pré-visualização também caem aqui.
- O progresso vai na caixa como `data-nabi-per`, e a folha de estilo o desenha. Enquanto sobe,
  cada caixa ganha um botão de cancelar (×), e a edição fica travada enquanto o lote roda.

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

// o envio só deixa resultado se houver wing de imagem ou de link — sem eles, exceção já aqui
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// o lado que exibe o marcador de progresso — cria-se primeiro para poder passar adiante
const view = mountUploadView({ nabi, surface, locale: 'pt' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'pt',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // aqui entra o código que de fato envia ao servidor. devolver um endereço é sucesso, null é falha
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // para onde vão os arquivos escolhidos pelo botão da barra de ferramentas
  onFiles: (files) => upload.take(files),
})
```

## Demo

Este site não tem servidor para onde enviar, então ele apenas finge: devolve tal e qual um
endereço `blob:` criado com `URL.createObjectURL()`. O resultado só permanece dentro desta
página.

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
