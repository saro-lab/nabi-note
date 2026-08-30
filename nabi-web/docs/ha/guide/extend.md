---
title: Fuka-fuki na musamman
description: Yarjejeniya da tsarin aiwatarwa da za a bi wajen ƙirƙirar sabon aikin takarda mai iya adanawa.
---

# Fuka-fuki na musamman

Custom wing ba maballin toolbar guda ba ne kawai. Ƙari ne na declaration da ke haɗa tsarin da za a adana a takarda, commands, juyawar HTML da Markdown, dokokin shigo da bayanai, da halayen allo. Registry yana duba declaration kafin a ƙirƙiri edita, saboda haka kuskuren tsari ba zai shiga takarda ba.

## Fara da mafi ƙanƙantar factory

Tsara rubutu na yau da kullum ba ya bukatar a ƙirƙiri cikakken declaration daga farko. Yi amfani da `simpleMark()` don inline formatting marar ƙima, `valueMark()` don formatting mai iyakantattun ƙimomi, `boxObject()` don block marar children, da `listFamily()` don list.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(
  wings().allBasic().use(exStrong),
)
```

## Gina nau'o'in wing daban-daban

Misalan da ke ƙasa suna nuna tsarin ajiya daban-daban. Da farko zaɓi factory guda ka yi rajista, sannan duba sakamakon `getJson()` da `getHtml()`. Idan kana son sakawa ko canza aikin a allo, sai ka ƙara commands da buttons bayan haka.

### 1. Inline formatting marar ƙima: jaddadawa

`simpleMark()` ya dace idan feature yana kewaye rubutu kawai. Wannan misali yana ajiye `exStrong` a takarda kuma yana fitar da `<strong>` a HTML.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

Idan an sa `clearable: true`, cire formatting zai cire wannan mark ma. Kafin ka ƙara maballi, a shafa shi da `nabi.applyCommand()` ko wani custom command. CSS na allon wallafawa na iya amfani da selector irin `.nabi-content strong` ɗaya da edita.

### 2. Inline formatting mai ƙima: alamar matsayi

Yi amfani da `valueMark()` idan ya wajaba a zaɓi ɗaya daga halattattun ƙimomi, kamar launi, girma, ko matsayi. Ana adana ƙimar a `a.v`, kuma ƙimar da ba ta cikin jeri ana cire ta a matakin `repair()`.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

Misalin ajiya shi ne `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["muhimmi"] }`. CSS yana nufin selector na ƙimar da aka adana, saboda haka allon wallafawa ma yana canzawa. Idan akwai takardun da aka riga aka adana, kada ka cire ƙima daga jerin ba tare da tunani ba, domin wasu ƙimomi za su iya ɓacewa yayin karantawa.

### 3. Block marar child: layin raba sanarwa

Ana yin independent block marar child, kamar hoto, bidiyo, ko layin raba, da `boxObject()`. Layi mai raba ba tare da attributes ba shi ne mafi ƙanƙantar misali.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Idan block yana buƙatar attributes kamar adireshi ko faɗi, bayyana aikin duba ƙima a `attrs`, kuma sanya ƙimomin da ake bukata a `requires`. Maimakon canza ƙimar da ba za a tabbatar ba zuwa default, ya fi kyau a ƙi ta da `null` domin bayanan ajiya da allo kada su saba.

### 4. Block mai paragraphs da yawa: akwatin jagora

Don block mai ɗauke da body, yi amfani da `container` declaration kai tsaye. `holds: 'blocks'` yana nufin yana karɓar block children kamar paragraph, list, da image.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Wannan declaration kaɗai ba ya samar da command da zai sanya paragraph cikin callout. Dole a ƙara pure command mai kewaye paragraphs da aka zaɓa zuwa `commands`, kuma a bayyana `button` mai gudanar da shi kafin a iya amfani da shi a UI na edita.

### 5. Feature mai ƙirƙirar list da items tare

Domin list da item koyaushe suna tare, yi amfani da `listFamily()`. Misalin nan ƙaramin custom list ne wanda yake samar da `<ul>` da `<li>`.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` yana gyara tsarin ta hanyar kewaye block da ba item ba zuwa item ko da ya shiga cikin list. Don adana ƙimar kowane item, kamar ko an yi check, ƙara `itemDecl` da `repairItem`.

### Tsarin rajista

Idan ana amfani da wings da yawa tare, yi rajistarsu lokaci guda. Server rendering ma dole ya yi amfani da tsari da declarations iri ɗaya domin JSON iri ɗaya ya samar da HTML iri ɗaya.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'ha' })
```

## Ƙayyade suna da tsarin ajiya

Sunan da za a rubuta a takarda dole ne ya bi tsarin `ex[A-Z0-9]...`. Idan ya fara da `ex`, kamar `exCallout`, ma'anar takardun da aka adana ba za ta canza ba ko da an ƙara official wing daga baya.

`place` yana ƙayyade tsarin ajiya. Formatting da ke kewaye da rubutu `mark` ne, independent block marar child `void` ne, block mai children kuma `container` ne. Paragraph attribute `attr` ne, yayin da kayan aikin allo da ba ya ƙirƙirar takarda `tool` ne. `container` yana bukatar `holds: 'blocks' | 'inline'` da `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, da `parts` options ne da ke bayyana ƙuntatawar tsarin ajiya. Idan ka yi amfani da `parts`, dole ne ka bayyana `partHtml` da ya dace da kowane part. Don wing mai zaɓar ƙima, yi amfani da `attrKey` da `attrValues` don takaita kewayon da aka amince da shi.

