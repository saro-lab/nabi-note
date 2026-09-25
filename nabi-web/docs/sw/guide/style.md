---
title: Mandhari ya CSS
description: Sanidi rangi, fonti, ukubwa na dark mode kwa vihariri na maudhui yaliyochapishwa ukitumia CSS variables.
---

# Mandhari ya CSS

NABI NOTE hutumia CSS ileile kwa kuhariri na maudhui yaliyochapishwa. Pakia stylesheet ya kifurushi mara moja, kisha override variables unazohitaji tu kwenye container ya huduma.

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

Weka tokens zinazoshirikiwa kwenye parent ya pamoja ili kihariri na mwonekano wake uliochapishwa viendelee kuwa na lugha ileile ya muonekano.

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

## Variables za kawaida

| Kusudi | Variables |
| --- | --- |
| Maandishi na mandharinyuma | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Mipaka na rangi ya msisitizo | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Pembe na vivuli | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Familia za fonti | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Eneo la kuhariri | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Toolbar inayobaki na preview | `--nabi-sticky-top`, `--nabi-preview-width` |
| Controls za touch | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Upana wa kuingia hali ya simu | `--nabi-mobile-breakpoint` |

Tokens za highlight na text color hutumia `--nabi-hl-<name>` na `--nabi-tc-<name>`. Kubadili `--nabi-hl-yellow`, kwa mfano, hubadili rangi ya kuonyesha highlight za `yellow` zilizohifadhiwa bila kubadili data ya hati.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Kizingiti cha hali ya simu

Hali ya simu huanza upana wa upau wa zana, mstari wa muktadha au eneo la kuonyesha unapokuwa chini ya `36rem`. Upana wa `36rem` hasa hubaki na mpangilio wa kawaida. Katika hali ya simu, upau wa zana na mstari wa muktadha husogezwa mlalo, paneli huwekwa katikati, na kichagua jedwali hupunguzwa hadi visanduku 5×5 vinavyofaa kuguswa.

Weka `--nabi-mobile-breakpoint` kwenye `:root`, kipengele cha juu au `.nabi` moja. Tumia urefu wa CSS usio hasi kama `rem`, `px` au `calc()`. Mabadiliko ya thamani ya CSS, ukubwa wa fonti ya mzizi, upana wa kontena au eneo la kuonyesha husasisha pia paneli zilizo wazi kiotomatiki. Paneli za kuingiza data zilizohamishwa chini ya `body` huendelea kutumia kizingiti cha kihariri cha asili.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Vifaa vya kugusa hubakiza vidhibiti vikubwa hata juu ya kizingiti hiki.

## Dark mode

Light mode ndiyo chaguomsingi. Ongeza `.dark` kwenye `html` au `body`, au weka `data-nabi-theme="dark"` kwenye kihariri maalumu au body iliyochapishwa.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Tumia `data-nabi-theme="light"` kujiondoa kwenye `.dark` ya ancestor. Programu yako ndiyo inadhibiti kubadilisha mandhari; kifurushi hakifuati `prefers-color-scheme` kiotomatiki.

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

## Tia style kwenye maudhui yaliyochapishwa pia

HTML iliyochapishwa pia inahitaji `.nabi-content` na CSS ileile. Jedwali, code blocks, picha, checklist na drop caps huonekana bila JavaScript. Ongeza `nabi-note/viewer` kwa tabia kama kupanga jedwali au code highlighting pekee.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Source Serif 4", Georgia, serif;
  --nabi-bg: transparent;
}
```

Weka layout ambayo kifurushi hakimiliki, kama upana wa body na line height, kwenye service class yako.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Usibadilishe muundo wa kuhariri

Usibadilishe `display` au `white-space` kwenye nodes za `[data-key]` zinazohaririwa, usiongeze pseudo-elements ndani ya maandishi yanayoharirika, wala usizime pointer behavior kwenye object wrappers. Sheria hizi zinaweza kuvunja caret geometry na document mapping.

Drop caps zilizochapishwa hutumia `::first-letter`, ilhali editing surface hutumia elementi halisi ya `[data-nabi-dropcap-letter]`. Usiongeze sheria nyingine ya `::first-letter` ndani ya `.nabi-editing` wala kubadilisha elementi hiyo.
