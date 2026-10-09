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
- `.nabi-toolbar`: chrome wrapper; sticky at the top within its own editor on desktop and mobile.
- `.nabi-content`: editing or published document body.
- `mountSurface()` adds `.nabi-editing` and `contenteditable`.
- `.nabi-tools`: preview/fullscreen controls created by `mountViewTools()`.
- `.is-fullscreen`: class-based fullscreen, not the browser Fullscreen API.

Mount the main toolbar and context toolbar on the two separate child roots, not on their shared `.nabi-toolbar` wrapper. Pass that wrapper to `mountSticky()` and as the `mountViewTools()` container. Keep each mount root dedicated to package-owned UI.

Keep each toolbar and its content inside their own `.nabi` wrapper. Native CSS sticky positioning confines the toolbar to that editor, so it leaves view when the editor scrolls past, including when several editors share a page. An open compact panel closes when its toolbar leaves the visible viewport.

With `mountSticky()`, losing editing focus stops caret scroll correction, while viewport offsets remain tracked until the keyboard inset disappears. Opening a panel from a scrolled sticky toolbar keeps the toolbar visible throughout that transition. Panel placement is measured after viewport offset updates.

When the keyboard opens, an already visible caret below a pinned toolbar keeps its position. Correction reveals a covered caret and closes only the remaining gap above an unpinned toolbar, respecting `--nabi-sticky-top`. The initial viewport establishes the baseline, so unchanged events and small address-bar changes do not count as keyboard jumps. After a user scroll, viewport position changes alone do not restart caret correction.

Never put `.nabi-editing` on published content.

## Toolbar layouts

`mountToolbar()` and `renderToolbarHtml()` accept the same layout options:

- `layout?: 'compact' | 'wrap'`, default `'compact'`.
- `quick?: readonly string[]`, default `['b', 'i', 'tc', 'fs']`. Entries are `ToolbarSlot.name` values. Their order is the quick-action priority in the mobile compact row.

The default compact layout shows every available main-toolbar command on desktop and wraps to fit the editor width, like fullscreen. Desktop means the viewport is at least `--nabi-mobile-breakpoint`; a narrow editor inside a desktop viewport still shows all commands. Below that breakpoint, outside fullscreen, the main toolbar uses one `2.25rem` row (36px at the default root font size). Mobile quick actions that do not fit remain available in the full Tools palette; they do not add another main-toolbar row. Available object properties appear automatically in their own wrapping row below in both modes. The mobile palette shows all registered toolbar commands that are valid for the current selection together as icons in their original wing groups and toolbar order. It has no category tabs, title/close header, or group borders. Custom groups stay in the same palette. Group identity remains available for keyboard navigation even without a visible border.

Main-toolbar, palette, and property-row buttons use `2rem` with `.875rem` icons (32px and 14px at the default root font size) on desktop and mobile, including fullscreen, explicit `wrap` layout, and coarse-pointer devices. The mobile full palette fills the editor toolbar width. The compact main row is `2.25rem` high, including mobile inline input prompts.

In the object property row, text-color and highlight swatch buttons use `1.75rem` click targets on desktop and mobile (28px at the default root font size). Their actual painted area remains `1.25rem` (20px). This smaller button size applies only to swatches. Swatches show tooltips but do not enlarge on hover. Selected swatches keep their actual color and show the selection background around that painted area, rather than an accent-colored border.

Selected toolbar, palette, and property buttons use a subtle background that mixes 12% `--nabi-accent` with 88% `--nabi-bg`, following both light and dark themes. Selected rows in choice and save dialogs use the same background. Selection no longer draws a bottom underline or an accent-colored border. Keyboard focus on buttons and range controls uses a stronger 20% accent background without an outline, so it stays distinct from selection. Focused text inputs use the 12% background and retain their neutral border. These states use the existing theme tokens; no additional public token is required.

Text inputs and range controls in the property row are vertically centered and use `1.75rem` heights on desktop and mobile (28px at the default root font size), including standalone context rows. Mobile inline input prompts also use `1.75rem` inputs. Mobile input text retains its 16px default through `--nabi-touch-font-size` to avoid focus-triggered browser zoom. Labels and value readouts keep their natural height.

The full wing palette has zero padding and icon gaps. Its group containers use `display: contents` so icons fill available rows while preserving DOM groups for Tab navigation. The connected object property row instead has `.25rem` vertical and `.375rem` horizontal padding, `.25rem` gaps between controls, and `.75rem` horizontal spacing between groups (4px, 6px, 4px, and 12px at the default root font size), with no trailing group margin. The property row has no outer border or shadow and uses `--nabi-soft` for a subtly contrasting background in both light and dark themes.

