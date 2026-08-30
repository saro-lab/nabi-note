---
title: தனிப்பயன் wing-கள்
description: நீடித்து சேமிக்கக்கூடிய ஆவண அம்சத்தைச் சேர்ப்பதற்கான ஒப்பந்தமும் செயல்படுத்தும் வரிசையும்.
---

# தனிப்பயன் wing-கள்

தனிப்பயன் wing என்பது கருவிப்பட்டி பொத்தானை விட அதிகமானது. சேமிக்கப்படும் ஆவண அமைப்பு, கட்டளைகள், HTML மற்றும் Markdown மாற்றம், இறக்குமதி விதிகள், காட்சி நடத்தை ஆகியவற்றை ஒன்றாக வைத்திருக்கும் அறிவிப்பு அடிப்படையிலான extension ஆகும். திருத்தி உருவாகும் முன்பே registry அதைச் சரிபார்ப்பதால், செல்லாத அமைப்புகள் ஆவணங்களில் நுழைவது தடுக்கப்படுகிறது.

## மிகக் குறுகிய factory-யில் தொடங்குங்கள்

பெரும்பாலான வடிவமைப்புக்கு முழு declaration தேவையில்லை. மதிப்பில்லாத inline mark-க்கு `simpleMark()`, வரையறுக்கப்பட்ட மதிப்புத் தொகுப்புள்ள mark-க்கு `valueMark()`, குழந்தைகளற்ற block-க்கு `boxObject()`, பட்டியலுக்கு `listFamily()`-ஐப் பயன்படுத்துங்கள்.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## பல வகையான wing-களை உருவாக்குங்கள்

கீழுள்ள ஒவ்வொரு உதாரணமும் வேறுபட்ட சேமிப்பு வடிவத்தைக் கொண்டது. முதலில் ஒன்றைப் பதிவுசெய்து `getJson()` மற்றும் `getHtml()`-ஐப் பாருங்கள். அமைப்பு செயல்பட்ட பின்னரே கட்டளைகளையும் பொத்தான்களையும் சேர்க்கவும்.

### 1. மதிப்பில்லாத inline mark: வலியுறுத்தல்

ஒரு அம்சம் உரையை மட்டும் சுற்றும்போது `simpleMark()`-ஐப் பயன்படுத்துங்கள். இது `exStrong`-ஐச் சேமித்து `<strong>` ஆக render செய்கிறது.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

`clearable: true` இருக்கும் போது, வடிவமைப்பை நீக்குதல் இந்த mark-ஐயும் அகற்றும். பொத்தானைச் சேர்ப்பதற்கு முன் `nabi.applyCommand()` அல்லது வேறு தனிப்பயன் கட்டளை மூலம் அதைப் பயன்படுத்துங்கள். அதே `.nabi-content strong` selector திருத்தியையும் வெளியிடப்பட்ட உள்ளடக்கத்தையும் வடிவமைக்கிறது.

### 2. மதிப்புள்ள inline mark: நிலைத் தொனி

அனுமதிக்கப்பட்ட தொகுப்பில் இருந்து தேர்வாகும் நிறம், அளவு அல்லது நிலைக்கு `valueMark()`-ஐப் பயன்படுத்துங்கள். மதிப்பு `a.v`-இல் சேமிக்கப்படும்; பட்டியலுக்கு வெளியே உள்ள மதிப்புகள் `repair()`-இன் போது நீக்கப்படும்.

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

இதன் சேமிக்கப்பட்ட வடிவம் `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["முக்கியம்"] }` ஆகும். CSS சேமித்த மதிப்பைக் குறிவைப்பதால் வெளியிடப்பட்ட உள்ளடக்கமும் மாறும். ஏற்கனவே உள்ள பட்டியலிலிருந்து மதிப்புகளை எளிதாக நீக்காதீர்கள்: முன்பு சேமித்த ஆவணங்கள் படிக்கப்படும் போது அவற்றை இழக்கலாம்.

### 3. குழந்தைகளற்ற block: பிரிப்பான்

படம், காணொளி அல்லது பிரிப்பான் போன்ற குழந்தைகளற்ற தனித்த object-க்கு `boxObject()`-ஐப் பயன்படுத்துங்கள்.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

URL அல்லது அகலம் போன்ற மதிப்புகளுள்ள object-க்கு, சரிபார்ப்பை `attrs`-இல் அறிவித்து கட்டாய மதிப்புகளை `requires`-இல் வையுங்கள். சரிபார்க்க முடியாத மதிப்புக்கு மறைமுகமாக default வழங்குவதற்குப் பதிலாக `null`-ஐத் திருப்பி மறுக்கவும்.

### 4. பல பத்திகளைக் கொண்ட block: callout

ஆவண உள்ளடக்கத்தை வைத்திருக்கும் block-க்கு `container`-ஐ அறிவியுங்கள். `holds: 'blocks'` என்பது பத்தி, பட்டியல், object-block குழந்தைகளை அனுமதிக்கிறது.

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

