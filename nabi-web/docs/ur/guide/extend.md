---
title: حسب ضرورت ونگز
description: مستقل دستاویزی خصوصیت شامل کرنے کا معاہدہ اور عمل درآمد کی ترتیب۔
---

# حسب ضرورت ونگز

حسب ضرورت ونگ صرف ٹول بار بٹن سے زیادہ ہے۔ یہ ایک اعلانیہ توسیع ہے جو محفوظ شدہ دستاویز کی ساخت، commands، HTML اور Markdown تبدیلی، امپورٹ قواعد اور منظر کے رویے کو اکٹھا رکھتی ہے۔ registry ایڈیٹر بننے سے پہلے اس کی توثیق کرتی ہے، اور غلط ساختوں کو دستاویزات میں آنے سے روکتی ہے۔

## سب سے محدود factory سے آغاز کریں

زیادہ تر فارمیٹنگ کو مکمل declaration کی ضرورت نہیں ہوتی۔ قدر کے بغیر inline mark کے لیے `simpleMark()`، محدود قدروں والے mark کے لیے `valueMark()`، بچوں کے بغیر بلاک کے لیے `boxObject()`، اور فہرست کے لیے `listFamily()` استعمال کریں۔

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## ونگ کی کئی اقسام بنائیں

ذیل کی ہر مثال کی محفوظ ساخت مختلف ہے۔ پہلے ایک کو رجسٹر کریں اور `getJson()` اور `getHtml()` دیکھیں۔ ساخت کام کرنے کے بعد ہی commands اور buttons شامل کریں۔

### 1. قدر کے بغیر inline mark: تاکید

جب کوئی خصوصیت صرف متن کو لپیٹے تو `simpleMark()` استعمال کریں۔ یہ `exStrong` محفوظ کرتا ہے اور اسے `<strong>` کے طور پر رینڈر کرتا ہے۔

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

`clearable: true` کے ساتھ، فارمیٹنگ صاف کریں اس mark کو بھی ہٹا دیتا ہے۔ بٹن شامل کرنے سے پہلے اسے `nabi.applyCommand()` یا کسی دوسری حسب ضرورت command سے لاگو کریں۔ یہی `.nabi-content strong` سلیکٹر ایڈیٹر اور شائع شدہ مواد کو طرز دیتا ہے۔

### 2. قدر کے ساتھ inline mark: حالت کا لہجہ

اجازت یافتہ مجموعے سے چنے ہوئے رنگ، حجم یا حالت کے لیے `valueMark()` استعمال کریں۔ قدر `a.v` میں محفوظ ہوتی ہے؛ فہرست سے باہر کی قدریں `repair()` کے دوران ہٹا دی جاتی ہیں۔

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

اس کی محفوظ شکل `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }` ہے۔ CSS محفوظ قدر کو ہدف بناتی ہے، اس لیے شائع شدہ مواد بھی بدلتا ہے۔ موجودہ فہرست سے قدریں بے پروائی سے نہ ہٹائیں: پہلے محفوظ شدہ دستاویزات پڑھنے پر انہیں کھو سکتی ہیں۔

### 3. بچوں کے بغیر بلاک: divider

تصویر، ویڈیو یا divider جیسے بچوں کے بغیر خود مختار آبجیکٹ کے لیے `boxObject()` استعمال کریں۔

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

URL یا چوڑائی جیسی قدروں والے آبجیکٹ کے لیے `attrs` میں توثیق کا اعلان کریں اور مطلوبہ قدریں `requires` میں رکھیں۔ خاموشی سے طے شدہ قدر بدلنے کے بجائے ناقابلِ توثیق قدر کو `null` سے رد کریں۔

### 4. کئی پیراگراف والا بلاک: callout

دستاویزی مواد رکھنے والے بلاک کے لیے `container` کا اعلان کریں۔ `holds: 'blocks'` پیراگراف، فہرست اور آبجیکٹ بلاک بچوں کی اجازت دیتا ہے۔

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

یہ declaration اکیلا منتخب پیراگراف لپیٹنے کا راستہ نہیں بناتا۔ خصوصیت کو ایڈیٹر UI میں ظاہر کرنے سے پہلے `commands` میں pure command اور اسے چلانے والا `button` شامل کریں۔

`isolating: true` کئی پیراگراف کی اجازت دیتا ہے، مگر حذف کو معلوماتی باکس کی حد پار کر کے ساتھ کے مواد سے ملنے سے روکتا ہے۔ `scopedCommands` میں درج کمانڈز باکس کے اندر کی دستاویز پر چلتی ہیں، اس لیے تصویر یا جدول داخل کرنا اور فہرست یا اقتباس میں بدلنا باکس کے اندر رہتا ہے۔

### 5. ملتی ہوئی فہرست اور item جوڑی

جہاں فہرست اور item کو ہمیشہ اکٹھا ہونا ہو وہاں `listFamily()` استعمال کریں۔

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

`listFamily()` فہرست کے اندر بلاک کو item میں لپیٹ کر درست کرتا ہے۔ checked حالت جیسی item سطح کی قدر کے لیے `itemDecl` اور `repairItem` شامل کریں۔

