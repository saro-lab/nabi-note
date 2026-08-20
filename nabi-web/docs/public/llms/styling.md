# Styling

## Loading the stylesheet - two ways

The stylesheet is never auto-injected by a mount.

**1. One file** - the common path, carries every wing's CSS:

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**2. Inject only what is registered:**

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// drop() removes only what this call added
```

The same stylesheet text is only inserted once - the dedup key is the sheet's **content**, so
mounting several editors on one page never stacks duplicates, and different wing combinations
still merge into a single union.

| | What loads | When it attaches |
|---|---|---|
| File | Everything - a file cannot know which wings you registered | Blocks rendering as a `<link>` in `<head>`, before paint |
| Inject | Only what `registry` has registered | Only once the editor's JavaScript has arrived |

A page with no editor (`registry` does not exist there) has to use the file path. **A page whose
document is pre-rendered on the server must also use the file path** - injecting means the
server-sent document paints once unstyled, then reflows as the stylesheet lands a moment later.

Registered wing stylesheets load **after** the core stylesheet, so at equal specificity a wing's
rule wins over the core's.

## Color and shape tokens

Component rules contain no color literals at all - everything is drawn from `--nabi-*`
variables, so overriding the variables is enough:

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

(Why the class is tripled: see "Winning specificity" below.)

| Token | Meaning | Light default |
|---|---|---|
| `--nabi-bg` / `--nabi-soft` | Background / slightly pressed surface | `#fff` / `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` / `--nabi-muted` / `--nabi-on-accent` | Text / muted text / text on the accent color | `#1b1b1f` / `#6b6b76` / `#fff` |
| `--nabi-line` / `--nabi-accent` | Border / accent color | `#e2e2e8` / `#3b6fe0` |
| `--nabi-danger` / `--nabi-on-danger` | Danger / text on it | `#d93b3b` / `#fff` |
| `--nabi-shadow` / `--nabi-scrim` | Box shadow / preview backdrop | - |
| `--nabi-radius` / `--nabi-radius-sm` / `--nabi-radius-xs` | Corner radii | `6px` / `4px` / `3px` |
| `--nabi-layer-radius` | Corner radius of a layer (panel/preview/lightbox) | `.25rem` |
| `--nabi-z-sticky` | Stack index of the sticky row | `20` |
| `--nabi-grid-cell` | Cell size of the table-size grid | `1.125rem` |
| `--nabi-hl-yellow/green/cyan/pink/purple/orange` | The six highlight colors | translucent |
| `--nabi-tc-green/coral/violet/amber/blue` | The five text colors | saturated |

These are declared at three selectors, not just `.nabi`:
`:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`. The preview overlay is a child of
`body`, so inheritance from `.nabi` never reaches it; a `.nabi-content` standing alone outside an
editor needs the tokens directly too.

The same list is written three times - light default, `.dark` override, explicit `.light`
override. **An override does not need to repeat all three** - beat specificity once and the
override applies in all three cases. Only if a different value is wanted specifically in dark
mode does a host need to add its own `.dark` condition.

## Reference-only tokens (not declared, just read)

The core reads these but never declares them - with no value supplied the fallback in
parentheses stands. Since there is no declared spot, **setting them on `:root` works as-is** -
unlike the color/shape tokens above (declared on `.nabi`, where inheritance cannot win against
them).

| Token | Meaning | Fallback |
|---|---|---|
| `--nabi-font` / `--nabi-font-serif` / `--nabi-font-mono` / `--nabi-font-cursive` | Fonts actually bound to the typeface wing's four families | system fonts |
| `--nabi-cursive-adjust` | `font-size-adjust` for the cursive family (handwriting faces have a low x-height and look small at the same px; this re-measures by x-height) | `0.4` |
| `--nabi-sticky-top` | How far down the sticky row sits. Set this to your fixed header's height if you have one | `0px` |
| `--nabi-preview-width` | Width of the preview card. `openPreview` measures the edit area's width when it opens and writes it directly onto the card, so a host override loses to that inline value | `720px` |
| `--nabi-placeholder` | The quoted string shown on the first line while the document is empty. `mountSurface` writes it onto the editing root from its `placeholder` option (or the core dictionary), so a host override loses to that inline value; restyle the hint through `.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before` instead | empty (no hint) |

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

`--nabi-typeface-base` is not in this group - **the core declares it** (default: follows
`--nabi-font`). The typeface wing has no option for it, so override this token directly to change
it.

`--nabi-keyboard-top` / `--nabi-keyboard-bottom` live at the same spot but are **written by the
core** - `mountSticky()` measures how far a mobile keyboard has pushed the screen and writes it
here; the sticky row and fullscreen read it. Not something to set by hand.

## No token, override the rule directly

Three things have no variable - the core baked the value into a rule, so override that selector.

