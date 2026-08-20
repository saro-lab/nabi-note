---
title: شيفرة
---

# شيفرة

## الوصف

`codeWing` (اسمه `code`) **ثابت** يملك كتلة الشيفرة (`<pre>`) — لا يُنادى
بأقواس.

وهو وعاء `holds: 'inline'`، وداخله يُثبَّته `repair` نصًّا صرفًا — لا تتخلله
العلامات ولا الأجنحة الأخرى. هذا ليس خانة منفصلة في العقد، بل الجناح يرتّب
داخله بنفسه.

وإن كتبت في سطر فارغ ` ``` ` ثم ضغطت مسافة أو Enter صارت كتلة شيفرة — وإن
أتبعتها باللغة كما في ` ```ts ` التُقطت تلك اللغة معها. وتُزاح السطور داخلًا
وخارجًا بـ`Tab` و`Shift+Tab` (ودفعة واحدة إن حُدِّدت سطور عدة). و Enter يرث
إزاحة السطر السابق.

لا يظهر الشريط السياقي إلا والمؤشر داخل الشيفرة — وفيه حقل إدخال تكتب فيه
اللغة بنفسك، و"بدون لغة"، وحقول اللغات الشائعة.

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

وهذه القائمة **طريق مختصر** لا غير — وليست قائمة اللغات التي تعرفها النواة. فما
ليس فيها تكتبه بنفسك في الحقل الأول، وتُمرَّر تلك القيمة إلى المُلوِّن كما هي.

## التلوين يُوصَل بالجناح

`highlight` **خطّاف يُرجع الأنواع لا الألوان** — وشكله `(المصدر, اللغة) =>
{text, type?}[]`، و`type` محصور في واحد من أربعة عشر: `keyword`·`string`·
`number`·`comment`·`function`·`class`·`variable`·`operator`·`punctuation`·
`tag`·`attribute`·`literal`·`regexp`·`meta` (`CODE_TOKEN_TYPES`).

اللون تحدّده صحيفة النواة نفسها عبر المحدِّد `[data-nabi-token="…"]` —
**خمسة أنواع فقط لها لون** (`comment`·`string`·`keyword`·`number`·`literal`).
بقية الأنواع تحمل العلامة فقط دون قاعدة لون، فتخرج بلون النص العادي. بما أن
القيمة لون ثابت لا متغير CSS، فتغيير الألوان أو دعم الوضع الداكن يتطلب تجاوز
ذلك المحدِّد بنفسك.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

ولا يحوي الحزمة قاموس القواعد نفسه — عليك وصل شيء مثل Prism أو highlight.js أو
Shiki بنفسك.

وجهة التلوين **تُوصَل بالجناح** — لا تُركَّب على حدة. تُبنى `attach` عبر
`makeCodeAttach` وتُستبدَل في جناح الشيفرة، ويربطها `mountSurface` تلقائيًّا.
والعرض التوضيحي في هذا الموقع مثال وصل Shiki على هذا النحو
(`.vitepress/src/highlight.ts`).

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// الجناح ثابت — يُستبدَل فيه العمل الملحق (`attach`) وحده
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

إعطاء `version` يعيد التلوين **حين يبقى المستند كما هو ويتغيّر جانب التلوين
فقط.** وذلك حال المُلوِّن الذي يجلب القواعد لا تزامنيًّا (وهو ما تفعله Shiki
حين تلقى لغة لأول مرة) — إذ لا يُطلَق `onChange` عند وصول القواعد لأن المستند
لم يتغيّر، فلولا هذا لاضطُررت إلى كتابة حرف زائد ليدخل اللون.

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// حين تصل القواعد متأخرة — رفع الرقم يعيد التلوين
grammarAge += 1
```

والقيمة المحفوظة تتبع العرف الخارجي — أي
`<pre data-nabi-lang="ts"><code class="language-ts">`، وتخرج الألوان في سمة
`data-nabi-token` (لا في `style` سطري).

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
