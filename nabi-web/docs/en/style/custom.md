---
title: Custom styles
description: Colors and shapes are changed by overriding CSS variables.
---

# Custom styles

**The host attaches the sheet** — one line of `import 'nabi-note/nabi.css'` with a bundler, or one
`<link>` on a CDN. After that, overriding variables is all there is to it.

The component rules carry **not one color literal.** Everything is drawn through `--nabi-*`
variables, so override the variables and the rest follows.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

Why the class is stacked three times is in [Staying clear of
specificity](#staying-clear-of-specificity) below.

::: tip The large premise of this page — a stored value does not stand on its own
The outgoing HTML (`getHtml()`) contains **not one character of inline `style`.** The stored value
says only *what* something is, through attributes (`data-nabi-align="center"`), and this
stylesheet says how it looks. So when the reading side draws stored HTML, it has to be **inside a
`.nabi-content` with this sheet on it** to look the way the editor did — see [Rendering stored HTML
elsewhere](#rendering-stored-html-elsewhere) below.
:::

::: tip Dark and light are already in there
There is **no** token the host has to override for the sake of a theme. The core sheet brings all
three — the light defaults, the `.dark` redefinition and an explicit `.light` redefinition. Inside
the editor, this site overrides nothing but four font tokens.
:::

## Color and shape tokens

| Token | Meaning | Default (light) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | background · slightly pressed surface | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | text · dimmed text · text on the accent | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | lines · accent color | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | danger · text on it | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | box shadow · preview backdrop | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | corners | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | corners of a layer (panel, preview, lightbox) | `.25rem` |
| `--nabi-z-sticky` | layer number of the sticky row | `20` |
| `--nabi-grid-cell` | cell size of the table size grid | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | the six highlight colors | translucent colors |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | the five text colors | solid colors |

This table holds only what the core sheet (`nabi.css`) **declares itself**. The declaration sits in
three places, not just `.nabi` — `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`.
The preview overlay is a child of `body`, so inheritance from `.nabi` never reaches it, and a
`.nabi-content` standing alone outside an editor has to receive the tokens directly too.

The same list is written out three times over (light defaults, `.dark`, explicit `.light`). **The
overriding side does not have to look at all three** — beat the specificity once and the value you
wrote applies in all three cases. If you do want a different value in dark, though, you have to
attach the `.dark` condition yourself.

## Tokens that are only referenced, never declared

The variables below are ones the core **references without declaring**. Give them no value and the
fallback in parentheses stands. Since there is no place they are declared, **writing them on
`:root` works as it stands** — that is where they part ways with the color and shape tokens above
(those are declared on `.nabi`, where inheritance cannot win).

| Token | Meaning | Fallback |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | the fonts actually bound to the typeface wing's four kinds | system fonts |
| `--nabi-cursive-adjust` | the cursive's `font-size-adjust`. A handwriting face has a low x-height and looks smaller at the same px, and this value re-measures it against the x-height | `0.4` |
| `--nabi-sticky-top` | how far down the sticky row sits. If the site has a fixed header, its height | `0px` |
| `--nabi-preview-width` | the width of the preview card. **`openPreview` measures the editing surface as it opens and writes that width onto the card itself**, so an inline value beats anything you set from outside | `720px` |
| `--nabi-placeholder` | the hint an empty editor shows, as a quoted string. **`mountSurface` writes the word from its own `placeholder` option (or the core dictionary) onto the editing root**, so an inline value beats anything you set from outside — to change its feel, write over `.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before` | none (no hint) |

`--nabi-typeface-base` is not of this kind — **the core declares it** (left alone it follows
`--nabi-font`). The typeface wing has no option for it, so override the token to change it.

`--nabi-keyboard-top` and `--nabi-keyboard-bottom` stand in the same place, but **the core writes
them** — `mountSticky()` measures how far a mobile keyboard pushed the screen up and writes it
here, and the sticky row and full screen read that value. They are not values to write by hand.

## Where there is no token — override the rule

The three below have **no variable**. The core bakes the value into a rule, so to change one you
override its selector.

**The four text sizes** — in `em`, so they follow the parent size.

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**The drop cap's size** — not a count of lines to wrap, just a letter size. How many lines it
actually covers is decided by that paragraph's line height.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**Code token colors** — the code wing's sheet writes colors straight onto `[data-nabi-token]`.
**Five** kinds currently get a color.

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

The `type` a highlighter answers with is a free-form string — any name outside those five draws
with no color, so add a rule of the same shape for the kinds you want. For different colors in
dark, attach the `.dark` condition yourself: the core ships no dark variant for these five.

The upload wing's progress animation (`--nabi-per`, `--nabi-t`, `--nabi-span`, `--nabi-clear`,
`--nabi-blur-max`) is **internal to that wing** — the names start with `--nabi-`, but they are not
a place opened up for the host to override.

---

## Outer sizing is `rem`

The outer sizing — buttons, spacing, toolbar chips and the rest — is mostly in `rem`, so it **grows
with the root (`html`) font size.** Enlarge the text in the browser or the OS and the editor's frame
grows with it. To change the size, change the root's `font-size`. A border is a *line* rather than a
size, so there are places where `px` remains.

---

## Staying clear of specificity

To override a color or shape token, stack **three classes**.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--my-accent);
}
```

Counted out, it goes like this. The light-default rule `:is(.nabi, …)` is **(0,1,0)**, since
`:is()` takes the highest of its arguments; the dark rule `:where(html, body).dark :is(.nabi, …)`
is **(0,2,0)**, since `:where()` counts zero and `.dark` and `:is()` are one class each. So
`.nabi.nabi` only **ties** with dark — and on a tie the one loaded later wins, and the core sheet
may well be loaded after the host's. Stack three to get to (0,3,0) and nothing rests on load order.

The preview overlay stands outside `.nabi` (as a child of `body`), so its selector has to be written
alongside for it to get the same color.

**A token the core does not declare, such as a font, needs none of this wrestling** — there is no
place it is declared, so inheritance alone reaches it and one `:root` line is enough.

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

---

## Light and dark

A `dark` class on **either** `html` or `body` means dark, `light` means light. With no class, light
is the default, and with both, the explicit `light` wins (the `.light` rules are loaded after the
`.dark` ones).

```html
<html class="dark"><!-- or <body class="dark"> --></html>
```

Toggle the class and the CSS reacts. There is no API to call. What a theme swaps is the color
variables alone; the component rules stay as they are — styles you wrote yourself follow dark too,
as long as they use only `--nabi-*` variables.

---

## Two ways to attach the sheet

**① One file** — the most common road. Every wing's CSS is in it.

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**② Inject only what you registered** — for when you want just the sheets of the wings actually
turned on.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// call drop() and only what this call put in is taken back out
```

