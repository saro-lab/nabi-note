---
title: تعارف
description: NABI NOTE ایک اوپن سورس WYSIWYG ایڈیٹر ہے جو براؤزر میں چلتا ہے۔
---

# NABI NOTE کیا ہے؟

NABI NOTE ایک براؤزر میں چلنے والا **اوپن سورس WYSIWYG ایڈیٹر** ہے۔


## nabi-tree

HTML کو براہِ راست سنبھالنا سرور سائیڈ پر رک جاتا ہے، جہاں کام کرنے کے لیے کوئی DOM موجود
نہیں۔ اس لیے دستاویز کو **nabi-tree** نامی ایک JavaScript آبجیکٹ کی صورت میں اٹھایا جاتا
ہے، جو دونوں طرف — JSON اور HTML — سیریلائز ہوتا ہے۔ اس تبدیلی کے دوران، دونوں سمتوں میں،
XSS رکھنے والا مواد چھان لیا جاتا ہے۔

> NABI NOTE کی فراہم کردہ ہر wing خود XSS سنبھالتی ہے۔ `کسٹم wing (تھرڈ پارٹی پلگ اِن)` کے
> لیے، اس کے مصنف سے تصدیق کریں کہ وہ بھی ایسا کرتی ہے۔

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## DOM کے بغیر SSR (سرور سائیڈ) سپورٹ

محفوظ کیا ہوا nabi-tree **سرور (Node.js) پر جوں کا توں پڑھ کر** بھیجے جانے والا HTML جوڑا
جا سکتا ہے۔ DOM صرف **ان پٹ** (`setHtml()`) اور سکرین سے جڑنے والے `mount*` کاموں کے لیے
درکار ہے۔

جہاں صرف دکھانا ہو وہاں ایڈیٹر کھڑا کرنے کی ضرورت ہی نہیں — ایک ہی فنکشن کافی ہے۔ یہ محفوظ
شدہ قدر اور `registry` (رجسٹرڈ wings کی فہرست) لیتا ہے، اور جواب میں HTML سٹرنگ دیتا ہے۔

**سرور پر `nabi-note/ssr` سے جوڑا جاتا ہے** — یہ صرف رینڈرنگ کے لیے ضروری چیزیں رکھنے والا
داخلی راستہ ہے، اس لیے ترمیمی سطح اور سکرین کے آلات بالکل لوڈ نہیں ہوتے۔

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// wing کی فہرست سرور شروع ہوتے وقت ایک بار بنائی جاتی ہے — ہر محفوظ قدر یہی ایک registry بانٹتی ہے۔
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['ایک تبصرے کی سطر'] }]   // ڈیٹابیس سے پڑھا گیا nabi-tree
renderStoredHtml(saved, registry)
// '<p>ایک تبصرے کی سطر</p>'
```

**جو nabi-tree نہیں وہ `null` جواب دیتا ہے** — رد کرنے کا قاعدہ `setJson()` جیسا ہی ہے۔ جو
قدر گزر جائے وہ ایڈیٹر کے اپنے `getHtml()` سے **ایک حرف بھی مختلف نہیں ہوتی**، کیونکہ دونوں
ایک ہی مرحلوں (normalize → assemble) سے گزرتے ہیں، اور اسی لیے XSS چھاننے کی جگہ بھی ایک
ہی ہے۔

ایڈیٹر کو سرور پر پہلے سے کھینچنا ہو تو اس کا جوڑا فنکشن استعمال کریں — صرف `data-key`
اضافی لگتا ہے۔

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">ایک تبصرے کی سطر</p>'
```

ایک ہی محفوظ قدر ہمیشہ ایک ہی `data-key` پاتی ہے، اس لیے یہ HTML جوں کا توں بھیج دیں اور
براؤزر میں `mountSurface({ nabi, registry, root, hydrate: true })` سے اپنا لیں تو سکرین
دوبارہ نہیں کھینچی جاتی۔ **اس سائٹ کا اپنا ہوم ڈیمو اسی طرح چلتا ہے** — پہلی نظر میں نظر
آنے والی دستاویز سرور نے کھینچ کر بھیجی تھی، اور ایڈیٹر اسی کے اوپر بیدار ہوتا ہے۔

