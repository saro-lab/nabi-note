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
- `.nabi-toolbar`: chrome wrapper; sticky at the top on desktop and docked during compact mobile editing.
- `.nabi-content`: editing or published document body.
- `mountSurface()` adds `.nabi-editing` and `contenteditable`.
- `.nabi-tools`: preview/fullscreen controls created by `mountViewTools()`.
- `.is-fullscreen`: class-based fullscreen, not the browser Fullscreen API.

Mount the main toolbar and context toolbar on the two separate child roots, not on their shared `.nabi-toolbar` wrapper. Pass that wrapper to `mountSticky()` and as the `mountViewTools()` container. Keep each mount root dedicated to package-owned UI.

Never put `.nabi-editing` on published content.

## Toolbar layouts

`mountToolbar()` and `renderToolbarHtml()` accept the same layout options:

- `layout?: 'compact' | 'wrap'`, default `'compact'`.
- `quick?: readonly string[]`, default `['b', 'i', 'tc', 'fs']`. Entries are `ToolbarSlot.name` values. Their order is the quick-action priority.

Compact layout keeps the main toolbar in one `3rem` row. Quick actions that do not fit remain available in the full Tools palette; the toolbar does not gain another row. The palette shows all registered toolbar commands that are valid for the current selection together as icons in their original wing groups and toolbar order. It has no category tabs, title/close header, or group borders. Custom groups stay in the same palette. Group identity remains available for keyboard navigation even without a visible border.

The desktop palette fills the editor toolbar width and uses `2rem` regular buttons with `.875rem` icons (32px and 14px at the default root font size). Desktop main-toolbar icons also use `.875rem`, while its `3rem` row and `2.75rem` regular buttons stay unchanged. Mobile icons keep their existing size, and regular mobile palette buttons retain `2.75rem` touch targets (44px at the default root font size).

In both the compact row and Object properties panel, text-color and highlight swatch buttons use `1.75rem` click targets on desktop and `2rem` on mobile (28px and 32px at the default root font size). Their painted area and selected border remain `1.25rem` (20px). This smaller button size applies only to swatches. Swatches show tooltips but do not enlarge on hover. Hovering an unselected swatch shows only a `--nabi-muted` border; selected swatches retain their `--nabi-accent` border around the small painted area.

Text inputs and range controls in those same areas are vertically centered and use `1.75rem` heights on desktop and `2rem` on mobile (28px and 32px at the default root font size). Mobile inline input prompts also use `2rem` inputs. Labels and value readouts keep their natural height.

The full wing palette has zero padding and icon gaps. Its group containers use `display: contents` so icons fill available rows while preserving DOM groups for Tab navigation. The Object properties panel instead has `.5rem` body padding, `.25rem` gaps between controls, and `.5rem` spacing between groups (8px, 4px, and 8px at the default root font size), with no trailing group margin. Only this context panel omits its outer border and shadow and uses `color-mix(in srgb, var(--nabi-bg) 95%, var(--nabi-fg) 5%)` for a subtly contrasting background in both light and dark themes.

Desktop tool panels open above the row when there is more room there, and their bodies scroll within the available height. All palettes, including detailed tools, omit the title/close header. Input prompts keep their fields and submit button. Use Escape or an outside interaction to close; the full/selection palette can also be closed with its toggle.

A `mountContextToolbar()` for the same `nabi` joins the compact layout automatically. Selection controls replace the quick actions in the same row, with a route back to the basic tools. When the current context controls do not all fit in that row, a highlighted down-chevron labeled Object properties appears immediately after Tools and opens the full set of context controls. The button is absent when all controls fit. The existing `toolsContext` dictionary key supplies its localized label. There is no separate context-layout option. A standalone context toolbar keeps its previous behavior. Preview/fullscreen controls mounted inside the same `.nabi-toolbar` wrapper stay visible in the compact row, subject to `showPreview` and `showFullscreen`. The full Tools palette contains registered wing buttons only: it does not duplicate view controls or add another context-tools entry, and it does not add undo/redo buttons. The basic row has no added undo/redo buttons either. Existing editor undo/redo APIs and keyboard shortcuts retain their behavior.

Use `layout: 'wrap'` to retain the previous main toolbar groups and separate context row. On narrow screens those rows retain their horizontal scrolling behavior. `quick` configures the compact layout only.

`Toolbar.buttons` still contains commands exposed through the Tools palette. A button's own `hidden` flag describes whether it is valid for the current selection; a hidden ancestor describes whether it is currently on screen. Registered keyboard accelerators can still invoke valid commands while the palette is closed.

