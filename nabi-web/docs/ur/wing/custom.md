---
title: اپنی مرضی کی wing بنانا
description: جو فارمیٹنگ موجود نہیں وہ wing سے بنائی جاتی ہے — ایک معاہدہ بھریں اور باقی کور خود کرتا ہے۔
---

# اپنی مرضی کی wing بنانا

wing ایک **آبجیکٹ** ہے۔ نہ کسی class کی وراثت، نہ الگ رجسٹریشن کا عمل — اسے
`createNabiWith` کو دی جانے والی صف میں رکھ دینا ہی رجسٹریشن ہے۔

جلی، جدول، اپ لوڈ بھی صرف یہاں لکھی گئی خانوں کو بھر کر بنی ہیں۔ آپ کی بنائی
wing بھی بنیادی wing کے **بالکل انہی شرائط** پر کام کرتی ہے — کوئی الگ شارٹ کٹ
نہیں۔

---

## سب سے مختصر wing

`<kbd>` کو جاننے والا ایک ہی inline mark۔

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // اس wing کا نام — محفوظ قدر کا `w` یہی ہوگا
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // باہر جانے والا رسم
  }),
  // اندر آنے والے HTML میں `<kbd>` کا مالک ہونے کا اعلان کرتا ہے
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

اب `<kbd>` دستاویز میں رہتا ہے۔ پیسٹ، `setHtml()`، محفوظ کرنا اور دوبارہ لوڈ
کرنے کے بعد بھی ویسے ہی رہتا ہے۔

```
رجسٹر ہو تو      <p>دبائیں: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   ویسا ہی رہتا ہے
رجسٹر نہ ہو تو   <p>دبائیں: <kbd>Ctrl</kbd></p>                →   <p>دبائیں: Ctrl</p>
```

**دونوں خانے مختلف سمتیں دیکھتی ہیں۔** `toHtml` باہر جانے کا راستہ ہے اور
`claim` اندر آنے کا۔ `claim` نہ لکھیں تو کھینچنا تو چلتا رہتا ہے مگر **دوبارہ
پڑھا نہیں جا سکتا** — محفوظ کر کے واپس لاتے ہی خول اتر جاتا ہے۔

`simpleMark` وہ بغیر خاصیت والے mark کا مختصر راستہ ہے۔ قدر رکھنے والے mark کے
لیے `valueMark`، جسم کے لیے `boxObject`، فہرست کی صنف کے لیے `listFamily` ہے،
باقی صورتوں میں `Wing` آبجیکٹ ہاتھ سے لکھا جاتا ہے۔

---

## wing کانسٹنٹ ہیں

**زیادہ تر wing پہلے سے بنے ہوئے کانسٹنٹ ہیں** — `boldWing`·`headingWing` جیسے،
انہیں بس صف میں رکھ دیں۔ صرف دو کو آپشن کی ضرورت ہے، ان کے لیے فیکٹری فنکشن الگ
سے ہے۔

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

صرف "attach کا کام" بدلنا ہو تو کانسٹنٹ کو پھیلا کر لکھیں — نئی wing بنانے سے یہ
آسان ہے، کیونکہ یہ صرف ایک خانہ بدلنا ہے۔

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## رجسٹریشن اور ترتیب

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**صف کی ترتیب ہی جانچ کی ترتیب ہے۔** کسی مارک اپ کا مالک طے کرتے وقت (`claim`)
کور اسی ترتیب سے پوچھتا ہے، اور جو wing پہلے جواب دے وہی لے جاتی ہے۔ کوئی نہ لے
تو خول اتر جاتا ہے۔

ٹول بار میں **گروہ (`button.group`) پہلے** آتا ہے۔ گروہ کی ترتیب طے شدہ ہے، اور
ایک ہی گروہ کے اندر صرف اسی صف کی ترتیب سے کھڑے ہوتے ہیں۔

### رجسٹر کرتے ہی مر جاتا ہے

`createNabiWith` معاہدہ توڑنے والی wing کو **فوراً پھینک دیتا ہے۔** دیر سے نہیں
پھٹتا۔

| کیا پکڑا جاتا ہے | مثال |
|---|---|
| محفوظ لفظ کو نام کے طور پر استعمال کرنا | `w: 'p'` · `w: 'br'` |
| ایک ہی نام دو بار رجسٹر کرنا | `boldWing` دو بار |
| node کھڑا ہو مگر `toHtml` نہ ہو | `place: 'mark'` مگر کھینچنے کا طریقہ نہیں |
| command کا نام قاعدہ توڑے | فعل+مفعول camelCase ہونا لازم (`insertTable`) |
| ضروری جوڑ نہ ہو | اپ لوڈ کے ساتھ `img` یا `a` ضرور ہونا چاہیے (`requiresAnyOf`) |

---

## command — خالص فنکشن

