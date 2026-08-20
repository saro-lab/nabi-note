---
title: تمييز
---

# تمييز

## الوصف

`highlightWing` هو مالك (claim) الوسم `<mark data-color="...">`. وهو علامة سطرية
ذات قيمة، فليس مبدِّلًا يُشعَل ويُطفأ بل خيارًا تنتقي منه لونًا — من طينة لون النص
نفسها.

- الضغط على زر شريط الأدوات (الاختصار `H`، بلا وسائط) يعمل كمبدِّل — إن كان النطاق
  المحدَّد كله مميَّزًا أزال التمييز، وإلا طبَّقه باللون الافتراضي (الأصفر).
- إذا وقف المؤشر داخل علامة تمييز، ظهرت في شريط الأدوات السياقي ستّ عيّنات لون
  (swatch) — يغيّر الضغط عليها اللون في مكانه. ولا يملك هذا الجناح زر "مسح" خاصًّا
  به — فمسح التنسيق من شأن `clearFormatWing` (ويلزم تسجيله على حدة).
- يعمل الأمر حتى لو لم تحدِّد نصًّا واكتفيت بوضع المؤشر — فإذا كان المؤشر داخل
  علامة تمييز أصلًا صارت عقدة تلك العلامة كلها هي الهدف (فلا حاجة إلى إعادة تحديد
  النطاق).
- لا يبقى في القيمة المحفوظة إلا اسم اللون — على هيئة `data-color="yellow"`
  مثلًا. ولا يخرج `style` سطري — فلون الخلفية الفعلي من شأن صحيفة أنماط المضيف
  (CSS) لا من شأن هذا الجناح.
- عند الدخول (`claim`) لا ينظر إلا إلى وسم `<mark>` — فإن كانت قيمة
  `data-color` خارج القائمة أو غائبة أصلًا أُلحق باللون الافتراضي (الأصفر) (فمعنى
  "تمييز" يحمله الوسم نفسه، ولا يُرمى لذلك).

| اسم اللون | القيمة المحفوظة |
|---|---|
| أصفر | `yellow` |
| أخضر | `green` |
| سماوي | `cyan` |
| وردي | `pink` |
| بنفسجي | `purple` |
| برتقالي | `orange` |

تُصدَّر قائمة الألوان أيضًا باسم `HIGHLIGHT_COLORS` (خريطة id ← قيمة لون CSS).

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
