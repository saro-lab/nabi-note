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
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Weka darasa moja la mandhari kwenye `.nabi` ya kihariri na `.nabi-content` ya mwonekano uliochapishwa ili kutumia variables sawa. Pakia CSS ya huduma baada ya CSS ya kifurushi na uweke mandhari ya sasa kupitia `data-nabi-theme`.

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

Uangaziaji na rangi ya maandishi hutumia `--nabi-hl-<name>` na `--nabi-tc-<name>`. Mandharinyuma ya seli hutumia `--nabi-cell-<name>` yenye `yellow`, `green`, `cyan`, `pink`, `purple`, `orange`. Variables hubadili rangi inayoonekana pekee, si jina lililohifadhiwa.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

Mandhari ya kawaida hutumia rangi hafifu kwa mandharinyuma ya seli. Hali nyeusi huhifadhi majina lakini hutumia rangi tofauti, angavu zaidi na zisizokolea sana, ili zitofautishwe kwenye msingi mweusi. Rangi hizi zenye uwazi kiasi huonyesha msingi; ukizibadili, hakiki utofauti wa maandishi kwenye mandharinyuma halisi ya ukurasa. Ili kubatilisha variables za rangi za kawaida, weka darasa la mandhari kwenye elementi halisi ya kihariri au maudhui yaliyochapishwa kama hapo juu, si kwenye mzazi yeyote wa nje.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Kizingiti cha hali ya simu

Upau wa kawaida `layout: 'compact'` hubadilika kuwa mstari mmoja wa simu upana wa skrini ukiwa chini ya `36rem`. `36rem` kamili huhifadhi mpangilio wa kompyuta. Kompyuta huonyesha zana zote kwa kuvunja mistari hata kihariri kikiwa chembamba. Sifa za vitu pia huvunja mistari chini yake; mistari yote miwili huchukua nafasi juu ya maandishi. Skrini nzima hupanua zana zote bila kujali upana.

Kwenye simu, zana za haraka, kitufe cha zana zote na vitufe vilivyounganishwa vya hakikisho/skrini nzima hubaki kwenye upau mkuu. Bado vinatumika sifa zinapoonekana. Paleti ya zana zote hutumia mpangilio wa makundi na vitenganishi vya kompyuta. `layout: 'wrap'` huonyesha zana zote kwa kuvunja mistari kila wakati.

Paneli za simu hufunguka kwenye nafasi iliyopo karibu na upau na sifa. Kichaguzi cha ukubwa wa jedwali ni tofauti: hufunguka katikati juu ya msingi wenye uwazi kiasi, kwa gridi ya 5×5 rahisi kugusa. Hakisubiri kibodi ifungwe; kuchagua ukubwa huingiza jedwali moja kisha kufunga kichaguzi.

Weka `--nabi-mobile-breakpoint` kwenye `:root`, elementi ya juu au `.nabi` moja kubadili kizingiti. Tumia urefu wa CSS usio hasi kama `rem`, `px` au `calc()`. Mabadiliko ya thamani ya CSS, ukubwa wa fonti ya mzizi au upana wa skrini husasisha pia paneli zilizo wazi kiotomatiki. Paneli za kuingiza zilizohamishwa chini ya `body` huhifadhi kizingiti cha kihariri cha asili.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Maeneo yanayoelea yana kizingiti tofauti cha safu moja. Hutumia safu moja kontena la maandishi, si skrini, likiwa chini ya `36rem`; uchapishaji hutumia mpangilio huo huo.

## Dark mode

Light mode ndiyo chaguomsingi. Ongeza `.dark` kwenye `html` au `body`, au weka `data-nabi-theme="dark"` kwenye kihariri maalumu au body iliyochapishwa.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Tumia `data-nabi-theme="light"` kujiondoa kwenye `.dark` ya ancestor. Programu yako ndiyo inadhibiti kubadilisha mandhari; kifurushi hakifuati `prefers-color-scheme` kiotomatiki.

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

## Tia style kwenye maudhui yaliyochapishwa pia

HTML iliyochapishwa pia inahitaji `.nabi-content` na CSS ileile. Jedwali, code blocks, picha, checklist na drop caps huonekana bila JavaScript. Ongeza `nabi-note/viewer` kwa tabia kama kupanga jedwali au code highlighting pekee.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
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
