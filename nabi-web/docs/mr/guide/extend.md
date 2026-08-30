---
title: सानुकूल wings
description: टिकाऊ document feature जोडण्याचा करार आणि अंमलबजावणीचा क्रम.
---

# सानुकूल wings

सानुकूल wing हे toolbar button पेक्षा अधिक आहे. ते साठवलेली document structure, commands, HTML व Markdown conversion, import rules आणि view behavior एकत्र ठेवणारे declarative extension आहे. संपादक तयार होण्यापूर्वी registry त्याची पडताळणी करते आणि अवैध रचना दस्तऐवजात येण्यापासून रोखते.

## सर्वात नेमक्या factory पासून सुरू करा

बहुतेक formatting साठी पूर्ण declaration लागत नाही. value नसलेल्या inline mark साठी `simpleMark()`, मर्यादित value set असलेल्या mark साठी `valueMark()`, children नसलेल्या block साठी `boxObject()`, आणि list साठी `listFamily()` वापरा.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## wings चे अनेक प्रकार तयार करा

खालील प्रत्येक उदाहरणाची साठवलेली रचना वेगळी आहे. आधी एक नोंदवा आणि `getJson()` व `getHtml()` तपासा. रचना कार्यरत झाल्यावरच commands आणि buttons जोडा.

### 1. value नसलेला inline mark: जोर

एखादे feature केवळ text भोवती आवरण घालत असेल तेव्हा `simpleMark()` वापरा. हे `exStrong` साठवते आणि `<strong>` म्हणून render करते.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

`clearable: true` असल्यास Clear formatting हा mark देखील काढतो. button जोडण्यापूर्वी `nabi.applyCommand()` किंवा दुसऱ्या custom command ने तो लागू करा. तोच `.nabi-content strong` selector संपादक आणि प्रकाशित मजकुराला style करतो.

### 2. value असलेला inline mark: स्थितीचा tone

परवानगीच्या set मधून निवडलेल्या color, size किंवा state साठी `valueMark()` वापरा. value `a.v` मध्ये साठवले जाते; सूचीबाहेरील values `repair()` दरम्यान काढल्या जातात.

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

त्याचे साठवलेले रूप `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }` आहे. CSS साठवलेल्या value ला लक्ष्य करते, त्यामुळे प्रकाशित मजकूरही बदलतो. अस्तित्वात असलेल्या list मधून values सहज काढू नका: आधी साठवलेले दस्तऐवज वाचताना त्या गमावू शकतात.

### 3. children नसलेला block: divider

image, video किंवा divider यांसारख्या children नसलेल्या स्वतंत्र object साठी `boxObject()` वापरा.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

URL किंवा width सारखी values असलेल्या object साठी `attrs` मध्ये validation घोषित करा आणि आवश्यक values `requires` मध्ये ठेवा. तपासता न येणारी value गुपचूप default ने बदलण्याऐवजी `null` ने नाकारा.

### 4. अनेक paragraphs असलेला block: callout

document content धारण करणाऱ्या block साठी `container` घोषित करा. `holds: 'blocks'` paragraph, list आणि object-block children ना परवानगी देते.

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

हे declaration एकटे निवडलेले paragraphs wrap करण्याचा मार्ग तयार करत नाही. feature editor UI मध्ये उघड करण्यापूर्वी `commands` मध्ये pure command आणि तो invoke करणारे `button` जोडा.

### 5. जुळणारी list आणि item जोडी

list आणि item नेहमी एकत्र असणे आवश्यक असेल तेथे `listFamily()` वापरा.

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

`listFamily()` list मधील block ला item मध्ये wrap करून दुरुस्त करते. checked state सारख्या item-level value साठी `itemDecl` आणि `repairItem` जोडा.

### एका क्रमबद्ध निवडीत नोंदवा

ब्राउझरप्रमाणे server वरही तेच declarations त्याच क्रमाने वापरा.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'mr' })
```

## नावे आणि document structure ठरवा

document मध्ये येणारी नावे `ex[A-Z0-9]...` शी जुळली पाहिजेत. `exCallout` सारखे नाव पुढील अधिकृत wing ला साठवलेल्या content चा अर्थ बदलण्यापासून रोखते.

`place` साठवलेली रचना ठरवते: `mark` inline content wrap करते, `void` हा children नसलेला block आहे, `container` children धरते, `attr` paragraph attributes बदलते आणि `tool` कोणताही document node तयार करत नाही. `container` ला `holds: 'blocks' | 'inline'` आणि `toHtml()` लागतात.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf` आणि `parts` रचनात्मक बंधने घोषित करतात. `parts` declaration ला प्रत्येक part साठी `partHtml` देखील लागते. value निवडणाऱ्या wing ला मर्यादित करण्यासाठी `attrKey` आणि `attrValues` वापरा.

