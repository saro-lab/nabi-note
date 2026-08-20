---
title: بناء علامة سطرية
description: place 'mark' — تنسيق يُلقى فوق الحروف. اكتب الطريق الصادر (toHtml) والوارد (claim) معًا.
---

# بناء علامة سطرية

`place: 'mark'` هو **تنسيق يُلقى فوق الحروف.** لا يشغل مكانًا، ولا يقطع تدفق
النص، ويمكن أن تتراكب علاماته — الغامق والمائل والتظليل كلها من هذا الصنف.

---

## علامة مكتملة واحدة

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { ar: 'اختصار' },
      shortcut: 'K',
      action: { kind: 'mark' },        // النواة تتولى التبديل — لا حاجة لأمر
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

ما يملؤه `simpleMark` اثنان: `place: 'mark'` و`escapeKeys: ['Escape']`. الباقي
يمر كما كتبته.

---

## الاتجاهان يُكتبان منفصلَين

| | الاتجاه | بدونه |
|---|---|---|
| `toHtml` | المستند ← HTML | **يموت التسجيل.** يجب أن يملك كل جناح يُقيم عقدة طريقة رسم |
| `claim` | HTML ← المستند | يُرسَم لكن **لا يُقرأ من جديد.** تُنزَع قشرته فور أن يُحفَظ ويُستعاد |

العلامات الست الأساسية (`b`·`i`·`u`·`s`·`sub`·`sup`) والعلامات الحاملة قيمة
الأربع (`hl`·`tc`·`fs`·`tf`) **تعرف النواة وسومها بالفعل.** لذلك لا يملك
`boldWing` لا `toHtml` ولا `claim`. أما الاسم الذي تبنيه بنفسك فلا تعرفه النواة،
فاكتب الاثنين معًا.

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| الوسيط | ما هو |
|---|---|
| `node` | العقدة الآن. تُستخرَج الخصائص بـ`node.a?.['المفتاح']` |
| `children()` | النص المرسوم بالداخل. **يُرسَم عند استدعائه**، فإن لم تستدعِه لا يخرج المحتوى |
| `ctx` | أداة البناء الآمن |

ما يمنحك `ctx`:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | يبني عنصرًا واحدًا. تُهرَّب (escape) القيم تلقائيًّا |
| `ctx.escape(text)` | يهرّب النص وحده |
| `ctx.url(raw)` · `ctx.src(raw)` | يصفّي عنوانًا. العنوان غير الموثوق يعود **`null`** |
| `ctx.keys` | هل هذا تجميع **لشاشة المحرر** الآن (`getEditorHtml()`) |

::: warning لا تُلصِق النص يدويًّا
كتابة شيء مثل `` `<kbd>${node.a?.['t']}</kbd>` `` تجعل نص المستند نفسه يتحول إلى
ترميز. مرّ دائمًا عبر `ctx.element` أو `ctx.escape`.
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — العنصر كما ورد تمامًا |
| `inner(block)` | يقرأ الداخل. `false` إن كانت علامة (مكان النص)، `true` إن كانت كتلة |
| الجواب | مصفوفة عقد، أو **`null`** (ليس لي → للجناح التالي) |

يُسأل كل جناح بترتيب المصفوفة، ويأخذها **أول من يرفع يده.**

هناك موضعان يُجاب فيهما بـ`null` — حين لا يكون الوسم لي، وحين **يكون وسمي لكن
القيمة خارج القائمة.** في الحالة الثانية إن أجبتَ بـ`inner(false)` تُنزَع القشرة
فقط ويبقى النص حيًّا.

---

## العلامة الحاملة قيمة

للعلامة التي **تختار واحدة من قائمة محددة** كاللون والحجم استعمل `valueMark`.

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // الخانة التي تعيش فيها القيمة
    values: [...LEVELS],             // لا تُقبَل قيمة خارج هذه القائمة
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // خارج القائمة — يبقى النص فقط
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

ما يضيفه `valueMark` اثنان:

- **`currentValue`** — قيمة الموضع الذي يقف فيه المؤشر الآن. يلوّن بها شريط
  الأدوات والشريط السياقي الخانة المضغوطة.
- **`repair`** — يفحص القيمة من جديد عند مدخل JSON. إن كانت خارج القائمة أو
  غائبة يجيب بـ`null` **فتُنزَع القشرة كاملة.** حتى القيمة المحفوظة المعدَّلة
  يدويًّا تُضبَط هنا.

::: tip أمر تغيير القيمة
ليس لأمر "غيّر إلى هذه القيمة" في العلامة الحاملة قيمة مساعد عام بعد. أما
`action: { kind: 'mark' }` الذي يشغّل ويطفئ بزر واحد فقط فيعمل كما هو، وإن احتجت
اختيار قيمة استعمل الآن العلامات الحاملة القيمة الأربع الأساسية (التظليل، لون
النص، حجم الخط، نوع الخط) أو افرد تصريحها بنفسك.
:::

---

## `escapeKeys` — الخروج من العلامة

حين يقف المؤشر عند نهاية علامة، لا يعرف أحد غير الإنسان أإن كان الحرف التالي
داخل العلامة أم خارجها. `escapeKeys` هو تلك البوابة.

```ts
escapeKeys: ['Escape']    // القيمة الافتراضية لـ simpleMark و valueMark
```

**لا يتحرك المؤشر.** الضغط على هذا المفتاح يضع حجزًا: "الحرف القادم سيخرج من هذه
العلامة". اكتب حرفًا واحدًا فيُستهلَك الحجز ويزول.

```
<kbd>Ctrl</kbd>(المؤشر)  →  Escape  →  كتابة "+"  →  <kbd>Ctrl</kbd>+
```

يمكن لعدة أجنحة أن تحجز المفتاح نفسه — لا يُحجَز إلا إن كان المؤشر فعلًا داخل تلك
العلامة الآن، فتخرج معًا فقط العلامات المتراكبة المعنيّة. ويُستعمَل
<kbd>Escape</kbd> أيضًا **لإلغاء** حجز قائم إن وُجد.

---

## العلامات لا تملك مفاتيح

حتى لو كتبت `onKey` **لا يصل إلى العلامة.** موضع المؤشر هو `{ path, offset }`
ونهاية `path` هي دائمًا **حامل النص**، والعلامة عقدة سطرية داخل ذلك الحامل فلا
تظهر في المسار إطلاقًا. حين تُحسَم ملكية مفتاح تصعد النواة هذا المسار فلا تصادف
علامة أبدًا.

السبب هو التراكب. عند الضغط على <kbd>Enter</kbd> داخل رابط داخل مائل داخل غامق
لا طريقة لتحديد أي الثلاثة صاحب القرار. البوابة الوحيدة التي تملكها العلامة تجاه
المفاتيح هي `escapeKeys`.

---

## التالي

- [الكتلة وخاصية الفقرة](../custom/block) — ما يشغل مكانًا
- [المفاتيح والتحويل التلقائي واللصق](../custom/input) — `onKey` و`inputRules`
- [الواجهة والسلوك](../custom/ui) — زر شريط الأدوات والشريط السياقي

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
