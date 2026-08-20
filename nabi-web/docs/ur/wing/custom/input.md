---
title: کلید، خودکار تبدیلی، پیسٹ
description: onKey سے کلید کو روکیں، inputRules سے صرف حروف سے فارمیٹ بنائیں، اور attach سے سکرین کو چھوئیں۔
---

# کلید، خودکار تبدیلی، پیسٹ

جن تین دروازوں سے wing انسان کے اشارے وصول کرتی ہے — **کلید** (`onKey`)،
**حرف** (`inputRules`)، **سکرین** (`attach`)۔

---

## کلید کا گزرنے کا راستہ

<kbd>Enter</kbd> جیسی کلید دبانے پر اسی ترتیب سے پوچھا جاتا ہے۔ جو پہلے سنبھال
لے اس کے بعد والا نہیں آتا۔

```
① ٹول بار شارٹ کٹ       کہیں بھی سنا جاتا ہے (جیسے Ctrl+B)
② خودکار تبدیلی          inputRules — صرف Enter اور Space
③ wing کا onKey           جہاں کیریٹ کھڑا ہے اس کے مالک کو
④ جسم کو نشانہ بنانا      پیراگراف کے شروع میں backspace ← آگے کا جسم پورا منتخب ہو جاتا ہے
⑤ کور کا قاعدہ            پیراگراف توڑنا، مٹانا، کیریٹ کا چلنا
⑥ براؤزر                یہاں تک کسی نے نہ لیا ہو تب ہی
```

---

## `onKey` — کلید کو روکنا

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // میرا کام نہیں — کور کو دے دیں
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // پہلے خانے کے شروع میں backspace — note کھول دیتا ہے
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
  commands: { toggleNote },
  onKey: noteKeys,
}
```

| دلیل | یہ کیا ہے |
|---|---|
| `intent` | `{ key, dir? }` — کون سی کلید |
| `doc` · `sel` · `env` | وہی جو command کو ملتا ہے |
| `owner` | `{ path, node }` — **وہ node جس کا میں مالک چنا گیا** |

جواب command جیسا ہی `{ doc, selection }` یا **`null`** ہے۔ `null` کا مطلب "میں
نہیں لے رہا" ہے، اس لیے کور خود اٹھا لیتا ہے — شرط پوری نہ ہو تو ہمیشہ `null`
جواب دیں۔

### آنے والی کلیدیں

| `intent.key` | کب |
|---|---|
| `'enter'` | <kbd>Enter</kbd> **اور** <kbd>Shift</kbd>+<kbd>Enter</kbd> دونوں |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | دونوں مٹانے والی کلیدیں |
| `'arrow'` | تیر کی کلید۔ سمت `intent.dir` میں (`'left'`·`'right'`·`'up'`·`'down'`) |

حروف کی کلید نہیں آتی۔ حرف براؤزر لکھتا ہے اور کور اسے وصول کرتا ہے۔

### مالک صرف ایک ہوتا ہے

کیریٹ کے راستے کو **اوپر چلتے ہوئے پہلا غیر پیراگراف node** جو ملے، اس node کی
مالک wing ہی مالک ہے۔

```
راستہ [1, 0, 0] پر کیریٹ                     مالک کا امیدوار
  [1, 0, 0]  →  p        پیراگراف ہے، چھوڑ دیا جاتا ہے
  [1, 0]     →  note     ← یہی مالک ہے
  [1]        →  p(wrapper)  یہاں تک نہیں پہنچتا
```

اسی لیے **سب سے اندر کا ظرف جیتتا ہے** — جدول کے اندر فہرست میں <kbd>Tab</kbd>
فہرست وصول کرتی ہے۔ part (`parts`) بھی مالک بن سکتا ہے، تب `owner.node` اسی
part کا node ہوتا ہے مگر `onKey` اس wing کا بلایا جاتا ہے جس نے اسے اعلان کیا۔
اسی لیے پہلے `owner.node.w` سے یہ جانچنا رواج ہے کہ کون سا node چنا گیا۔

mark مالک نہیں بن سکتا — [وجہ inline mark کی دستاویز میں ہے](./inline#mark-کے-پاس-کلید-نہیں-ہوتی)۔

---

## `inputRules` — صرف حروف سے بنانا

`# ` لکھنے سے سرخی بن جانا اور `> ` لکھنے سے quote بن جانا یہی ہے۔

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| خانہ | |
|---|---|
| `trigger` | `'space'` یا `'enter'` — یہ کلید لکھنے کے **اسی لمحے** پکڑتا ہے |
| `pattern` | regex۔ `run` کو وہی match ملتا ہے |
| `run` | `{ name, args? }` — چلایا جانے والا command |
| `scope` | `'block'` (default) یا `'word'` |

### `'block'` — سطر کے شروع کو بدل دیتا ہے

کیریٹ کے آگے **سطر کے شروع** کو دیکھتا ہے۔ میچ ہو جائے تو وہ شروع (اور trigger
حرف) مٹا کر command چلاتا ہے۔

