---
title: Wings maalumu
description: Mkataba na mpangilio wa utekelezaji wa kuongeza kipengele cha hati kinachodumu.
---

# Wings maalumu

Wing maalumu ni zaidi ya kitufe cha toolbar. Ni extension ya declarative inayoweka pamoja muundo wa hati iliyohifadhiwa, commands, ubadilishaji wa HTML na Markdown, sheria za import, na tabia ya view. Registry huihalalisha kabla kihariri hakijawepo, na kuzuia miundo batili kuingia kwenye hati.

## Anza na factory yenye upeo mdogo zaidi

Uumbizaji mwingi hauhitaji declaration kamili. Tumia `simpleMark()` kwa inline mark isiyo na thamani, `valueMark()` kwa mark yenye seti ndogo ya thamani, `boxObject()` kwa block isiyo na watoto, na `listFamily()` kwa orodha.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Unda aina kadhaa za wing

Kila mfano hapa chini una umbo tofauti la kuhifadhiwa. Sajili moja kwanza na ukague `getJson()` na `getHtml()`. Ongeza commands na buttons baada ya muundo kufanya kazi.

### 1. Inline mark isiyo na thamani: msisitizo

Tumia `simpleMark()` wakati kipengele kinafunika maandishi tu. Hii huhifadhi `exStrong` na kuitoa kama `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

Kwa `clearable: true`, Clear formatting huondoa mark hii pia. Kabla ya kuongeza button, itumie kwa `nabi.applyCommand()` au command nyingine maalumu. Selector ileile ya `.nabi-content strong` huweka style kwa kihariri na maudhui yaliyochapishwa.

### 2. Inline mark yenye thamani: tone ya hali

Tumia `valueMark()` kwa rangi, ukubwa, au hali iliyochaguliwa kutoka seti inayoruhusiwa. Thamani huhifadhiwa kwenye `a.v`; thamani zilizo nje ya orodha huondolewa wakati wa `repair()`.

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

Umbo lake lililohifadhiwa ni `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Muhimu"] }`. CSS hulenga thamani iliyohifadhiwa, kwa hiyo hubadili maudhui yaliyochapishwa pia. Usiondoe thamani kwa urahisi kutoka orodha iliyopo: hati zilizohifadhiwa awali zinaweza kuzipoteza zinaposomwa.

### 3. Block isiyo na mtoto: kigawanyaji

Tumia `boxObject()` kwa object huru isiyo na watoto, kama picha, video au kigawanyaji.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Kwa object yenye thamani kama URL au upana, declare validation katika `attrs` na uweke thamani zinazohitajika katika `requires`. Kataa thamani isiyoweza kuthibitishwa kwa `null` badala ya kubadilisha kimya kimya kwa default.

### 4. Block yenye aya kadhaa: callout

Kwa block inayoshikilia maudhui ya hati, declare `container`. `holds: 'blocks'` huruhusu watoto wa aya, orodha na object-block.

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

Declaration hii peke yake haitengenezi njia ya kufunika aya zilizochaguliwa. Ongeza pure command katika `commands` na `button` inayoitumia kabla ya kuonyesha kipengele kwenye UI ya kihariri.

### 5. Jozi inayolingana ya orodha na item

Tumia `listFamily()` pale orodha na item lazima zitokee pamoja daima.

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

`listFamily()` hutengeneza upya block ndani ya orodha kwa kuifunika katika item. Ongeza `itemDecl` na `repairItem` kwa thamani ya kiwango cha item kama checked state.

### Sajili katika selection moja yenye mpangilio

Tumia declarations zilezile kwa mpangilio uleule kwenye seva na kivinjari.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'sw' })
```

## Bainisha majina na muundo wa hati

Majina yanayoingia kwenye hati lazima yalingane na `ex[A-Z0-9]...`. Jina kama `exCallout` huzuia wing rasmi ya baadaye kubadili maana ya maudhui yaliyohifadhiwa.

`place` huamua umbo linalohifadhiwa: `mark` hufunika maudhui ya inline, `void` ni block isiyo na mtoto, `container` hushikilia watoto, `attr` hubadili attributes za aya, na `tool` haitengenezi document node. `container` huhitaji `holds: 'blocks' | 'inline'` na `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, na `parts` hutangaza structural constraints. Declaration ya `parts` pia inahitaji `partHtml` kwa kila part. Tumia `attrKey` na `attrValues` kubana wing inayochagua thamani.

## Kila option ya declaration

Declare kile wing inachohitaji tu. Factory tayari hutoa baadhi ya fields kwa ajili yako.