A sheet with the same text goes in **once** — the key it folds on is the sheet's **content**, so
raising several editors in one document never stacks them, and mixing different wing sets gathers
into a single union.

:::: tip Two differences between them — what's included, and when it attaches
**What's included.** A file cannot know which wings you registered, so it carries **all** of them.
Injection reads the `registry` and carries **only what you registered**. A page that merely
displays stored HTML has no editor and therefore no `registry`, so it takes the file route.

**When it attaches.** A file arrives as a `<link>` in the head and **blocks rendering** until it
loads. Injection attaches only **after the editor's JavaScript arrives**. So a page whose document
is rendered ahead of time on the server and sent down should take the file route — over injection,
the server-rendered document would first paint bare and then get restyled and relaid-out once the
sheet lands.
::::

The sheets of the wings you registered go in **after** the core sheet, so at equal priority the wing
wins.

---

## What you can target

What a variable cannot do, aim at the classes that actually exist.

| Selector | What | Who attaches it |
|---|---|---|
| `.nabi` | the shell wrapping the whole editor (chrome + writing area). The color and shape tokens hang here | the host |
| `.nabi-content[contenteditable]` | the writing area itself | the host |
| `.nabi-toolbar` | the slot wrapping the toolbar row and the context row. This class *is* "sticks to the top" | the host |
| `.nabi-toolbar-row` | the container the toolbar sits in | `mountToolbar()` |
| `.nabi-context` | the container the context row sits in | `mountContextToolbar()` |
| `.nabi-tools` | the slot for the preview and full-screen buttons — the core floats it to the top right | `mountViewTools()` |
| `.nabi-tool` | those two buttons themselves | `mountViewTools()` |
| `.tb-group` | a group of toolbar buttons | `mountToolbar()` |
| `.ctb-group` · `.ctb-button` · `.ctb-swatch` · `.ctb-input` | the context row's groups, buttons, color swatches and text fields | `mountContextToolbar()` |
| `.tb-picker` · `.tb-picker-grid` · `.tb-picker-cell` | the box that opens under a button, such as the table size grid | `mountToolbar()` |
| `.tb-prompt` · `.tb-prompt-input` | the address layer that opens when inserting something new | `mountToolbar()` |
| `.nabi-hints [data-hint]` | the shortcut badges from a double tap of Shift — the badge is `::before` and the label `::after`, so the two show together | `mountHints()` |
| `[data-nabi-tip]` | the tooltip — drawn with CSS `::after` alone | the core throughout |
| `.nabi-content.nabi-dropping` | the writing area while a file is being dragged over it. The guidance text rides on the `data-nabi-drop` attribute | `mountUpload()` |

