---
title: بنیادی استعمال
description: npm سے حاصل کر کے ایک nabi آبجیکٹ کھڑا کریں، اور دو مداخل و تین مخارج سے دستاویز کا تبادلہ کریں۔
---

# بنیادی استعمال

یہ npm والا راستہ ہے۔ ایک `<script>` سطر سے استعمال کا راستہ
[{{ t('menu_intro_cdn') }}](./cdn) میں ہے۔

```sh
npm i nabi-note
```

---

## ٹکڑوں کو جوڑنا

میزبان جگہ بناتا ہے اور mount ایک ایک کر کے جوڑتا ہے۔ نیچے کم از کم ترتیب ہے، اور
ہر wing کی دستاویز میں دکھائی جانے والی مثال اسی ڈھانچے میں ایک دو wing جوڑنے کی
شکل ہوتی ہے۔

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'ur' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'ur' })
mountSticky({ root: app, surface })

// قدر بدلنے پر — یہاں اپنا کوڈ لگائیں
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

جگہ میزبان بناتا ہے، مگر **اس جگہ کی شکل کور جانتا ہے** — mount خود اپنے ظرف پر
`.nabi-toolbar-row`·`.nabi-context`·`.nabi-editing` لگا دیتا ہے، اور آلات کا ڈبہ
بھی خود کھڑا کرتا ہے۔ مطلب یہ کہ میزبان کو خود سے ترتیب بنانے کی ضرورت نہیں، اسی
لیے اوپر کے مارک اپ میں صرف تین کلاسیں ہیں۔

- **`class="nabi"`** — رنگ کے ٹوکن اور سٹائل شیٹ صرف اسی کے اندر رہتے ہیں۔ یہ وہ
  ڈبہ بھی ہے جسے مکمل سکرین پوری طرح جما دیتی ہے، اس لیے ٹول بار اور ترمیمی حصہ
  **دونوں** اس کے اندر ہونا ضروری ہیں۔
- **`class="nabi-toolbar"`** — ٹول بار سطر اور سیاق سطر کو ایک ٹکڑا بنا کر **اوپر
  چپکاتا (sticky) ہے۔** دونوں الگ چپکیں تو سیاق سطر ابھرنے پر متن دھکیلا جاتا ہے
  اور سکرین ہلتی ہے۔
- **`class="nabi-content" contenteditable`** — ترمیمی حصہ خود۔

اگر سائٹ پر کوئی مقررہ ہیڈر ہے تو `--nabi-sticky-top` سے اتنا نیچے کر دیں، اور
`mountSticky()` لگا لیں تو موبائل کی بورڈ نے سکرین کو جتنا دھکیلا اسے کور خود
ناپ کر واپس کر دیتا ہے۔

**سٹائل شیٹ میزبان لگاتا ہے۔** bundler استعمال کریں تو `import 'nabi-note/nabi.css'`
ایک سطر کافی ہے، اور صرف رجسٹر شدہ wing کا CSS چاہیے تو
`injectSheets(document, collectSheets(registry))` بلائیں۔

دکھانے کی زبان ہر mount میں `locale` سے طے ہوتی ہے — دستاویز کا متن ویسا ہی رہتا
ہے، صرف ٹول بار اور سیاق سطر کے نام بدلتے ہیں۔ منتخب کرنے والا (picker) بنانا ہو
تو پیکج کی نکالی ہوئی `LOCALES` (کوڈ کی فہرست) استعمال کریں۔

