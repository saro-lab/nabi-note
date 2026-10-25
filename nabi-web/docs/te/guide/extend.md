---
title: అనుకూల వింగ్స్
description: స్థిరమైన పత్ర ఫీచర్‌ను చేర్చే ఒప్పందం, అమలు క్రమం.
---

# అనుకూల వింగ్స్

అనుకూల వింగ్ టూల్‌బార్ బటన్ కంటే ఎక్కువ. ఇది నిల్వ పత్ర నిర్మాణం, ఆదేశాలు, HTML, Markdown మార్పిడి, దిగుమతి నియమాలు, వీక్షణ ప్రవర్తనను కలిపి ఉంచే డిక్లరేటివ్ విస్తరణ. ఎడిటర్ ఏర్పడకముందే రిజిస్ట్రీ దానిని ధృవీకరించి, చెల్లని నిర్మాణాలు పత్రాల్లోకి రాకుండా చేస్తుంది.

## అత్యంత చిన్న ఫ్యాక్టరీతో ప్రారంభించండి

చాలా ఆకృతీకరణకు పూర్తి డిక్లరేషన్ అవసరం లేదు. విలువలేని ఇన్‌లైన్ గుర్తుకు `simpleMark()`, పరిమిత విలువల గుర్తుకు `valueMark()`, పిల్లలు లేని బ్లాక్‌కు `boxObject()`, జాబితాకు `listFamily()` వాడండి.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## అనేక రకాల వింగ్స్‌ను నిర్మించండి

దిగువ ప్రతి ఉదాహరణకు వేర్వేరు నిల్వ ఆకారం ఉంది. ముందుగా ఒకదాన్ని నమోదు చేసి `getJson()`, `getHtml()`ను పరిశీలించండి. నిర్మాణం పనిచేసిన తర్వాతే ఆదేశాలు, బటన్‌లను చేర్చండి.

### 1. విలువలేని ఇన్‌లైన్ గుర్తు: ఎమ్ఫసిస్

ఫీచర్ వచనాన్ని మాత్రమే చుట్టినప్పుడు `simpleMark()` వాడండి. ఇది `exStrong`ను నిల్వ చేసి `<strong>`గా రెండర్ చేస్తుంది.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

`clearable: true`తో ఆకృతీకరణ తొలగింపు ఈ గుర్తును కూడా తీసేస్తుంది. బటన్ చేర్చేముందు `nabi.applyCommand()` లేదా మరో అనుకూల ఆదేశంతో వర్తింపజేయండి. అదే `.nabi-content strong` సెలెక్టర్ ఎడిటర్, ప్రచురిత కంటెంట్‌కు శైలి ఇస్తుంది.

### 2. విలువతో ఇన్‌లైన్ గుర్తు: స్థితి టోన్

అనుమతించిన సమితి నుంచి ఎంచుకునే రంగు, పరిమాణం లేదా స్థితికి `valueMark()` వాడండి. విలువ `a.v`లో నిల్వ అవుతుంది; జాబితా వెలుపలి విలువలు `repair()`లో తొలగిపోతాయి.

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