Tool panels open outside the complete toolbar and property row, above them when there is more room there, and their bodies scroll within the available height. Mobile inline input prompts stay in the main toolbar row. All palettes, including detailed tools, omit the title/close header. Input prompts keep their fields and submit button. Default tool panels, except the mobile table size picker, have no full-page scrim, background blur, or inert page. This includes image/YouTube/link prompts and code-language property prompts. Narrow standalone panels also use only the local panel shadow. Preview, lightbox, save, history, and choice dialogs retain the separate full-page modal backdrop. Use Escape or an outside interaction to close; the full/selection palette can also be closed with its toggle. The property row remains visible while the selection has available properties.

A `mountContextToolbar()` for the same `nabi` joins the compact layout automatically. Its controls stay in the dedicated context mount root and appear below the main toolbar whenever the current selection has properties. This row takes up normal layout space, wraps its controls to fit desktop or mobile widths, and moves with the main toolbar inside the shared sticky wrapper. It is hidden only when there are no available properties. Mobile quick actions remain in the main row; desktop shows all available main-toolbar commands. There is no Object properties entry button, back-to-tools button, or corresponding `toolsContext` or `toolsBack` locale key. There is no separate context-layout option. A standalone context toolbar keeps its previous layout with the shared smaller control sizes. Preview/fullscreen controls mounted inside the same `.nabi-toolbar` wrapper stay visible in the main toolbar, subject to `showPreview` and `showFullscreen`. The mobile full Tools palette contains registered wing buttons only: it does not duplicate view controls or add undo/redo buttons. The main toolbar has no added undo/redo buttons either. Existing editor undo/redo APIs and keyboard shortcuts retain their behavior.

Use `layout: 'wrap'` to retain the previous explicit main toolbar groups and separate context row. Outside fullscreen, narrow screens retain those rows' horizontal scrolling behavior. Both use the shared smaller control sizes. `quick` configures only the mobile row of `compact` layout; desktop and fullscreen show the complete command set.

In fullscreen, both layouts show all main-toolbar commands available for the current selection, followed by the full current object's property controls in a separate row. Both rows stay pinned at the top while the document scrolls, and controls wrap onto additional lines when needed, including on narrow screens. The mobile compact Tools button is replaced by the visible main-toolbar controls. Connected preview/fullscreen controls remain available. Exiting fullscreen restores the configured main-toolbar layout: the default stays expanded on desktop and returns to the compact row on mobile, while available properties stay visible below it.

Switching between the compact and expanded modes closes open tool panels before moving their controls. Viewport breakpoint or fullscreen changes close panels through this rule only when they change that layout mode.

Host-rendered panels supplied through `ToolbarOptions.panels` can use `{ mode: 'modal', render }` for a centered window over a full-page translucent backdrop, or `{ mode: 'inline', render }` for an anchored desktop panel that becomes a fullscreen dialog on mobile. The viewport and `--nabi-mobile-breakpoint` determine mobile behavior; a narrow desktop editor stays anchored, including with `layout: 'wrap'`. Inline sessions close when the breakpoint changes. Modal presentations follow the visual viewport and contain focus with an inert background. Both modes supply only an empty content root; the host adds its own controls and connects `close()` and `insertImage(src)`. Function-only entries retain the previous floating/hosted placement and lifecycle. Render host DOM or a framework component only inside the supplied `root`; the package retains the outer panel. Its content may grow after asynchronous work: resize observation updates placement when available, and the context also exposes `reposition()`. See `api-reference.md` for cleanup and `quickstart-npm.md` for the image-picker example.

`Toolbar.buttons` still contains commands exposed through the Tools palette. A button's own `hidden` flag describes whether it is valid for the current selection; a hidden ancestor describes whether it is currently on screen. Registered keyboard accelerators can still invoke valid commands while the palette is closed.

All compact toolbar and palette items, including color swatches, show hover tooltips that float under `body`, so toolbar and panel overflow do not clip them. Tooltips include actual registered accelerators such as Ctrl/Cmd+B and preserve registered double-key labels such as Esc Esc. The Tools tooltip shows Shift Shift. The former letter-hint shortcuts remain removed.

On iOS, icon buttons activate a completed short, single-touch tap directly on `touchend`, preserving the editing selection and canceling the compatibility click. This accommodates Safari text-selection menus that can consume the synthesized click. The touchend handler does not turn scrolling, multitouch, long presses, canceled gestures, or releases outside the button into command taps; these retain the browser's default handling. Native document selection menus remain available. Layout measurements avoid moving unchanged toolbar buttons during a press. Physical-device Safari selection-menu behavior still requires verification; browser automation does not reproduce the native menu.

## Palette keyboard navigation