All compact toolbar and palette items, including color swatches, show hover tooltips that float under `body`, so toolbar and panel overflow do not clip them. Tooltips include actual registered accelerators such as Ctrl/Cmd+B and preserve registered double-key labels such as Esc Esc. The Tools tooltip shows Shift Shift. The former letter-hint shortcuts remain removed.

## Palette keyboard navigation

Mount `mountHints({ toolbar, context, root, surface })` to enable double-Shift entry. In compact layout, tapping Shift twice opens the full Tools palette. In `wrap` layout it focuses the first available toolbar button without opening a palette. The former letter badges and single-letter command lookup are removed.

- `Tab` moves to the first available icon of the next group; `Shift+Tab` moves to the previous group. Both wrap around the group list.
- `ArrowRight` and `ArrowLeft` move through available icons and wrap at the ends.
- `ArrowDown` and `ArrowUp` move to the nearest column in the next or previous rendered row, wrapping between the first and last rows. Movement follows the actual layout rather than a fixed column count.
- `Enter` or `Space` activates the focused icon.
- `Escape` closes the palette and returns to editing.

These navigation rules also apply to selection-control groups and hosted panels. Inputs, selects, textareas, and editable fields retain their normal key behavior. Events already handled by a specialized picker are left alone; for example, the table grid retains its own arrow-key behavior. Repeated key events, active IME composition, and modified Shift combinations do not trigger double-Shift entry.

On desktop and mobile, executing a command in an open non-input palette keeps focus in the palette for consecutive actions. Escape closes it and restores editing focus. Input prompts follow their own input and submission behavior.

For compact layout, `Hints.active()` reflects whether the tool panel is open, including a panel opened with the pointer. `Hints.hide()` closes it and restores surface focus. In `wrap` layout, `active()` reports keyboard navigation and `hide()` ends it. Clicking or focusing outside the editor, or unmounting, ends the interaction without stealing focus back.

The legacy `shortcut` declaration remains compatibility metadata with registry validation; it does not render a badge, add a letter-shortcut tooltip suffix, or enable letter-based palette activation. Registered `accelerator` and `doubleKeys` commands retain their separate behavior.

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

`mountViewTools()` measures the edit surface's border-box width before entering fullscreen and keeps that width centered, capped at the available viewport width. When the measured paper is narrower than the fullscreen container's available width, exposing workspace background on its sides, it receives `1.5rem` top and bottom margins (24px at the default root font size) and subtle shadows above and below. When the paper fills the available width, both margins are zero and there is no shadow. This follows the actual paper and container widths, not the mobile breakpoint; a narrow viewport can still show the margins when its paper is narrower. A short document fills the remaining height below the toolbar after subtracting any margins. Long content grows normally, and scrolling to the end reveals any bottom margin. The toolbar keeps its usual background. Exiting fullscreen or unmounting restores the surface's previous layout. These spacing and shadow changes apply to fullscreen editing; preview layout is unchanged.

Set the two background tokens on `:root`, an ancestor, or an individual editor. Their defaults follow the active light/dark theme:

```css
.article-editor {
  --nabi-fullscreen-bg: #eee;
  --nabi-fullscreen-content-bg: #fff;
}
```

The transient `.nabi-fullscreen-content` and `.nabi-fullscreen-framed` classes and `--nabi-fullscreen-content-width` property are managed by `mountViewTools()` on the supplied surface; do not maintain them manually.

## Mobile breakpoint

Narrow controls activate when the toolbar/context row or viewport width is strictly below `36rem`. Exactly `36rem` keeps the regular controls. Narrow mode centers standalone panels and reduces the table picker to 5x5 touch-sized cells. Compact panels stay inside the shared tool panel. A compact toolbar remains a single row at every container width; `layout: 'wrap'` and standalone context rows keep their narrow horizontal scrolling.

Compact docking requires the viewport itself to be below this breakpoint and the associated surface or tool panel to be active. A narrow editor column on a desktop viewport does not dock. The toolbar follows the visible viewport above the software keyboard. Opening a mobile selection/menu panel moves focus out of the editing surface, waits for the detected keyboard to close, and uses that area for the panel. The panel shrinks to its content height, capped by the measured keyboard height or a bounded fallback when no keyboard height is available. Text-input prompts instead replace the toolbar row with their fields and submit button so the keyboard can remain available; Escape or an outside interaction closes them. The browser controls the actual keyboard; viewport changes are used to update placement.

This behavior requires `surface` on the toolbar mount. Physical-device IME transitions were not verified for this toolbar change. A visual viewport simulation cannot establish that behavior. Check keyboard transitions, composition, orientation changes, and external keyboards on the target devices before relying on a specific mobile layout.

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
