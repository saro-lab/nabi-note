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
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Assign the same theme class to the editor's `.nabi` and the published view's `.nabi-content` to apply the same variables to both. Load your service CSS after the package CSS and specify the current theme with `data-nabi-theme`.

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
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

Highlights and text colors use `--nabi-hl-<name>` and `--nabi-tc-<name>`. Table cell backgrounds use `--nabi-cell-<name>` with `yellow`, `green`, `cyan`, `pink`, `purple`, and `orange`. Variables change only the displayed color, not the stored color name.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

The default theme uses pale cell backgrounds. Dark mode retains the same color names but uses separate, brighter, less saturated colors to make them easier to distinguish on dark surfaces. These translucent colors let the background show through; when customizing them, check text contrast on your actual page background. Apply the theme class to the actual editor or published-content element as shown above, rather than an arbitrary outer parent, to override that element's default color variables.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Mobile breakpoint

The default `layout: 'compact'` toolbar switches to a single mobile row when viewport width is below `36rem`. Exactly `36rem` retains the desktop layout. On desktop, all tools wrap even when the editor itself is narrow. Object property tools wrap below; both rows occupy space above the content. Fullscreen expands all tools regardless of viewport width.

On mobile, quick tools, the all-tools button, and connected preview/fullscreen buttons remain in the main toolbar. They remain usable when property tools appear. The all-tools palette uses the same group order and separators as desktop. `layout: 'wrap'` always displays all tools with wrapping.

Mobile panels open in the available space around the toolbar and property tools. The table size picker is an exception: it opens centered over a translucent backdrop with a touch-friendly 5×5 grid. It does not wait for the keyboard to close; choosing a size inserts one table and closes the picker.

Set `--nabi-mobile-breakpoint` on `:root`, an ancestor, or an individual `.nabi` to change the threshold. Use a non-negative CSS length such as `rem`, `px`, or `calc()`. Changes to the CSS value, root font size, or viewport width automatically update open panels too. Input panels moved under `body` retain their original editor's threshold.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Float regions have a separate single-column threshold. They use one column when the content container, rather than the viewport, is narrower than `36rem`; printing uses the same layout.

## Dark mode

Light mode is the default. Add `.dark` to `html` or `body`, or set `data-nabi-theme="dark"` on a specific editor or published body.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Use `data-nabi-theme="light"` to opt out of an ancestor's `.dark`. Your application controls theme switching; the package does not automatically follow `prefers-color-scheme`.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
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
  --nabi-font: "Noto Serif KR", serif;
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
