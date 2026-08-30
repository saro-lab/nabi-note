---
title: Configuração de SSR
description: Renderize documentos NABI TREE salvos como HTML seguro no servidor e hidrate um editor no navegador.
---

# Configuração de SSR

No servidor, importe apenas `nabi-note/ssr`, não superfícies de navegador nem UI. Ele valida o JSON de NABI TREE salvo e o transforma em HTML publicado ou HTML de editor hidratável.

## Criar HTML publicado

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` valida e normaliza a entrada JSON, depois retorna HTML publicado. `null` significa que o registry atual não consegue ler essa entrada. Inclua o CSS do pacote e a classe `.nabi-content` na página publicada.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Adicione `attachViewer()` de `nabi-note/viewer` no navegador apenas para ordenação interativa de tabelas ou realce de código. Conteúdo publicado simples precisa só de CSS.

## Hidratar marcação de editor pré-renderizada

Para mostrar um editor desde o primeiro paint, renderize-o com `renderStoredEditorHtml()` no servidor e passe `hydrate: true` à superfície do navegador.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Servidor e navegador devem usar o mesmo documento, as mesmas declarações de wings na mesma ordem e as mesmas opções que afetam o HTML. Insira a saída do servidor sem alterações como filhos diretos da raiz de conteúdo, e não defina `contenteditable` nessa raiz com antecedência. Se a estrutura for diferente, a superfície renderiza um novo HTML de edição.

## Pré-renderizar também a barra de ferramentas

`renderToolbarHtml()` e `renderViewToolsHtml()` podem pré-renderizar controles de barra no servidor. A montagem no navegador conecta esses controles quando registry, locale e ordem de grupos coincidem. DOM arbitrário da aplicação dentro de uma raiz de barra de ferramentas não é compatível.

Não use APIs de navegador como `injectSheets()` durante SSR. Vincule o arquivo construído `nabi-note/nabi.css` ou inclua-o no seu bundle CSS.
