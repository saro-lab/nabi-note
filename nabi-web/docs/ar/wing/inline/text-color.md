---
title: لون النص
---

# لون النص

## الوصف

`textColorWing` هو مالك (claim) الوسم `<span data-color="...">`. وهو من طينة
التمييز نفسها: علامة سطرية ذات قيمة، فلا تُشعَل وتُطفأ بل تنتقي منها لونًا.

- الضغط على زر شريط الأدوات (الاختصار `C`، بلا وسائط) يعمل كمبدِّل.
- إذا وقف المؤشر داخل علامة لون نص، ظهرت في شريط الأدوات السياقي خمس عيّنات لون
  (swatch) — يغيّر الضغط عليها اللون في مكانه (فلا تتراكم العلامات فوق بعضها).
  ولا يملك هذا الجناح زر "مسح" خاصًّا به — فذلك من شأن `clearFormatWing`.
- حتى لو اكتفيت بوضع المؤشر واخترت لونًا، فإن كان المؤشر داخل علامة لون نص أصلًا
  صارت عقدة تلك العلامة كلها هي الهدف.
- لا يبقى في القيمة المحفوظة إلا اسم اللون — على هيئة `data-color="green"`
  مثلًا. ولا يخرج `style` سطري.
- عند الدخول (`claim`) لا ينظر إلا إلى ما كان وسم `<span>` ويحمل السمة
  `data-color` — أمّا `<span>` الخالي من `data-color` فلا يطالب به هذا الجناح،
  فيُجرَّد من غلافه ويسقط إلى نص عادي. وإن وُجدت السمة وكانت قيمتها خارج القائمة
  أدناه أُلحق باللون الافتراضي (الأخضر) (وهي قاعدة التمييز نفسها — فالوسم يحمل
  أصلًا معنى "نص ملوَّن"، ولا يُرمى لذلك).
- وهو علامة مغايرة للتمييز، فيمكن أن يجتمعا على النص نفسه.

| اسم اللون | القيمة المحفوظة |
|---|---|
| أخضر | `green` |
| مرجاني | `coral` |
| بنفسجي | `violet` |
| كهرماني | `amber` |
| أزرق | `blue` |

تُصدَّر قائمة الألوان أيضًا باسم `TEXT_COLORS` (خريطة id ← قيمة لون CSS).

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