| Eneo | Options | Kusudi |
| --- | --- | --- |
| Msingi | `w`, `place`, `basic`, `styles` | Jina, aina ya muundo, uanachama wa katalogi ya msingi, CSS chaguomsingi |
| Muundo | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Aina ya mtoto, tabia ya Enter, attributes zinazoruhusiwa, boolean attributes |
| Muundo | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Parts za ndani, watoto wanaoruhusiwa, kutoruhusu alignment, dependency ya wing |
| Thamani | `attrKey`, `attrValues`, `currentValue` | Key na orodha ya thamani iliyohifadhiwa, utambuzi wa thamani ya sasa |
| Commands na input | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Commands, kushughulikia key, tabia ya Escape/double-key, sheria za autoformat |
| Tabia ya surface | `attach` | Tabia ya DOM na cleanup ya surface |
| Ubadilishaji | `toHtml`, `partHtml`, `toMd`, `partMd` | Output ya HTML na Markdown |
| Import na repair | `claim`, `ioFilter`, `repair`, `partRepair` | HTML import, ushughulikiaji wa faili, validation na repair ya JSON |
| UI | `button`, `buttons`, `context` | Declarations za toolbar na context UI |
| Clear formatting | `clearable` | Ikiwa Clear formatting huiondoa |

`w` na `place` zinahitajika daima. Wings za `mark`, `void`, na `container` zinazounda nodes pia zinahitaji `toHtml()`. Container huhitaji `holds`; kila part iliyotangazwa inahitaji `partHtml` yake inayolingana.

## Weka HTML, Markdown na JSON pamoja

`toHtml()` hutoa saved node kuwa HTML, wakati `toMd()` hutoa Markdown. Bila Markdown builder, HTML iliyozalishwa huhifadhiwa ili taarifa isipotee. Tumia `claim()` kutambua elementi yako ya HTML na attributes zilizothibitishwa pekee wakati wa import.

`repair()` hutumika JSON inapopakiwa na tena baada ya commands. Rudisha node iliyorekebishwa kwa attribute batili, au `null` kwa node isiyoweza kubakizwa. Unda HTML kwa `ctx.element()`, `ctx.escape()`, na `ctx.url()`; usiunganishe tags, attributes au URL kuzunguka checks hizo.

## Tenganisha commands na tabia ya view

Command ni pure function ya hati na selection inayorudisha hati inayofuata na selection ndani yake. Haisomi wala kubadili DOM, na hurudisha `null` inaposhindwa kufanya mabadiliko halali. Taja commands kwa lower camel case inayoanza na kitenzi, kama `insertNote`.

Weka tabia ya DOM pekee, kama table drag selection, katika `attach(host)`. Sajili cleanup mara moja kwa kila listener au attribute iliyobadilishwa kwa `host.onDispose()` ili setup iliyoshindwa bado isafishwe. Usibadilishe composing text DOM wala selection mapping ya surface.

Declare controls za toolbar na context kwa `button`, `buttons`, na `context`; kurudia sheria zake za command kwenye UI ya programu kunaweza kufanya UI na document model zitofautiane.

## Mitindo ya CSS

Weka baseline CSS inayohitajika na wing kwenye `styles`. Mitindo ya built-in wing tayari imo katika `nabi-note/nabi.css`. Kivinjari kinachokusanya selected registry styles kinaweza kutumia `collectSheets()` na `injectSheets()`; SSR inapaswa kuunganisha faili ya CSS badala yake.

Tumia classes na data attributes zilezile kwa kuhariri na maudhui yaliyochapishwa, lakini usibadilishe editing `[data-key]` structure, `display`, au `white-space`. CSS lazima ibadilishe muonekano pekee, si caret mapping.

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

Lenga classes au data attributes zilizoundwa na `toHtml()` pekee. Weka mabadiliko ya huduma katika upeo mwembamba zaidi, kwa mfano `.article-body .ex-callout`.

## Thibitisha mkataba mzima

Thibitisha kwamba hati ya JSON iliyohifadhiwa hupakiwa tena kwa muundo na HTML ileile. Jaribu kwamba registry inakataa majina batili, commands rudufu, builders zinazokosekana, na dependencies zisizotimizwa. Funika HTML import batili na ingizo la `repair()`, ushughulikiaji wa command selection, SSR output, na published view yenye style.

Kwa types kamili na factory arguments, angalia declarations zilizosakinishwa na [English API reference](https://nabi.saro.me/llms/api-reference.md).
