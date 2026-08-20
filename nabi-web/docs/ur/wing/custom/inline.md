---
title: inline mark بنانا
description: place 'mark' — حروف کے اوپر چڑھایا جانے والا فارمیٹ۔ باہر جانے کا راستہ (toHtml) اور اندر آنے کا راستہ (claim) ساتھ لکھیں۔
---

# inline mark بنانا

`place: 'mark'` **حروف کے اوپر چڑھایا جانے والا فارمیٹ ہے۔** یہ جگہ نہیں لیتا،
متن کے بہاؤ کو نہیں توڑتا، اور آپس میں چڑھ سکتا ہے — جلی، ترچھا، ہائی لائٹ سب
اسی قسم کے ہیں۔

---

## ایک مکمل mark

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { ur: 'شارٹ کٹ' },
      shortcut: 'K',
      action: { kind: 'mark' },        // toggle کور خود کرتا ہے — command کی ضرورت نہیں
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

`simpleMark` جو بھرتا ہے وہ دو چیزیں ہیں: `place: 'mark'` اور `escapeKeys:
['Escape']`۔ باقی جیسا لکھا وہیسا گزر جاتا ہے۔

---

## دو سمتیں الگ لکھی جاتی ہیں

| | سمت | نہ ہو تو |
|---|---|---|
| `toHtml` | دستاویز ← HTML | **رجسٹریشن مر جاتی ہے۔** جو wing node کھڑا کرتی ہے اسے کھینچنے کا طریقہ ضرور رکھنا چاہیے |
| `claim` | HTML ← دستاویز | کھینچا تو جاتا ہے مگر **دوبارہ پڑھا نہیں جا سکتا۔** محفوظ کر کے واپس لاتے ہی خول اتر جاتا ہے |

بنیادی چھ mark (`b`·`i`·`u`·`s`·`sub`·`sup`) اور قدر رکھنے والے چار mark
(`hl`·`tc`·`fs`·`tf`) کے ٹیگ **کور کو پہلے سے معلوم ہیں۔** اس لیے `boldWing`
میں نہ `toHtml` ہے نہ `claim`۔ خود بنایا گیا نام کور نہیں جانتا، اس لیے دونوں
لکھنا لازم ہے۔

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| دلیل | یہ کیا ہے |
|---|---|
| `node` | ابھی کا node۔ خاصیت `node.a?.['کلید']` سے نکالی جاتی ہے |
| `children()` | اندر کا کھینچا گیا متن۔ **بلانے پر ہی کھینچتا ہے،** نہ بلائیں تو اندر کا مواد نہیں نکلتا |
| `ctx` | محفوظ طریقے سے بنانے کا آلہ |

`ctx` جو دیتا ہے:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | ایک ٹکڑا بناتا ہے۔ قدر خود بخود escape ہو جاتی ہے |
| `ctx.escape(text)` | صرف متن escape کرتا ہے |
| `ctx.url(raw)` · `ctx.src(raw)` | پتہ چھانتا ہے۔ ناقابلِ اعتماد پتہ **`null`** ہے |
| `ctx.keys` | ابھی **ایڈیٹر کے لیے** جوڑا جا رہا ہے یا نہیں (`getEditorHtml()`) |

::: warning متن کو ہاتھ سے نہ جوڑیں
`` `<kbd>${node.a?.['t']}</kbd>` `` جیسا لکھیں تو دستاویز کا متن خود مارک اپ بن
جاتا ہے۔ ہمیشہ `ctx.element` یا `ctx.escape` سے گزریں۔
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — جیسا اندر آیا ویسا ہی element |
| `inner(block)` | اندر پڑھتا ہے۔ mark ہو تو `false` (حروف کی جگہ)، block ہو تو `true` |
| جواب | node کی صف، یا **`null`** (میرا نہیں → اگلی wing کو) |

wing کی صف کی ترتیب سے پوچھا جاتا ہے اور **جو پہلے ہاتھ اٹھائے** وہی لے جاتی ہے۔

`null` جواب ملنے کی دو جگہیں ہیں — جب ٹیگ میرا نہ ہو، اور جب **ٹیگ تو میرا ہو
مگر قدر فہرست سے باہر ہو۔** بعد والی صورت میں `inner(false)` جواب دیں تو صرف
خول اترتا ہے اور متن بچ جاتا ہے۔

---

## قدر رکھنے والا mark