| تعمیر | لازمی | کام |
|---|---|---|
| `createNabiWith(wings, options?)` | ہاں | `{ nabi, registry }` واپس دیتا ہے۔ DOM کی ضرورت نہیں |
| `mountSurface({ nabi, registry, root })` | ہاں | کیریٹ، IME اور ان پٹ کو nabi-tree سے دوبارہ ملاتا ہے۔ رجسٹر شدہ wing کا `attach` بھی ساتھ لگاتا ہے |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | نہیں | مین ٹول بار۔ اس کے بغیر بھی `applyCommand()` سے براہِ راست ترمیم ممکن ہے |
| `mountContextToolbar({ nabi, registry, root, surface? })` | نہیں | کیریٹ کی جگہ کے مطابق سیاق سطر (جدول کی قطار و کالم، کوڈ کی زبان، لنک کا پتہ و نام وغیرہ) |
| `mountHints({ toolbar, context?, root, surface? })` | نہیں | Shift دو بار دبانے پر نکلنے والا شارٹ کٹ بیج |
| `mountViewTools({ nabi, surface, root, container })` | نہیں | پیش نظارہ اور مکمل سکرین کے دو بٹن۔ `root` وہ `.nabi` ڈبہ ہے جسے مکمل سکرین جمائے گی |
| `mountSticky({ root, surface })` | نہیں | موبائل کی بورڈ نے سکرین کو جتنا دھکیلا اس کے مطابق چپکا ہوا ٹول بار واپس کرتا ہے |
| `mountPickedMark({ nabi, surface })` | نہیں | تصویر یا ویڈیو چننے کا نشان (براؤزر خود نہیں دکھاتا) |
| `mountFile({ nabi, store, name? })` | save·open استعمال کریں تو | `.nabi` فائل کے طور پر محفوظ کرنا اور کھولنا |
| `mountLocalHistory({ nabi, storage })` | localHistory استعمال کریں تو | مقررہ وقفے پر براؤزر میں ریکارڈ کرنا |
| `mountUpload({ … })` + `mountUploadView({ … })` | upload استعمال کریں تو | ڈراپ، پیسٹ یا فائل چننے کی اپ لوڈ پیش رفت اور اس کا اظہار |

**تصویر، چیک، جدول کے خانے کو گھسیٹنا اور کوڈ کی رنگ کاری کے لیے الگ سے کوئی mount
نہیں چاہیے** — یہ سب wing خود `attach` سے اٹھائے ہوتی ہے، اور `mountSurface` انہیں
خود ساتھ لگا دیتا ہے۔ کوڈ کی رنگ کاری کے لیے صرف رنگ کرنے والا جوڑ دیں
(`makeCodeAttach`، دیکھیں [{{ t('menu_wing_code') }}](../wing/block/code))۔

wing بدلنی ہو تو یہ سارا ٹکڑا اکٹھا کریں (`unmount()`) اور نئے سرے سے بنائیں —
ہٹائی گئی wing جو مارک اپ رکھتی تھی وہ اسی جگہ سادہ متن بن کر گر جاتا ہے۔ اس سائٹ
کا ڈیمو دراصل اسی طرح چلتا ہے — wing کا چپ بند کر کے دوبارہ کھولیں تو تعمیر پوری
دوبارہ بنتی ہے۔

رنگ اور شکل کے CSS متغیرات [{{ t('menu_style_custom') }}](../style/custom) میں
ہیں۔

---

## دستاویز نکالنے کے تین طریقے

```ts
nabi.getHtml()        // محفوظ کرنے اور شائع کرنے کے لیے HTML
nabi.getJson()        // nabi-tree (JSON)
nabi.getEditorHtml()  // ابھی ایڈیٹر سکرین کا HTML (اس پر data-key لگا ہے)
```

**محفوظ کرنے کی قدر پہلے دو میں سے ایک ہے۔** `getEditorHtml()` پر سکرین کا خاص
نشان (`data-key`) لگا ہے، یہ باہر بھیجنے والی قدر نہیں — یہ جگہ سرور سے ایڈیٹر
پہلے سے کھینچ کر بھیجنے (SSR) کے لیے ہے۔

باہر جانے والا JSON اس طرح دکھتا ہے۔ **دستاویز بلاکس کی ایک صف ہے،** اسے لپیٹنے
والی کوئی جڑ node نہیں ہے۔

```json
[
  {"w":"p","a":{"h":2},"ch":["عنوان"]},
  {"w":"p","ch":["متن ",{"w":"b","ch":["جلی"]}," اور ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["لنک"]}]},
  {"w":"p","a":{"a":"c"},"ch":["درمیان"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["ایک"]}]},
    {"w":"li","ch":[{"w":"p","ch":["دو"]}]}]}]}
]
```

پڑھنے کے قواعد صرف چار ہیں۔

- **`w` وہ wing کا id ہے جو اُس node کو کھینچتا ہے۔** محفوظ الفاظ صرف دو ہیں —
  `p` (پیراگراف) اور `br` (سطر) — باقی سب رجسٹر کی گئی wing کے id ہیں، جیسے `b`،
  `ul`، `li`۔ سرخی الگ wing نہیں بلکہ **پیراگراف کی خاصیت** ہے
  (`{"w":"p","a":{"h":2}}`)۔
