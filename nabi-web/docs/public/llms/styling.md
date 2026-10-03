# Styling contract

## Load CSS

Bundler:

```ts
import 'nabi-note/nabi.css';
```

HTML:

```html
<link rel="stylesheet" href="/assets/nabi.css">
```

The bundled file contains `CORE_CSS` and every built-in wing stylesheet. It is the safest choice for an editor, server-rendered content, and published pages.

For a selected registry in a browser:

```ts
import { CORE_CSS, collectSheets, injectSheets } from 'nabi-note';

const sheets = collectSheets(registry, CORE_CSS);
const detachStyles = injectSheets(document, sheets);
```

`collectSheets()` places core CSS first, then registered wing CSS, and removes duplicate strings. `injectSheets()` shares each exact CSS string by `Document` with reference counting. Its disposer removes a package-owned style only after the final reference; it never removes a matching style supplied by the host.

Do not use runtime injection in SSR. Link or bundle `nabi-note/nabi.css`.

## Host markup

The host normally supplies:

```html
<div class="nabi">
  <div class="nabi-toolbar">
    <div class="nabi-toolbar-row"></div>
    <div class="nabi-context"></div>
  </div>
  <div class="nabi-content"></div>
</div>
```

- `.nabi`: theme and editor shell.
- `.nabi-toolbar`: sticky chrome wrapper.
- `.nabi-content`: editing or published document body.
- `mountSurface()` adds `.nabi-editing` and `contenteditable`.
- `.nabi-tools`: preview/fullscreen controls created by `mountViewTools()`.
- `.is-fullscreen`: class-based fullscreen, not the browser Fullscreen API.

Never put `.nabi-editing` on published content.

## Main theme tokens

| Token | Default purpose |
| --- | --- |
| `--nabi-fg`, `--nabi-muted` | Main and secondary text |
| `--nabi-bg`, `--nabi-soft` | Main and soft backgrounds |
| `--nabi-line` | Borders and separators |
| `--nabi-accent`, `--nabi-on-accent` | Selection/action and text on it |
| `--nabi-danger`, `--nabi-on-danger` | Destructive action pair |
| `--nabi-radius`, `--nabi-radius-sm`, `--nabi-radius-xs` | General corner radii |
| `--nabi-layer-radius` | Panel/overlay corner radius |
| `--nabi-shadow`, `--nabi-scrim` | Floating layer shadow and backdrop |
| `--nabi-z-sticky` | Sticky toolbar layer, default 20 |
| `--nabi-z-overlay`, `--nabi-z-dialog` | Fullscreen and modal overlay layers |
| `--nabi-z-diff-fullscreen` | Standalone fullscreen diff layer, default 80 |
| `--nabi-grid-cell` | Table picker cell size |
| `--nabi-control-size`, `--nabi-touch-control-size` | Standard and touch control heights |
| `--nabi-motion-press`, `--nabi-motion-fast` | Press and short UI transitions |
| `--nabi-motion-progress`, `--nabi-motion-toast` | Upload progress and toast fade transitions |
| `--nabi-hl-<name>` | Six highlight colors |
| `--nabi-tc-<name>` | Five text colors |

Set overrides on `:root`, a page theme root, or one `.nabi`.

## Host-input tokens

The core reads these but does not always declare the host-facing value:

| Token | Meaning |
| --- | --- |
| `--nabi-font` | Base sans font stack |
| `--nabi-font-serif` | Typeface wing serif stack |
| `--nabi-font-mono` | Typeface wing monospace stack |
| `--nabi-font-cursive` | Typeface wing cursive stack |
| `--nabi-cursive-adjust` | Optional `font-size-adjust` for cursive |
| `--nabi-content-min-height` | Minimum edit surface height, default 12.5rem |
| `--nabi-placeholder-color` | Empty-editor placeholder color |
| `--nabi-sticky-top` | Offset below a fixed host header |
| `--nabi-preview-width` | Preview card width; preview may set an inline measured width |
| `--nabi-fullscreen-bg` | Fullscreen outer background; defaults to a 94% main background / 6% text color mix (light gray in light mode) |
| `--nabi-fullscreen-content-bg` | Fullscreen paper background; defaults to `--nabi-bg` (white in light mode) |
| `--nabi-mobile-breakpoint` | Mobile-mode width threshold, default 36rem (strictly below) |
| `--nabi-touch-font-size` | Core input size on touch/narrow screens, default 16px |
| `--nabi-diff-height` | Standalone diff pane height, default 30rem |