### ایک مرتب انتخاب میں رجسٹر کریں

سرور پر وہی declarations اسی ترتیب میں استعمال کریں جو براؤزر میں ہیں۔

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

## نام اور دستاویز کی ساخت متعین کریں

دستاویز میں آنے والے ناموں کا `ex[A-Z0-9]...` سے ملنا ضروری ہے۔ `exCallout` جیسا نام کسی آئندہ سرکاری ونگ کو محفوظ شدہ مواد کا معنی بدلنے سے روکتا ہے۔

`place` محفوظ شکل طے کرتا ہے: `mark` inline مواد کو لپیٹتا ہے، `void` بچوں کے بغیر بلاک ہے، `container` بچے رکھتا ہے، `attr` پیراگراف کے اوصاف بدلتا ہے، اور `tool` کوئی دستاویزی node نہیں بناتا۔ `container` کو `holds: 'blocks' | 'inline'` اور `toHtml()` درکار ہیں۔

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`، `boolAttrs`، `allows`، `requiresAnyOf` اور `parts` ساختی پابندیاں بیان کرتے ہیں۔ `parts` declaration کو ہر part کے لیے `partHtml` بھی درکار ہے۔ قدر منتخب کرنے والے ونگ کو محدود کرنے کے لیے `attrKey` اور `attrValues` استعمال کریں۔

## declaration کا ہر اختیار

صرف وہی اعلان کریں جس کی ونگ کو ضرورت ہو۔ factory پہلے ہی آپ کے لیے کچھ fields مہیا کرتی ہے۔

| حصہ | اختیارات | مقصد |
| --- | --- | --- |
| بنیاد | `w`, `place`, `basic`, `styles` | نام، ساختی قسم، بنیادی کیٹلاگ رکنیت، طے شدہ CSS |
| ساخت | `holds`, `singleParagraph`, `isolating`, `attrs`, `boolAttrs` | بچوں کی قسم، Enter کا رویہ، ترمیمی حدود کی حفاظت، مجاز attributes، boolean attributes |
| ساخت | `parts`, `allows`, `noAlign`, `requiresAnyOf` | اندرونی حصے، اجازت یافتہ بچے، سیدھ سے اخراج، ونگ انحصار |
| قدریں | `attrKey`, `attrValues`, `currentValue` | محفوظ قدر کی key اور فہرست، موجودہ قدر کی شناخت |
| commands اور input | `commands`, `scopedCommands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | کمانڈز، اندرونی دستاویز پر چلنے والی کمانڈز، کلید کی ہینڈلنگ، Escape/دو بار دبانا، خودکار تبدیلی |
| surface رویہ | `attach` | surface کے لیے DOM رویہ اور صفائی |
| تبدیلی | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML اور Markdown آؤٹ پٹ |
| امپورٹ اور مرمت | `claim`, `ioFilter`, `repair`, `partRepair` | HTML امپورٹ، فائل handling، JSON توثیق اور مرمت |
| UI | `button`, `buttons`, `context` | ٹول بار اور سیاق UI declarations |
| فارمیٹنگ صاف کریں | `clearable` | آیا فارمیٹنگ صاف کریں اسے ہٹاتا ہے |

`w` اور `place` ہمیشہ درکار ہیں۔ node بنانے والے `mark`، `void` اور `container` ونگز کو `toHtml()` بھی درکار ہے۔ container کو `holds` درکار ہے؛ ہر declared part کو اس کا متعلقہ `partHtml` چاہیے۔

## HTML، Markdown اور JSON کو اکٹھا رکھیں

`toHtml()` محفوظ node کو HTML میں رینڈر کرتا ہے، جبکہ `toMd()` Markdown برآمد کرتا ہے۔ Markdown builder کے بغیر، بنایا گیا HTML برقرار رہتا ہے تاکہ معلومات ضائع نہ ہوں۔ امپورٹ کرتے وقت صرف اپنے HTML عنصر اور توثیق شدہ اوصاف پہچاننے کے لیے `claim()` استعمال کریں۔

`repair()` JSON لوڈ ہونے پر اور commands کے بعد دوبارہ چلتا ہے۔ غلط وصف کے لیے درست کیا ہوا node، یا ایسے node کے لیے `null` واپس کریں جسے برقرار نہیں رکھا جا سکتا۔ HTML کو `ctx.element()`، `ctx.escape()` اور `ctx.url()` سے بنائیں؛ ان جانچوں کے گرد tags، attributes یا URLs کو کبھی جوڑ کر نہ بنائیں۔

## commands کو منظر کے رویے سے الگ رکھیں

command، دستاویز اور انتخاب کا pure function ہے جو اگلی دستاویز اور اس کے اندر انتخاب واپس کرتا ہے۔ یہ کبھی DOM نہیں پڑھتا یا بدلتا، اور درست تبدیلی نہ کر سکے تو `null` واپس کرتا ہے۔ commands کے نام فعل سے شروع ہونے والے lower camel case میں رکھیں، جیسے `insertNote`۔