## प्रत्येक declaration option

wing ला लागते तेवढेच घोषित करा. काही fields factory आधीच पुरवते.

| क्षेत्र | Options | उद्देश |
| --- | --- | --- |
| मूलभूत | `w`, `place`, `basic`, `styles` | नाव, रचनात्मक प्रकार, basic-catalog सदस्यता, default CSS |
| रचना | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Child प्रकार, Enter behavior, परवानगीचे attributes, boolean attributes |
| रचना | `parts`, `allows`, `noAlign`, `requiresAnyOf` | अंतर्गत parts, परवानगीचे children, alignment वगळणे, wing dependency |
| Values | `attrKey`, `attrValues`, `currentValue` | साठवलेली value key व list, current-value detection |
| Commands आणि input | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Commands, key handling, Escape/double-key behavior, autoformat rules |
| Surface behavior | `attach` | surface साठी DOM behavior व cleanup |
| Conversion | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML व Markdown output |
| Import आणि repair | `claim`, `ioFilter`, `repair`, `partRepair` | HTML import, file handling, JSON validation व repair |
| UI | `button`, `buttons`, `context` | Toolbar व context UI declarations |
| Clear formatting | `clearable` | Clear formatting ते काढते का |

`w` आणि `place` नेहमी आवश्यक आहेत. node तयार करणाऱ्या `mark`, `void` आणि `container` wings ना `toHtml()` देखील लागते. container ला `holds` लागते; प्रत्येक घोषित part ला त्याचा `partHtml` लागतो.

## HTML, Markdown आणि JSON एकत्र ठेवा

`toHtml()` साठवलेल्या node चे HTML मध्ये rendering करते, तर `toMd()` Markdown export करते. Markdown builder नसल्यास माहिती हरवू नये म्हणून तयार झालेले HTML राखले जाते. import करताना फक्त तुमचा HTML element आणि पडताळलेले attributes ओळखण्यासाठी `claim()` वापरा.

JSON लोड होताना आणि commands नंतर पुन्हा `repair()` चालते. अवैध attribute साठी दुरुस्त केलेला node परत करा, किंवा राखता न येणाऱ्या node साठी `null` परत करा. `ctx.element()`, `ctx.escape()` आणि `ctx.url()` ने HTML तयार करा; त्या तपासण्यांना वगळून tags, attributes किंवा URLs जोडू नका.

## commands आणि view behavior वेगळे ठेवा

command हा document आणि selection चा pure function असून पुढचा document आणि त्यातील selection परत करतो. तो कधीही DOM वाचत किंवा बदलत नाही, आणि वैध बदल करता न आल्यास `null` परत करतो. `insertNote` प्रमाणे क्रियापदाने सुरू होणारी lower camel case नावे commands ला द्या.

table drag selection सारखे फक्त DOM मधील behavior `attach(host)` मध्ये ठेवा. अयशस्वी setup सुद्धा साफ होण्यासाठी प्रत्येक listener किंवा बदललेल्या attribute चे cleanup `host.onDispose()` ने लगेच नोंदवा. composing text DOM किंवा surface चे selection mapping बदलू नका.

toolbar आणि context controls `button`, `buttons` आणि `context` ने घोषित करा; त्यांच्या command rules ची application UI मध्ये पुनरावृत्ती केल्यास UI आणि document model वेगळे होऊ शकतात.

## CSS styles

wing ला आवश्यक baseline CSS `styles` मध्ये ठेवा. built-in wing styles `nabi-note/nabi.css` मध्ये आधीच आहेत. निवडलेले registry styles जोडणारा browser `collectSheets()` आणि `injectSheets()` वापरू शकतो; SSR ने त्याऐवजी CSS file ला link करावे.

editing आणि प्रकाशित मजकुरासाठी तेच classes आणि data attributes वापरा, पण editing `[data-key]` structure, `display` किंवा `white-space` बदलू नका. CSS ने फक्त appearance बदलले पाहिजे, caret mapping नाही.

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

फक्त `toHtml()` ने तयार केलेले classes किंवा data attributes लक्ष्य करा. उदाहरणार्थ `.article-body .ex-callout` प्रमाणे service-specific बदल अधिक मर्यादित ठेवा.

## संपूर्ण करार तपासा

साठवलेला JSON document पुन्हा लोड केल्यावर तीच रचना आणि HTML मिळते याची खात्री करा. registry अवैध नावे, duplicate commands, missing builders आणि न पूर्ण झालेल्या dependencies नाकारते का ते तपासा. अवैध HTML import व `repair()` input, command selection handling, SSR output आणि styled published view तपासा.

पूर्ण types आणि factory arguments साठी स्थापित declarations आणि [English API reference](https://nabi.saro.me/llms/api-reference.md) तपासा.
