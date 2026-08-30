---
title: Wings مخصصة
description: العقد وتسلسل التنفيذ لإضافة ميزة مستند دائمة.
---

# Wings مخصصة

الـwing المخصصة ليست مجرد زر في شريط الأدوات. إنها امتداد تصريحي يجمع بنية المستند المحفوظة والأوامر وتحويل HTML وMarkdown وقواعد الاستيراد وسلوك العرض. تتحقق منها registry قبل وجود المحرر، فتمنع دخول بنى غير صالحة إلى المستند.

## ابدأ بأضيق factory

لا تحتاج معظم التنسيقات إلى تصريح كامل. استخدم `simpleMark()` لـinline mark بلا قيمة، و`valueMark()` لـmark ذات مجموعة قيم محدودة، و`boxObject()` لكتلة بلا أبناء، و`listFamily()` لقائمة.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## نفّذ عدة أنواع من wing

لكل مثال أدناه بنية حفظ مختلفة. سجّل واحدًا أولًا وافحص `getJson()` و`getHtml()`. لا تضف الأوامر والأزرار إلا بعد أن تعمل البنية.

### 1. Inline mark بلا قيمة: تأكيد

استخدم `simpleMark()` عندما تكتفي الميزة بتغليف النص. يُحفظ `exStrong` ويُعرض كـ`<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

عند `clearable: true` يزيل مسح التنسيق هذه mark أيضًا. قبل إضافة زر، طبّقها عبر `nabi.applyCommand()` أو أمر مخصص آخر. ينسّق المحدد `.nabi-content strong` نفسه المحرر والمحتوى المنشور.

### 2. Inline mark ذات قيمة: نبرة الحالة

استخدم `valueMark()` للون أو الحجم أو الحالة المختارة من مجموعة مسموحة. تُحفظ القيمة في `a.v`، وتُزال القيم خارج القائمة أثناء `repair()`.

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

صورتها المحفوظة هي `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. تستهدف CSS القيمة المحفوظة فتغيّر صفحة النشر أيضًا. لا تحذف قيمًا من قائمة قائمة بلا تدبر؛ فقد تفقدها المستندات القديمة عند القراءة.

### 3. كتلة بلا أبناء: فاصل

استخدم `boxObject()` لكائن مستقل بلا أبناء مثل صورة أو فيديو أو فاصل.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

للكائن ذي القيم مثل URL أو العرض، صرّح بالتحقق في `attrs` وضع القيم المطلوبة في `requires`. ارفض القيمة التي لا يمكن التحقق منها بـ`null` بدل استبدال افتراضي صامت.

### 4. كتلة بعدة فقرات: تنبيه

للكتلة التي تحتوي محتوى مستند، صرّح بـ`container`. تسمح `holds: 'blocks'` بأبناء من الفقرات والقوائم وكتل العناصر.

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

لا ينشئ هذا التصريح وحده طريقة لتغليف الفقرات المحددة. أضف أمرًا خالصًا إلى `commands` و`button` تستدعيه قبل إظهار الميزة في UI المحرر.

### 5. زوج متطابق من القائمة والعنصر

استخدم `listFamily()` عندما يجب أن تظهر القائمة والعنصر معًا دائمًا.

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

تصلح `listFamily()` كتلة داخل القائمة بتغليفها في عنصر. أضف `itemDecl` و`repairItem` لقيمة على مستوى العنصر مثل حالة الاختيار.

### التسجيل في اختيار واحد مرتب

استخدم التصريحات نفسها وبالترتيب نفسه على الخادم وفي المتصفح.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'ar' })
```

## تحديد الأسماء وبنية المستند

يجب أن تطابق الأسماء التي تدخل المستند `ex[A-Z0-9]...`. يمنع اسم مثل `exCallout` أي wing رسمية مستقبلية من تغيير معنى المحتوى المحفوظ.

تحدد `place` بنية الحفظ: تغلف `mark` المحتوى inline، و`void` كتلة بلا أبناء، و`container` يحمل أبناء، و`attr` يغير خصائص الفقرة، و`tool` لا ينشئ عقدة مستند. يحتاج `container` إلى `holds: 'blocks' | 'inline'` و`toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

تصرّح `attrs` و`boolAttrs` و`allows` و`requiresAnyOf` و`parts` بقيود البنية. ويحتاج كل جزء مصرح في `parts` إلى `partHtml` مقابل. استخدم `attrKey` و`attrValues` لتقييد قيم wing الاختيارية.

## جميع خيارات التصريح

صرّح بما تحتاجه wing فقط؛ يوفّر factory بعض الحقول أصلًا.