The preview and full screen are **built by the core** too.

| Selector | What | Who |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` · `.nabi-content.nabi-preview-body`) | the document preview overlay | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | the box showing one picture alone, large | `openImageLightbox()` |
| `.nabi.is-fullscreen` | full screen — pins the `.nabi` box to the screen | `setFullscreen()` (the class name is `FULLSCREEN_CLASS`) |

Attach `mountViewTools()` and the two buttons open and close these by themselves. To open them
yourself, call `openPreview({ nabi, editor })`,
`openImageLightbox({ editor, src, alt?, locale })`, `setFullscreen(root, on)` or
`isFullscreen(root)`.

::: tip The tools slot builds itself
`mountViewTools()` **raises its own box** and prepends it to the container you hand it — it does not
turn that container into `.nabi-tools`. So pass it the toolbar itself and nothing breaks: the class
that floats to the right end is on a span of the core's own making, standing first, and the buttons
already in the row flow around it.
:::

The editor-screen markers can be targeted too — `[data-nabi-token]` (a code block's token colors),
`[data-nabi-lang]` (a code block's language), `[data-color]` (highlight and text color — told apart
by the `<mark>` and `<span>` tags), and `data-nabi-align`, `data-nabi-typeface`, `data-nabi-size`,
`data-nabi-dropcap` (paragraph attributes). The canonical names of these markers are the `*_ATTR`
constants in each wing's file.

---

## Rendering stored HTML elsewhere

The outgoing value (`getHtml()`) is HTML with `data-nabi-*` attributes left on it, and **not
one character of inline `style`.** Which means the look is entirely the sheet's job, and so drawing
it without the sheet gives you bare HTML with no alignment, no text sizes and no table lines.

To draw it the way the editor did, wrap it in `.nabi-content` — this class receives the color and
shape tokens directly, without a `.nabi` around it (the `.nabi-content:where(:not(.nabi *))` rule in
`nabi.css`).

```html
<div class="nabi-content">your stored HTML</div>
```

For the sheet itself, take route ① from the section above — a page with no editor has no
`registry` to gather from.

### Viewer-side behavior — table sorting

Right now **table sorting alone** ships as a reading-side function. There is no general system yet
for an arbitrary wing to hang its own reading-side behavior.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'en' })
```

It finds tables carrying `data-nabi-sortable` and puts sort buttons in the header cells. The release
function (`detach`) takes back the buttons it planted and the row order it changed.

::: danger Do not attach it to an element you edit
`attachTableSort()` plants buttons in the DOM and changes the row order. Save the DOM while it is
attached and that hardens into the value — on the reading side, attach it only to a read-only copy.
:::

---

## Next

- [{{ t('menu_wing_custom') }}](../wing/custom) — build a format that does not exist yet
- [{{ t('menu_intro_index') }}](../intro) — the words this documentation uses

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