- **سٹرنگ ہو تو حرف، آبجیکٹ ہو تو wing۔** صنف بتانے کے لیے کوئی الگ خانہ نہیں۔
- **`a` وہ قدر ہے جو اُس wing نے تھامی ہے** — لنک کا پتہ، ہائی لائٹ کا رنگ، سرخی
  کا درجہ وغیرہ۔ قدر نہ ہو تو خانہ بھی نہیں ہوتا۔ سیدھ کی قدر بھی `a` ہی ہے مگر
  یہ اسی خانے کے **اندر** بیٹھی ہے، اس لیے الجھن نہیں ہوتی
  (`{"w":"p","a":{"a":"c"}}` — درمیان میں سیدھا کیا گیا پیراگراف)۔
- **جدول، فہرست، تصویر جیسی چیز جو پیراگراف کی جگہ لیتی ہے اسے ایک پیراگراف ایک
  تہہ میں لپیٹتا ہے** (اوپر `ul` دیکھیں)۔ وہی پیراگراف سیدھ اٹھاتا ہے، اور کیریٹ
  کو اُس چیز کے آگے پیچھے کھڑا ہونے کی جگہ یہی دیتا ہے۔ HTML میں یہ
  `<div data-nabi-p>` بن کر نکلتا ہے — کیونکہ `<p>` قواعد کے لحاظ سے جدول یا
  فہرست کو نہیں سما سکتا۔

اندر گھومنے والی ٹری میں ہر node پر ایک اضافی کلید `_id` بھی ہوتی ہے — یہ **وہ
اندرونی پتہ ہے جس سے کیریٹ node کو پکڑتا ہے،** زیادہ تر ترمیم میں نئے سرے سے دیا
جاتا ہے، اور باہر جاتے وقت اتار دیا جاتا ہے (اوپر کی مثال میں 470 سے 323 بائٹ)۔
باہر نکلی ہوئی قدر کو سیدھا `setJson()` میں دوبارہ ڈال دیا جا سکتا ہے۔

---

## دستاویز اندر ڈالنے کے چار طریقے

```ts
createNabiWith(wings, { doc })   // پہلے سے بنے ہوئے nabi-tree سے شروع
nabi.setJson(json)               // nabi-tree سے پورا بدل دینا
nabi.setHtml(html)               // HTML سٹرنگ سے پورا بدل دینا
nabi.applyCommand('setHeading', { value: 2 })  // ترمیمی command (وہی دروازہ جو wing استعمال کرتی ہے)
```

چاروں **کامیابی یا ناکامی کا جواب `boolean` سے دیتے ہیں۔** exception نہیں پھینکتے،
اور ناکام ہوں تو دستاویز کو ہاتھ نہیں لگاتے۔

| جہاں جواب `false` ہو | |
|---|---|
| `setJson` | nabi-tree کی شکل نہیں ہے |
| `setHtml` | `parseHtml` اڈاپٹر نہیں جوڑا گیا (نیچے دیکھیں) یا ترمیم لاک ہے |
| `applyCommand` | ایسا کوئی command نہیں، یا **کچھ بدلا ہی نہیں** |

آخری سطر ایک قاعدہ ہے — **کچھ نہ بدلے تو خاموشی ہے۔** پہلے سے سطح 2 کی سرخی والے
پیراگراف پر دوبارہ `setHeading` لگائیں تو جواب `false` آتا ہے، نہ undo کا نکتہ
بنتا ہے نہ کوئی سگنل نکلتا ہے۔

### `setHtml` کو اڈاپٹر کی ضرورت ہے