| المجال | الخيارات | الغرض |
| --- | --- | --- |
| الأساس | `w`, `place`, `basic`, `styles` | الاسم، نوع البنية، عضوية الفهرس الأساسي، CSS الافتراضي |
| البنية | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | نوع الأبناء، سلوك Enter، السمات المسموحة والمنطقية |
| البنية | `parts`, `allows`, `noAlign`, `requiresAnyOf` | الأجزاء الداخلية، الأبناء المسموحون، منع المحاذاة، اعتماد wing |
| القيم | `attrKey`, `attrValues`, `currentValue` | مفتاح القيمة وقائمتها واكتشاف القيمة الحالية |
| الأوامر والإدخال | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | الأوامر والمفاتيح وEscape/المفتاح المزدوج والتنسيق التلقائي |
| سلوك السطح | `attach` | سلوك DOM والتنظيف للسطح |
| التحويل | `toHtml`, `partHtml`, `toMd`, `partMd` | إخراج HTML وMarkdown |
| الاستيراد والإصلاح | `claim`, `ioFilter`, `repair`, `partRepair` | استيراد HTML والملفات والتحقق من JSON وإصلاحه |
| UI | `button`, `buttons`, `context` | عناصر شريط الأدوات والسياق |
| مسح التنسيق | `clearable` | هل يزيلها مسح التنسيق |

`w` و`place` مطلوبان دائمًا. وتحتاج wings التي تنتج عقدًا من نوع `mark` و`void` و`container` إلى `toHtml()` أيضًا. يحتاج container إلى `holds`، ويحتاج كل جزء مصرح إلى `partHtml` المقابل.

## أبقِ HTML وMarkdown وJSON معًا

تعرض `toHtml()` العقدة المحفوظة إلى HTML، وتصدّر `toMd()` ‏Markdown. من دون Markdown builder، يُحتفظ بـHTML المولّد حتى لا تضيع المعلومات. استخدم `claim()` للتعرف عند الاستيراد على عنصرك وسماته المتحقق منها فقط.

تعمل `repair()` عند تحميل JSON وبعد الأوامر. أعد عقدة مصححة للسمة غير الصالحة، أو `null` لعقدة لا يمكن الاحتفاظ بها. ابنِ HTML باستخدام `ctx.element()` و`ctx.escape()` و`ctx.url()`؛ لا تجمع الوسوم أو السمات أو URL حول هذه الفحوص.

## افصل الأوامر عن سلوك العرض

الأمر دالة خالصة للمستند والتحديد، تعيد المستند التالي وتحديدًا داخله. لا تقرأ DOM ولا تغيّره، وتعيد `null` عندما يتعذر تغيير صالح. سمّ الأوامر بـlower camel case يبدأ بفعل مثل `insertNote`.

ضع سلوك DOM فقط، مثل تحديد الجدول بالسحب، في `attach(host)`. سجّل فورًا تنظيف كل listener وسمة متغيرة باستخدام `host.onDispose()` حتى يجري التنظيف عند فشل الإعداد. لا تغيّر DOM لنص التركيب ولا ربط تحديد السطح.

صرّح بعناصر شريط الأدوات والسياق عبر `button` و`buttons` و`context`. قد يؤدي تكرار قواعد أوامرها في UI التطبيق إلى اختلاف UI عن نموذج المستند.

## أنماط CSS

ضع CSS الأساسي المطلوب للـwing في `styles`. أنماط wings المضمّنة موجودة أصلًا في `nabi-note/nabi.css`. يستطيع المتصفح استخدام `collectSheets()` و`injectSheets()` لأنماط registry المحددة؛ أما SSR فيربط ملف CSS.

استخدم الفئات وdata attributes نفسها للتحرير والنشر، لكن لا تغيّر بنية `[data-key]` أو `display` أو `white-space` في المحرر. يجب أن تغيّر CSS المظهر فقط لا ربط المؤشر.

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

استهدف الفئات وdata attributes التي ينشئها `toHtml()` فقط. واجعل تغييرات الخدمة أضيق، مثل `.article-body .ex-callout`.

## تحقق من العقد كاملًا

تحقق من أن JSON المحفوظ يُعاد تحميله بالبنية وHTML نفسيهما. اختبر رفض registry للأسماء غير الصالحة والأوامر المكررة وbuilders الناقصة والاعتماديات غير المستوفاة. وغطِّ استيراد HTML غير الصالح وإدخال `repair()` وتعامل الأوامر مع التحديد وناتج SSR وصفحة النشر المنسقة.

للأنواع الكاملة ووسائط factory، راجع التعريفات المثبتة و[مرجع API الإنجليزي](https://nabi.saro.me/llms/api-reference.md).