దీని సేవ్ చేసిన రూపం `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. CSS సేవ్ చేసిన విలువనే లక్ష్యంగా తీసుకుంటుంది కాబట్టి, ప్రచురించిన కంటెంట్ కూడా మారుతుంది. ఇప్పటికే ఉన్న జాబితా నుంచి విలువలను తేలికగా తొలగించవద్దు; గతంలో సేవ్ చేసిన పత్రాలు చదివినప్పుడు వాటిని కోల్పోవచ్చు.

### 3. పిల్లలు లేని బ్లాక్: విభాజకం

చిత్రం, వీడియో లేదా విభాజకం వంటి పిల్లలు లేని స్వతంత్ర ఆబ్జెక్టుకు `boxObject()` వాడండి.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

URL లేదా వెడల్పు వంటి విలువలున్న ఆబ్జెక్టుకు `attrs`లో ధృవీకరణను ప్రకటించి, అవసరమైన విలువలను `requires`లో ఉంచండి. తనిఖీ చేయలేని విలువకు నిశ్శబ్దంగా డిఫాల్ట్‌ను పెట్టకుండా `null`తో తిరస్కరించండి.

### 4. అనేక పేరాలున్న బ్లాక్: కాల్‌అవుట్

పత్ర కంటెంట్‌ను ఉంచే బ్లాక్‌కు `container`ను ప్రకటించండి. `holds: 'blocks'` పేరా, జాబితా, ఆబ్జెక్ట్-బ్లాక్ పిల్లలను అనుమతిస్తుంది.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  isolating: true,
  scopedCommands: ['insertImage', 'insertTable', 'toggleBulletList', 'toggleQuote'],
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

ఈ డిక్లరేషన్ ఒక్కటే ఎంచుకున్న పేరాలను చుట్టే మార్గాన్ని సృష్టించదు. ఎడిటర్ UIలో ఫీచర్‌ను చూపేముందు `commands`లో స్వచ్ఛమైన ఆదేశాన్ని, దానిని పిలిచే `button`ను చేర్చండి.

`isolating: true` అనేక పేరాలను అనుమతిస్తూనే, తొలగింపు సమాచార పెట్టె హద్దును దాటి పక్క కంటెంట్‌తో కలవకుండా ఆపుతుంది. `scopedCommands` లోని కమాండ్లు పెట్టెలోని పత్రంపై నడుస్తాయి; అందువల్ల చిత్రం/పట్టిక చేర్చడం, జాబితా/ఉల్లేఖనంగా మార్చడం పెట్టెలోనే ఉంటాయి.

### 5. జతైన జాబితా మరియు అంశం

జాబితా, అంశం ఎల్లప్పుడూ కలిసే చోట `listFamily()` వాడండి. కింది ఉదాహరణ `<ul>`, `<li>`లను సృష్టించే అతి సరళమైన అనుకూల జాబితా.

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

`listFamily()` జాబితాలోని బ్లాక్‌ను అంశంలో చుట్టి సరిదిద్దుతుంది. తనిఖీ చేసిన స్థితి వంటి అంశ-స్థాయి విలువకు `itemDecl`, `repairItem`ను చేర్చండి.

### ఒక క్రమబద్ధమైన ఎంపికలో నమోదు చేయండి

బ్రౌజర్‌లో వాడిన అదే డిక్లరేషన్‌లను, అదే క్రమంలో సర్వర్‌లో కూడా వాడండి.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'te' })
```

## పేర్లు మరియు పత్ర నిర్మాణాన్ని నిర్వచించండి

పత్రంలోకి వచ్చే పేర్లు తప్పక `ex[A-Z0-9]...`కు సరిపోవాలి. `exCallout` వంటి పేరు భవిష్యత్తులో అధికారిక wing సేవ్ చేసిన కంటెంట్ అర్థాన్ని మార్చకుండా అడ్డుకుంటుంది.

`place` నిల్వ ఆకారాన్ని నిర్ణయిస్తుంది: `mark` ఇన్‌లైన్ కంటెంట్‌ను చుట్టుతుంది, `void`కు పిల్లలు ఉండరు, `container` పిల్లలను ఉంచుతుంది, `attr` పేరా లక్షణాలను మారుస్తుంది, `tool` పత్ర నోడ్‌ను సృష్టించదు. `container`కు `holds: 'blocks' | 'inline'`, `toHtml()` అవసరం.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, `parts` నిర్మాణ పరిమితులను ప్రకటిస్తాయి. `parts` డిక్లరేషన్‌కు ప్రతి భాగం కోసం `partHtml` కూడా అవసరం. విలువను ఎంచుకునే wingను పరిమితం చేయడానికి `attrKey`, `attrValues` వాడండి.

## ప్రతి డిక్లరేషన్ ఎంపిక

wingకు అవసరమైనవే ప్రకటించండి. factory ఇప్పటికే మీ కోసం కొన్ని ఫీల్డ్‌లను అందిస్తుంది.

