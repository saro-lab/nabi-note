---
title: Uso básico
description: Monte um editor NABI NOTE no navegador e salve e restaure seus documentos.
---

# Uso básico

Este guia cobre um editor renderizado no cliente (CSR) no navegador: escolha wings, monte o editor e sua UI, e depois salve e restaure JSON de NABI TREE.

## Instalação e HTML base

```bash
npm install nabi-note
```

Carregue a mesma folha de estilos tanto para o editor quanto para o conteúdo publicado. Não adicione `contenteditable` por conta própria; `mountSurface()` é responsável por isso.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Montar um editor

`allBasic()` seleciona os wings oficiais que funcionam sem ligação específica da aplicação. Adicione wings conectados a serviços, como upload, armazenamento de arquivos ou comparação de documentos, conforme as guias individuais.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'en',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'en',
  placeholder: 'Write something.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'en',
})
```

`locale` controla a barra de ferramentas e os textos auxiliares; passe o mesmo valor a toda montagem de UI. `placeholder` aparece apenas quando o editor está vazio. `onError` recebe falhas isoladas de comandos e callbacks. `undoLimit` é o número de entradas de desfazer (200 por padrão). `typingMergeMs` é o intervalo que combina digitação consecutiva em um único passo de desfazer; defina como `0` para manter cada inserção separada.

Cada editor precisa de raízes próprias e não sobrepostas para conteúdo e barra de ferramentas. Em uma página com vários editores, dê a cada barra sua própria superfície por `surface`, para que foco e atalhos não se misturem.

## Escolher wings

Use `use()` e `drop()` para manter apenas os recursos necessários. Cada página de wing documenta as opções aceitas.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

Para um bundle menor, passe apenas os wings necessários, como `boldWing` e `imageWing`, em um array. Nomes desconhecidos, opções inválidas e dependências ausentes falham imediatamente quando o editor é criado.

## Salvar e carregar

Salve a saída de `getJson()` como JSON de NABI TREE quando o documento for editado novamente. `getHtml()` é para saída publicada. Nunca salve o resultado exclusivo do editor de `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

Use `setHtml()` para importar HTML externo. O editor no navegador já fornece seu parser HTML, portanto nenhuma opção de parser é necessária. `setJson()` e `setHtml()` retornam `false` para entrada inválida não vazia e deixam o documento atual intacto.

```ts
nabi.setHtml('<p>Imported document</p>')
```

JSON e HTML são entradas não confiáveis. NABI NOTE lê ambos pelos wings registrados e suas regras permitidas, mas isso não substitui a autorização de upload nem a política de segurança do seu serviço.

## APIs usadas com frequência

| Tarefa | API |
| --- | --- |
| Criar um editor | `createNabiWith`, `wings` |
| Montar a superfície e a barra | `mountSurface`, `mountToolbar` |
| Salvar e restaurar | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Observar mudanças | `nabi.onChange(listener)` |
| Desfazer e refazer | `nabi.undo()`, `nabi.redo()` |
| Renderizar HTML no servidor | `renderStoredHtml` de `nabi-note/ssr` |
| Adicionar comportamento à página publicada | `attachViewer` de `nabi-note/viewer` |
| Comparar documentos | `diffDocs` de `nabi-note/diff` |

Para os tipos exatos e todos os argumentos, verifique primeiro as declarações do pacote instalado. Ferramentas de automação também podem usar a [referência de API em inglês](https://nabi.saro.me/llms/api-reference.md).

## Desmontar

Desmonte na ordem inversa da criação. Não modifique diretamente o `innerHTML` da raiz de edição; altere documentos por APIs públicas como `setJson()`, `setHtml()` ou `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
