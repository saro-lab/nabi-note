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

Sanya class na jigo ɗaya a `.nabi` na edita da `.nabi-content` na shafin da aka wallafa don amfani da variables iri ɗaya. Loda CSS na sabis bayan na package, sannan a nuna jigon yanzu da `data-nabi-theme`.

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
| Faɗin sauyawa zuwa yanayin wayar hannu | `--nabi-mobile-breakpoint` |

Haskakawa da launin rubutu suna amfani da `--nabi-hl-<name>` da `--nabi-tc-<name>`. Bayan cell na tebur yana amfani da `--nabi-cell-<name>` mai goyon bayan `yellow`, `green`, `cyan`, `pink`, `purple`, `orange`. Variables suna sauya launin da ake gani kawai, ba sunan da aka adana ba.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

Jigon asali yana nuna bayan cells da launuka masu laushi. Yanayin duhu yana riƙe sunayen amma yana amfani da wasu launuka masu haske da ƙarancin kaifi domin a bambanta su a bayan duhu. Waɗannan launuka masu ɗan bayyana suna barin a ga bayan shafi; idan an sauya su, a duba bambancin rubutu da ainihin bayan shafin. Don maye gurbin variables na launi na asali, a saka class na jigo a ainihin element na edita ko abun da aka wallafa kamar sama, ba a wani mahaifin waje kawai ba.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Iyakar yanayin wayar hannu

Toolbar na asali `layout: 'compact'` yana komawa layi ɗaya na waya idan faɗin allo ya gaza `36rem`. Daidai `36rem` yana barin tsarin desktop. A desktop, duk kayan suna naɗewa zuwa layuka ko edita ya yi ƙunci. Properties na object ma suna naɗewa a ƙasa; layukan biyu suna ɗaukar sarari sama da rubutu. Cikakken allo yana buɗe duk kayan ko da wane faɗi ne.

A waya, kayan gaggawa, maɓallin duk kayan da maɓallan preview/cikakken allo da aka haɗa suna zama a babban toolbar. Har yanzu ana iya amfani da su lokacin da properties suka bayyana. Palette na duk kayan yana bin jerin rukuni da masu rarrabawa na desktop. `layout: 'wrap'` kullum yana nuna duk kayan da naɗewar layi.

Panel na waya yana buɗewa a sararin da ke kewaye da toolbar da properties. Mai zaɓar girman tebur ya bambanta: yana buɗewa a tsakiya kan bayan mai ɗan bayyana da grid na 5×5 mai sauƙin taɓawa. Ba ya jiran keyboard ya rufe; zaɓar girma yana saka tebur ɗaya sannan ya rufe.

Saita `--nabi-mobile-breakpoint` a `:root`, element na sama ko `.nabi` ɗaya domin sauya iyaka. Yi amfani da tsawon CSS marar korau kamar `rem`, `px` ko `calc()`. Canjin ƙimar CSS, girman font na tushe ko faɗin allo yana sabunta panels da ke buɗe kai tsaye. Panel na shigarwa da aka matsar ƙarƙashin `body` yana riƙe iyakar editansa na asali.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Yankunan iyo suna da iyaka dabam ta komawa shafi ɗaya. Suna amfani da shafi ɗaya idan faɗin container na rubutu, ba allo ba, ya gaza `36rem`; bugawa ma tana amfani da wannan tsari.

## Dark mode

Tsohuwar yanayi light mode ce. Idan an ƙara `.dark` a `html` ko `body` na shafi, ko a saita `data-nabi-theme="dark"` ga wani edita ko allon wallafawa, dark mode zai yi aiki.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Yi amfani da `data-nabi-theme="light"` idan kana son katse tasirin `.dark` na sama. Sabis ne yake sarrafa canjin jigo; package ba ya bin `prefers-color-scheme` da kansa.

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