### تین داخلی راستے

| جو جوڑا جائے | اس میں کیا ہے | کب |
|---|---|---|
| `nabi-note` | پورا ایڈیٹر — جوڑنا، سطح، سکرین کے آلات | جہاں آپ **لکھتے** ہیں |
| `nabi-note/ssr` | صرف وہ جو محفوظ قدر کو HTML میں کھینچتا ہے | سرور، یا صرف پڑھنے والا صفحہ |
| `nabi-note/viewer` | پڑھنے کی طرف کا رویہ (جدول کی ترتیب، کوڈ کی رنگ کاری) | جہاں آپ شائع شدہ HTML **دکھاتے** ہیں |

`nabi-note/ssr` ترمیمی سطح (`surface`) اور سکرین کے آلات (`ui`) کی **ایک فائل بھی نہیں
چھوتا** — ایک جانچ سورس کو چھان کر اس کی ضمانت دیتی ہے۔ اس لیے سرور کے بنڈل میں DOM کوڈ
گھسنے کا کوئی راستہ نہیں۔

## ساری فارمیٹنگ wing ہے

جس اکائی کو دوسرے ایڈیٹر "پلگ اِن" کہتے ہیں، اسے یہاں **wing (پَر)** کہا جاتا ہے۔ کور جو
مارک اپ براہِ راست جانتا ہے وہ پیراگراف (`p`)، سطر توڑ (`br`) اور سادہ متن ہے؛ سرخی، فہرست،
جدول اور جلی — سب wing ہیں۔

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>جلی</b> <i>ترچھا</i></p>')
bare.getHtml()
// '<p>جلی ترچھا</p>'                    — کوئی wing رجسٹر نہیں ہوئی، سب سادہ متن بن گیا۔

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>جلی</b> <i>ترچھا</i></p>')
bold.getHtml()
// '<p><b>جلی</b> ترچھا</p>'              — صرف boldWing رجسٹر ہوئی، اس لیے صرف جلی بچا۔
```

جو مارک اپ wing کی صورت میں رجسٹر نہ ہو وہ **سادہ متن میں بدل جاتا ہے۔** اسی لیے غیر
اعلانیہ HTML کبھی گزر کر نہیں آتا، اور اسی لیے ہر سرکاری طور پر معاون wing نقصان دہ script
کو چھان دیتی ہے۔


## انٹرفیس

دستاویز صرف `applyCommand()` کے ذریعے بدلی جا سکتی ہے۔

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // جلی
nabi.applyCommand('setHeading', { value: 2 })   // H2
nabi.undo()
nabi.redo()
```

command **کامیابی یا ناکامی کا جواب `boolean` میں دیتی ہے۔** کچھ نہ بدلے تو `false` جواب
دیتی ہے اور نہ history میں کوئی نشان چھوڑتی ہے نہ ترمیم کرتی ہے۔


## کوڈ کی تہیں

**اس کا مطلب یہ نہیں کہ قدر اسی ترتیب میں بہتی ہے۔** یہ نیچے سے اوپر تک چنی گئی **انحصار
کی سمت** ہے، اور قاعدہ ایک ہی ہے — **نیچے کی تہہ اوپر کی تہہ کو نہیں جانتی۔** اسی لیے نیچے
کی تہیں (`schema` · `doc` · `html`) DOM کو نہیں چھوتیں، اور یہی وجہ ہے کہ وہ سرور پر جوں
کی توں چلتی ہیں۔ قدر جس راستے سے آتی جاتی ہے وہ اوپر کا nabi-tree خاکہ ہے۔

<LayerStack
  :layers="layers"
  caption=""
/>

یہ ترتیب کوئی تحریری وعدہ نہیں بلکہ **ایک جانچ مشین کے ذریعے اس کی ضمانت دیتی ہے** — تہہ
کے خلاف ایک بھی import بنے تو ٹیسٹ وہیں ٹوٹ جاتا ہے۔


## اصطلاحات