Four text sizes (`em`-based, follow the parent's size):

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

Drop cap size - not a line count, a single font size; actual lines covered follow that
paragraph's line-height:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

Code token colors - five types get a color:

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

A highlighter's `type` is a free string - any name outside these five draws with no color, so add
a rule of the same shape for types you want covered. There is no built-in dark variant for these
five; add your own `.dark` condition if you need one.

Upload-wing progress animation tokens (`--nabi-per`/`--nabi-t`/`--nabi-span`/`--nabi-clear`/
`--nabi-blur-max`) are internal to that wing - despite the `--nabi-` prefix, they are not a spot
meant for host overrides.

## Outer dimensions are `rem`

Buttons, spacing, toolbar chips, and most other outer sizes are `rem`, so they **grow with the
root (`html`) font size** - zooming text in the browser or OS grows the editor chrome with it.
Change size by changing the root `font-size`. Borders are lines, not sizes, so some stay `px`.

## Winning specificity

Override a color/shape token by stacking **three classes**:

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--your-accent);
}
```

The math: the light-default rule `:is(.nabi, ...)` is `(0,1,0)` since `:is()` takes the highest of
its arguments; the dark rule `:where(html, body).dark :is(.nabi, ...)` is `(0,2,0)`, since
`:where()` counts as zero and `.dark` plus `:is()` are one class each. So `.nabi.nabi` only ties
with dark - and a tie is won by whichever rule loads later, which the core stylesheet might well
do after the host's. Stack three to reach `(0,3,0)`, which no longer depends on load order.

The preview overlay sits outside `.nabi` (a child of `body`), so its selector needs to be
included too for it to pick up the same color.

**A token the core never declares (fonts, for instance) needs none of this** - with no declared
spot, inheritance alone reaches it, so one `:root` line is enough.

## Light / dark

A `dark` class on **either** `html` or `body` means dark; `light` means light. No class defaults
to light; both present means the explicit `light` wins (`.light` rules load after `.dark` rules).

```html
<html class="dark"><!-- or <body class="dark"> --></html>
```

Toggling the class is all the CSS needs - there is no API call for this. A theme swaps only color
variables; component rules are unchanged - hand-written styles follow dark too, as long as they
only use `--nabi-*` variables.

## Selectable classes

| Selector | What | Who attaches it |
|---|---|---|
| `.nabi` | The shell wrapping the whole editor (chrome + edit area). Color/shape tokens attach here | Host |
| `.nabi-content[contenteditable]` | The edit area itself | Host |
| `.nabi-toolbar` | Wraps the toolbar row and context row - this class is what makes it sticky | Host |
| `.nabi-toolbar-row` | Container the toolbar sits in | `mountToolbar()` |
| `.nabi-context` | Container the context row sits in | `mountContextToolbar()` |
| `.nabi-tools` | Slot for the preview/fullscreen buttons - the core floats it top-right | `mountViewTools()` |
| `.nabi-tool` | Those two buttons themselves | `mountViewTools()` |
| `.tb-group` | A toolbar button group | `mountToolbar()` |
| `.ctb-group` / `.ctb-button` / `.ctb-swatch` / `.ctb-input` | Context-row groups, buttons, color swatches, text fields | `mountContextToolbar()` |
| `.tb-picker` / `.tb-picker-grid` / `.tb-picker-cell` | The box that opens under a button, e.g. the table-size grid | `mountToolbar()` |
| `.tb-prompt` / `.tb-prompt-input` | The address-input layer shown when inserting something new | `mountToolbar()` |
| `.nabi-hints [data-hint]` | Shortcut badges from a fast double-tap of Shift - the badge is `::before`, the label `::after` | `mountHints()` |
| `[data-nabi-tip]` | Tooltip - drawn with CSS `::after` only | core-wide |
| `.nabi-content.nabi-dropping` | Edit area while a file is being dragged over it. The hint text rides on `data-nabi-drop` | `mountUpload()` |

Preview and fullscreen are also **core-built**:

| Selector | What | Who |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` / `.nabi-content.nabi-preview-body`) | Document preview overlay | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | Single-image lightbox | `openImageLightbox()` |
| `.nabi.is-fullscreen` | Fullscreen - pins the `.nabi` box to the screen | `setFullscreen()` (class name is `FULLSCREEN_CLASS`) |

`mountViewTools()` wires both buttons to open/close these on their own. To open them directly:
`openPreview({ nabi, editor })`, `openImageLightbox({ editor, src, alt?, locale })`,
`setFullscreen(root, on)`, `isFullscreen(root)`.

Edit-screen-only markers are also targetable - `[data-nabi-token]` (code block token color),
`[data-nabi-lang]` (code block language), `[data-color]` (highlight/text-color, distinguished by
the `<mark>`/`<span>` tag), and the paragraph attributes `data-nabi-align`, `data-nabi-typeface`,
`data-nabi-size`, `data-nabi-dropcap`. The authoritative names for these live in each wing file's
`*_ATTR` constant.

## Rendering stored HTML outside the editor

Output (`getHtml()`) is HTML with `data-nabi-*` attributes and **not one character of inline
`style`.** Appearance is entirely the stylesheet's job, so rendering it with no stylesheet
produces bare HTML with no alignment, no text sizes, no table rules.

Wrap it in `.nabi-content` to render it exactly as the editor did - this class receives
color/shape tokens directly even with no surrounding `.nabi` (the rule
`.nabi-content:where(:not(.nabi *))` in `nabi.css`).

```html
<div class="nabi-content">your stored HTML</div>
```

Load the stylesheet the same way as in "Loading the stylesheet" above - `import
'nabi-note/nabi.css'` for a bundler, a `<link>` otherwise. Even a page mounting no editor still
gets tokens declared, as long as `.nabi-content` is present.

### A reader-side behavior - table sort

Currently **only table sorting** ships as a reader-side function. There is no general system yet
for an arbitrary wing to attach its own reader-side behavior.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'en' })
```

Finds tables carrying `data-nabi-sortable` and adds sort buttons to header cells. `detach()`
undoes the buttons and any reordered rows.

**Do not attach this to an element you are editing** - `attachTableSort()` inserts buttons into
the DOM and reorders rows; saving the DOM while it is attached bakes that into the value. Attach
it only to a read-only copy on the reading side.

## See also

- `llms/overview.md` - the `outputHtml` representation (why there is no inline `style` to begin
  with)
- `llms/quickstart-npm.md` / `llms/quickstart-cdn.md` - loading the stylesheet as part of a full
  assembly
- `llms/ssr.md` - why a server-rendered page must use the file path, not injection
