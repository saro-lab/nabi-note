---
title: Upload de arquivos
description: Conecte a transferência de arquivos ao uploader do seu serviço.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Upload de arquivos

Conecte seleção de arquivos, arrastar e soltar, e operações de colar que contenham apenas arquivos a um fluxo de upload. A demo desta página não envia arquivos para um servidor; em um serviço real, você precisa conectar um uploader que recebe um arquivo e devolve uma URL.

Para inserir resultados de upload como blocos de imagem, você precisa da wing de imagem. Para inserir outros arquivos como links de anexo, você precisa da wing de link. Se o seu serviço aceitar os dois formatos, selecione as duas wings explicitamente. Enquanto o upload estiver em andamento, o editor fica bloqueado, e os arquivos concluídos são inseridos juntos como uma única etapa de desfazer.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Se você selecionar apenas `upload`, ela fornece automaticamente qualquer dependência ausente entre imagem e link. A transferência é conectada com `mountUpload()`, e a UI de progresso da tela de edição normalmente é conectada com `mountUploadView()`. Se o servidor devolver URLs HTTPS, a opção de URL local não é necessária.

## Contrato da API do servidor

NABI NOTE não envia arquivos para o seu servidor por conta própria. A função `uploader` envia um arquivo ao servidor e, quando a operação é bem-sucedida, devolve apenas uma URL `https:` pública ou autenticada. O contrato de API mais simples fica assim.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

O servidor não deve confiar apenas no nome original do arquivo, na extensão ou no valor MIME enviados pelo navegador. Verifique autenticação e permissão primeiro, limite o tamanho do arquivo durante o streaming e inspecione o tipo real do arquivo. Crie o nome armazenado no servidor. Para imagens, recodifique-as ou crie miniaturas quando necessário. Se os arquivos enviados não devem ficar disponíveis para qualquer pessoa, devolva um caminho de download que exija autenticação em vez de uma URL pública.

| Verificação no servidor | Motivo |
| --- | --- |
| Usuário autenticado e permissão de upload | Impede gravação no armazenamento de outro usuário |
| Tamanho por arquivo e tamanho total da requisição | Evita esgotamento de memória e armazenamento |
| Tipo MIME real e extensão permitidos | Bloqueia executáveis com extensões renomeadas |
| Nome armazenado aleatório e armazenamento isolado | Evita manipulação de caminho e sobrescrita de arquivos existentes |
| Política de acesso e expiração da URL de resposta | Evita expor arquivos privados apenas pela URL |

`extensions` e `maxFileSize` no cliente são apenas o primeiro passo para dar retorno rápido ao usuário. Aplique os mesmos limites também no servidor.

## Conectar o uploader no navegador

O exemplo abaixo é a conexão real esperada pelo NABI NOTE. Ele usa `XMLHttpRequest` porque o `fetch()` padrão do navegador não oferece progresso de upload. Devolva somente a `url` da resposta do servidor; imagens viram blocos de imagem, e outros arquivos viram links de anexo.

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'en' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('Upload request failed.')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'en',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'en' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'en',
})
```

Conecte `fileSink: upload.take` para que operações de arrastar e soltar, e de colar que contenham apenas arquivos, entrem no fluxo de upload. A UI da wing de upload passa os resultados do botão de seleção de arquivos para `upload.take()`. Enquanto o upload estiver em andamento, o editor fica bloqueado, e os arquivos concluídos de cada lote são inseridos como uma única etapa de desfazer. `upload.cancel()` ou o botão de cancelar em `uploadView` aborta as requisições em andamento por meio de `AbortSignal`.

## Falha e limpeza

Se o servidor devolver uma resposta de erro ou o `uploader` devolver `null`, esse arquivo não será inserido no documento. Outros arquivos do mesmo lote continuam sendo processados. Se o limite de tamanho total for excedido, o lote inteiro não começa. Ao fechar a tela, desmonte na ordem inversa da criação.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Apenas durante o desenvolvimento, você pode usar URLs `blob:` para pré-visualização imediata. Nesse caso, ative `allowLocalUrls: true` na montagem do editor, na wing de imagem e na wing de upload. Se uploads reais do servidor devolvem URLs HTTPS, é mais seguro não habilitar essa opção.

## Estilos CSS

Arquivos comuns concluídos são exibidos pela wing de link como `a[data-nabi-file]`. Use esse seletor quando quiser alterar somente a aparência do anexo na visualização publicada.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Resultados de upload de imagem seguem o CSS da wing de imagem. O progresso de upload aparece apenas na tela de edição, então o CSS da visualização publicada não precisa criar um estado de progresso.