Fallback font and placeholder tokens are declared internally. Prefer the host-facing names above.

## Fullscreen paper

`mountViewTools()` measures the edit surface's border-box width before entering fullscreen and keeps that width centered, capped at the available viewport width. The paper fills the remaining height below the toolbar and grows with long content. The toolbar keeps its usual background. Exiting fullscreen or unmounting restores the surface's previous layout.

Set the two background tokens on `:root`, an ancestor, or an individual editor. Their defaults follow the active light/dark theme:

```css
.article-editor {
  --nabi-fullscreen-bg: #eee;
  --nabi-fullscreen-content-bg: #fff;
}
```

The transient `.nabi-fullscreen-content` class and `--nabi-fullscreen-content-width` property are managed by `mountViewTools()` on the supplied surface; do not maintain them manually.

## Mobile breakpoint

Mobile mode starts when the toolbar/context row or viewport width is strictly below `36rem`. Exactly `36rem` keeps the regular layout. Mobile mode scrolls the toolbar and context row horizontally, centers panels, and reduces the table picker to 5x5 touch-sized cells.

Set `--nabi-mobile-breakpoint` on `:root`, an ancestor, or an individual `.nabi`. Use a non-negative CSS length such as `rem`, `px`, or `calc()`. Changes to the CSS value, root font size, container width, or viewport width update mounted controls and open panels automatically, including prompts moved under `body`.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

The browser UI resolves the CSS length and toggles `.nabi-narrow`; do not put `var()` in a media-query condition or manually maintain that class. Coarse-pointer devices retain larger touch controls above this breakpoint.

## Light and dark

Default is light. Dark mode activates when:

- an ancestor `html` or `body` has class `.dark`; or
- the relevant `.nabi`, scrim, or diff root has `data-nabi-theme="dark"`.

`data-nabi-theme="light"` overrides an inherited page `.dark` state. The package does not automatically follow `prefers-color-scheme`; the host owns the active theme.

Overlays are appended under `body`, so core tokens are also established on scrims and standalone published `.nabi-content` roots. If adding custom wing styles, ensure their overlay state does not rely only on inheritance from the editor shell.

## Placeholder

`mountSurface()` writes a quoted `--nabi-placeholder` custom property. Default text comes from the active locale. Pass `placeholder: ''` to disable it.

The placeholder appears only for one empty unfocused paragraph and is not a DOM text node. It disappears on focus so an Android IME can use the real empty text slot without generated content interfering.

## Drop caps

Published content uses `::first-letter`:

```css
.nabi-content:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter
```

Editing content does not use `::first-letter` because WebKit and Chromium can mis-map caret geometry around it. Editor HTML wraps the first grapheme in a real `[data-nabi-dropcap-letter]` span and applies the same visual rule. The span is display-only, excluded from stored HTML, and removed from same-document clipboard output.

Do not replace the span, synthesize a second one, or add a competing `::first-letter` rule inside `.nabi-editing`.

## Published content

A read-only body needs `.nabi-content` plus CSS:

```html
<article class="nabi-content">...</article>
```

CSS handles layout, check states, drop caps, code colors, tables, images, and attachments. JavaScript is optional. Use `nabi-note/viewer` only for table sorting and code token painting.

## Safe overrides

Prefer custom properties and a host class:

```css
.article-editor {
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Inter, system-ui, sans-serif;
}
```

Avoid rules that:

- change `display` or generated content of `data-key` editing nodes;
- add pseudo-elements inside editable text;
- change `white-space` semantics;
- disable pointer behavior on object wrappers;
- move or replace live composing nodes.

Those rules can change caret geometry or DOM-to-tree mapping, not just appearance.

## Icon themes

Use `--nabi-icon-<key>: url("/icons/name.svg")` for SVG, WebP, or PNG replacements. Default icons are external files in `dist/icons/`; copy this directory alongside a manually hosted `nabi.css`. Runtime CSS injection resolves assets from the browser module or script. Use the published CSS for SSR, not server `file:` URLs. See `icons.md` for all control families, dark variants, open-panel inheritance, and visibility options.