| విభాగం | ఎంపికలు | ఉద్దేశ్యం |
| --- | --- | --- |
| ప్రాథమికం | `w`, `place`, `basic`, `styles` | పేరు, నిర్మాణ రకం, ప్రాథమిక జాబితా సభ్యత్వం, డిఫాల్ట్ CSS |
| నిర్మాణం | `holds`, `singleParagraph`, `isolating`, `attrs`, `boolAttrs` | పిల్లల రకం, Enter ప్రవర్తన, సవరణ హద్దుల రక్షణ, అనుమతించిన attributes, boolean attributes |
| నిర్మాణం | `parts`, `allows`, `noAlign`, `requiresAnyOf` | అంతర్గత భాగాలు, అనుమతించిన పిల్లలు, సమలేఖన మినహాయింపు, wing ఆధారం |
| విలువలు | `attrKey`, `attrValues`, `currentValue` | నిల్వ విలువ key, జాబితా, ప్రస్తుత విలువ గుర్తింపు |
| ఆదేశాలు, ఇన్‌పుట్ | `commands`, `scopedCommands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | కమాండ్లు, లోపలి పత్రంలో నడిచే కమాండ్లు, కీ నిర్వహణ, Escape/రెండుసార్లు నొక్కడం, స్వయంచాలక మార్పు |
| సర్ఫేస్ ప్రవర్తన | `attach` | సర్ఫేస్‌కు DOM ప్రవర్తన, శుభ్రపరచడం |
| మార్పిడి | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML, Markdown అవుట్‌పుట్ |
| దిగుమతి, మరమ్మతు | `claim`, `ioFilter`, `repair`, `partRepair` | HTML దిగుమతి, ఫైల్ నిర్వహణ, JSON ధృవీకరణ, మరమ్మతు |
| UI | `button`, `buttons`, `context` | టూల్‌బార్, సందర్భ UI డిక్లరేషన్‌లు |
| ఆకృతీకరణ తొలగింపు | `clearable` | Clear formatting దీన్ని తీసేస్తుందా |

`w`, `place` ఎల్లప్పుడూ అవసరం. నోడ్‌లను ఉత్పత్తి చేసే `mark`, `void`, `container` wingsకు `toHtml()` కూడా అవసరం. containerకు `holds` కావాలి; ప్రకటించిన ప్రతి భాగానికి సరిపడే `partHtml` కావాలి.

## HTML, Markdown, JSONను కలిపి ఉంచండి

`toHtml()` సేవ్ చేసిన నోడ్‌ను HTMLగా రెండర్ చేస్తుంది; `toMd()` Markdownను ఎగుమతి చేస్తుంది. Markdown builder లేకపోతే సమాచారం పోకుండా రూపొందిన HTMLను ఉంచుతారు. దిగుమతిలో మీ స్వంత HTML మూలకం, ధృవీకరించిన లక్షణాలనే గుర్తించడానికి `claim()` వాడండి.

`repair()` JSON లోడ్ అయినప్పుడు, ఆదేశాల తర్వాత మళ్లీ నడుస్తుంది. చెల్లని లక్షణానికి సరిచేసిన నోడ్‌ను, ఉంచలేని నోడ్‌కు `null`ను ఇవ్వండి. HTMLను `ctx.element()`, `ctx.escape()`, `ctx.url()`తో నిర్మించండి; ఆ తనిఖీల చుట్టూ tagలు, లక్షణాలు, URLలను ఎప్పుడూ కలపవద్దు.

## ఆదేశాలను వీక్షణ ప్రవర్తన నుంచి వేరుగా ఉంచండి

ఆదేశం పత్రం, ఎంపికకు సంబంధించిన స్వచ్ఛమైన ఫంక్షన్; ఇది తదుపరి పత్రాన్ని, అందులోని ఎంపికను ఇస్తుంది. అది DOMను చదవదు లేదా మార్చదు; చెల్లుబాటు మార్పు చేయలేనప్పుడు `null` ఇస్తుంది. `insertNote`లా క్రియతో మొదలయ్యే lower camel case పేర్లను ఇవ్వండి.

పట్టిక drag ఎంపిక వంటి DOMకే పరిమితమైన ప్రవర్తనను `attach(host)`లో ఉంచండి. సెటప్ విఫలమైనా శుభ్రం కావడానికి ప్రతి listener లేదా మార్చిన లక్షణానికి `host.onDispose()`తో వెంటనే cleanupను నమోదు చేయండి. కూర్చుతున్న వచన DOMను లేదా సర్ఫేస్ ఎంపిక మ్యాపింగ్‌ను మార్చవద్దు.

`button`, `buttons`, `context`తో టూల్‌బార్, సందర్భ నియంత్రణలను ప్రకటించండి; వాటి ఆదేశ నియమాలను అప్లికేషన్ UIలో నకలు చేయడం UI, పత్ర మోడల్ వేరుపడేలా చేయవచ్చు.

### బ్లాక్ లోపల కమాండ్లు నడపడం

`holds: 'blocks'` ఉన్న కంటైనర్లపై, బ్లాక్‌లను ఉంచే `parts` పై `scopedCommands` ప్రకటించండి. ఎంపిక రెండు చివరలూ ఒకే ప్రాంతంలో ఉంటే కమాండ్‌కు ఆ ప్రాంతపు పిల్ల పత్రం, సాపేక్ష ఎంపిక మార్గాలు అందుతాయి; ఫలితం తిరిగి బయటి పత్రంలో వర్తిస్తుంది. ప్రాంతపు హద్దు దాటే ఎంపిక తిరస్కరించబడుతుంది; బయట అసలు కమాండ్ ప్రవర్తనే ఉంటుంది. తేలియాడే ప్రాంతాలు, పట్టిక గడులు కూడా చేర్పు, మార్పు, అప్‌లోడ్ పరిధిని ఇదే విధంగా కాపాడుకుంటాయి.

```ts
const exMediaBox: Wing = {
  w: 'exMediaBox',
  place: 'container',
  holds: 'blocks',
  isolating: true,
  scopedCommands: ['insertImage', 'commitUpload', 'toggleCode'],
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-media-box' }),
}
```

జాబితాలో వింగ్ కమాండ్లు మాత్రమే ఇవ్వవచ్చు. నమోదు కాని కమాండ్లు దాటవేయబడతాయి, కాబట్టి చిత్రం లేదా అప్‌లోడ్ వింగ్‌ను కలిపి నమోదు చేయడం తప్పనిసరి కాదు. ఇచ్చిన లోపలి పత్రం, సాపేక్ష మార్గాలతో మాత్రమే పనిచేసే కమాండ్లను ఎంచుకోండి; మొత్తం పత్రంలోని నిరపేక్ష మార్గాలు అవసరమయ్యే లేదా మొత్తం పత్రాన్ని మార్చే కమాండ్లు చేర్చవద్దు. కోర్ కమాండ్లనూ ఈ జాబితాలో పెట్టలేరు.

`singleParagraph` కంటెంట్‌ను ఒక పేరాకు పరిమితం చేస్తుంది; `isolating` అనేక పేరాలను ఉంచుతూనే Backspace/Delete సవరణ హద్దును దాటకుండా ఆపుతుంది. బ్లాక్‌లను ఉంచే `parts` పై కూడా `isolating: true` ప్రకటించవచ్చు.

### ఒకదానిలో మరొకటి ఉన్న బ్లాక్‌లలో కీ నిర్వహణ

`onKey` అందుకునే `KeyIntent.shift` ద్వారా Enter, Shift+Enter మధ్య తేడా తెలుస్తుంది. స్వతంత్ర సవరణ ప్రాంతంలో లోపలి వింగ్ `null` ఇస్తే, నిర్వహణ వరుసగా ఆ ప్రాంతం వరకు పై వింగ్‌లకు వెళ్తుంది. అందువల్ల గడిలోని జాబితా, కోడ్ ముందుగా ఇండెంటేషన్‌ను నిర్వహిస్తాయి; నిర్వహించని Tab గడుల మధ్య కదలవచ్చు. ఒక కీ ఇన్‌పుట్‌కు ఒకే వింగ్ రెండుసార్లు పిలవబడదు.

## CSS శైలులు

wingకు అవసరమైన ప్రాథమిక CSSను `styles`లో ఉంచండి. అంతర్నిర్మిత wing శైలులు ఇప్పటికే `nabi-note/nabi.css`లో ఉన్నాయి. ఎంచుకున్న registry శైలులను సమకూర్చే బ్రౌజర్ `collectSheets()`, `injectSheets()`ను వాడవచ్చు; SSR బదులుగా CSS ఫైల్‌కు లింక్ ఇవ్వాలి.

ఎడిటింగ్, ప్రచురిత కంటెంట్‌కు అదే classలు, data లక్షణాలను వాడండి; కానీ ఎడిటింగ్ `[data-key]` నిర్మాణం, `display`, `white-space`ను మార్చవద్దు. CSS రూపాన్ని మాత్రమే మార్చాలి, కేరెట్ మ్యాపింగ్‌ను కాదు.

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

`toHtml()` సృష్టించిన classలు లేదా data లక్షణాలనే లక్ష్యంగా పెట్టండి. సేవ-ప్రత్యేక మార్పులను, ఉదాహరణకు `.article-body .ex-callout`లా, మరింత పరిమితంగా ఉంచండి.

## మొత్తం ఒప్పందాన్ని ధృవీకరించండి

సేవ్ చేసిన JSON పత్రం మళ్లీ లోడ్ అయినప్పుడు అదే నిర్మాణం, HTML వస్తాయో ధృవీకరించండి. చెల్లని పేర్లు, నకిలీ ఆదేశాలు, లేని builderలు, తీరని ఆధారాలను registry తిరస్కరిస్తుందో పరీక్షించండి. చెల్లని HTML దిగుమతి, `repair()` ఇన్‌పుట్, ఆదేశ ఎంపిక నిర్వహణ, SSR అవుట్‌పుట్, శైలీకరించిన ప్రచురిత వీక్షణను కూడా కవర్ చేయండి.

పూర్తి రకాలు, factory arguments కోసం ఇన్‌స్టాల్ చేసిన డిక్లరేషన్‌లు, [ఆంగ్ల API reference](https://nabi.saro.me/llms/api-reference.md)ను చూడండి.
