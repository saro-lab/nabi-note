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

O intervalo padrão entre pressionamentos consecutivos de Enter para sair de um contêiner de blocos é 180ms. O duplo toque em Esc e Shift mantém 350ms. Definir `doubleEnterMs` explicitamente em `mountSurface()` altera o intervalo tanto de Enter quanto do duplo Esc.

Cada editor precisa de raízes próprias e não sobrepostas para conteúdo e barra de ferramentas. Em uma página com vários editores, dê a cada barra sua própria superfície por `surface`, para que foco e atalhos não se misturem.

## Configurar a barra de ferramentas

A barra padrão agrupa títulos, formatação de texto, alinhamento, listas, inserção e ferramentas do documento, nessa ordem, com separadores verticais. No desktop, todas as ferramentas aparecem em várias linhas; no celular, as ferramentas rápidas e o botão de todas as ferramentas ocupam uma linha. As propriedades de tabelas, imagens e regiões flutuantes aparecem abaixo e podem ser usadas junto com as ferramentas do texto.

Use `groups` para alterar a ordem dos grupos e `quick` para a ordem das ferramentas rápidas no celular. Por exemplo, um editor que insere imagens com frequência pode mover o grupo `media` para o início.

```ts
import { TOOLBAR_GROUPS, mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'pt',
  groups: ['media', ...TOOLBAR_GROUPS.filter((group) => group !== 'media')],
  quick: ['b', 'i', 'tc', 'img'],
})
```

As ferramentas rápidas seguem a ordem indicada, sem separadores. Dentro de cada grupo, vale a ordem de registro das asas. Ao pré-renderizar a barra com SSR, passe a mesma ordem de grupos ao servidor e ao navegador. [Temas CSS](./style#limite-do-modo-movel) explica a disposição conforme a largura da tela.

Conecte `mountHints()` para escolher ferramentas pelo teclado pressionando Shift duas vezes. Tab muda de grupo e as setas percorrem os ícones do mesmo grupo. No desktop e em tela cheia, usa-se a barra visível; no celular, a paleta de todas as ferramentas.

Painéis de imagem, campos de URL e seletores de arquivo lembram a seleção ao abrir. Se você apenas mover o cursor, a inserção usa a posição original; se editar ou substituir o documento, a entrada é cancelada com um aviso. Mesmo que desfazer restaure um conteúdo idêntico, a seleção antiga não é reutilizada.

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
