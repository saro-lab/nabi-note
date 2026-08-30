---
title: Basic usage
description: Build a browser-based NABI NOTE editor, then save and restore its documents.
---

# Basic usage

This guide covers a client-side rendered (CSR) editor in the browser: choose wings, mount the editor and its UI, then save and restore NABI TREE JSON.

## Install and add the base markup

```bash
npm install nabi-note
```

Load the same stylesheet for both the editor and published content. Do not add `contenteditable` yourself; `mountSurface()` owns it.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Mount an editor

`allBasic()` selects the official wings that work without application-specific wiring. Add service-connected wings such as upload, file storage, or document diffing as described in their individual guides.

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

`locale` controls toolbar and helper text; pass the same value to every UI mount. `placeholder` is shown only for an empty editor. `onError` receives isolated failures from commands and callbacks. `undoLimit` is the number of undo entries (200 by default). `typingMergeMs` is the interval that merges consecutive typing into one undo step; set it to `0` to keep each insertion separate.

Every editor needs its own non-overlapping content and toolbar roots. On a page with several editors, give each toolbar its own editor surface through `surface` so focus and shortcuts do not cross over.

## Choose wings

Use `use()` and `drop()` to keep only the features you need. Each wing page documents the options it accepts.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

For a smaller bundle, pass only the required wings, such as `boldWing` and `imageWing`, as an array. Unknown names, invalid options, and missing dependencies fail immediately when the editor is created.

## Save and load

Save `getJson()` output as NABI TREE JSON when a document will be edited again. `getHtml()` is for published output. Never store the editor-only result of `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

Use `setHtml()` to import external HTML. The browser editor already provides its HTML parser, so no parser option is needed. `setJson()` and `setHtml()` return `false` for invalid non-empty input and leave the current document untouched.

```ts
nabi.setHtml('<p>Imported document</p>')
```

JSON and HTML are both untrusted input. NABI NOTE reads them through the registered wings and their allowed rules, but that does not replace upload authorization or your service's security policy.

## Common APIs

| Task | API |
| --- | --- |
| Create an editor | `createNabiWith`, `wings` |
| Mount the surface and toolbar | `mountSurface`, `mountToolbar` |
| Save and restore | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Observe changes | `nabi.onChange(listener)` |
| Undo and redo | `nabi.undo()`, `nabi.redo()` |
| Render HTML on a server | `renderStoredHtml` from `nabi-note/ssr` |
| Add published-page behavior | `attachViewer` from `nabi-note/viewer` |
| Compare documents | `diffDocs` from `nabi-note/diff` |

For exact types and every argument, check the installed package declarations first. Automation tools can also use the [English API reference](https://nabi.saro.me/llms/api-reference.md).

## Dispose mounts

Unmount in reverse creation order. Do not modify the editing root's `innerHTML` directly; change documents through public APIs such as `setJson()`, `setHtml()`, or `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