இந்த declaration மட்டும் தேர்ந்தெடுக்கப்பட்ட பத்திகளைச் சுற்றும் வழியை உருவாக்காது. திருத்தி UI-யில் அம்சத்தை வெளிப்படுத்துவதற்கு முன் `commands`-இல் pure command-ஐயும் அதை அழைக்கும் `button`-ஐயும் சேர்க்கவும்.

### 5. பொருந்தும் பட்டியல் மற்றும் item இணை

பட்டியலும் item-மும் எப்போதும் ஒன்றாக இருக்க வேண்டியபோது `listFamily()`-ஐப் பயன்படுத்துங்கள்.

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

`listFamily()` பட்டியலுக்குள் இருக்கும் block-ஐ item-ஆகச் சுற்றி அமைப்பைச் சரிசெய்கிறது. தேர்வுசெய்யப்பட்ட நிலை போன்ற item-நிலை மதிப்புக்கு `itemDecl` மற்றும் `repairItem`-ஐச் சேர்க்கவும்.

### ஒரே வரிசைப்படுத்திய தேர்வில் பதிவுசெய்யுங்கள்

உலாவியில் பயன்படுத்தும் அதே declaration-களை அதே வரிசையில் சேவையகத்திலும் பயன்படுத்துங்கள்.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'ta' })
```

## பெயர்களையும் ஆவண அமைப்பையும் வரையறுக்கவும்

ஆவணத்தில் சேரும் பெயர்கள் `ex[A-Z0-9]...`-க்கு பொருந்த வேண்டும். `exCallout` போன்ற பெயர், எதிர்கால அதிகாரப்பூர்வ wing சேமித்த உள்ளடக்கத்தின் பொருளை மாற்றுவதைத் தடுக்கிறது.

`place` சேமிப்பு வடிவத்தை நிர்ணயிக்கிறது: `mark` inline உள்ளடக்கத்தைச் சுற்றும், `void` குழந்தைகளற்ற block, `container` குழந்தைகளை வைத்திருக்கும், `attr` பத்தி attribute-களை மாற்றும், `tool` ஆவண node எதையும் உருவாக்காது. `container`-க்கு `holds: 'blocks' | 'inline'` மற்றும் `toHtml()` தேவை.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, `parts` ஆகியவை அமைப்புக் கட்டுப்பாடுகளை அறிவிக்கின்றன. `parts` declaration-க்கு ஒவ்வொரு part-க்கும் `partHtml` தேவை. மதிப்பைத் தேர்ந்தெடுக்கும் wing-ஐக் கட்டுப்படுத்த `attrKey` மற்றும் `attrValues`-ஐப் பயன்படுத்துங்கள்.

## ஒவ்வொரு declaration விருப்பமும்

wing-க்கு தேவையானவற்றை மட்டும் அறிவியுங்கள். factory ஏற்கனவே சில field-களை வழங்கும்.

| பகுதி | விருப்பங்கள் | நோக்கம் |
| --- | --- | --- |
| அடிப்படை | `w`, `place`, `basic`, `styles` | பெயர், அமைப்பு வகை, அடிப்படை catalog உறுப்புரிமை, இயல்புநிலை CSS |
| அமைப்பு | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | குழந்தை வகை, Enter நடத்தை, அனுமதிக்கப்பட்ட attribute-கள், boolean attribute-கள் |
| அமைப்பு | `parts`, `allows`, `noAlign`, `requiresAnyOf` | உள் parts, அனுமதிக்கப்பட்ட குழந்தைகள், alignment விலக்கு, wing சார்பு |
| மதிப்புகள் | `attrKey`, `attrValues`, `currentValue` | சேமித்த மதிப்பு key மற்றும் பட்டியல், நடப்பு மதிப்பு கண்டறிதல் |
| கட்டளைகளும் உள்ளீடும் | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | கட்டளைகள், key கையாளுதல், Escape/double-key நடத்தை, autoformat விதிகள் |
| surface நடத்தை | `attach` | surface-க்கான DOM நடத்தை மற்றும் cleanup |
| மாற்றம் | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML மற்றும் Markdown வெளியீடு |
| இறக்குமதியும் சரிசெய்தலும் | `claim`, `ioFilter`, `repair`, `partRepair` | HTML இறக்குமதி, கோப்பு கையாளுதல், JSON சரிபார்ப்பு மற்றும் சரிசெய்தல் |
| UI | `button`, `buttons`, `context` | கருவிப்பட்டி மற்றும் context UI declaration-கள் |
| வடிவமைப்பை நீக்குதல் | `clearable` | வடிவமைப்பை நீக்குதல் இதை அகற்றுமா |

`w` மற்றும் `place` எப்போதும் தேவை. node உருவாக்கும் `mark`, `void`, `container` wing-களுக்கு `toHtml()`-மும் தேவை. container-க்கு `holds` தேவை; அறிவிக்கப்பட்ட ஒவ்வொரு part-க்கும் அதற்குரிய `partHtml` தேவை.

## HTML, Markdown, JSON-ஐ ஒன்றாக வைத்திருங்கள்

`toHtml()` சேமித்த node-ஐ HTML-ஆக render செய்கிறது; `toMd()` Markdown-ஐ export செய்கிறது. Markdown builder இல்லாவிட்டால் தகவல் இழக்கப்படாமல் உருவாக்கிய HTML தக்கவைக்கப்படும். இறக்குமதியின் போது உங்கள் சொந்த HTML element மற்றும் சரிபார்க்கப்பட்ட attribute-களை மட்டுமே அடையாளம் காண `claim()`-ஐப் பயன்படுத்துங்கள்.

JSON ஏற்றப்படும் போதும் கட்டளைகளுக்குப் பின்பும் `repair()` இயங்குகிறது. செல்லாத attribute-க்கு சரிசெய்த node-ஐத் திருப்புங்கள்; தக்கவைக்க முடியாத node-க்கு `null`-ஐத் திருப்புங்கள். `ctx.element()`, `ctx.escape()`, `ctx.url()` மூலம் HTML-ஐ உருவாக்குங்கள்; அவற்றின் சரிபார்ப்புகளைத் தவிர்த்து tag, attribute, URL-களை ஒருபோதும் string-ஆக இணைக்காதீர்கள்.

## கட்டளைகளையும் காட்சி நடத்தையையும் பிரியுங்கள்

கட்டளை என்பது ஆவணத்தையும் selection-ஐயும் பெற்று அடுத்த ஆவணத்தையும் அதிலுள்ள selection-ஐயும் தரும் pure function ஆகும். அது DOM-ஐப் படிக்கவோ மாற்றவோ கூடாது; செல்லுபடியான மாற்றம் செய்ய முடியாதபோது `null`-ஐத் திருப்பும். `insertNote` போன்ற verb-ஆல் தொடங்கும் lower camel case-இல் கட்டளைகளுக்குப் பெயரிடுங்கள்.

அட்டவணை drag selection போன்ற DOM-க்கு மட்டுமே உரிய நடத்தையை `attach(host)`-இல் வையுங்கள். ஒவ்வொரு listener அல்லது மாற்றிய attribute-க்கும் உடனடியாக `host.onDispose()` மூலம் cleanup-ஐப் பதிவுசெய்யுங்கள்; அப்போதுதான் அமைப்பு தோல்வியடைந்தாலும் சுத்தம் செய்யப்படும். composing text DOM அல்லது surface-இன் selection mapping-ஐ மாற்றாதீர்கள்.

கருவிப்பட்டி மற்றும் context controls-ஐ `button`, `buttons`, `context` மூலம் அறிவியுங்கள்; அவற்றின் கட்டளை விதிகளை application UI-இல் நகலெடுப்பது UI-யும் ஆவண model-உம் வேறுபடச் செய்யலாம்.

## CSS style-கள்

wing-க்கு அவசியமான அடிப்படை CSS-ஐ `styles`-இல் வையுங்கள். உள்ளமைந்த wing style-கள் ஏற்கனவே `nabi-note/nabi.css`-இல் உள்ளன. தேர்ந்த registry style-களை அமைக்கும் உலாவி `collectSheets()` மற்றும் `injectSheets()`-ஐப் பயன்படுத்தலாம்; SSR CSS கோப்பை இணைக்க வேண்டும்.

திருத்தலுக்கும் வெளியிடப்பட்ட உள்ளடக்கத்திற்கும் ஒரே class-களையும் data attribute-களையும் பயன்படுத்துங்கள்; ஆனால் திருத்தப்படும் `[data-key]` அமைப்பு, `display`, `white-space`-ஐ மாற்றாதீர்கள். CSS தோற்றத்தை மட்டுமே மாற்ற வேண்டும்; caret mapping-ஐ அல்ல.

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

`toHtml()` உருவாக்கும் class அல்லது data attribute-களை மட்டும் குறிவையுங்கள். சேவைக்கே உரிய மாற்றங்களை `.article-body .ex-callout` போலக் குறுகிய selector-ஆக வைத்திருங்கள்.

## முழு ஒப்பந்தத்தையும் சரிபாருங்கள்

சேமித்த JSON ஆவணம் மீண்டும் ஏற்றப்படும்போது அதே அமைப்பிற்கும் HTML-க்கும் திரும்புகிறதா எனச் சரிபாருங்கள். செல்லாத பெயர்கள், நகல் கட்டளைகள், காணாத builder-கள், பூர்த்தியாகாத சார்புகளை registry மறுக்கிறதா எனச் சோதியுங்கள். செல்லாத HTML இறக்குமதி மற்றும் `repair()` உள்ளீடு, கட்டளை selection கையாளுதல், SSR வெளியீடு, வடிவமைக்கப்பட்ட வெளியிடப்பட்ட காட்சி ஆகியவற்றையும் சோதிக்கவும்.

முழுமையான வகைகள் மற்றும் factory argument-களுக்கு, நிறுவிய declaration-களையும் [ஆங்கில API reference](https://nabi.saro.me/llms/api-reference.md)-ஐயும் பார்க்கவும்.