| لفظ | معنی |
|---|---|
| **mark** | حروف پر چڑھنے والی فارمیٹنگ — مثلاً `<b>` · `<i>` · `<a>` |
| **block** | مثلاً پیراگراف · سرخی · فہرست · جدول · تصویر |
| **پیراگراف کی خاصیت** | پیراگراف کی خاصیت — مثلاً سیدھ، ڈراپ کیپ |
| **wrapper پیراگراف** | جدول، فہرست، تصویر جیسی سنگل-پیراگراف چیز کو لپیٹنے والا پیراگراف |
| **claim** | یہ فیصلہ کہ کوئی مارک اپ کس wing کا ہے |
| **parts** | wing کے اندر کا فیچر — مثلاً جدول کی قطاریں اور کالم، تہہ بلاک کی خلاصہ سطر |

### ترمیمی سکرین پر

| لفظ | معنی |
|---|---|
| **caret** | ایڈیٹر کے اندر کا انتخابی کرسر |
| **context row** | وہ ٹول بار جو کیریٹ کی موجودہ حالت کو کنٹرول کرتی ہے — مثلاً جدول کے قطار و کالم کمانڈ، کوڈ کا زبان خانہ، لنک کا پتہ و نام خانہ، سرخی کا H1 سے H6 |

### کور

| لفظ | معنی |
|---|---|
| **cocoon** | nabi-tree کا معیاری مرحلہ۔ یہ **ہر command کے بعد خود چلتا ہے**، اس لیے کوئی بھی command قاعدہ توڑنے والی دستاویز نہیں چھوڑ سکتی |
| **attach** | وہ hook جو wing اُس وقت اعلان کرتی ہے جب اسے سکرین کو براہ راست چھونا ہو — مثلاً جدول کے خانے کو گھسیٹنا، کوڈ کی رنگ کاری، چیک ٹوگل۔ `mountSurface` رجسٹرڈ wing کا یہ hook خود ساتھ لگا دیتا ہے |
| **input rule** | وہ تبدیلی جو صرف ٹائپ کرنے سے ہو جاتی ہے — مثلاً ہائفن اور خالی جگہ سے فہرست، `#` اور خالی جگہ سے سرخی |


## اگلی دستاویزات

- [{{ t('menu_intro_usage') }}](./intro/usage) — جوڑنا، ان پٹ اور آؤٹ پٹ سب کچھ
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — بغیر بلڈ ٹول کے، صرف ایک `<script>` سے
- [{{ t('menu_wing_custom') }}](./wing/custom) — جو فارمیٹنگ موجود نہیں اسے خود بنانا

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import LayerStack from '../.vitepress/ui/LayerStack.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: 'ہاتھ سے لکھنا · چسپاں کرنا · لوڈ کرنا', kind: 'in' },
  { label: 'setHtml() · setJson()', note: 'فنکشن کے ذریعے ان پٹ', kind: 'gate' },
];

const hubCore = { label: 'nabi-tree', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: 'ایڈیٹر کے لیے HTML', kind: 'out' },
];

const layers = [
  { name: 'locale', what: 'زبان' },
  { name: 'code', what: 'خالص tokenizer جو ترمیمی سکرین اور پڑھنے والی سکرین دونوں مشترکہ استعمال کرتی ہیں' },
  { name: 'schema', what: 'nabi-tree کی شکل اور cocoon کی تعریف' },
  { name: 'doc', what: 'ڈالنا · مٹانا · توڑنا · حد — DOM کے بغیر' },
  { name: 'caret', what: 'کیریٹ کی جگہ، انتخاب اور حدود' },
  { name: 'html', what: 'nabi-tree ↔ HTML' },
  { name: 'editor', what: 'command انٹرفیس رکھنے والا انسٹینس' },
  { name: 'wing', what: 'رجسٹریشن کے وقت Wing کی جانچ' },
  { name: 'wings', what: 'سرکاری wings (bold، italic … table، upload…)' },
  { name: 'surface', what: 'caret · IME · ان پٹ کو ٹری سے ملاتی ہے' },
  { name: 'ui', what: 'UI کی تہہ' },
  { name: 'viewer', what: 'صرف پڑھنے کے لیے' },
]
</script>