صرف DOM والا رویہ، جیسے جدول drag selection، `attach(host)` میں رکھیں۔ ہر listener یا بدلے ہوئے attribute کے لیے فوراً `host.onDispose()` سے cleanup رجسٹر کریں تاکہ ناکام setup کی بھی صفائی ہو۔ composing متن DOM یا surface کی selection mapping نہ بدلیں۔

ٹول بار اور سیاق controls کو `button`، `buttons` اور `context` سے declare کریں؛ ان کے command قواعد کو application UI میں دہرانے سے UI اور دستاویزی ماڈل مختلف ہو سکتے ہیں۔

### بلاک کے اندر کمانڈ چلانا

`scopedCommands` کو `holds: 'blocks'` والے کنٹینرز اور بلاکس رکھنے والے `parts` پر بیان کریں۔ اگر انتخاب کے دونوں سرے ایک ہی علاقے میں ہوں تو کمانڈ کو اس علاقے کی ذیلی دستاویز اور انتخاب کے نسبتی راستے ملتے ہیں، اور نتیجہ واپس بیرونی دستاویز میں لگایا جاتا ہے۔ علاقے کی حد پار کرنے والا انتخاب مسترد ہوتا ہے؛ باہر کمانڈ کا اصل رویہ برقرار رہتا ہے۔ فلوٹ علاقے اور جدول کے سیلز بھی اسی طریقے سے اندراج، تبدیلی اور اپ لوڈ کی حدود برقرار رکھتے ہیں۔

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

فہرست میں صرف وِنگ کمانڈز دی جا سکتی ہیں۔ غیر رجسٹرڈ کمانڈز چھوڑ دی جاتی ہیں، اس لیے تصویر یا اپ لوڈ وِنگ کو ساتھ رجسٹر کرنا لازم نہیں۔ ایسی کمانڈز منتخب کریں جو صرف دی گئی اندرونی دستاویز اور نسبتی راستوں سے کام کریں؛ پوری دستاویز کے مطلق راستے مانگنے یا پوری دستاویز بدلنے والی کمانڈز شامل نہ کریں۔ کور کمانڈز بھی اس فہرست میں نہیں آ سکتیں۔

`singleParagraph` مواد کو ایک پیراگراف تک محدود کرتا ہے؛ `isolating` کئی پیراگراف برقرار رکھ کر Backspace/Delete کو ترمیمی حد پار کرنے سے روکتا ہے۔ بلاکس رکھنے والے `parts` پر بھی `isolating: true` دیا جا سکتا ہے۔

### اندر در اندر بلاکس میں کلید سنبھالنا

`onKey` کو ملنے والا `KeyIntent.shift`، Enter اور Shift+Enter میں فرق کرتا ہے۔ آزاد ترمیمی علاقے میں اندرونی وِنگ `null` لوٹائے تو ہینڈلنگ بالترتیب بالائی وِنگز کو اس علاقے تک دی جاتی ہے۔ اس لیے سیل کی فہرست اور کوڈ پہلے indentation سنبھالتے ہیں؛ غیر سنبھالا گیا Tab سیلز کے درمیان جا سکتا ہے۔ ایک کلید کے ان پٹ پر ایک ہی وِنگ دو بار نہیں بلائی جاتی۔

## CSS طرزیں

ونگ کی مطلوبہ بنیادی CSS کو `styles` میں رکھیں۔ اندرونی ونگ طرزیں پہلے ہی `nabi-note/nabi.css` میں شامل ہیں۔ منتخب registry طرزیں جمع کرنے والا براؤزر `collectSheets()` اور `injectSheets()` استعمال کر سکتا ہے؛ SSR کو اس کے بجائے CSS فائل لنک کرنی چاہیے۔

ترمیم اور شائع شدہ مواد کے لیے ایک ہی classes اور data attributes استعمال کریں، مگر ترمیمی `[data-key]` ساخت، `display` یا `white-space` نہ بدلیں۔ CSS کو صرف ظاہر بدلنا چاہیے، کرسر mapping نہیں۔

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

صرف `toHtml()` کی بنائی ہوئی classes یا data attributes کو ہدف بنائیں۔ سروس مخصوص تبدیلیاں زیادہ محدود رکھیں، مثلاً `.article-body .ex-callout`۔

## پورے معاہدے کی توثیق کریں

تصدیق کریں کہ محفوظ شدہ JSON دستاویز اسی ساخت اور HTML کے ساتھ دوبارہ لوڈ ہوتی ہے۔ آزمائیں کہ registry غلط ناموں، duplicate commands، غائب builders اور غیر پوری dependencies کو رد کرتی ہے۔ غلط HTML امپورٹ اور `repair()` ان پٹ، command selection handling، SSR آؤٹ پٹ اور طرز دیے ہوئے شائع شدہ منظر کو شامل کریں۔

مکمل types اور factory arguments کے لیے نصب شدہ declarations اور [انگریزی API حوالہ](https://nabi.saro.me/llms/api-reference.md) دیکھیں۔
