---
title: SSR setup
description: Safely render stored NABI TREE documents to HTML on a server and hydrate an editor in the browser.
---

# SSR setup

On the server, import only `nabi-note/ssr`, not browser surfaces or UI. It validates stored NABI TREE JSON and turns it into published HTML or hydratable editor HTML.

## Render published HTML

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` validates and normalizes its JSON input, then returns published HTML. `null` means the current registry cannot read that input. Include the package CSS and `.nabi-content` on the published page.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Add `attachViewer()` from `nabi-note/viewer` in the browser only for interactive table sorting or code highlighting. Plain published content needs only CSS.

## Hydrate pre-rendered editor markup

To show an editor from the first paint, render it with `renderStoredEditorHtml()` on the server and pass `hydrate: true` to the browser surface.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

The server and browser must use the same document, wing declarations in the same order, and options that affect HTML. Insert the server output unchanged as direct children of the content root, and do not pre-set `contenteditable` on that root. If the structure differs, the surface renders fresh editor HTML.

## Pre-render the toolbar too

`renderToolbarHtml()` and `renderViewToolsHtml()` can pre-render toolbar controls on the server. Mounting in the browser wires those controls when the registry, locale, and group order match. Arbitrary host DOM inside a toolbar root is not supported.

Do not use browser APIs such as `injectSheets()` during SSR. Link the built `nabi-note/nabi.css` file or include it in your CSS bundle.
