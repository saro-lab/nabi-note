---
title: CSS themes
description: Configure colors, fonts, sizing, and dark mode for editors and published content with CSS variables.
---

# CSS themes

NABI NOTE uses the same CSS for editing and published content. Load the package stylesheet once, then override only the variables you need on a service container.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Put shared tokens on a common parent so the editor and its published view retain the same visual language.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Common variables

| Purpose | Variables |
| --- | --- |
| Text and background | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Borders and accent | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Corners and shadows | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Font families | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Editing surface | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Sticky toolbar and preview | `--nabi-sticky-top`, `--nabi-preview-width` |
| Touch controls | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Mobile-mode width threshold | `--nabi-mobile-breakpoint` |

Highlight and text-color tokens use `--nabi-hl-<name>` and `--nabi-tc-<name>`. Changing `--nabi-hl-yellow`, for example, changes the display color of stored `yellow` highlights without changing document data.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Mobile breakpoint

Mobile mode starts when the toolbar/context row or viewport width is strictly below `36rem`. Exactly `36rem` keeps the regular layout. Mobile mode scrolls the toolbar and context row horizontally, centers panels, and reduces the table picker to 5×5 touch-sized cells.

Set `--nabi-mobile-breakpoint` on `:root`, an ancestor, or an individual `.nabi`. Use a non-negative CSS length such as `rem`, `px`, or `calc()`. Changes to the CSS value, root font size, container width, or viewport width automatically update open panels too. Input panels moved under `body` keep using their original editor’s threshold.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Touch devices retain larger controls above this breakpoint.

## Dark mode

Light mode is the default. Add `.dark` to `html` or `body`, or set `data-nabi-theme="dark"` on a specific editor or published body.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Use `data-nabi-theme="light"` to opt out of an ancestor's `.dark`. Your application controls theme switching; the package does not automatically follow `prefers-color-scheme`.

```css
.dark .brand-note {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Style published content too

Published HTML also needs `.nabi-content` and the same CSS. Tables, code blocks, images, checklists, and drop caps render without JavaScript. Add `nabi-note/viewer` only for behavior such as table sorting or code highlighting.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Source Serif 4", Georgia, serif;
  --nabi-bg: transparent;
}
```

Set layout that the package does not own, such as body width and line height, on your service class.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Do not alter editing structure

Do not change `display` or `white-space` on editing `[data-key]` nodes, add pseudo-elements inside editable text, or disable pointer behavior on object wrappers. These rules can break caret geometry and document mapping.

Published drop caps use `::first-letter`, while an editing surface uses a real `[data-nabi-dropcap-letter]` element. Do not add another `::first-letter` rule inside `.nabi-editing` or replace that element.