دستاویز بدلنے کا ہر راستہ ایک ہی command سے گزرتا ہے۔ command **نہ DOM جانتا ہے
نہ سکرین۔**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // باہر سے آئی قدر ہے، اس لیے جانچ لازم ہے — نہ ملے تو کچھ نہیں ہوتا
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { ur: 'مہر' },
    action: { kind: 'command', command: 'insertStamp', args: { text: 'ٹھیک ہے' } },
  },
}
```

| دلیل | یہ کیا ہے |
|---|---|
| `doc` | ابھی کی دستاویز (بلاکس کی صف)۔ **بدلیں نہیں، نئی دستاویز جواب دیں** |
| `sel` | ابھی کا انتخاب |
| `args` | جو بٹن یا سیاق سطر نے قدر بھیجی ہے۔ **باہر سے آئی ہے، جانچنا لازم ہے** |
| `env` | اصناف کی معرفت — کیا کیا کچھ سما سکتا ہے، کیا چیز مانی جاتی ہے |

جواب `{ doc, selection }` یا **`null`** ہوتا ہے۔ **کچھ نہ بدلے تو `null` جواب
دیں** — تب `applyCommand` کا جواب `false` آتا ہے اور undo کا نکتہ نہیں جمتا۔
جواب میں دی گئی دستاویز کو `cocoon` ایک بار مزید سنوارتا ہے، اس لیے کوئی بھی
command قاعدے توڑنے والی دستاویز پیچھے نہیں چھوڑ سکتا۔

بلانے کا طریقہ ہمیشہ نام سے ہے۔

```ts
nabi.applyCommand('insertStamp', { text: 'ٹھیک ہے' })   // boolean
```

---

## بھری جا سکنے والی تمام خانیں

`Wing` میں پچیس خانے ہیں، **صرف دو لازمی ہیں** (`w`·`place`)۔

### یہ کیا ہے

| خانہ | معنی |
|---|---|
| `w` | اس wing کا نام۔ محفوظ قدر کا `w` یہی بنتا ہے۔ محفوظ لفظ (`p`·`br`) استعمال نہیں ہو سکتے |
| `place` | `'mark'` حروف کے اوپر · `'void'` بغیر اندرونی مواد کا جسم · `'container'` جس کے اندر متن ہو · `'attr'` پیراگراف کی خاصیت · `'tool'` وہ آلہ جس کا دستاویز میں کوئی نشان نہیں |
| `holds` | اندر کیا سماتا ہے — `'blocks'` یا `'inline'` |
| `singleParagraph` | اندر صرف **ایک** پیراگراف تک محدود ہوتا ہے (جدول کا خانہ) |
| `boolAttrs` | صرف `1` قدر والی boolean خاصیات کے نام |
| `allows` | یہاں اندر آ سکنے والی wing کے نام۔ نہ لکھیں تو سب اجازت ہے |
| `requiresAnyOf` | ان میں سے ایک ساتھ رجسٹر ہونا لازم ہے |
| `parts` | بغیر بٹن کے وہ ساختی حصہ جو ساتھ لاتی ہے — جدول کی قطاریں و خانے، تہہ بلاک کی خلاصہ سطر |

### قدر

| خانہ | معنی |
|---|---|
| `attrKey` · `attrValues` | پیراگراف کی خاصیت کے استعمال کردہ خانے کا نام اور قبول کی جانے والی قدروں کی فہرست |
| `currentValue` | ابھی دبی ہوئی ہے یا نہیں — ٹول بار اور سیاق سطر اسی جواب سے خانے کو رنگتے ہیں |

### آنے جانے کا راستہ

| خانہ | معنی |
|---|---|
| `toHtml` · `partHtml` | باہر جانے والا رسم |
| `claim` | اندر آنے والے HTML میں اس ٹیگ کا مالک طے کرتا ہے |
| `repair` · `partRepair` | JSON کے داخلے پر اس node کو سنوارتا ہے۔ `null` جواب دیں تو خول سمیت ہٹ جاتا ہے |

### ہاتھ اور کلید

| خانہ | معنی |
|---|---|
| `commands` | یہ wing جو command جوڑتی ہے |
| `onKey` | کیریٹ اس wing کے node کے اندر ہو تو کلید پہلے یہی پکڑتی ہے |
| `escapeKeys` | جن کلیدوں سے اگلا حرف اس mark سے باہر آ جاتا ہے |
| `inputRules` | صرف حروف ٹائپ کرنے سے ہونے والی خودکار تبدیلی |
| `attach` | جب سکرین کو براہِ راست چھونا ہو — جدول کے خانے کو گھسیٹنا، کوڈ کی رنگ کاری یہی ہیں |

### شکل

| خانہ | معنی |
|---|---|
| `button` · `buttons` | ٹول بار کا ایک یا کئی بٹن |
| `context` | سیاق سطر کا اعلان |
| `styles` | اس wing کا اٹھایا ہوا CSS |

---

## `w` — نام رکھنا

`w` وہ **حرف ہے جو محفوظ قدر میں ہر node کے ساتھ دہرایا جاتا ہے۔** جتنا مختصر
ہو بہتر ہے — اسی لیے بنیادی wing کے نام `b`·`hl`·`tf` جیسے مختصر ہیں۔ مگر کسی
اور کے نام سے مل جائے تو رجسٹریشن مر جاتی ہے، اس لیے خود بنائی wing کے لیے تھوڑا
لمبا مگر نہ ٹکرانے والا نام رکھیں۔

HTML ٹیگ کے نام جیسا ہونا ضروری نہیں — باہر جانے والا ٹیگ `toHtml` طے کرتا ہے۔

::: warning نام بعد میں بدلا تو
محفوظ قدر کا `w` ہی وہ نام ہے، اس لیے نام بدلنے سے **پہلے سے محفوظ دستاویزات
پڑھی نہیں جا سکتیں۔** بدلنا ضروری ہو تو پرانا نام بھی `claim` میں ساتھ قبول
کرنے کا منتقلی دور رکھیں۔
:::

---

## اگلی دستاویزات

- [inline mark](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [بلاک اور پیراگراف کی خاصیت](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [کلید، خودکار تبدیلی، پیسٹ](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI اور برتاؤ](./custom/ui) — `button` · `context` · `styles`، اور صارف سے سوال پوچھنا

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