```
"> " لکھنا   →   "&gt;" مٹ جاتا ہے اور toggleQuote چلتا ہے
```

یہ صرف پیراگراف کی **پہلی سطر پر** پکڑا جاتا ہے۔ <kbd>Shift</kbd>+<kbd>Enter</kbd>
سے نئی سطر پر جانے کے بعد اگلی سطر پر نہیں پکڑا جاتا — اس سے پہلے سے لکھے متن کے
درمیان اچانک فارمیٹ نکل آنے سے بچا جاتا ہے۔

### `'word'` — ایک لفظ پر لگتا ہے

کیریٹ کے آگے **ایک لفظ** کو دیکھتا ہے۔ میچ ہو جائے تو اسے منتخب کر کے command
چلاتا ہے اور کیریٹ کو اسی جگہ واپس رکھ دیتا ہے۔ متن مٹتا نہیں — mark لگانے کا
راستہ یہی ہے۔

اگر وہ لفظ **پہلے سے اسی wing کا mark پہن رہا ہو تو چھوڑ دیا جاتا ہے۔** ایک ہی
جگہ پر دو بار نہیں پکڑا جاتا۔

### مشترک قواعد

- کیریٹ **تہہ (بغیر انتخاب) ہو تب ہی** چلتا ہے۔ حد منتخب کر کے space دبائیں تب
  بھی نہیں پکڑا جاتا۔
- صرف عام پیراگراف میں چلتا ہے — جسم رکھنے والے wrapper پیراگراف میں نہیں پکڑا
  جاتا۔
- wing کی صف کی ترتیب سے جانچا جاتا ہے، اور **پہلا کامیاب قاعدہ** جیتتا ہے۔
- command `null` جواب دے (یعنی کرنے کو کچھ نہیں) تو **واپس پلٹ کر اگلے قاعدے پر
  چلا جاتا ہے۔** ناکام خودکار تبدیلی کا کوئی نشان دستاویز میں نہیں رہتا۔

---

## `attach` — سکرین کو چھونا

کبھی دستاویز بدلنی نہیں ہوتی بلکہ **سکرین پر ہونے والی چیز** سننی ہوتی ہے —
جدول کے خانے کو گھسیٹ کر چننا، کوڈ کو رنگنا، تہہ بلاک کے مثلث پر کلک کرنا۔

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // ہٹانے والا فنکشن جواب میں دیں
}
```

`host` تین چیزیں دیتا ہے۔

| | |
|---|---|
| `host.root` | ترمیمی سطح کا element |
| `host.nabi` | ایڈیٹر۔ دستاویز بدلنی ہو تو **command سے** کریں |
| `host.pathOfKey(id)` | سکرین کا `data-key` دستاویز کے راستے میں بدل دیتا ہے |

`mountSurface` رجسٹر شدہ تمام wing کا `attach` ساتھ لگا دیتا ہے، اور ہٹاتے وقت
جواب میں ملے ہٹانے والے فنکشن بلاتا ہے۔ یہ **وہ واحد جگہ ہے جہاں DOM جاننے والا
کوڈ رہ سکتا ہے** — command، `toHtml`، `repair` کے اندر `document` کو ہاتھ نہ
لگائیں۔

::: tip `data-key` سے دستاویز ڈھونڈنا
ایڈیٹر کے لیے جوڑا گیا (`getEditorHtml()`) ہر node پر `data-key` لگاتا ہے۔ جس
element پر دبایا گیا اس کے قریب ترین `[data-key]` ڈھونڈ کر `host.pathOfKey()`
کو دیں تو دستاویز میں اس کی جگہ مل جاتی ہے۔
:::

---

## پیسٹ اور ابتدائی HTML

پیسٹ، `setHtml()`، اور محفوظ قدر واپس لانا **سب ایک ہی دروازے سے گزرتے ہیں۔**
یہاں wing کو صرف `claim` کرنا ہوتا ہے — [inline mark کی دستاویز میں `claim`](./inline#claim)
میں لکھا ہے۔

```
پیسٹ ─────┐
setHtml  ─┼→ parsing → wing کا claim → کور کا بنیادی ٹیگ میچ → repair → cocoon → دستاویز
ابتدائی HTML ─┘
```

`claim` نہ ہو تو **اس ٹیگ کا خول اتر جاتا ہے اور صرف اندر کا متن رہ جاتا ہے۔**
اسی قاعدے کی وجہ سے کسی اور ایڈیٹر سے کاپی کیا گیا نامعلوم مارک اپ دستاویز میں
جوں کا توں نہیں جم جاتا۔

JSON سے اندر آنے کا راستہ (`setJson()`) ٹیگ نہیں بلکہ node ہے، اس لیے دربان
`claim` نہیں `repair` ہے۔

---

## اگلی دستاویزات

- [UI اور برتاؤ](../custom/ui) — ٹول بار کا بٹن اور سیاق سطر
- [inline mark](../custom/inline) · [بلاک اور پیراگراف کی خاصیت](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