## Dukan declaration options

A bayyana waɗanda ake bukata kawai. Lokacin amfani da factory, kada a maimaita ƙimomin da factory ta riga ta ƙayyade.

| Rukuni | Option | Amfani |
| --- | --- | --- |
| Asali | `w`, `place`, `basic`, `styles` | Suna, nau'in tsari, ko a haɗa shi da basic wing, da asalin CSS |
| Tsari | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Nau'in child, halayen Enter, attributes da aka yarda da su, boolean attributes |
| Tsari | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Part na ciki, child da aka yarda da su, hana alignment, dependency wings |
| Zaɓin ƙima | `attrKey`, `attrValues`, `currentValue` | Maɓalli da jeri na ƙimar ajiya da gano ƙimar da aka zaɓa |
| Commands/input | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Command, sarrafa keys, Escape, keys masu jere, auto-conversion |
| Haɗin allo | `attach` | DOM behavior da tsaftacewa da surface ke bukata |
| Juyawa | `toHtml`, `partHtml`, `toMd`, `partMd` | Fitar HTML da Markdown |
| Shigo da gyara | `claim`, `ioFilter`, `repair`, `partRepair` | Shigo da HTML, sarrafa fayil, tantancewa da gyaran JSON |
| UI | `button`, `buttons`, `context` | Toolbar da context tools |
| Cire formatting | `clearable` | Ko mark ɗin yana cikin abubuwan da za a cire |

`w` da `place` kullum ake bukata. Wings masu ƙirƙirar document node, kamar `mark`, `void`, da `container`, suna bukatar `toHtml()` ma. `container` yana bukatar `holds`, kuma `parts` suna bukatar `partHtml` mai suna iri ɗaya. `attr` da `tool` ba sa ƙirƙirar document node, saboda haka ƙa'idar ta bambanta.

## Kare HTML, Markdown, da JSON tare

`toHtml()` yana canza node da aka adana zuwa HTML na allo; `toMd()` kuma yana fitar da Markdown. Idan ba a bayyana Markdown conversion ba, HTML da aka samar zai tsaya domin kada bayanai su ɓace. Idan za a sake karanta HTML, `claim()` ya duba element da attributes nasa kawai sannan ya mayar da shi node.

`repair()` yana gudana yayin loda JSON da kuma bayan command ya gudana. Ka gyara ka dawo da attribute values da ba a yarda da su ba, kuma ka dawo da `null` ga node da ba za a iya tsarawa ba. Yi amfani da context functions irin `ctx.element()`, `ctx.escape()`, da `ctx.url()` wajen haɗa HTML. Kada a haɗa strings don tsallake tantancewar tags, attributes, ko URL.

## Raba commands da halayen allo

Command pure function ne wanda ke karɓar takarda da wurin selection, ya dawo da sabuwar takarda da selection da ke cikinta. Ba ya karantawa ko canza DOM, kuma yana dawo da `null` ga request da ba za a iya canzawa ba. Sunan command ya fara da fi'ili cikin lower camel case, kamar `insertNote`.

Halayen allo da ba su da sauƙin bayyana su da command, kamar drag selection na tebur, a sanya su cikin `attach(host)`. Da zarar an canza event listener ko attribute, a yi rajistar aikin mayarwa da `host.onDispose()` domin a tsaftace ko da setup ya gaza daga baya. Kada ka canza composing text DOM ko selection mapping na surface kai tsaye.

Ana bayyana toolbar da context tools da `button`, `buttons`, da `context`. Idan aka sake aiwatar da dokokin command daban a application UI, toolbar da document model na iya rabuwa.

## CSS styles

A `styles` na wing za a iya bayyana asalin CSS da ake bukata. CSS na wings da aka yi rajista yana cikin `nabi-note/nabi.css`. Idan ana haɗa registry da aka zaɓa kawai a runtime, za a iya amfani da `collectSheets()` da `injectSheets()` a burauza, amma a SSR a link CSS file.

Allon wallafawa ma yana amfani da CSS da classes da data attributes iri ɗaya da edita. Raba selectors na edita da na wallafawa, kuma kada ka canza tsarin, `display`, ko `white-space` na editing node `[data-key]`. CSS ya canza kallo kawai; bai kamata ya taɓa document structure ko caret mapping ba.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Idan ka nufi class ko data attribute da `toHtml()` ya ƙirƙira kawai, za ka iya ƙawata JSON iri ɗaya lafiya daban a edita da allon wallafawa. Ka raba canje-canje na sabis da narrower selector, kamar `.article-body .ex-callout`.

## Abubuwan tabbatarwa

Tabbatar cewa idan an sake loda JSON da aka adana, tsari da HTML iri ɗaya suna fitowa. A gwada registry na ƙin sunan da bai dace ba, duplicate command, builder da ya ɓace, da dependency da ba a cika ba. Duba shigo da HTML, input mara kyau na `repair()`, selection na command, fitar SSR, da allon wallafawa da CSS don samun aminci.

Ana iya duba cikakkun types da factory arguments a type declarations na package da aka shigar da kuma [English API reference](https://nabi.saro.me/llms/api-reference.md).