رنگ اور سائز جیسے **مقررہ فہرست سے ایک چننے والے** mark کے لیے `valueMark`
استعمال ہوتا ہے۔

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // وہ خاصیت خانہ جس میں قدر رہتی ہے
    values: [...LEVELS],             // اس سے باہر کی قدر قبول نہیں
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // فہرست سے باہر — صرف متن رہنے دیں
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

`valueMark` جو دو چیزیں جوڑتا ہے:

- **`currentValue`** — ابھی کیریٹ جہاں کھڑا ہے اس جگہ کی قدر۔ ٹول بار اور سیاق
  سطر اسی جواب سے دبے ہوئے خانے کو رنگتے ہیں۔
- **`repair`** — JSON کے داخلے پر قدر کو دوبارہ جانچتا ہے۔ فہرست سے باہر ہو یا
  موجود نہ ہو تو `null` جواب دے کر **خول سمیت ہٹا دیتا ہے۔** ہاتھ سے بدلی گئی
  محفوظ قدر بھی یہاں پکڑی جاتی ہے۔

::: tip قدر بدلنے والا command
قدر رکھنے والے mark کا "اس قدر پر بدل دو" command کے لیے ابھی عوامی مدد گار
نہیں ہے۔ صرف ایک بٹن سے آن آف کرنے والا `action: { kind: 'mark' }` ویسے ہی چل
جاتا ہے، اور قدر چننے کی ضرورت ہو تو ابھی بنیادی چار قدر رکھنے والے mark
(ہائی لائٹ، متن کا رنگ، متن کا سائز، typeface) استعمال کریں یا ان کا اعلان
پھیلا کر لکھیں۔
:::

---

## `escapeKeys` — mark سے باہر نکلنا

جب کیریٹ mark کے آخر میں کھڑا ہو تو اگلا حرف mark کے اندر جائے گا یا باہر یہ
صرف انسان جانتا ہے۔ `escapeKeys` وہی دروازہ ہے۔

```ts
escapeKeys: ['Escape']    // simpleMark اور valueMark کی default قدر
```

**کیریٹ نہیں ہلتا۔** یہ کلید دبانے سے ایک reservation لگتی ہے: "اگلا لکھا
جانے والا حرف اس mark سے باہر ہوگا"۔ ایک حرف لکھیں تو reservation استعمال ہو
کر ختم ہو جاتی ہے۔

```
<kbd>Ctrl</kbd>(کیریٹ)  →  Escape  →  "+" ٹائپ کرنا  →  <kbd>Ctrl</kbd>+
```

کئی wing ایک ہی کلید لگا سکتی ہیں — reservation صرف تب لگتی ہے جب کیریٹ حقیقت
میں اس وقت اسی mark کے اندر ہو، اس لیے ایک دوسرے پر چڑھے ہوئے mark میں سے صرف
متعلقہ mark ساتھ اترتے ہیں۔ <kbd>Escape</kbd> پہلے سے لگی reservation کو
**واپس لینے** کے لیے بھی استعمال ہوتا ہے۔

---

## mark کے پاس کلید نہیں ہوتی

`onKey` لکھیں تب بھی **mark تک نہیں پہنچتا۔** کیریٹ کی جگہ `{ path, offset }`
ہے اور `path` کا آخری سرا ہمیشہ **حروف تھامنے والا holder** ہوتا ہے — mark اس
holder کے اندر کا inline node ہے، اس لیے راستے میں کبھی آتا ہی نہیں۔ کلید کا
مالک طے کرتے وقت کور یہی راستہ اوپر چلتا ہے، اس لیے mark سے کبھی نہیں ملتا۔

وجہ ہے چڑھاؤ۔ جلی کے اندر ترچھے کے اندر لنک میں <kbd>Enter</kbd> دبانے پر تینوں
میں سے کون فیصلہ کرے گا، اس کا کوئی طریقہ نہیں۔ mark کے پاس کلید کے لیے صرف ایک
دروازہ ہے — `escapeKeys`۔

---

## اگلی دستاویزات

- [بلاک اور پیراگراف کی خاصیت](../custom/block) — جگہ لینے والی چیز
- [کلید، خودکار تبدیلی، پیسٹ](../custom/input) — `onKey` اور `inputRules`
- [UI اور برتاؤ](../custom/ui) — ٹول بار کا بٹن اور سیاق سطر

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
