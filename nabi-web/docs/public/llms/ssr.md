# SSR and hydration

Use `nabi-note/ssr` when the process must not import browser surface or UI code.

## SSR exports

The entry exports:

- `makeRegistry`, `renderStoredHtml`, `renderStoredEditorHtml`;
- `renderToolbarHtml`, `renderViewToolsHtml`, `toolbarSlots`, `TOOLBAR_GROUPS`;
- `defaultWings`, `wingNames`, `wings`;
- `safeUrl`;
- NABI TREE types and `P`, `BR`, `isElement`, `isText`;
- locale helpers needed by rendering, including DOM-free `createLocale()`.

Toolbar renderers accept a fixed string or a `LocaleSource` as `locale`. They read
the current value without subscribing. Create a source per request or editor; do
not share mutable language state between unrelated server requests. On the client,
pass the same source to the mounts and call `setLocale()` to update labels without
replacing the hydrated buttons or document. See `quickstart-npm.md`.

It does not export `createNabiWith`, `mountSurface`, UI mounts, viewer behavior, or diff UI.

## Render stored content

```ts
import {
  makeRegistry,
  renderStoredHtml,
  wings,
} from 'nabi-note/ssr';

const registry = makeRegistry(wings().allBasic().build());
const html = renderStoredHtml(storedJson, registry);

if (html === null) {
  // Invalid document input.
}
```

`renderStoredHtml()` accepts user JSON, validates and normalizes it, and returns published HTML or `null`. It is the detached equivalent of `nabi.getHtml()`.

`renderStoredEditorHtml()` returns hydratable editor HTML or `null`. It is the detached equivalent of `nabi.getEditorHtml()` and is not a storage format.

The options type is `{ allowLocalUrls?: boolean }`. Keep local URLs disabled for durable published content unless the consuming environment can resolve them and the security tradeoff is intended.

## Hydrate an editor

Server:

```ts
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry);
```

Browser:

```ts
import {
  createNabiWith,
  mountSurface,
  wings,
} from 'nabi-note';

const selected = wings().allBasic();
const { nabi, registry } = createNabiWith(selected, {
  doc: storedJson,
});

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  hydrate: true,
});
```

Requirements:

- The server and browser use the same ordered wing declarations and options that affect HTML.
- Both start from the same normalized document.
- The server output is inserted unchanged as the content root's direct children.
- The root itself does not include `contenteditable`; the browser mount owns it.
- The matching CSS is present before first paint.

Internal IDs are deterministic for the same normalized input. Hydration adopts server DOM when the direct child `data-key` sequence matches the current document. If it does not match, the surface replaces the content with fresh editor HTML. Hydration is an optimization, not a way to preserve arbitrary host DOM.

## Pre-render toolbar markup

```ts
import {
  makeRegistry,
  renderToolbarHtml,
  renderViewToolsHtml,
  wings,
} from 'nabi-note/ssr';

const registry = makeRegistry(wings().allBasic().build());

const toolbarHtml = renderToolbarHtml({
  registry,
  locale: 'en',
  layout: 'compact',
  quick: ['b', 'i', 'tc', 'fs'],
});

const viewToolsHtml = renderViewToolsHtml({ locale: 'en' });
```

`layout` defaults to `'compact'`; use `'wrap'` for the previous explicit layout. `quick` takes toolbar slot names in priority order and defaults to `['b', 'i', 'tc', 'fs']`. It configures the mobile compact row; desktop shows every available main-toolbar command, wrapping like fullscreen. A server cannot know the final viewport width, container width, active selection, or software keyboard. After mounting, the browser expands the default toolbar when the viewport reaches `--nabi-mobile-breakpoint` and uses the compact row below it. Property controls appear automatically below the main toolbar when available. Both rows stay sticky together within their own editor on desktop and mobile.

Toolbar HTML no longer includes the old letter-badge attributes or letter-shortcut tooltip suffixes. Keyboard palette navigation is wired after mounting; keep server and browser package versions aligned.

In the browser, mount the matching UI on those roots. `mountToolbar()` compares button names and localized labels. If the structure matches, it wires the existing buttons. If not, it removes only direct pre-rendered wing groups and renders the correct structure.

Matching toolbar markup produced by `renderToolbarHtml()` is the package-owned pre-render exception to the otherwise empty dedicated-root rule. The toolbar mount may move, wire, replace, and remove those package-owned controls, including placement inside the compact Tools palette. Arbitrary host-owned child DOM inside a toolbar root is not a supported baseline and must live outside that root.

The matching inputs are:

- the registry and wing order;
- locale or translator;
- toolbar group order;
- `layout` and `quick` configuration.

Pre-rendering avoids an empty toolbar before JavaScript, but the browser remains authoritative. A failed browser mount rolls back wiring on matching pre-rendered buttons, and `unmount()` detaches that wiring.

The public detached rendering boundary is the stored renderer pair. Low-level rendering of an internal canonical document is package-private.

## CSS on SSR pages

Link the built package CSS:

```html
<link rel="stylesheet" href="/assets/nabi.css">
```

Runtime `injectSheets()` requires a `Document` and is not the server path. If a build system extracts CSS, use `nabi-note/nabi.css` as the source.

Published viewer behavior is separate. After hydration or on a read-only page, import `nabi-note/viewer` only when sorting or code paint is required.

## Icon themes and individual view tools

Pass the same `showPreview` and `showFullscreen` booleans to `renderViewToolsHtml()` and `mountViewTools()`. Both default to true; both false returns an empty SSR string and mounts no wrapper. Matching controls are reused. When connected to a compact toolbar, the browser keeps enabled view controls visible in the main row. CSS URL changes keep button identity. Load the published CSS and icon assets before hydration; do not serialize server `CORE_CSS` with `file:` asset URLs into a page. See `icons.md`.