HTML پڑھنے کا کام براؤزر کا `DOMParser` کرتا ہے۔ کور DOM کو نہیں جانتا، اس لیے
اعلان کے وقت وہ اڈاپٹر جوڑ دیں۔

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` کو اڈاپٹر کی ضرورت نہیں — محفوظ کیا گیا JSON **سرور (Node.js) پر بھی
جوں کا توں** ڈالا جا سکتا ہے۔ جوڑنا (`getHtml`) بھی DOM استعمال نہیں کرتا، اس لیے
سرور پر JSON پڑھ کر HTML بنا کر بھیجنے کا راستہ کھلا رہتا ہے۔

---

## ایڈیٹر کے صارف سے سوال پوچھنے کا راستہ

فائل کھولتے وقت "غیر محفوظ لکھائی موجود ہے، پھر بھی کھولیں؟" جیسا سوال چاہیے ہو
سکتا ہے۔ وہ ڈبہ **اعلان کے وقت ایک بار** جوڑا جاتا ہے۔

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | شکل |
|---|---|
| `message` | `(text: string) => void` — ایک پیغام، کوئی جواب نہیں لیتا |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — sync یا async دونوں قبول کرتا ہے |

**کور خود بخود براؤزر کے ڈائیلاگ استعمال نہیں کرتا۔** جس صفحے کا اپنا ڈائیلاگ ہو
اس میں سرمئی ڈبہ دخل نہیں دینا چاہیے، اور پلگ اِن (IntelliJ، VS Code) میں
`window.confirm` بالکل موجود ہی نہیں ہوتا۔ اوپر کی تین سطریں میزبان بناتا ہے۔

::: warning نہ دیں تو جواب "نہیں" ہے
جس سوال کا کوئی جواب نہ دے وہ "ہاں" نہیں ہے — یہ منسوخی، Escape یا ونڈو بند کرنے
جیسا ہی معنی رکھتا ہے۔ یہ جواب "غیر محفوظ لکھائی چھوڑ کر کھولوں؟" جیسی جگہ پر
لگتا ہے، اس لیے سوال پوچھنے والا نہ ہونے کی صورت میں چیز کو ضائع کرنے کی طرف نہیں
جانا چاہیے۔ سرور (Node) پر بھی یہی قدر خاموشی سے گزر جاتی ہے۔
:::

**یہ ایک ہی ایڈیٹر کی چیز ہے** — عالمی (global) نہیں، اس لیے ایک صفحے کے دو
ایڈیٹر مختلف انداز سے سوال پوچھ سکتے ہیں۔ wing کو بھی وہی ملتا ہے (`nabi.$ask`) —
اس کی تفصیل [{{ t('menu_wing_custom') }} ▸ UI اور برتاؤ](../wing/custom/ui) میں
ہے۔

---

## اس ایڈیٹر کا نام اور "کیا بدلا ہے"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <یونکس وقت>-<nonce>، ہر انسٹینس کے لیے ایک
nabi.isChanged() // آخری بنیادی خط کے بعد دستاویز میں کچھ حرکت ہوئی یا نہیں
```

`sessionId` ایک بار بنتا ہے اور بدلتا نہیں۔ وقت بتاتا ہے کہ یہ ایڈیٹر کب کھڑا ہوا،
اسی سے ترتیب خود بخود بن جاتی ہے، اور nonce وہی ملی سیکنڈ میں کھڑے ہوئے دو
ایڈیٹروں کو الگ کرتا ہے۔ یہ خاکہ، لاگ اور خودکار محفوظ کاری کی کلید پر لگایا جانے
والا نام ہے۔

`isChanged()` کا **بنیادی خط نیا صرف تین چیزیں کھینچتی ہیں** — دستاویز کو پورا
اندر ڈالنا (`createNabiWith({ doc })`، `setJson()`، `setHtml()`) اور محفوظ ہونے
کی اطلاع۔

```ts
nabi.$markSaved(savedDoc)   // محفوظ ہو جانے کے بعد — وہی ٹری دیں جو اُس وقت محفوظ ہوئی
```

**محفوظ ہونے کے اُس لمحے کی ٹری دیں** (ابھی کی ٹری نہیں)۔ کیونکہ محفوظ کاری میں
دیر لگنے کے دوران ٹائپ کیا گیا حرف بھی "بدلا ہوا" ہی رہنا چاہیے۔ محفوظ کرنے والی
wing (`save`) فائل واقعی لکھے جانے کے بعد اسے بلاتی ہے، اس لیے `.nabi` میں محفوظ
کرنے پر `isChanged()` کی قدر `false` ہو جاتی ہے۔

**واپس پہلی جگہ پر آ جانے پر بھی دوبارہ `false` ہو جاتا ہے** — کیونکہ nabi-tree
ناقابلِ تبدیل ہے اور ہر ترمیم پر پوری بدل جاتی ہے، تو دستاویز ایک جیسی ہے یا نہیں
یہ جاننے کے لیے چھاننے یا hash کرنے کی ضرورت نہیں، یہ اُسی جگہ معلوم ہو جاتا ہے۔

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## اگلی دستاویزات

- [{{ t('menu_intro_ssr') }}](./ssr) — محفوظ شدہ دستاویز کو سرور پر پہلے سے کھینچنا، اور `hydrate` سے سنبھالنا
- [{{ t('menu_intro_cdn') }}](./cdn) — بغیر بلڈ ٹول کے، صرف ایک `<script>` سے
- [{{ t('menu_wing_custom') }}](../wing/custom) — جو فارمیٹنگ موجود نہیں اسے خود بنانا

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
