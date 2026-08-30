---
title: Jigon CSS
description: Saita launuka, font, girma, da dark mode na edita da allon wallafawa da CSS variables.
---

# Jigon CSS

NABI NOTE yana amfani da CSS iri ɗaya ga edita da allon wallafawa. Bayan an loda CSS na package sau ɗaya, hanya mafi aminci ita ce a sake saita CSS variables da ake buƙata a container na sabis.

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

Idan an sanya tokens iri ɗaya a parent na gama-gari na edita da allon wallafawa, allon biyu za su riƙe yanayi iri ɗaya.

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

## Variables da ake yawan canzawa

| Amfani | Variable |
| --- | --- |
| Rubutu da bango | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Layi da launin jaddadawa | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Kusurwa da inuwa | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Asalin font | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Yankin gyara | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Toolbar mai tsayawa da preview | `--nabi-sticky-top`, `--nabi-preview-width` |
| Yanayin taɓawa | `--nabi-touch-font-size`, `--nabi-touch-control-size` |

Ana canza highlighter da launin rubutu da `--nabi-hl-<name>` da `--nabi-tc-<name>` bi da bi. Misali, canza `--nabi-hl-yellow` yana canza launin allo kaɗai na ƙimar highlighter `yellow` da aka adana a takarda.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Dark mode

Tsohuwar yanayi light mode ce. Idan an ƙara `.dark` a `html` ko `body` na shafi, ko a saita `data-nabi-theme="dark"` ga wani edita ko allon wallafawa, dark mode zai yi aiki.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Yi amfani da `data-nabi-theme="light"` idan kana son katse tasirin `.dark` na sama. Sabis ne yake sarrafa canjin jigo; package ba ya bin `prefers-color-scheme` da kansa.

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

## A shafa CSS ga allon wallafawa ma

HTML na wallafawa yana bukatar CSS iri ɗaya da `.nabi-content`. Tebur, code, hoto, checklist, da drop cap suna samun salo ko babu JavaScript. Sai a ƙara `nabi-note/viewer` idan ana buƙatar aiki kamar daidaita tebur ko canza launin code.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

Layout da package bai mallaka ba, kamar faɗin rubutu da tazarar layi, ana saita su a class na sabis.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Abin da bai kamata a canza a allon gyara ba

Kada ka canza `display` ko `white-space` na node `[data-key]` da ake gyarawa. A guji saka pseudo-element cikin rubutun gyara, ko hana pointer behavior na object wrapper kamar hoto da attachment. Irin waɗannan canje-canje na iya sa matsayin caret da matsayin takarda na DOM su saba.

Drop cap yana bayyana da `::first-letter` a allon wallafawa, amma a allon gyara yana amfani da ainihin element `[data-nabi-dropcap-letter]`. Kada ka ƙara `::first-letter` a cikin `.nabi-editing` ko ka canza wannan element.
