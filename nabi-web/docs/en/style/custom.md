---
title: Custom styles
description: How to customize NABI NOTE's colors, fonts, spacing and other styles using CSS variables.
---

# Custom styles

**The host application loads the stylesheet itself** — `import 'nabi-note/nabi.css'` in a bundler environment, or a `<link>` tag on a CDN. After that, overriding just the CSS variables you need changes the entire editor theme consistently.

Every UI component in NABI NOTE is **styled solely through `--nabi-*` CSS variables, with no hard-coded color literals**, so overriding the variables alone is enough to match your branding.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

For why the class selector is stacked three times, see the [CSS specificity guide](#css-specificity-guide) section below.

::: tip Stored HTML contains no inline styles
The HTML the editor outputs (`getHtml()`) **contains no inline `style` attributes.** The markup carries only semantic structure and attributes (such as `data-nabi-align="center"`), while the stylesheet handles the visual presentation. So when you render stored HTML on an external page, you still need to place it **inside a `.nabi-content` container with `nabi.css` applied** for it to look the same as it did in the editor.

See [Rendering stored HTML elsewhere](#rendering-stored-html-elsewhere) below for details.
:::

::: tip Light and dark themes are built in by default
The host doesn't need to define any extra variables for the default theme. The core stylesheet already ships with the light defaults, a `.dark` theme, and an explicit `.light` theme.
:::

## Color and theme tokens

| Token | Meaning | Default (light) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | Base background · hover/soft background | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | Base text · muted secondary text · text on the accent color | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | Border/divider · main accent color (focus/active) | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | Danger/warning color · text on the danger color | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | Dropdown shadow · modal/preview dim backdrop | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | Corner rounding (default · small · minimal) | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | Corner rounding for layered popups/modals | `.25rem` |
| `--nabi-z-sticky` | z-index of the sticky header | `20` |
| `--nabi-grid-cell` | Grid cell size for pickers such as the table insert grid | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | The six highlighter colors | translucent colors |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | The five text colors | solid colors |

The variables in the table above are tokens the core stylesheet (`nabi.css`) **declares directly.** They're bound not just to `.nabi` but to three selectors — `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))` — to support standalone rendering.

## Reference-only tokens (can be set on :root)

The variables below are tokens the core stylesheet **only references — as `var(--token, fallback)` — without declaring them itself.** If the host doesn't set a value, the given fallback applies. Since they aren't declared at the core level, you **can declare them on `:root` to apply them globally.**

| Token | Meaning | Default fallback |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | Font family for the editor and each branch of the typeface wing | system fonts |
| `--nabi-cursive-adjust` | The `font-size-adjust` ratio for the cursive font | `0.4` |
| `--nabi-sticky-top` | Top offset of the sticky toolbar (set to the height of a fixed site header, if any) | `0px` |
| `--nabi-preview-width` | Default width of the preview modal card | `720px` |
| `--nabi-placeholder` | Placeholder text shown in an empty editor | none |
| `--nabi-placeholder-color` | Color of the placeholder text (falls back to a theme-specific color if unset) | `--nabi-placeholder-color-fallback` |
| `--nabi-content-min-height` | Minimum height of an empty editing surface (applies only to the editing surface, `.nabi-editing`) | `12.5rem` |
| `--nabi-touch-font-size` | Font size of form inputs (`.nabi-input`) on touch devices (`pointer: coarse` or width 40rem or less) — prevents iOS Safari's auto-zoom | `16px` |

`--nabi-typeface-base` isn't reference-only — **the core declares it directly** (it references `--nabi-font` by default). To change the default font, override `--nabi-font`.

`--nabi-keyboard-top` and `--nabi-keyboard-bottom` are internal variables that **`mountSticky()` measures and writes dynamically** from the mobile keyboard's height.

`--nabi-bar-height` is likewise an internal variable that **`mountSticky()` measures and writes** from the toolbar's actual height. It's used as the `scroll-margin-block-start` on `.nabi-content > *` elements so they don't end up hidden under the toolbar when scrolled to.

## Overriding fixed styles that have no variable

The three properties below are defined as fixed CSS rules rather than variables, so to change them you override the class selector directly.

**The four text sizes** (in `em`, relative to the parent size):

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**The drop cap's first-letter size**:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**Code block token colors**:

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

---

## Unit conventions

Most UI dimensions — button size, spacing, toolbar height and so on — are defined in `rem`, so they **scale in proportion to the root (`html`) font size.** If a user enlarges the default font size in their browser or OS, the editor UI naturally scales up with it.

---

## CSS specificity guide

When overriding a theme color variable declared by the core, we recommend **stacking three classes** to reliably raise the style's priority.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: #7c3aed;
}
```

- The light-default rule `:is(.nabi, …)` has a specificity of **(0, 1, 0)**.
- The dark-mode rule `:where(html, body).dark :is(.nabi, …)` has a specificity of **(0, 2, 0)**.
- So stacking three classes as in `.nabi.nabi.nabi` gets you a specificity of **(0, 3, 0)**, which reliably wins regardless of CSS load order.

The preview modal is mounted as a direct child of `body`, so you also need to specify the `.nabi-scrim.nabi-scrim.nabi-scrim` selector for the same theme color to apply there too.
Reference-only tokens the core doesn't declare, such as font tokens, apply correctly with a single declaration on `:root`.

---

## Light / dark theme

The dark theme applies when the `html` or `body` element carries a `dark` class, and the light theme when it carries a `light` class. With no class, the default light theme applies, and if both classes are present, the explicit `light` class wins.

```html
<html class="dark"><!-- or <body class="dark"> --></html>
```

Switching themes just means toggling the class — there's no separate JavaScript API to call. When you write custom styles, using `--nabi-*` variables means their colors automatically follow theme switches too.

---

## Ways to load the stylesheet

**1. Import the whole CSS file** (the most common, recommended way)

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**2. Dynamically inject only the registered wings' styles**

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// calling drop() removes the injected styles from the DOM
```

Identical stylesheet content is never injected twice — it's managed as a single tag.
In a server-side rendering (SSR) setup, it's best to load the static CSS file rather than inject it, to avoid a flash of unstyled content (FOUC) before the client-side JS runs.

---

## Customizable CSS classes and UI elements

| Selector | What it is | Created by |
|---|---|---|
| `.nabi` | Top-level container wrapping the whole editor (toolbar + editing area) | the host |
| `.nabi-content[contenteditable]` | The actual body editing area | the host |
| `.nabi-toolbar` | Sticky header container wrapping the toolbar and context bar | the host |
| `.nabi-toolbar-row` | The main toolbar's button row | `mountToolbar()` |
| `.nabi-context` | The dynamic context toolbar container | `mountContextToolbar()` |
| `.nabi-tools` | Wrapper for the preview and full-screen buttons | `mountViewTools()` |
| `.nabi-hints [data-hint]` | The shortcut-hint badge shown on a rapid double-press of Shift | `mountHints()` |
| `[data-nabi-tip]` | Button tooltip (rendered with CSS `::after`) | core components |
| `.nabi-content.nabi-dropping` | The editing area while a file is being dragged over it | `mountUpload()` |

### Modals and popups

| Selector | What it is | Created by |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > `.nabi-content.nabi-preview-body` | The document preview modal | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | The image lightbox popup | `openLightbox()` |
| `.nabi-scrim` > `.nabi-card.nabi-choose` | The paste-format picker popup | `openChoosePanel()` |
| `.nabi-scrim` > `.nabi-card.nabi-save` | The save-file popup (filename input and format picker) | `openSavePanel()` |
| `.nabi.is-fullscreen` | The class activating the editor's full-screen mode | `setFullscreen()` |

---

## Rendering stored HTML elsewhere

The HTML string extracted with `getHtml()` consists only of semantic markup and `data-nabi-*` attributes, with no inline `style`.
To render it on an external page with the same look as the editor, wrap the body in a `.nabi-content` class and load `nabi.css`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">

<div class="nabi-content">
  <!-- the HTML body saved via nabi.getHtml() -->
</div>
```

Even without wrapping it in `.nabi`, the theme and font tokens apply to `.nabi-content` itself, so you can reproduce exactly the styling you saw in the editor.

### Enabling read-only table sorting

To enable column sorting for tables on a published HTML page, attach the `attachTableSort` function.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'en' })
```

It detects tables carrying the `data-nabi-sortable` attribute and adds sort buttons to the column headers. Calling the returned `detach()` function removes the added DOM buttons and restores the original row order.

::: warning Don't apply attachTableSort to a DOM you're editing
`attachTableSort()` manipulates the DOM structure directly, so applying it to an editor area still being edited can permanently bake the sort-button UI into the document body. Only ever use it on a read-only viewer screen.
:::

---

## Next

- [{{ t('menu_wing_custom') }}](../wing/custom) — build your own custom formatting wing
- [{{ t('menu_intro_index') }}](../intro) — introduction to NABI NOTE and its architecture

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