Mount `mountHints({ toolbar, context, root, surface })` to enable double-Shift entry. In mobile compact layout outside fullscreen, tapping Shift twice opens the full Tools palette. On desktop, in fullscreen, or in `wrap` layout it focuses the first available visible toolbar button without opening a palette. The former letter badges and single-letter command lookup are removed.

- `Tab` moves to the first available icon of the next group; `Shift+Tab` moves to the previous group. Both wrap around the group list.
- `ArrowRight` and `ArrowLeft` move through available icons and wrap at the ends.
- `ArrowDown` and `ArrowUp` move to the nearest column in the next or previous rendered row, wrapping between the first and last rows. Movement follows the actual layout rather than a fixed column count.
- `Enter` or `Space` activates the focused icon.
- `Escape` closes the palette and returns to editing.

These navigation rules also apply to selection-control groups and hosted panels. Inputs, selects, textareas, and editable fields retain their normal key behavior. Events already handled by a specialized picker are left alone; for example, the table grid retains its own arrow-key behavior. Repeated key events, active IME composition, and modified Shift combinations do not trigger double-Shift entry.

Opening a panel and navigating its controls reveal the focused tool only within the tool area's scroll containers. They do not scroll the outer page, including when the host uses scroll padding for a fixed header.

On desktop and mobile, executing a command in an open non-input palette keeps focus in the palette for consecutive actions. Escape closes it and restores editing focus. Input prompts follow their own input and submission behavior.

When a property control already has focus, changing its value preserves that focus after the property row refreshes. It does not explicitly refocus the editing surface or reveal the caret, avoiding an unwanted mobile keyboard reopen or page scroll. Pointer icon buttons continue to preserve the existing editing selection and focus. Their caret correction accounts for the visible viewport's actual position, so a keyboard-induced viewport offset does not cause an unnecessary scroll for an already visible caret.

For mobile compact layout outside fullscreen, `Hints.active()` reflects whether the tool panel is open, including a panel opened with the pointer. `Hints.hide()` closes it and restores surface focus. For the expanded desktop toolbar, fullscreen, or `wrap` layout, `active()` reports keyboard navigation and `hide()` ends it. Clicking or focusing outside the editor, or unmounting, ends the interaction without stealing focus back.

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

Narrow UI activates when the toolbar/context row or viewport width is strictly below `36rem`. Narrow mode centers standalone panels and reduces the table picker to 5x5 touch-sized cells. The default toolbar's expanded-versus-compact mode uses only the viewport width: exactly `36rem` and above shows all main-toolbar commands, including inside a narrow editor or on a coarse-pointer device. Below that breakpoint, outside fullscreen, the main toolbar uses the compact row with hosted panels. Its property row wraps below in either mode. Explicit `layout: 'wrap'` and standalone context rows keep their narrow horizontal scrolling. Fullscreen main and context controls wrap instead. Control dimensions stay the same across desktop and mobile.

The compact toolbar and its property row stay at the top within their own editor at every viewport width. Showing properties does not open a floating panel or move focus away from editing. Mobile panel behavior requires the viewport itself to be below this breakpoint; a narrow editor column on a desktop viewport keeps desktop panel behavior. Mobile Tools and selection/menu panels open immediately in the available space around the toolbar and its property row and move focus from the editing surface into the panel. Opening does not wait for the keyboard to close. Panels open above or below according to the available space and scroll within that space. Their height follows the content, capped by the measured keyboard height or a bounded fallback. Text-input prompts replace the main toolbar row with their fields and submit button so the keyboard can remain available; Escape or an outside interaction closes them. The browser controls the actual keyboard; viewport changes update panel placement.

The table size picker is an exception to the hosted mobile panels. It closes the Tools palette and opens a centered modal layer over a translucent backdrop, including in fullscreen and `layout: 'wrap'`. The layer tracks visual viewport changes, contains focus, and keeps the background inert while open. Selecting a size inserts one table and immediately closes the layer; Escape or an outside interaction cancels it. Closing restores editing focus, and crossing the viewport breakpoint dismisses the picker. Desktop keeps an anchored grid.

This behavior requires `surface` on the toolbar mount. Physical-device IME transitions were not verified for this toolbar change. A visual viewport simulation cannot establish that behavior. Check keyboard transitions, composition, orientation changes, and external keyboards on the target devices before relying on a specific mobile layout.

Set `--nabi-mobile-breakpoint` on `:root`, an ancestor, or an individual `.nabi`. Use a non-negative CSS length such as `rem`, `px`, or `calc()`. Changes to the CSS value, root font size, container width, or viewport width update mounted controls and open panels automatically, including input prompts anchored inside the editor.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

The browser UI resolves the CSS length and toggles `.nabi-narrow`; do not put `var()` in a media-query condition or manually maintain that class. Toolbar and property controls use the shared smaller dimensions on coarse-pointer devices too.

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
